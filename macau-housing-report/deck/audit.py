"""Geometry audit for the generated deck (LibreOffice cannot open pptx in this sandbox).

Checks: text overflow (estimated), out-of-bounds shapes, text-vs-text collisions,
text over pictures/charts (other than deliberate), footer/page-number over bleed photos,
missing speaker notes.
Width model: CJK/fullwidth = 1.0 em, others = 0.52 em; line box = 1.30 * size * line-spacing.
"""
import sys
from pptx import Presentation
from pptx.util import Emu
from lxml import etree

NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
EMU = 914400.0

def wem(ch):
    o = ord(ch)
    if 0x2E80 <= o <= 0x9FFF or 0xFF00 <= o <= 0xFF60 or 0x3000 <= o <= 0x303F or 0xFE30 <= o <= 0xFE4F:
        return 1.0
    if ch in "，。、；：！？（）「」『』〔〕→":
        return 1.0
    if ch in "−÷≈×–":
        return 0.6
    if ch.isdigit():
        return 0.58
    if ch in " ":
        return 0.3
    if ch.isupper():
        return 0.66
    return 0.52

def para_info(p):
    """return (text, max font pt, line spacing multiple, letter spacing pt, bold)"""
    txt = ""
    fs = 0
    spc = 0.0
    for r in p.findall(".//a:r", NS):
        t = r.find("a:t", NS)
        rp = r.find("a:rPr", NS)
        txt += (t.text or "") if t is not None else ""
        if rp is not None:
            if rp.get("sz"):
                fs = max(fs, int(rp.get("sz")) / 100.0)
            if rp.get("spc"):
                spc = max(spc, int(rp.get("spc")) / 100.0)
    for br in p.findall(".//a:br", NS):
        pass
    if fs == 0:
        epr = p.find("a:endParaRPr", NS)
        fs = int(epr.get("sz")) / 100.0 if epr is not None and epr.get("sz") else 18.0
    lsm = 1.0
    ln = p.find("a:pPr/a:lnSpc/a:spcPct", NS)
    if ln is not None:
        lsm = int(ln.get("val")) / 100000.0
    return txt, fs, lsm, spc

def measure(shape):
    """estimated (needed_h_in, widest_line_in, lines) for a text shape"""
    tf = shape.text_frame
    body = tf._txBody
    bp = body.find("a:bodyPr", NS)
    ml = int(bp.get("lIns", 91440)) / EMU
    mr = int(bp.get("rIns", 91440)) / EMU
    mt = int(bp.get("tIns", 45720)) / EMU
    mb = int(bp.get("bIns", 45720)) / EMU
    w = shape.width / EMU - ml - mr
    total = 0.0
    widest = 0.0
    nlines = 0
    for p in body.findall("a:p", NS):
        # split on explicit breaks
        segs = [[]]
        for child in p:
            tag = etree.QName(child).localname
            if tag == "r":
                t = child.find("a:t", NS)
                segs[-1].append((t.text or "") if t is not None else "")
            elif tag == "br":
                segs.append([])
        txt_all, fs, lsm, spc = para_info(p)
        cap_pt = w * 72.0
        lh = fs * 1.30 * lsm / 72.0
        if not txt_all and len(segs) == 1:
            total += lh
            nlines += 1
            continue
        for seg in segs:
            s = "".join(seg)
            cur = 0.0
            lines = 1
            for ch in s:
                cw = wem(ch) * fs + spc
                if cur + cw > cap_pt + 0.5:
                    lines += 1
                    widest = max(widest, cur / 72.0)
                    cur = cw
                else:
                    cur += cw
            widest = max(widest, cur / 72.0)
            total += lines * lh
            nlines += lines
    return total + mt + mb, widest + ml + mr, nlines, (ml, mr, mt, mb)

def text_rect(shape):
    """estimated occupied rectangle of the actual text (in inches)"""
    need, widest, nlines, (ml, mr, mt, mb) = measure(shape)
    x = shape.left / EMU
    y = shape.top / EMU
    w = shape.width / EMU
    h = shape.height / EMU
    body = shape.text_frame._txBody
    bp = body.find("a:bodyPr", NS)
    anchor = bp.get("anchor", "t")
    # alignment of first paragraph
    algn = "l"
    p0 = body.find("a:p", NS)
    if p0 is not None:
        ppr = p0.find("a:pPr", NS)
        if ppr is not None and ppr.get("algn"):
            algn = ppr.get("algn")
    tw = min(w, widest)
    if algn == "ctr":
        tx = x + (w - tw) / 2
    elif algn == "r":
        tx = x + (w - tw)
    else:
        tx = x
    th = need
    if anchor == "ctr":
        ty = y + (h - th) / 2
    elif anchor == "b":
        ty = y + h - th
    else:
        ty = y
    return tx, ty, tw, th

def inter(a, b):
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    ix = max(0, min(ax + aw, bx + bw) - max(ax, bx))
    iy = max(0, min(ay + ah, by + bh) - max(ay, by))
    return ix * iy, ix, iy

def main(path, only=None):
    prs = Presentation(path)
    SW, SH = prs.slide_width / EMU, prs.slide_height / EMU
    issues = []
    for idx, sl in enumerate(prs.slides, 1):
        if only and idx not in only:
            continue
        # notes
        notes = ""
        if sl.has_notes_slide:
            notes = sl.notes_slide.notes_text_frame.text.strip()
        if len(notes) < 20:
            issues.append((idx, "NOTES", "missing or very short speaker notes"))
        pics = []
        charts = []
        texts = []
        for sh in sl.shapes:
            try:
                x, y, w, h = sh.left / EMU, sh.top / EMU, sh.width / EMU, sh.height / EMU
            except TypeError:
                continue
            st = sh.shape_type
            is_chart = getattr(sh, "has_chart", False) and sh.has_chart
            if st == 13:
                pics.append((sh, (x, y, w, h)))
            elif is_chart:
                charts.append((sh, (x, y, w, h)))
            # bounds (ignore full-slide background rect)
            if x < -0.01 or y < -0.01 or x + w > SW + 0.01 or y + h > SH + 0.01:
                if not (abs(w - SW) < 0.02 and abs(h - SH) < 0.02):
                    issues.append((idx, "BOUNDS", f"shape '{sh.name}' ({x:.2f},{y:.2f},{w:.2f},{h:.2f}) leaves slide"))
            if sh.has_text_frame and sh.text_frame.text.strip():
                need, widest, nl, _ = measure(sh)
                hh = h
                if need > hh + 0.04:
                    issues.append((idx, "OVERFLOW", f"'{sh.text_frame.text.strip()[:28]}…' needs {need:.2f}in, box {hh:.2f}in ({nl} lines)"))
                tr = text_rect(sh)
                texts.append((sh, tr, sh.text_frame.text.strip()))
        # content-zone check: no non-footer shape (rules included) may cross into the page-number zone
        for sh in sl.shapes:
            try:
                x, y, w, h = sh.left / EMU, sh.top / EMU, sh.width / EMU, sh.height / EMU
            except TypeError:
                continue
            if sh.shape_type == 13:
                continue
            if abs(w - SW) < 0.02 and abs(h - SH) < 0.02:
                continue
            if y >= 6.33:
                continue  # footers and page numbers live here
            bottom = y + h
            if sh.has_text_frame and sh.text_frame.text.strip():
                tr = text_rect(sh)
                bottom = tr[1] + tr[3]
                label_ = sh.text_frame.text.strip()[:18]
            else:
                label_ = "rule/shape"
            if bottom > 6.36:
                issues.append((idx, "ZONE", f"{label_} reaches y={bottom:.2f}in (page-number zone starts 6.36)"))
        # text vs text collisions
        for i in range(len(texts)):
            for j in range(i + 1, len(texts)):
                a = texts[i][1]
                b = texts[j][1]
                area, ix, iy = inter(a, b)
                if area > 0.02 and ix > 0.08 and iy > 0.06:
                    issues.append((idx, "COLLIDE", f"'{texts[i][2][:16]}…' x '{texts[j][2][:16]}…' overlap {ix:.2f}x{iy:.2f}in"))
        # text over pictures / charts
        for (sh, tr, t) in texts:
            for (ps, pr) in pics:
                area, ix, iy = inter(tr, pr)
                if area > 0.02 and ix > 0.05 and iy > 0.05:
                    issues.append((idx, "TEXT-ON-PIC", f"'{t[:20]}…' overlaps picture by {ix:.2f}x{iy:.2f}in"))
            for (cs, cr) in charts:
                area, ix, iy = inter(tr, cr)
                if area > 0.02 and ix > 0.05 and iy > 0.05:
                    issues.append((idx, "TEXT-ON-CHART", f"'{t[:20]}…' overlaps chart by {ix:.2f}x{iy:.2f}in"))
    return issues, len(prs.slides)

if __name__ == "__main__":
    path = sys.argv[1]
    only = [int(v) for v in sys.argv[2].split(",")] if len(sys.argv) > 2 else None
    issues, n = main(path, only)
    print(f"slides: {n}, issues: {len(issues)}")
    for i in issues:
        print(f"  #{i[0]:02d} {i[1]:<13} {i[2]}")

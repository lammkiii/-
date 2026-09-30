"""Better approximate renderer for QA (LibreOffice cannot open pptx here).
- text drawn char-by-char: ASCII with Helvetica metrics, CJK with builtin china-t (1 em)
- letter-spacing (spc), alignment, valign, wrap, paragraph line spacing honoured
- pictures cropped per srcRect; rect fills/dashes; line+arrow; simple bar/line charts
usage: render2.py deck.pptx out_dir [pages]
"""
import sys, os, io
import pymupdf
from pptx import Presentation
from pptx.util import Emu
from lxml import etree
from PIL import Image

NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main",
      "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
      "c": "http://schemas.openxmlformats.org/drawingml/2006/chart"}
PT = 72.0
EMU = 914400.0
CREAM = (0.933, 0.922, 0.890)
RED = (0.792, 0.0, 0.075)

FH = pymupdf.Font("helv")
FB = pymupdf.Font("hebo")
FC = pymupdf.Font("china-t")

def is_cjk(ch):
    o = ord(ch)
    return (0x2E80 <= o <= 0x9FFF) or (0xFF00 <= o <= 0xFF60) or (0x3000 <= o <= 0x303F) or (0xFE30 <= o <= 0xFE4F) or o in (0x2014, 0x2013, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x00B7, 0xFF0D, 0x2212, 0x2192, 0x2190, 0x00F7, 0x2248, 0x2265, 0x2264, 0x00D7, 0x2605, 0x25CF)

NARROW = {0x2212: 0.6, 0x00F7: 0.6, 0x2013: 0.55, 0x2248: 0.6, 0x00D7: 0.6, 0x00B7: 0.4, 0x2265: 0.6, 0x2264: 0.6}
def adv(ch, fs, bold, spc):
    if is_cjk(ch):
        return fs * NARROW.get(ord(ch), 1.0) + spc
    f = FB if bold else FH
    try:
        return f.text_length(ch, fontsize=fs) + spc
    except Exception:
        return fs * 0.55 + spc

def hexcol(v):
    v = str(v)
    if len(v) != 6:
        return None
    return tuple(int(v[i:i + 2], 16) / 255 for i in (0, 2, 4))

def run_props(r):
    rp = r.find("a:rPr", NS)
    fs, bold, col, spc = 18.0, False, RED, 0.0
    face = None
    if rp is not None:
        if rp.get("sz"):
            fs = int(rp.get("sz")) / 100.0
        bold = rp.get("b") == "1"
        if rp.get("spc"):
            spc = int(rp.get("spc")) / 100.0
        sf = rp.find("a:solidFill/a:srgbClr", NS)
        if sf is not None:
            col = hexcol(sf.get("val")) or RED
    return fs, bold, col, spc

def draw_text(page, sh):
    body = sh.text_frame._txBody
    bp = body.find("a:bodyPr", NS)
    ml = int(bp.get("lIns", 91440)) / EMU * PT
    mr = int(bp.get("rIns", 91440)) / EMU * PT
    mt = int(bp.get("tIns", 45720)) / EMU * PT
    mb = int(bp.get("bIns", 45720)) / EMU * PT
    anchor = bp.get("anchor", "t")
    x, y, w, h = sh.left / EMU * PT, sh.top / EMU * PT, sh.width / EMU * PT, sh.height / EMU * PT
    cap = w - ml - mr
    # build lines
    lines = []  # (list of (ch, fs, bold, col, spc), lsm, align)
    for p in body.findall("a:p", NS):
        ppr = p.find("a:pPr", NS)
        algn = ppr.get("algn") if ppr is not None and ppr.get("algn") else "l"
        lsm = 1.0
        if ppr is not None:
            sp = ppr.find("a:lnSpc/a:spcPct", NS)
            if sp is not None:
                lsm = int(sp.get("val")) / 100000.0
        chars = []
        segs = [[]]
        for child in p:
            tag = etree.QName(child).localname
            if tag == "r":
                t = child.find("a:t", NS)
                txt = (t.text or "") if t is not None else ""
                fs, bold, col, spc = run_props(child)
                for ch in txt:
                    segs[-1].append((ch, fs, bold, col, spc))
            elif tag == "br":
                segs.append([])
        if not any(segs):
            epr = p.find("a:endParaRPr", NS)
            fs = int(epr.get("sz")) / 100.0 if epr is not None and epr.get("sz") else 12
            lines.append(([], lsm, algn, fs))
            continue
        for seg in segs:
            cur, curw = [], 0.0
            for c in seg:
                cw = adv(c[0], c[1], c[2], c[4])
                if curw + cw > cap + 0.5 and cur:
                    lines.append((cur, lsm, algn, max(k[1] for k in cur)))
                    cur, curw = [], 0.0
                cur.append(c)
                curw += cw
            lines.append((cur, lsm, algn, max([k[1] for k in cur] or [12])))
    total = sum(fs * 1.3 * lsm for (_, lsm, _, fs) in lines)
    if anchor == "ctr":
        ty = y + (h - total) / 2
    elif anchor == "b":
        ty = y + h - mb - total
    else:
        ty = y + mt
    for (chars, lsm, algn, fs) in lines:
        lh = fs * 1.3 * lsm
        lw = sum(adv(c[0], c[1], c[2], c[4]) for c in chars)
        if algn == "ctr":
            tx = x + ml + (cap - lw) / 2
        elif algn == "r":
            tx = x + ml + (cap - lw)
        else:
            tx = x + ml
        base = ty + lh * 0.80
        for c in chars:
            ch, cfs, bold, col, spc = c
            if ch.strip():
                try:
                    if is_cjk(ch):
                        page.insert_text((tx, base), ch, fontsize=cfs, color=col, fontname="china-t")
                    else:
                        page.insert_text((tx, base), ch, fontsize=cfs, color=col, fontname="hebo" if bold else "helv")
                except Exception:
                    pass
            tx += adv(ch, cfs, bold, spc)
        ty += lh

def pic_stream(sh):
    im = Image.open(io.BytesIO(sh.image.blob)).convert("RGBA")
    W, H = im.size
    l, r, t, b = sh.crop_left, sh.crop_right, sh.crop_top, sh.crop_bottom
    im = im.crop((int(W * l), int(H * t), int(W * (1 - r)), int(H * (1 - b))))
    bg = Image.new("RGB", im.size, (int(CREAM[0] * 255), int(CREAM[1] * 255), int(CREAM[2] * 255)))
    bg.paste(im, mask=im.split()[3])
    buf = io.BytesIO()
    bg.save(buf, "JPEG", quality=80)
    return buf.getvalue()

def draw_chart(page, sh):
    x, y, w, h = sh.left / EMU * PT, sh.top / EMU * PT, sh.width / EMU * PT, sh.height / EMU * PT
    ch = sh.chart
    plot = ch.plots[0]
    cats = list(plot.categories)
    series = [(s.name, list(s.values)) for s in plot.series]
    xml = ch._chartSpace
    is_bar = xml.find(".//c:barChart", NS) is not None
    bar_dir = "col"
    if is_bar:
        bd = xml.find(".//c:barChart/c:barDir", NS)
        bar_dir = bd.get("val") if bd is not None else "col"
    vmax_el = xml.find(".//c:valAx/c:scaling/c:max", NS)
    vmin_el = xml.find(".//c:valAx/c:scaling/c:min", NS)
    allv = [v for _, vs in series for v in vs if v is not None]
    vmax = float(vmax_el.get("val")) if vmax_el is not None else max(allv) * 1.15
    vmin = float(vmin_el.get("val")) if vmin_el is not None else 0.0
    legend = xml.find(".//c:legend", NS) is not None
    fmt_el = xml.find(".//c:dLbls/c:numFmt", NS)
    fmt = fmt_el.get("formatCode") if fmt_el is not None else "General"
    def fmt_v(v):
        if "0.0" in fmt and "%" not in fmt:
            s_ = f"{v:,.1f}" if "#" in fmt else f"{v:.1f}"
        elif "%" in fmt:
            s_ = f"{v:.1f}%"
        elif "#,##0" in fmt:
            s_ = f"{v:,.0f}"
        else:
            s_ = f"{v:g}"
        return s_
    pad_l, pad_b, pad_t, pad_r = 8, 28 if not (bar_dir == "bar" and is_bar) else 8, 10, 8
    if is_bar and bar_dir == "bar":
        pad_l = 92
    leg_h = 24 if legend else 0
    px0, py0 = x + pad_l, y + pad_t
    pw, ph = w - pad_l - pad_r, h - pad_t - pad_b - leg_h
    page.draw_rect(pymupdf.Rect(x, y, x + w, y + h), color=None, fill=CREAM)
    n = len(cats)
    ns = len(series)
    cols = [RED, (0.89, 0.706, 0.682)]
    if is_bar and bar_dir == "col":
        gw = pw / n
        bw = gw * 0.6 / ns
        for ci, cat in enumerate(cats):
            for si, (nm, vs) in enumerate(series):
                v = vs[ci]
                if v is None: continue
                bh = (v - vmin) / (vmax - vmin) * ph
                bx = px0 + gw * ci + gw * 0.2 + bw * si
                by = py0 + ph - bh
                page.draw_rect(pymupdf.Rect(bx, by, bx + bw, py0 + ph), color=None, fill=cols[si % 2])
                t = fmt_v(v)
                tw = sum(adv(c, 10.5, True, 0) for c in t)
                for k, c in enumerate(t):
                    pass
                cx = bx + bw / 2 - tw / 2
                for c in t:
                    page.insert_text((cx, by - 3), c, fontsize=10.5, color=RED, fontname="hebo")
                    cx += adv(c, 10.5, True, 0)
            lab = str(cat)
            lw = sum(adv(c, 9.5, False, 0) for c in lab)
            lx = px0 + gw * ci + gw / 2 - lw / 2
            for c in lab:
                page.insert_text((lx, py0 + ph + 14), c, fontsize=9.5, color=RED, fontname="china-t" if is_cjk(c) else "helv")
                lx += adv(c, 9.5, False, 0)
        page.draw_line((px0, py0 + ph), (px0 + pw, py0 + ph), color=RED, width=0.5)
    elif is_bar and bar_dir == "bar":
        gh = ph / n
        bh_ = gh * 0.6 / ns
        for ci, cat in enumerate(cats):
            for si, (nm, vs) in enumerate(series):
                v = vs[ci]
                if v is None: continue
                bwid = (v - vmin) / (vmax - vmin) * pw
                by = py0 + gh * ci + gh * 0.2 + bh_ * si
                page.draw_rect(pymupdf.Rect(px0, by, px0 + bwid, by + bh_), color=None, fill=cols[si % 2])
                t = fmt_v(v)
                cx = px0 + bwid + 4
                for c in t:
                    page.insert_text((cx, by + bh_ * 0.7), c, fontsize=10.5, color=RED, fontname="hebo")
                    cx += adv(c, 10.5, True, 0)
            lab = str(cat)
            lw = sum(adv(c, 9.5, False, 0) for c in lab)
            lx = px0 - 6 - lw
            for c in lab:
                page.insert_text((lx, py0 + gh * ci + gh / 2 + 3), c, fontsize=9.5, color=RED, fontname="china-t" if is_cjk(c) else "helv")
                lx += adv(c, 9.5, False, 0)
    else:
        gw = pw / n
        for si, (nm, vs) in enumerate(series):
            pts = []
            for ci, v in enumerate(vs):
                if v is None: continue
                cx = px0 + gw * ci + gw / 2
                cy = py0 + ph - (v - vmin) / (vmax - vmin) * ph
                pts.append((cx, cy, v))
            for a, b in zip(pts, pts[1:]):
                page.draw_line((a[0], a[1]), (b[0], b[1]), color=RED, width=2.2, dashes="[4 3] 0" if si == 1 else None)
            for (cx, cy, v) in pts:
                page.draw_circle((cx, cy), 3.2, color=RED, fill=RED)
                t = fmt_v(v)
                tw = sum(adv(c, 10, True, 0) for c in t)
                lx = cx - tw / 2
                for c in t:
                    page.insert_text((lx, cy - 7 - (0 if si == 0 else -16)), c, fontsize=10, color=RED, fontname="hebo")
                    lx += adv(c, 10, True, 0)
        for ci, cat in enumerate(cats):
            lab = str(cat)
            lw = sum(adv(c, 9.5, False, 0) for c in lab)
            lx = px0 + gw * ci + gw / 2 - lw / 2
            for c in lab:
                page.insert_text((lx, py0 + ph + 14), c, fontsize=9.5, color=RED, fontname="china-t" if is_cjk(c) else "helv")
                lx += adv(c, 9.5, False, 0)
        page.draw_line((px0, py0 + ph), (px0 + pw, py0 + ph), color=RED, width=0.5)
    if legend:
        lx = x + w / 2 - 80
        for si, (nm, vs) in enumerate(series):
            page.draw_rect(pymupdf.Rect(lx, y + h - 16, lx + 14, y + h - 10), color=None, fill=cols[si % 2])
            t = str(nm)
            cx = lx + 18
            for c in t:
                page.insert_text((cx, y + h - 9), c, fontsize=9, color=RED, fontname="china-t" if is_cjk(c) else "helv")
                cx += adv(c, 9, False, 0)
            lx = cx + 14

def render(pptx, outdir, want=None):
    prs = Presentation(pptx)
    SW, SH = prs.slide_width / EMU * PT, prs.slide_height / EMU * PT
    os.makedirs(outdir, exist_ok=True)
    doc = pymupdf.open()
    for idx, sl in enumerate(prs.slides, 1):
        if want and idx not in want:
            continue
        page = doc.new_page(width=SW, height=SH)
        page.draw_rect(pymupdf.Rect(0, 0, SW, SH), color=None, fill=CREAM)
        for sh in sl.shapes:
            try:
                x, y, w, h = sh.left / EMU * PT, sh.top / EMU * PT, sh.width / EMU * PT, sh.height / EMU * PT
            except TypeError:
                continue
            r = pymupdf.Rect(x, y, x + w, y + h)
            if sh.shape_type == 13:
                try:
                    page.insert_image(r, stream=pic_stream(sh), keep_proportion=False)
                except Exception as e:
                    page.draw_rect(r, color=(.6, .6, .6), fill=(.85, .85, .85))
                continue
            if getattr(sh, "has_chart", False) and sh.has_chart:
                try:
                    draw_chart(page, sh)
                except Exception as e:
                    page.draw_rect(r, color=RED, fill=None, width=0.6)
                    page.insert_text((x + 6, y + 14), f"[chart err {e}]", fontsize=8, color=RED)
                continue
            el = sh._element
            spPr = el.find("p:spPr", NS)
            prst = None
            if spPr is not None:
                pg = spPr.find("a:prstGeom", NS)
                prst = pg.get("prst") if pg is not None else None
            if prst == "line":
                xfrm = spPr.find("a:xfrm", NS)
                fh = xfrm.get("flipH") == "1"
                fv = xfrm.get("flipV") == "1"
                ln = spPr.find("a:ln", NS)
                x1, x2 = (x + w, x) if fh else (x, x + w)
                y1, y2 = (y + h, y) if fv else (y, y + h)
                page.draw_line((x1, y1), (x2, y2), color=RED, width=2.0)
                # arrow head at end
                import math
                ang = math.atan2(y2 - y1, x2 - x1)
                L = 9
                for da in (0.45, -0.45):
                    page.draw_line((x2, y2), (x2 - L * math.cos(ang + da), y2 - L * math.sin(ang + da)), color=RED, width=2.0)
                continue
            # fills / outlines
            fill = None
            sf = spPr.find("a:solidFill/a:srgbClr", NS) if spPr is not None else None
            if sf is not None:
                fill = hexcol(sf.get("val"))
            lncol, lnw, dash = None, 0.0, None
            if spPr is not None:
                ln = spPr.find("a:ln", NS)
                if ln is not None:
                    lc = ln.find("a:solidFill/a:srgbClr", NS)
                    if lc is not None:
                        lncol = hexcol(lc.get("val"))
                        lnw = int(ln.get("w", 12700)) / 12700.0
                    pd = ln.find("a:prstDash", NS)
                    if pd is not None and pd.get("val") not in (None, "solid"):
                        dash = "[4 3] 0"
            if (fill is not None and fill != CREAM) or lncol is not None:
                if (h < 3.0 or w < 3.0) and fill is not None:  # hairline rule
                    page.draw_rect(pymupdf.Rect(x, y, x + w, y + max(h, 0.6)), color=None, fill=fill)
                else:
                    page.draw_rect(r, color=lncol, fill=fill if fill != CREAM else None, width=lnw or 0.5, dashes=dash)
            if sh.has_text_frame and sh.text_frame.text.strip():
                draw_text(page, sh)
    out = os.path.join(outdir, "preview.pdf")
    doc.save(out)
    res = []
    for i, pg in enumerate(doc, 1):
        pix = pg.get_pixmap(dpi=110)
        p = os.path.join(outdir, f"s{i:02d}.png")
        pix.save(p)
        res.append(p)
    return res

if __name__ == "__main__":
    want = [int(v) for v in sys.argv[3].split(",")] if len(sys.argv) > 3 else None
    ps = render(sys.argv[1], sys.argv[2], want)
    print("rendered", len(ps))

/* 澳門房屋問題 — SOCI2101 小組研習報告
   設計語言沿用組員提供的 Canva 模板：純紅配奶白、Inter 巨型標題、
   細紅線分隔、相片出血、括號頁碼、大量留白。 */

const PptxGenJS = require("pptxgenjs");

/* ---------- 設計代幣 ---------- */
const CREAM = "EEEBE3";
const RED = "CA0013";
const RULE = "C72A09";
const RED_T = "E3B4AE"; // 紅的淡階，只用於圖表次要數列
const FZH = "Microsoft JhengHei";
const FEN = "Inter";

const W = 13.333, H = 7.5, M = 0.62, CW = W - M * 2;
const IMG = (n, e) => `img/image${n}.${e || "jpeg"}`;
const BLEED_H = H - 1.15;   // 出血相片下緣，保留底部奶白給頁碼與頁腳

const pres = new PptxGenJS();
pres.layout = "LAYOUT_WIDE";
pres.author = "SOCI2101 小組";
pres.title = "澳門房屋問題 — 馬克思理論視角";

let pageNo = 0;

/* ---------- 基礎 ---------- */
function slide(opts = {}) {
  const s = pres.addSlide();
  s.background = { color: CREAM };
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H, fill: { color: CREAM }, line: { type: "none" },
  });
  if (!opts.bare) chrome(s, opts);
  return s;
}

// 恆定的頁面裝置：左下括號頁碼、左下小標、右下科目
function chrome(s, opts = {}) {
  pageNo += 1;
  const n = String(pageNo).padStart(2, "0");
  if (opts.noPage !== true) {
    s.addText(`(${n})`, {
      x: M, y: H - 1.12, w: 1.5, h: 0.6, isTextBox: true, margin: 0,
      fontFace: FEN, fontSize: 30, bold: true, color: RED, valign: "middle",
    });
  }
  s.addText("澳門房屋問題\n馬克思理論視角", {
    x: M, y: H - 0.56, w: 3, h: 0.44, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: 9.5, bold: true, color: RED,
    charSpacing: 1, lineSpacingMultiple: 1.22,
  });
  s.addText("SOCI2101　當代社會問題\n小組研習報告", {
    x: W - M - 3.2, y: H - 0.56, w: 3.2, h: 0.44, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: 9.5, bold: true, color: RED,
    charSpacing: 1, lineSpacingMultiple: 1.22, align: "right",
  });
}

// 巨型標題，緊行距
function title(s, text, o = {}) {
  s.addText(text, {
    x: o.x ?? M, y: o.y ?? 0.62, w: o.w ?? 8.4, h: o.h ?? 1.7,
    isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: o.size ?? 42, bold: true, color: RED,
    lineSpacingMultiple: o.lsm ?? 0.98, align: o.align || "left", valign: "top",
  });
}

// 小標籤：粗體＋字距，替代英文的 all-caps
function label(s, text, o) {
  s.addText(text, {
    x: o.x, y: o.y, w: o.w, h: o.h ?? 0.34, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: o.size ?? 12, bold: true, color: o.color || RED,
    charSpacing: o.cs ?? 1.6, lineSpacingMultiple: 1.25,
    align: o.align || "left", valign: "top",
  });
}

function body(s, text, o) {
  s.addText(text, {
    x: o.x, y: o.y, w: o.w, h: o.h ?? 2.0, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: o.size ?? 14, color: o.color || RED,
    lineSpacingMultiple: o.lsm ?? 1.52, bold: !!o.bold, valign: "top",
  });
}

function hr(s, x, y, w, thick) {
  s.addShape(pres.ShapeType.rect, {
    x, y, w, h: thick || 0.014,
    fill: { color: RULE }, line: { type: "none" },
  });
}

// 模板的招牌列表：每項下面一條細紅線
function ruledList(s, { x, y, w, items, gap, size, labelText, split }) {
  const sp = split ?? 0.34;
  let cy = y;
  if (labelText) {
    label(s, labelText, { x, y: cy, w, size: 12 });
    cy += 0.44;
    hr(s, x, cy, w);
    cy += 0.14;
  }
  const g = gap ?? 0.52;
  items.forEach((it) => {
    const two = Array.isArray(it);
    if (two) {
      label(s, it[0], { x, y: cy, w: w * sp, h: g - 0.1, size: size ?? 13 });
      s.addText(it[1], {
        x: x + w * (sp + 0.015), y: cy, w: w * (1 - sp - 0.015), h: g - 0.1, isTextBox: true, margin: 0,
        fontFace: FZH, fontSize: size ?? 13, color: RED, lineSpacingMultiple: 1.3, valign: "top",
      });
    } else {
      label(s, it, { x, y: cy, w, size: size ?? 13 });
    }
    cy += g - 0.12;
    hr(s, x, cy, w);
    cy += 0.12;
  });
  return cy;
}

// 出血相片
function bleed(s, { file, x, y, w, h, sizing }) {
  s.addImage({
    path: file, x, y, w, h,
    sizing: sizing || { type: "cover", w, h },
  });
}

// 大數字
function bigStat(s, { x, y, w, value, unit, label: lb, note, size }) {
  s.addText(
    [
      { text: value, options: { fontFace: FEN, fontSize: size ?? 54, bold: true, color: RED } },
      ...(unit ? [{ text: unit, options: { fontFace: FZH, fontSize: (size ?? 54) * 0.42, bold: true, color: RED } }] : []),
    ],
    { x, y, w, h: 1.02, isTextBox: true, margin: 0, valign: "middle" }
  );
  label(s, lb, { x, y: y + 1.02, w, size: 13 });
  if (note) {
    s.addText(note, {
      x, y: y + 1.42, w, h: 1.0, isTextBox: true, margin: 0,
      fontFace: FZH, fontSize: 10.5, color: RED, lineSpacingMultiple: 1.38, valign: "top",
    });
  }
}

function source(s, text) {
  s.addText(text, {
    x: M + 3.3, y: H - 0.56, w: CW - 6.8, h: 0.44, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: 8.5, color: RED, lineSpacingMultiple: 1.2,
    align: "center", valign: "top",
  });
}

/* ---------- 分段頁 ---------- */
function divider(num, head, sub, lede, img, note) {
  const s = slide();
  if (img) {
    bleed(s, { file: img, x: 8.55, y: 0, w: W - 8.55, h: BLEED_H });
  }
  label(s, num, { x: M, y: 1.45, w: 4, size: 14, cs: 3 });
  title(s, head, { y: 1.9, w: 7.4, size: 60, lsm: 0.95, h: 2.2 });
  s.addText(sub, {
    x: M, y: 4.15, w: 7.2, h: 0.5, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: 17, bold: true, color: RED, charSpacing: 1.2,
  });
  hr(s, M, 4.78, 7.2);
  body(s, lede, { x: M, y: 4.98, w: 7.0, h: 1.3, size: 13.5 });
  s.addNotes(note || `${num}　${head.replace(/\n/g, "")}。換人接力，先用一句交代這部分要證明什麼，再進入內容。`);
  return s;
}

/* ================= 1 · 封面 ================= */
{
  const s = slide({ bare: true });
  pageNo += 1;
  s.addImage({
    path: IMG(1, "png"), x: 4.45, y: 2.25, w: 4.45, h: 5.25,
    sizing: { type: "contain", w: 4.45, h: 5.25 },
  });
  s.addText("澳門房屋問題", {
    x: M, y: 0.52, w: 12.1, h: 1.9, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: 96, bold: true, color: RED,
    lineSpacingMultiple: 0.92, align: "center",
  });
  s.addText("馬克思理論視角", {
    x: M, y: 2.34, w: 12.1, h: 1.5, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: 76, bold: true, color: RED,
    lineSpacingMultiple: 0.92, align: "center",
  });
  label(s, "當代社會問題\n小組研習報告\n匯報時間 45 分鐘", {
    x: M, y: H - 1.62, w: 3.4, h: 0.85, size: 11.5, cs: 1.2,
  });
  label(s, "澳門理工大學\n人文及社會科學學院\n社會工作學課程", {
    x: W - M - 3.4, y: H - 1.62, w: 3.4, h: 0.85, size: 11.5, cs: 1.2, align: "right",
  });
  s.addNotes(
    "開場。本組課題為房屋問題，按課程指引指定使用馬克思理論。\n" +
    "全份報告一句話結論：澳門房屋問題不是樓價一路上升，而是樓價相對勞動收入長期偏離合理區間，且這個偏離不因市場回調而消除。\n" +
    "提醒：封面組員名單在下一頁分工表補上。"
  );
}

/* ================= 2 · 目錄 ================= */
{
  const s = slide();
  title(s, "報告結構\n與評分權重", { size: 44, w: 5.6, h: 2.0 });
  body(s, "本報告依課程指引的五大部分編排。五十分中有三十五分集中在現況數據與社會因素及理論兩塊，匯報時間亦按此比重分配。", {
    x: M, y: 2.85, w: 4.9, h: 1.9, size: 13.5,
  });
  ruledList(s, {
    x: 6.5, y: 0.78, w: CW - 5.88, labelText: "五大部分與時間分配", gap: 0.62,
    items: [
      ["第一部分　概念", "5 個主要概念　·　4 頁　·　5 分鐘"],
      ["第二部分　現況趨勢", "15 分　·　19 頁　·　16 分鐘"],
      ["第三部分　社會因素", "20 分（與理論合計）　·　6 頁　·　9 分鐘"],
      ["第四部分　馬克思理論", "6 個理論工具　·　9 頁　·　10 分鐘"],
      ["第五部分　紓解方案", "4 項具體措施　·　3 頁　·　4 分鐘"],
      ["收尾", "訪問交代、參考文獻、數據限制　·　4 頁"],
    ],
  });
  label(s, "純熟報告技巧另佔 10 分，靠演練而非頁數", {
    x: 6.5, y: 5.25, w: CW - 5.88, size: 12.5,
  });
  s.addNotes("說明結構與時間分配，強調第二至第四部分是得分主戰場。概念與措施做到準確即可，不必鋪陳。");
}

/* ================= 3 · 核心論點 ================= */
{
  const s = slide();
  label(s, "核心論點", { x: M, y: 0.62, w: 4, size: 14, cs: 3 });
  title(s, "樓價跌了三成\n但買樓沒有變得容易", { y: 1.05, w: 11.5, size: 52, lsm: 0.98, h: 2.3 });
  body(s, "收入中位數同期下跌，租金反而上升。樓價回落的受益者是有資本入市的人；租金上升的承受者是沒有資產的租戶。", {
    x: M, y: 3.35, w: 7.8, h: 0.9, size: 15, bold: true,
  });
  hr(s, M, 4.25, CW, 0.02);
  const cols = [M, M + 3.1, M + 6.2, M + 9.3];
  const data = [
    ["−31.7", "%", "樓價四年累計跌幅", "2021 年全年每平方米 103,859 元\n降至 2025 年全年 70,935 元"],
    ["−71.3", "%", "成交量萎縮", "2019 年第 4 季 1,831 宗\n降至 2023 年第 4 季 525 宗"],
    ["+2.1", "%", "住宅租金逆勢上升", "2025 年全年每平方米實用面積\n平均租金按年升幅"],
    ["10.3", " 倍", "樓價收入比仍偏高", "雙職家庭推算；國際合理\n區間為 3 至 5 倍"],
  ];
  data.forEach(([v, u, l, n], i) => {
    bigStat(s, { x: cols[i], y: 4.42, w: 2.85, value: v, unit: u, label: l, note: n, size: 40 });
  });
  source(s, "資料來源：澳門統計暨普查局《私人建築及不動產交易》、《租金統計》、《就業調查》");
  s.addNotes(
    "這頁是全份報告的骨幹，四個數字要記熟。\n" +
    "重點：不要說「樓價一路上升」，數據不支持。租金升 2.1% 與樓價跌三成方向相反，這個張力是本組最有力的論點。\n" +
    "預告：貫穿三個問題的核心矛盾是空置與短缺並存。"
  );
}

/* ================= 4 · 分工 ================= */
{
  const s = slide();
  bleed(s, { file: IMG(3), x: 8.9, y: 0, w: W - 8.9, h: 3.55 });
  title(s, "小組分工", { size: 44, h: 1.1 });
  body(s, "按部分分工，每人負責一段並自行掌握該段全部數據來源，答問時能即時回應。", {
    x: M, y: 1.72, w: 7.6, h: 0.8, size: 13.5,
  });
  ruledList(s, {
    x: M, y: 2.72, w: 7.6, gap: 0.5, size: 12.5,
    items: [
      ["＿＿＿＿＿", "第一部分　概念　·　5 分鐘"],
      ["＿＿＿＿＿", "第二部分　樓價與收入　·　8 分鐘"],
      ["＿＿＿＿＿", "第二部分　租金與舊樓　·　8 分鐘"],
      ["＿＿＿＿＿", "第三部分　社會因素　·　9 分鐘"],
      ["＿＿＿＿＿", "第四部分　馬克思理論　·　10 分鐘"],
      ["＿＿＿＿＿", "第五部分與收尾　·　5 分鐘"],
    ],
  });
  label(s, "兩項共同責任", { x: 8.9, y: 3.95, w: 3.8, size: 12.5 });
  body(s, "訪問 1 至 2 位相關社會人士，兩人一組進行。\n\n交稿前每人自查一次自己那段的數據，核對原始報告。", {
    x: 8.9, y: 4.42, w: 3.8, h: 1.8, size: 12,
  });
  s.addNotes("組內使用頁，匯報時可快速帶過或略去。");
}


/* ---------- 表格：沿用模板的細紅線列式 ---------- */
function dataTable(s, { x, y, w, head, rows, colW, rowH, align, hi, cap }) {
  let cy = y;
  if (cap) { label(s, cap, { x, y: cy, w, size: 12 }); cy += 0.42; }
  const rh = rowH ?? 0.4;
  const cw = colW || head.map(() => w / head.length);
  const pad = (i) => (align && align[i] === "right" && i < head.length - 1 ? 0.14 : 0);
  let cx = x;
  head.forEach((hd, i) => {
    s.addText(hd, {
      x: cx, y: cy, w: cw[i] - pad(i), h: 0.34, isTextBox: true, margin: 0,
      fontFace: FZH, fontSize: 11, bold: true, color: RED, charSpacing: 0.8,
      align: (align && align[i]) || "left", valign: "middle",
    });
    cx += cw[i];
  });
  cy += 0.38;
  hr(s, x, cy, w, 0.02);
  cy += 0.1;
  rows.forEach((r, ri) => {
    const isHi = hi && hi.includes(ri);
    let rx = x;
    r.forEach((cell, ci) => {
      const numeric = (align && align[ci] === "right");
      s.addText(String(cell), {
        x: rx, y: cy, w: cw[ci] - pad(ci), h: rh - 0.08, isTextBox: true, margin: 0,
        fontFace: numeric ? FEN : FZH, fontSize: isHi ? 13 : 12,
        bold: isHi, color: RED,
        align: (align && align[ci]) || "left", valign: "middle",
      });
      rx += cw[ci];
    });
    cy += rh - 0.08;
    hr(s, x, cy, w);
    cy += 0.08;
  });
  return cy;
}

/* ---------- 引言式大字塊 ---------- */
function quoteBlock(s, { x, y, w, text, attrib, size }) {
  s.addText(`「${text}」`, {
    x, y, w, h: 2.6, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: size ?? 26, bold: true, color: RED,
    lineSpacingMultiple: 1.28, valign: "top",
  });
  if (attrib) label(s, attrib, { x, y: y + 2.7, w, size: 12 });
}

/* ================= 第一部分 ================= */
divider("第一部分", "主要概念", "五個貫穿全報告的概念", "課程指引要求解釋 4 至 5 個相關主要概念。都市更新是老師課堂上特別點名必須有的一項，其餘四項按本報告的論證需要選定。", IMG(14, "png"), "換人接力。這部分只需 5 分鐘，五個概念講定義就好，不要展開論證。都市更新是老師點名要有的，要講清楚它包含重建、維修保養、保存及活化三種模式 —— 第五部分的措施三就建基於此。");

{
  const s = slide();
  title(s, "房屋問題與\n住房可負擔性", { size: 40, h: 1.8 });
  hr(s, M, 2.55, 5.6);
  label(s, "概念一　房屋問題", { x: M, y: 2.78, w: 5.6, size: 13 });
  body(s, "住房的供給、分配、可負擔性與居住質素未能滿足社會成員基本居住需要而形成的結構性問題。與個別家庭居住困難之別在於：成因在社會結構而非個人選擇，且影響特定社會群體而非個別人士。", {
    x: M, y: 3.22, w: 5.6, h: 1.9, size: 12.5,
  });
  label(s, "概念二　住房可負擔性", { x: 6.7, y: 2.78, w: 5.6, size: 13 });
  body(s, "家庭在維持其他基本生活開支的前提下取得合適住房的能力。國際常用樓價收入比量度，即住宅價格中位數除以家庭年收入中位數，數值代表一個家庭在不消費的假設下需工作多少年方能購入住宅。", {
    x: 6.7, y: 3.22, w: 5.6, h: 1.9, size: 12.5,
  });
  hr(s, 6.7, 2.55, 5.6);
  label(s, "國際慣例視 3 至 5 倍為合理區間（高武洲 2017 引用之標準）", { x: 6.7, y: 5.2, w: 5.6, size: 11.5 });
  s.addNotes("兩個概念一併講。強調房屋問題的定義重點在「結構性」，這是社會學看問題與日常抱怨的分野。可負擔性的定義要講清楚，因為第二部分整個論證都靠它。");
}

{
  const s = slide();
  bleed(s, { file: IMG(6), x: 7.9, y: 0, w: W - 7.9, h: 4.6 });
  label(s, "概念三", { x: M, y: 0.62, w: 4, size: 13, cs: 3 });
  title(s, "都市更新", { y: 1.02, w: 6.8, size: 52, h: 1.2 });
  body(s, "對建築老化、設施落後、居住環境惡化的舊有城區，進行重建、維修保養、保存及活化的規劃行為。澳門的政策概念歷經三屆政府演變，由舊區重整轉為都市更新。", {
    x: M, y: 2.35, w: 6.6, h: 1.5, size: 13.5,
  });
  ruledList(s, {
    x: M, y: 4.05, w: 6.6, gap: 0.46, size: 12.5, labelText: "法律依據與三種模式",
    items: [
      ["第 18/2022 號法律", "《都市更新法律制度》2022 年 12 月生效"],
      ["模式一", "重建"],
      ["模式二", "維修保養"],
      ["模式三", "保存及活化"],
    ],
  });
  s.addNotes("此法已生效三年多，切勿說成「法案待立法會通過」，那是會被扣分的硬傷。三種模式要記，因為第五部分的措施三就是主張把重心由重建前移到維修保養。");
}

{
  const s = slide();
  title(s, "階梯房屋政策\n與夾心階層", { size: 40, h: 1.8 });
  label(s, "概念四　階梯房屋政策", { x: M, y: 2.6, w: 5.4, size: 13 });
  body(s, "澳門現行的分層住房供應框架，針對不同收入水平的居民提供對應選項，目標是使住房需求沿階梯逐級上移。", {
    x: M, y: 3.04, w: 5.4, h: 1.2, size: 12.5,
  });
  ruledList(s, {
    x: M, y: 4.3, w: 5.4, gap: 0.42, size: 12,
    items: ["社會房屋　最弱勢家庭，低廉租金", "經濟房屋　收入較少但期待自置居所", "夾心階層住房　夾屋", "長者公寓　2024 年 10 月投入服務", "私人房屋　市場價格"],
  });
  hr(s, 6.6, 2.42, 5.7, 0.02);
  label(s, "概念五　夾心階層", { x: 6.6, y: 2.6, w: 5.7, size: 13 });
  body(s, "收入及資產超出社會房屋與經濟房屋的申請上限，卻不足以負擔私人住宅市場價格的家庭。其結構位置決定他們同時被公共房屋體系與市場機制排除，是階梯房屋政策中最易斷鏈的一環。\n\n這個概念在第四部分會再用到：夾心階層的困境並非源於個人選擇失當，而是階級結構在住房分配制度中的必然位置。", {
    x: 6.6, y: 3.04, w: 5.7, h: 2.6, size: 12.5,
  });
  hr(s, M, 2.42, 5.4, 0.02);
  s.addNotes("五階梯要按順序講出來，聽眾才能理解「斷鏈」的意思。夾心階層是第四部分階級分析的接口，這裡先埋線。");
}

{
  const s = slide();
  bleed(s, { file: IMG(10), x: 0, y: 0, w: 5.1, h: BLEED_H });
  title(s, "兩個補充概念", { x: 5.7, y: 0.75, w: 6.9, size: 38, h: 1.0 });
  hr(s, 5.7, 2.05, 6.9);
  label(s, "三無大廈", { x: 5.7, y: 2.28, w: 6.9, size: 14 });
  body(s, "無業主會、無管理公司、無維修基金的樓宇。全澳樓齡 30 年以上的樓宇中，絕大部分屬此類，因此即使業權門檻已下調，仍缺乏集體決策與出資的機制。", {
    x: 5.7, y: 2.72, w: 6.9, h: 1.4, size: 13,
  });
  hr(s, 5.7, 4.18, 6.9);
  label(s, "仕紳化　Gentrification", { x: 5.7, y: 4.41, w: 6.9, size: 14 });
  body(s, "舊區更新後租金與物價上升，原低收入居民被迫遷離的過程。此概念在第四部分的租隙理論與剝奪式積累分析中是核心工具，並直接對應第五部分的措施四。", {
    x: 5.7, y: 4.85, w: 6.9, h: 1.4, size: 13,
  });
  s.addNotes("這兩個概念是工具性的，先定義好，第四部分理論分析才不必再解釋。三無大廈解釋為何重建難，仕紳化解釋為何更新有風險。");
}

/* ================= 第二部分 ================= */
divider("第二部分", "澳門現況\n與趨勢", "佔 15 分　·　須提供近 5 年充足數據", "本部分全部數據直接抄自澳門統計暨普查局季報原文，已逐一開啟 PDF 核對。三個具體問題：私樓樓價過高、舊區樓宇老化與重建困難、舊區居住環境惡化。", IMG(13), "這部分佔 15 分，是得分主戰場，用 16 分鐘。所有數據都開過原始 PDF 核對，若被問來源要答得出是哪一份季報。全段的敘事線：樓價跌了但買樓沒變容易，因為收入也跌、租金還升，最後收在空置與短缺並存。");

{
  const s = slide();
  title(s, "三個具體問題", { size: 42, h: 1.1 });
  body(s, "三個問題共用同一組社會因素，並在第四部分由同一套理論解釋。", {
    x: M, y: 1.85, w: 8, h: 0.5, size: 13.5,
  });
  const cx = [M, M + 4.1, M + 8.2];
  const items = [
    ["問題一", "私樓樓價過高", "年輕人難以置業。樓價雖由高峰回落三成，但收入中位數同期下跌，租金反而上升，可負擔性並未改善。"],
    ["問題二", "舊區樓宇老化\n與重建困難", "約 6,000 幢樓宇中 4,838 幢樓齡達 30 年以上，其中超過 3,500 幢為低層唐樓。老化速度快於更新速度。"],
    ["問題三", "舊區居住環境\n惡化", "無電梯、公共空間不足、消防通風條件差，居住者以長者與低收入家庭為主，形成雙重弱勢疊加。"],
  ];
  items.forEach(([n, t, d], i) => {
    label(s, n, { x: cx[i], y: 2.62, w: 3.7, size: 12, cs: 2.4 });
    hr(s, cx[i], 3.02, 3.7, 0.02);
    s.addText(t, {
      x: cx[i], y: 3.2, w: 3.7, h: 1.1, isTextBox: true, margin: 0,
      fontFace: FZH, fontSize: 24, bold: true, color: RED, lineSpacingMultiple: 1.05, valign: "top",
    });
    body(s, d, { x: cx[i], y: 4.4, w: 3.7, h: 1.7, size: 12.5 });
  });
  s.addNotes("三個問題是課堂初步答案加老師回應確定的。強調它們不是三件獨立的事，而是同一結構的三個面向，這點在第三、四部分會證明。");
}

{
  const s = slide();
  bleed(s, { file: IMG(14, "png"), x: 9.4, y: 0, w: W - 9.4, h: 2.7 });
  title(s, "近五年全年樓價序列", { size: 40, w: 8.6, h: 1.0 });
  body(s, "指引要求近五年數據。下表為 DSEC 各年年度報告的整體住宅每平方米實用面積平均價格，並以按年變動率交叉驗證，是本報告的主序列。", {
    x: M, y: 1.68, w: 8.6, h: 0.7, size: 13,
  });
  dataTable(s, {
    x: M, y: 2.5, w: 8.6,
    head: ["年份", "每平方米均價", "按年變化", "出處"],
    colW: [1.2, 2.3, 1.6, 3.5],
    align: ["left", "right", "right", "left"],
    rows: [
      ["2021", "103,859", "−1.1%", "2021 年第 4 季報告"],
      ["2022", "93,781", "−9.7%", "由 2023 年數值反推"],
      ["2023", "93,500", "−0.3%", "2023 年年度新聞稿"],
      ["2024", "85,114", "−9.0%", "2024 年第 4 季報告"],
      ["2025", "70,935", "−16.7%", "2025 年年度新聞稿"],
    ],
    hi: [0, 4],
    rowH: 0.48,
  });
  hr(s, M, 5.32, 8.6, 0.02);
  label(s, "自我驗證：93,500 × 0.91 ≈ 85,114　　85,114 × 0.833 ≈ 70,935", { x: M, y: 5.5, w: 8.6, size: 12 });
  body(s, "整條序列以各年公佈的按年變動率相乘即可還原下一年的數值，說明數據內部一致，可直接引用。", {
    x: M, y: 5.92, w: 8.6, h: 0.6, size: 11.5,
  });
  bigStat(s, { x: 9.4, y: 2.95, w: 3.3, value: "−31.7", unit: "%", label: "四年累計跌幅", note: "由 2021 年全年 103,859 元\n降至 2025 年全年 70,935 元", size: 44 });
  hr(s, 9.4, 5.15, 3.3);
  body(s, "同期辦公室單位跌至每平方米 57,490 元（按年 −17.6%），工業單位 33,926 元（−13.6%）—— 跌勢並非住宅獨有。", {
    x: 9.4, y: 5.35, w: 3.3, h: 1.2, size: 11.5,
  });
  source(s, "資料來源：澳門統計暨普查局《私人建築及不動產交易》各年年度報告");
  s.addNotes(
    "這是第二部分的主序列，必須講清楚。四年由 103,859 跌到 70,935，累計 −31.7%。\n" +
    "自我驗證那一行是加分位：說明我們不是照抄單一數字，而是用各年公佈的變動率互相印證過。\n" +
    "2022 年的數值是由 2023 年的水平與變動率反推，投影片上已如實標註，若老師問起要答得出。"
  );
}

{
  const s = slide();
  title(s, "五年樓價序列", { size: 40, h: 1.0 });
  body(s, "歷年第 4 季住宅單位資料。此表直接抄自 DSEC《私人建築及不動產交易 2024 年全年及第 4 季》原文。", {
    x: M, y: 1.68, w: 7.6, h: 0.6, size: 13,
  });
  dataTable(s, {
    x: M, y: 2.5, w: 8.1,
    head: ["第 4 季", "每平方米實用面積均價", "買賣數目", "買賣金額"],
    colW: [1.5, 3.3, 1.7, 1.6],
    align: ["left", "right", "right", "right"],
    rows: [
      ["2019", "104,468", "1,831", "11,582"],
      ["2020", "108,969", "1,630", "11,529"],
      ["2021", "104,865", "1,221", "8,116"],
      ["2022", "91,001", "649", "4,181"],
      ["2023", "89,259", "525", "2,858"],
      ["2024", "76,071", "884", "—"],
    ],
    hi: [1, 5],
    rowH: 0.44,
  });
  label(s, "單位：澳門元　·　金額單位：百萬澳門元", { x: M, y: 5.62, w: 8.1, size: 10.5 });
  bigStat(s, { x: 9.3, y: 2.5, w: 3.4, value: "−30.2", unit: "%", label: "價格五年累計跌幅", note: "2020 年第 4 季 108,969 元\n至 2024 年第 4 季 76,071 元", size: 38 });
  bigStat(s, { x: 9.3, y: 4.5, w: 3.4, value: "−71.3", unit: "%", label: "成交量萎縮幅度", note: "2019 年第 4 季 1,831 宗\n至 2023 年第 4 季 525 宗", size: 38 });
  source(s, "資料來源：澳門統計暨普查局《私人建築及不動產交易 2024 年全年及第 4 季》");
  s.addNotes("2020 年第 4 季是高峰，2024 年第 4 季是最低點，兩個數字加紅。成交量 2023 年見底後 2024 年回升至 884 宗，說明是市場調整而非需求消失。");
}

{
  const s = slide();
  title(s, "量價齊跌，成交量先回穩", { size: 38, h: 1.0 });
  body(s, "柱為成交量，折線為價格。價格持續下行而成交量在 2023 年見底後回升，是典型的市場調整形態。", {
    x: M, y: 1.62, w: 8.6, h: 0.55, size: 13,
  });
  const yrs = ["2019", "2020", "2021", "2022", "2023", "2024"];
  s.addChart(
    [
      {
        type: pres.ChartType.bar,
        data: [{ name: "買賣數目（宗）", labels: yrs, values: [1831, 1630, 1221, 649, 525, 884] }],
      },
      {
        type: pres.ChartType.line,
        data: [{ name: "每平方米均價（澳門元）", labels: yrs, values: [104468, 108969, 104865, 91001, 89259, 76071] }],
        options: { secondaryValAxis: true, secondaryCatAxis: true, chartColors: [RED], lineSize: 3.5, lineDataSymbolSize: 9, lineDataSymbol: "circle" },
      },
    ],
    {
      x: M, y: 2.35, w: 12.1, h: 4.0,
      barDir: "col", barGapWidthPct: 55,
      chartColors: [RED_T],
      chartArea: { fill: { color: CREAM }, border: { pt: 0, color: CREAM } },
      plotArea: { fill: { color: CREAM } },
      valAxes: [
        { showValAxisTitle: false, valAxisMaxVal: 2000, valAxisMinVal: 0, valAxisLabelColor: RULE, valAxisLabelFontFace: FEN, valAxisLabelFontSize: 10, valGridLine: { color: "DCD6CC", size: 1 } },
        { showValAxisTitle: false, valAxisMaxVal: 120000, valAxisMinVal: 0, valAxisLabelColor: RED, valAxisLabelFontFace: FEN, valAxisLabelFontSize: 10, valGridLine: { style: "none" } },
      ],
      catAxes: [
        { catAxisLabelColor: RULE, catAxisLabelFontFace: FEN, catAxisLabelFontSize: 11, catGridLine: { style: "none" } },
        { catAxisHidden: true },
      ],
      showLegend: true, legendPos: "b", legendColor: RED, legendFontFace: FZH, legendFontSize: 11,
    }
  );
  source(s, "資料來源：澳門統計暨普查局《私人建築及不動產交易》歷年第 4 季");
  s.addNotes("讀圖口徑：左軸是成交量，右軸是價格。指出 2023 年成交量見底、2024 年回升，但價格繼續跌，說明買家在價格回調後重新入市。");
}

{
  const s = slide();
  title(s, "第 1 季序列與單位面積", { size: 38, h: 1.0 });
  dataTable(s, {
    x: M, y: 1.75, w: 6.0, cap: "歷年第 1 季住宅單位每平方米均價",
    head: ["第 1 季", "均價", "買賣數目"],
    colW: [1.6, 2.4, 2.0],
    align: ["left", "right", "right"],
    rows: [
      ["2020", "100,332", "981"],
      ["2021", "100,217", "1,310"],
      ["2022", "96,048", "826"],
      ["2023", "93,351", "848"],
      ["2024", "85,004", "573"],
      ["2025", "71,859", "754"],
    ],
    hi: [5],
    rowH: 0.42,
  });
  dataTable(s, {
    x: 7.3, y: 1.75, w: 5.4, cap: "按實用面積統計的每平方米均價　2025 年第 1 季",
    head: ["單位面積", "全澳", "澳門半島"],
    colW: [2.4, 1.5, 1.5],
    align: ["left", "right", "right"],
    rows: [
      ["少於 50 平方米", "67,826", "61,065"],
      ["50 至 99.9 平方米", "70,731", "66,211"],
      ["100 至 149.9 平方米", "73,134", "71,953"],
      ["150 平方米及以上", "77,699", "78,434"],
    ],
    rowH: 0.44,
  });
  hr(s, M, 5.45, CW, 0.02);
  body(s, "2024 年全年整體均價為 85,114 元，按年下跌 9.0%，但全年住宅買賣數目反而增加 17.4% —— 量升價跌。\n單位愈大，每平方米售價愈高（全澳由 67,826 升至 77,699 元）—— 這一點在下一組租金數據會出現關鍵反轉。", {
    x: M, y: 5.62, w: CW, h: 1.0, size: 12.5, bold: true,
  });
  source(s, "資料來源：澳門統計暨普查局《私人建築及不動產交易 2025 年第 1 季》");
  s.addNotes("兩個表並排，左邊看時間趨勢，右邊看面積差異。最後一句要說清楚：買樓時大單位每平方米貴，這與租金完全相反，下一頁揭曉。");
}

{
  const s = slide();
  bleed(s, { file: IMG(4), x: 8.7, y: 0, w: W - 8.7, h: 3.9 });
  title(s, "收入中位數同期下跌", { size: 38, w: 7.8, h: 1.0 });
  dataTable(s, {
    x: M, y: 1.78, w: 7.6, cap: "月工作收入中位數（澳門元）",
    head: ["季度", "就業人口", "本地就業居民"],
    colW: [2.8, 2.4, 2.4],
    align: ["left", "right", "right"],
    rows: [
      ["2024 年第 3 季", "18,000", "20,500"],
      ["2024 年第 4 季", "18,000", "20,500"],
      ["2025 年第 1 季", "18,800", "21,500"],
      ["2025 年第 2 季", "17,800", "20,000"],
      ["2025 年第 3 季", "17,000", "20,000"],
    ],
    hi: [2, 4],
    rowH: 0.44,
  });
  hr(s, M, 5.12, 7.6, 0.02);
  body(s, "同期總體失業率僅 1.8%、本地居民 2.4%，而就業居民有 26.1% 從事文娛博彩及其他服務業，為最大行業。", {
    x: M, y: 5.3, w: 7.6, h: 0.7, size: 12.5,
  });
  label(s, "在近乎全民就業的條件下，\n收入中位數仍然回落", { x: 8.7, y: 4.22, w: 4.0, h: 0.68, size: 14 });
  body(s, "這說明居住負擔問題並非源於失業，而是源於薪酬結構與資產價格之間的關係。問題不在有無工作，而在勞動所得與資本所得的分配。", {
    x: 8.7, y: 4.95, w: 4.0, h: 1.5, size: 12.5,
  });
  source(s, "資料來源：澳門統計暨普查局《就業調查 2025 年 7 月至 9 月》");
  s.addNotes("這頁是駁「年輕人不夠努力」的關鍵。失業率 1.8% 近乎全民就業，收入中位數還跌，問題顯然在結構不在個人。");
}

{
  const s = slide();
  title(s, "樓價收入比推算", { size: 40, h: 1.0 });
  body(s, "以下為本報告自行推算，計算式完整列出以便查核，非引用任何機構的官方比率。", {
    x: M, y: 1.68, w: 7.6, h: 0.5, size: 13,
  });
  ruledList(s, {
    x: M, y: 2.42, w: 7.2, gap: 0.58, size: 13, labelText: "計算式", split: 0.47,
    items: [
      ["單位面積（實用）", "70 平方米　約 753 平方呎"],
      ["雙職家庭年收入", "20,000 × 2 人 × 12 個月 ＝ 480,000 元"],
      ["以 2021 全年均價 103,859 元計", "總價 7,270,130 元　→　15.1 倍"],
      ["以 2024 全年均價 85,114 元計", "總價 5,957,980 元　→　12.4 倍"],
      ["以 2025 全年均價 70,935 元計", "總價 4,965,450 元　→　10.3 倍"],
      ["單一收入者（2025 年基準）", "約 20.7 倍"],
      ["國際合理區間", "3 至 5 倍"],
    ],
    hi: [3],
  });
  bigStat(s, { x: 8.9, y: 2.5, w: 3.8, value: "10.3", unit: " 倍", label: "雙職家庭　2025 年全年", note: "即使樓價四年累計回落逾三成，樓價收入比也只由 15.1 倍降至 10.3 倍，依然是國際合理上限的兩倍以上。單一收入者需約 21 年。", size: 52 });
  s.addNotes("計算式要在投影片上完整顯示，這是學術誠信的要求，也方便老師核對。強調結論：四年跌了三成，比率只由 15.1 降到 10.3，仍是國際合理上限的兩倍以上。");
}

{
  const s = slide();
  title(s, "22.89 倍的出處已追到", { size: 38, h: 1.0 });
  label(s, "高武洲（2017）《澳門研究》2017 年第 3 期，第 69 頁", { x: M, y: 1.72, w: 8, size: 12.5 });
  hr(s, M, 2.18, CW, 0.02);
  body(s, "他的算法是：以 2017 年第 1 季月收入中位數 15,000 元、雙薪家庭年收入 36 萬元，對比住宅平均每戶交易總價 824 萬元，得出 22.89 倍，並寫明「一戶中等收入家庭，約 23 年內不吃不喝，不穿不花，把所有收入用來供樓，才買得起樓，還未計利息支出部分」。", {
    x: M, y: 2.42, w: 5.9, h: 2.2, size: 13,
  });
  label(s, "為何與本報告的 10.3 倍差距這麼大", { x: 6.9, y: 2.42, w: 5.4, size: 13 });
  body(s, "分子不同。高武洲用平均每戶交易總價，會被大面積單位與豪宅拉高；本報告用 70 平方米乘每平方米均價，鎖定一個標準家庭單位。\n\n兩者都站得住，但不可混用。報告引用時必須註明採用哪一種算法。", {
    x: 6.9, y: 2.88, w: 5.4, h: 2.0, size: 12.5,
  });
  hr(s, M, 5.0, CW);
  body(s, "同頁另一項對照：高武洲引用的國際標準是年收入的 3.5 至 5 倍，並記錄當時香港為 10.7 倍。Demographia 近年公布的香港數字為 14.4 倍，可見不同年份與不同方法之間差異極大，引用時必須寫明版本與涵蓋季度。", {
    x: M, y: 5.18, w: CW, h: 1.0, size: 12.5,
  });
  s.addNotes("這頁展示我們追溯來源的功夫，是加分項。重點：同一個現象有兩個數字，我們知道為什麼不同，也知道該用哪個。");
}

{
  const s = slide();
  label(s, "老師課堂上要求的對照", { x: M, y: 0.62, w: 6, size: 13, cs: 2.4 });
  title(s, "樓價升幅是\n收入升幅的近五倍", { y: 1.05, w: 10.5, size: 50, lsm: 0.98, h: 2.2 });
  hr(s, M, 3.4, CW, 0.02);
  const cx = [M, M + 4.3, M + 8.6];
  bigStat(s, { x: cx[0], y: 3.7, w: 4.0, value: "12.3", unit: " 倍", label: "住宅平均每戶交易價格升幅", note: "2004 年 67 萬元\n升至 2017 年 824 萬元", size: 50 });
  bigStat(s, { x: cx[1], y: 3.7, w: 4.0, value: "2.6", unit: " 倍", label: "人均本地居民總收入升幅", note: "2002 年 19.9 萬元\n升至 2015 年 52.0 萬元", size: 50 });
  bigStat(s, { x: cx[2], y: 3.7, w: 4.0, value: "4.7", unit: " 倍", label: "兩者差距", note: "資產價格的增值速度\n遠超勞動報酬的增長", size: 50 });
  source(s, "資料來源：高武洲（2017）《澳門研究》2017 年第 3 期第 69 頁，原始數據引自澳門統計暨普查局");
  s.addNotes("這三個數字是有學術文獻支撐的，不是我們自己算的。可直接回應老師課堂上「人工追不上樓價」的要求。");
}

{
  const s = slide();
  title(s, "引用陷阱：三個不可混用的數字", { size: 36, h: 1.0 });
  body(s, "樓價收入比看似簡單，但不同機構的方法學互不通用。以下三點若弄錯會被審稿人直接質疑。", {
    x: M, y: 1.65, w: 8.6, h: 0.5, size: 13,
  });
  ruledList(s, {
    x: M, y: 2.35, w: CW, gap: 0.78, size: 13,
    items: [
      ["Demographia 並不包含澳門", "該報告只涵蓋八個國家的市場。任何聲稱「Demographia 澳門樓價收入比」的數字都不可能成立。逐字稿提到的「澳門約 14.8」查不到出處，不要用。"],
      ["香港的對照值本身在變動", "Demographia 2025 年版為 14.4（2024 年第 3 季數據），2024 年版 16.7，2022 年版 18.8。老師口述的「約 16 年」對應較早版本。引用須寫明版本與季度。"],
      ["Numbeo 澳門 23.6 是眾包數據", "僅 49 條記錄、11 位貢獻者，方法學與 Demographia 不同，不可與香港 14.4 並列比較。若要用必須註明為眾包估算。"],
      ["可比的對照是新加坡", "Demographia 樓價收入比 3.8，自置居所比率 90.8%（2024 年，新加坡統計局），方法一致，可作合理區間的參照。"],
    ],
  });
  s.addNotes("這頁是防守頁。若老師問起 14.8 這個數字，我們已經查證過它查不到出處，並說明了原因。這比照抄數字穩得多。");
}

/* ---- 關鍵反轉 ---- */
{
  const s = slide();
  bleed(s, { file: IMG(12), x: 7.6, y: 0, w: W - 7.6, h: BLEED_H });
  label(s, "關鍵反轉", { x: M, y: 0.72, w: 5, size: 14, cs: 3 });
  title(s, "樓價在跌\n租金在升", { y: 1.18, w: 6.6, size: 62, lsm: 0.95, h: 2.4 });
  hr(s, M, 3.72, 6.5, 0.02);
  body(s, "同一時期，買樓的價格跌了三成，租樓的價格卻升了 2.1%。跌價的受益者是有資本入市的人，升租的承受者是沒有資產的租戶。", {
    x: M, y: 3.95, w: 6.5, h: 1.3, size: 15, bold: true,
  });
  body(s, "2025 年全澳住宅單位每平方米實用面積平均租金按年上升 2.1%，澳門半島、氹仔、路環升幅分別為 1.3%、2.5% 及 3.5%。", {
    x: M, y: 5.35, w: 6.5, h: 1.0, size: 12.5,
  });
  source(s, "資料來源：澳門統計暨普查局《租金統計 2025 年全年及第四季》");
  s.addNotes("這是全份報告最鋒利的一頁，語速要放慢。強調方向相反：買的跌、租的升，對無資產者最不利。這組數據兩份參考資料都沒有，是我們自己從原始報告抽出來的。");
}

{
  const s = slide();
  title(s, "租金按樓齡：舊樓只及新樓六成半", { size: 34, h: 1.0 });
  s.addChart(
    [{ type: pres.ChartType.bar, data: [{ name: "每平方米平均租金（澳門元）", labels: ["5 年及以下", "6 至 10 年", "11 至 20 年", "21 至 30 年", "大於 30 年"], values: [182, 166, 143, 121, 119] }] }],
    {
      x: M, y: 1.7, w: 7.7, h: 4.1,
      barDir: "bar", barGapWidthPct: 45,
      chartColors: [RED],
      chartArea: { fill: { color: CREAM }, border: { pt: 0, color: CREAM } },
      plotArea: { fill: { color: CREAM } },
      showValue: true, dataLabelPosition: "outEnd", dataLabelColor: RED,
      dataLabelFontFace: FEN, dataLabelFontSize: 12, dataLabelFontBold: true,
      valAxisMaxVal: 200, valAxisLabelColor: RULE, valAxisLabelFontFace: FEN, valAxisLabelFontSize: 10,
      valGridLine: { color: "DCD6CC", size: 1 },
      catAxisLabelColor: RED, catAxisLabelFontFace: FZH, catAxisLabelFontSize: 11.5,
      catGridLine: { style: "none" },
      showLegend: false,
    }
  );
  bigStat(s, { x: 8.8, y: 1.85, w: 3.9, value: "65", unit: "%", label: "舊樓租金佔新樓比例", note: "樓齡 30 年以上為每平方米 119 元，5 年以下新樓為 182 元。", size: 50 });
  hr(s, 8.8, 4.15, 3.9);
  body(s, "舊區住戶付較低租金，換來的是無電梯、無管理、無維修基金的居住條件。這是階級在空間上分化的量化證據，而非單純的市場定價差異。\n\n全澳住宅平均為 139 元，按年升 2.1%。", {
    x: 8.8, y: 4.35, w: 3.9, h: 2.0, size: 12.5,
  });
  source(s, "資料來源：澳門統計暨普查局《租金統計 2025 年全年及第四季》");
  s.addNotes("橫向條形圖是因為樓齡標籤較長，這是學術繪圖的標準選擇。重點句：付得少不等於住得好，付得少正因為住得差。");
}

{
  const s = slide();
  title(s, "買與租的反轉", { size: 42, h: 1.0 });
  body(s, "買樓時細單位每平方米最便宜，租樓時細單位每平方米最貴。方向完全相反。", {
    x: M, y: 1.68, w: 8.4, h: 0.5, size: 14, bold: true,
  });
  dataTable(s, {
    x: M, y: 2.42, w: 7.4,
    head: ["單位面積", "售價（2025 Q1）", "租金（2025 全年）"],
    colW: [2.8, 2.3, 2.3],
    align: ["left", "right", "right"],
    rows: [
      ["少於 50 平方米", "67,826", "168"],
      ["50 至 99.9 平方米", "70,731", "138"],
      ["100 至 149.9 平方米", "73,134", "128"],
      ["150 平方米及以上", "77,699", "124"],
    ],
    hi: [0],
    rowH: 0.48,
  });
  label(s, "售價最低　租金最高", { x: M, y: 4.85, w: 7.4, size: 12.5 });
  hr(s, 8.5, 2.42, 4.2, 0.02);
  body(s, "負擔不起首期而只能租住細單位的家庭，按單位面積計付出最高的居住成本，而且付出的是租金而非本金 —— 支出不會轉化為資產。\n\n這是貧窮溢價在住房市場的具體形態，也是第四部分「資產者以資本換取增值、無產者以工資換取居住權」的直接數據對應。", {
    x: 8.5, y: 2.62, w: 4.2, h: 2.8, size: 12.5,
  });
  hr(s, M, 5.4, CW);
  body(s, "分區租金同樣呈現階級的空間分佈：黑沙環新填海區每平方米 165 元為全澳最高，黑沙環及祐漢區僅 121 元、新橋區 120 元，屬全澳最低之列。", {
    x: M, y: 5.58, w: CW, h: 0.8, size: 12.5,
  });
  source(s, "資料來源：澳門統計暨普查局《私人建築及不動產交易》、《租金統計》");
  s.addNotes("這頁要講慢。核心：買不起就要租，而租的單位面積成本更高，錢又不會變成資產。祐漢租金最低這點下面會再用，它是都更第一個項目所在地。");
}

/* ---- 問題二 ---- */
{
  const s = slide();
  bleed(s, { file: IMG(6), x: 0, y: 0, w: 4.8, h: BLEED_H });
  label(s, "問題二", { x: 5.4, y: 0.72, w: 4, size: 13, cs: 3 });
  title(s, "舊區樓宇老化\n與重建困難", { x: 5.4, y: 1.12, w: 7.2, size: 40, h: 1.9 });
  hr(s, 5.4, 3.1, 7.2, 0.02);
  const sx = [5.4, 7.9, 10.4];
  [["4,838", " 幢", "樓齡 30 年以上"], ["3,500+", " 幢", "低層唐樓"], ["6,000", " 幢", "全澳樓宇總數（約）"]].forEach(([v, u, l], i) => {
    s.addText([
      { text: v, options: { fontFace: FEN, fontSize: 34, bold: true, color: RED } },
      { text: u, options: { fontFace: FZH, fontSize: 14, bold: true, color: RED } },
    ], { x: sx[i], y: 3.3, w: 2.4, h: 0.7, isTextBox: true, margin: 0, valign: "middle" });
    label(s, l, { x: sx[i], y: 4.0, w: 2.4, size: 11.5 });
  });
  hr(s, 5.4, 4.5, 7.2);
  body(s, "絕大部分屬三無大廈。重建受制於三重障礙：業權門檻雖已下調但唐樓產權高度分散、三無狀態下缺乏維修基金與集體決策機制、以及重建期間安置空間不足。結果是老化速度快於更新速度。", {
    x: 5.4, y: 4.7, w: 7.2, h: 1.6, size: 13,
  });
  s.addNotes("三個數字說明存量規模。重點是三重障礙，這直接引出第五部分的措施三：把政策重心由重建前移到維修與管理。");
}

{
  const s = slide();
  title(s, "都市更新的業權門檻", { size: 40, h: 1.0 });
  label(s, "第 18/2022 號法律《都市更新法律制度》　2022 年 12 月 28 日公佈生效", { x: M, y: 1.68, w: 9, size: 12.5 });
  dataTable(s, {
    x: M, y: 2.28, w: 7.6,
    head: ["樓宇狀況", "強制參與重建所需業權比例"],
    colW: [4.6, 3.0],
    align: ["left", "right"],
    rows: [
      ["樓齡 30 至 40 年", "85%"],
      ["樓齡 30 至 40 年，少於 7 個獨立單位", "80%"],
      ["樓齡 40 年以上", "80%"],
      ["被命令全部拆卸的殘危樓宇", "60%"],
      ["2019 年諮詢文本原建議（未採納）", "90 / 80 / 60%"],
    ],
    hi: [0],
    rowH: 0.5,
  });
  hr(s, 8.6, 2.28, 4.1, 0.02);
  label(s, "兩個引用陷阱", { x: 8.6, y: 2.48, w: 4.1, size: 13 });
  body(s, "一、門檻是 85／80／60%，不是諮詢文本建議的 90／80／60%。\n\n二、此法已生效三年多，不可寫成「法案待立法會通過」。\n\n兩項若寫錯，等於聲稱一條已生效的法律尚未通過，是會被直接扣分的硬傷。", {
    x: 8.6, y: 2.95, w: 4.1, h: 2.6, size: 12.5,
  });
  hr(s, M, 5.2, 7.6);
  body(s, "都市更新模式包括重建、維修保養、保存及活化；補償方式包括單位置換、按公平市值的現金補償及搬遷特別津貼，並設暫住房與置換房安排。首個項目為祐漢七棟樓群，住商戶共 2,556 戶。", {
    x: M, y: 5.38, w: 7.6, h: 1.0, size: 12.5,
  });
  s.addNotes("這頁是我們交叉核對後改正過的。原本兩份參考資料一份寫 90%、一份說法案未通過，都錯。可以在此展示我們查了公報原文。");
}

{
  const s = slide();
  bleed(s, { file: IMG(5), x: 8.6, y: 0, w: W - 8.6, h: 4.3 });
  label(s, "問題三", { x: M, y: 0.72, w: 4, size: 13, cs: 3 });
  title(s, "舊區居住環境與\n公共房屋缺口", { y: 1.12, w: 7.7, size: 38, h: 1.8 });
  dataTable(s, {
    x: M, y: 2.95, w: 7.7,
    head: ["項目", "數值"],
    colW: [5.6, 2.1],
    align: ["left", "right"],
    rows: [
      ["全澳住宅單位總數（2021 年 6 月底）", "238,464"],
      ["其中社會房屋單位", "15,037"],
      ["社會房屋佔全澳住宅單位比例", "6.3%"],
      ["推算 2025 年社屋所需總量（區間中值）", "17,394"],
      ["在建經濟房屋項目（10 個）單位總數", "10,669"],
      ["社屋中專為體弱長者設計的單位", "1,006"],
    ],
    hi: [2],
    rowH: 0.42,
  });
  label(s, "社屋存量的長期擴張", { x: 8.9, y: 4.45, w: 3.8, size: 13 });
  body(s, "6,059 個　佔 3.2%（2009 年底）\n12,753 間（2016 年底）\n15,037 個　佔 6.3%（2021 年 6 月）\n\n十二年增約 2.5 倍。這點要如實講：國家確實在擴張公共房屋。第四部分的論證不是「國家不介入」，而是介入的邊界。", {
    x: 8.9, y: 4.88, w: 3.8, h: 1.9, size: 11.5,
  });
  source(s, "資料來源：澳門房屋局、高武洲（2017）");
  s.addNotes("社屋只佔全澳住宅 6.3%，這個比例要強調。時間序列顯示供應在增加，但推算需求增加得更快。");
}

/* ---- 空置與短缺並存 ---- */
{
  const s = slide();
  label(s, "貫穿三個問題的核心矛盾", { x: M, y: 0.62, w: 6, size: 14, cs: 2.4 });
  title(s, "空置與短缺並存", { y: 1.05, w: 11, size: 58, h: 1.5 });
  hr(s, M, 2.72, CW, 0.02);
  body(s, "澳門不是沒有房子，也不是政府沒有錢。政府建成了樓，卻大量空置，同時仍有家庭住在無電梯的唐樓裡等公屋。這個矛盾把三個問題串成一條線，也是第四部分馬克思分析最有力的落點。", {
    x: M, y: 2.95, w: 10.4, h: 1.2, size: 16, bold: true,
  });
  const cx = [M, M + 6.3];
  label(s, "個案一　石排灣經屋", { x: cx[0], y: 4.35, w: 5.6, size: 13 });
  hr(s, cx[0], 4.78, 5.6);
  s.addText([
    { text: "38.9", options: { fontFace: FEN, fontSize: 44, bold: true, color: RED } },
    { text: "%", options: { fontFace: FZH, fontSize: 20, bold: true, color: RED } },
  ], { x: cx[0], y: 4.95, w: 5.6, h: 0.8, isTextBox: true, margin: 0, valign: "middle" });
  body(s, "路環石排灣地區經屋空置率。同期澳門半島 4.9%、氹仔 6.8%。", { x: cx[0], y: 5.78, w: 5.6, h: 0.6, size: 12 });
  label(s, "個案二　明珠都滙置換房", { x: cx[1], y: 4.35, w: 5.8, size: 13 });
  hr(s, cx[1], 4.78, 5.8);
  s.addText([
    { text: "338", options: { fontFace: FEN, fontSize: 44, bold: true, color: RED } },
    { text: " / 2,000+", options: { fontFace: FEN, fontSize: 22, bold: true, color: RED } },
  ], { x: cx[1], y: 4.95, w: 5.8, h: 0.8, isTextBox: true, margin: 0, valign: "middle" });
  body(s, "購買期屆滿僅售出 338 個單位，餘下 1,700 多個。", { x: cx[1], y: 5.78, w: 5.8, h: 0.6, size: 12 });
  s.addNotes("這頁是第二部分的收束，也是通往第四部分的橋。兩個個案都是政府建好了樓但沒人住，原因不同但病理相同：制度設計與實際需求錯配。");
}

{
  const s = slide();
  bleed(s, { file: IMG(10), x: 8.5, y: 0, w: W - 8.5, h: BLEED_H });
  label(s, "個案一", { x: M, y: 0.72, w: 4, size: 13, cs: 3 });
  title(s, "石排灣經屋：\n樓建好了，沒人住", { y: 1.12, w: 7.5, size: 38, h: 1.8 });
  ruledList(s, {
    x: M, y: 2.95, w: 7.5, gap: 0.5, size: 12.5, labelText: "房屋局 2015 年 3 月資料",
    items: [
      ["已領鎖匙的新建公屋", "7,087 戶"],
      ["其中未入住", "1,457 戶　空置率 20.5%"],
      ["對比私人住宅空置率", "為其三倍"],
      ["澳門半島 / 氹仔 / 石排灣", "4.9% / 6.8% / 38.9%"],
    ],
  });
  hr(s, M, 5.32, 7.5, 0.02);
  body(s, "高武洲的診斷是規劃問題而非需求問題：石排灣社區缺乏同步的商業配套，學校、街市、醫院未能同期建成，長者與兒童的生活需要未及時提供，在職人士受困於石排灣與城區之間的交通堵塞。", {
    x: M, y: 5.5, w: 7.5, h: 1.1, size: 12.5,
  });
  source(s, "資料來源：高武洲（2017）第 77 頁，引時任立法議員何潤生 2015 年 6 月數據");
  s.addNotes("重點句：樓建好了，但生活配套沒有同步，居民寧願不住。這證明供應量不是唯一問題，規劃配套同樣決定政策成敗。");
}

{
  const s = slide();
  label(s, "個案二", { x: M, y: 0.62, w: 4, size: 13, cs: 3 });
  title(s, "明珠都滙置換房：\n建好了，賣不出", { y: 1.02, w: 8.6, size: 40, h: 1.8 });
  const cx = [M, M + 4.3, M + 8.6];
  bigStat(s, { x: cx[0], y: 2.95, w: 4.0, value: "338", label: "完成購買手續的申請人", note: "購買期於 2026 年 1 月 30 日屆滿", size: 44 });
  bigStat(s, { x: cx[1], y: 2.95, w: 4.0, value: "1,700+", label: "餘下未售出單位", note: "黑沙環「P」地段置換房項目", size: 44 });
  bigStat(s, { x: cx[2], y: 2.95, w: 4.0, value: "2,800+", label: "同地段暫住房單位", note: "因申請、價格及分配方式仍待批示訂定，至今完全未作暫住用途", size: 44 });
  hr(s, M, 5.08, CW, 0.02);
  label(s, "兩層原因", { x: M, y: 5.28, w: 3, size: 13 });
  body(s, "法律上，《都市更新暫住房及置換房法律制度》規定置換房申請資格為「因都市更新而被拆卸，且因城市規劃而無法回遷」的業權人，實質排除了大多數有意重建、希望以置換方式處置舊樓的業權人。設計上，明珠都滙的單位尺寸主要參考原海一居，戶型相對較大，未必能與戶型較小的舊樓匹配置換。祐漢、下環、新橋等舊區有迫切重建需求，卻對不上這批現成單位。", {
    x: M + 3.1, y: 5.28, w: CW - 3.1, h: 1.2, size: 12,
  });
  source(s, "資料來源：立法議員高岸聲書面質詢，2026 年 3 月");
  s.addNotes("三個數字並排，反差最強烈。強調 2,800 多個暫住房建好了但一戶都沒用，原因是配套法規未訂。這是現行進行中的事，資料是 2026 年 3 月的。");
}

{
  const s = slide();
  label(s, "官方研究的結論", { x: M, y: 0.62, w: 5, size: 14, cs: 3 });
  title(s, "政府自己的研究\n就是這樣說的", { y: 1.02, w: 8.2, size: 42, lsm: 0.98, h: 2.0 });
  quoteBlock(s, {
    x: M, y: 3.05, w: 7.6, size: 19,
    text: "經計算現時澳門住宅單位總量已超出實際住戶數量……研究團隊認為澳門的房屋問題是資源錯配，主要出於結構與功能性分佈未能滿足居民的實際需求",
    attrib: "政策研究和區域發展局委託、澳門大學執行《澳門未來房屋需求研究》",
  });
  dataTable(s, {
    x: 8.55, y: 1.05, w: 4.15, cap: "該研究的空置數據（2020 年底）",
    head: ["項目", "數值"],
    colW: [2.75, 1.4],
    align: ["left", "right"],
    rows: [
      ["全澳住宅單位總數", "236,313"],
      ["實際住戶數", "199,700"],
      ["兩者差額", "36,613"],
      ["空置住宅單位", "15,765"],
      ["平均空置率", "6.67%"],
    ],
    hi: [2, 4],
    rowH: 0.46,
  });
  hr(s, 8.55, 4.0, 4.15, 0.02);
  body(s, "空置相對集中在氹仔和路環，而大單位的空置率明顯偏高。這與價格數據吻合：150 平方米以上單位每平方米售價最高（77,699 元），空置率也最高。\n\n被生產出來的住宅，規格對應的是購買力最強的一端，而非需求量最大的一端 —— 這就是資源錯配的具體形態。", {
    x: 8.55, y: 4.2, w: 4.15, h: 2.2, size: 11.5,
  });
  source(s, "資料來源：《澳門未來房屋需求研究》五大類房屋需求估計摘要文本");
  s.addNotes(
    "這頁的份量在於：空置與短缺並存不是我們的推論，是政府委託研究自己的結論，而且用了「資源錯配」這個詞。\n" +
    "引用時照錄原文，不要改寫。236,313 個單位對 199,700 戶，差額 36,613 個 —— 這個對比要唸出來。\n" +
    "大單位空置率最高這點，直接連回第四部分的交換價值分析。"
  );
}

{
  const s = slide();
  label(s, "一手證據", { x: M, y: 0.72, w: 5, size: 14, cs: 3 });
  quoteBlock(s, {
    x: M, y: 1.35, w: 11.4, size: 30,
    text: "如果直接轉為面向公眾出售，可能會失去當初作為都市更新用途的政策原意，同時也可能會影響到私人房地產市場",
    attrib: "立法議員高岸聲書面質詢所記錄的當局顧慮，2026 年 3 月",
  });
  hr(s, M, 4.45, CW, 0.02);
  body(s, "在有大量單位空置、同時有家庭居住困難的情況下，不開放出售的考慮之一是避免影響私人房地產市場。這不需要任何推測或演繹 —— 政策文件本身就把兩種利益的權衡寫了出來。", {
    x: M, y: 4.68, w: 6.5, h: 1.3, size: 14, bold: true,
  });
  label(s, "同時要記住", { x: 7.5, y: 4.68, w: 5.2, size: 13 });
  body(s, "政府並不缺資源。截至 2016 年 4 月，澳門金融管理局公佈的財政儲備資產達 4,351.3 億澳門元，而當時公共開支僅佔財政收入約三分之一（高武洲 2017，第 79 頁）。\n\n因此問題的表述不應是政府沒有能力，而是資源配置的優先次序與制度設計。", {
    x: 7.5, y: 5.12, w: 5.2, h: 1.5, size: 12,
  });
  s.addNotes("這頁是全報告的理論支點，務必照錄原文、不加形容詞。證據本身已經足夠，加重語氣反而削弱學術性。第四部分工具六會回到這一頁。");
}


/* ================= 第三部分 · 社會因素 ================= */
divider("第三部分", "社會因素", "與理論合計佔 20 分　·　得分最重的一塊", "課程指引列出五類社會因素：經濟、政治和法律（包括公共政策）、社會文化、社會人口、地理和物理環境。本報告選取四類，每類均須同時影響上述三個問題 —— 這是老師課堂上特別強調的要求。", IMG(4), "這部分與第四部分合計 20 分，是全報告最重的一塊。四個因素每個都要明確說出它如何同時影響三個問題 —— 這是老師課堂上特別強調的要求，不要只講因素本身。");

{
  const s = slide();
  title(s, "四個社會因素", { size: 44, h: 1.1 });
  body(s, "每個因素都同時作用於三個問題，這是本部分的組織原則，也是與泛泛而談的分野。", {
    x: M, y: 1.8, w: 8.6, h: 0.5, size: 13.5,
  });
  const cells = [
    ["經濟", "單一產業結構與資產收入的分配失衡", "抬高私樓價格、削弱舊區業主自費維修能力、使低收入家庭固定於條件較差的舊區"],
    ["政治和法律", "土地供應限制與更新法律的門檻設計", "填海週期以十年計、夾屋一環推進反覆、業權門檻在產權分散的唐樓構成實際障礙"],
    ["社會人口", "高密度、人口老化與家庭結構變化", "長者集中於高樓齡舊區、無電梯對長者可達性最尖銳、家庭小型化提高單位需求數量"],
    ["地理和物理環境", "土地稀缺與建築存量老化", "商住用地僅 2.9 平方公里、填海沉澱期 5 至 8 年、老化存量龐大且集中"],
  ];
  const px = [M, M + 6.3], py = [2.45, 4.35];
  cells.forEach(([t, sub, eff], i) => {
    const x = px[i % 2], y = py[Math.floor(i / 2)];
    label(s, `因素${["一", "二", "三", "四"][i]}`, { x, y, w: 5.8, size: 11, cs: 2.4 });
    s.addText(t, {
      x, y: y + 0.32, w: 5.8, h: 0.5, isTextBox: true, margin: 0,
      fontFace: FZH, fontSize: 22, bold: true, color: RED, valign: "top",
    });
    hr(s, x, y + 0.88, 5.8);
    label(s, sub, { x, y: y + 1.0, w: 5.8, size: 12 });
    body(s, eff, { x, y: y + 1.42, w: 5.8, h: 0.6, size: 11.5 });
  });
  s.addNotes("先給總覽，再逐個展開。強調「每個因素都同時影響三個問題」，這正是指引要求的做法。");
}

const factors = [
  {
    n: "因素一", t: "經濟", sub: "單一產業結構與資產收入的分配失衡", img: IMG(3),
    stats: [["17,000", " 元", "2025 年第 3 季月收入中位數"], ["70,935", " 元", "2025 年全年住宅每平方米均價"], ["26.1", "%", "就業居民從事文娛博彩及服務業"]],
    body: "博彩業主導的經濟結構使大量資本集中流入澳門，而土地與房產成為資本增值的主要載體。勞動收入的增長速度長期落後於資產價格：一個月的中位收入不足以購入四分之一平方米。博彩業的週期性波動又使居民收入穩定性偏低，疫情期間的收入衝擊與樓價回調同步發生，可負擔性未見改善。",
    note: "此因素同時抬高私樓價格、削弱舊區業主自費維修重建的能力，並使低收入家庭被固定於居住條件較差的舊區。",
  },
  {
    n: "因素二", t: "政治和法律", sub: "土地供應限制與更新法律的門檻設計", img: IMG(13),
    stats: [["85", "%", "30 至 40 年樓宇的業權門檻"], ["2,800+", " 個", "建成但未啟用的暫住房單位"], ["2026", " 年", "施政報告仍在研究擴大適用範圍"]],
    body: "土地供應受制於填海造地的時間與成本，新城填海區的開發週期以十年計。階梯房屋政策在設計上覆蓋不同收入層，但夾屋一環推進反覆，2026 年政府評估其需求不算迫切，使夾心階層缺乏對應選項。第 18/2022 號法律為都市更新設定的業權門檻雖保障私有產權，卻在產權高度分散的唐樓實際上構成重建障礙。",
    note: "經濟房屋的定價與轉讓限制則影響公共房屋在階梯間的流動性；置換房的資格限制使現成單位對不上實際需求。",
  },
  {
    n: "因素三", t: "社會人口", sub: "高密度、人口老化與家庭結構變化", img: IMG(11),
    stats: [["21,300", " 人", "每平方公里人口密度"], ["100,000", " 人", "澳門半島實際密度（每平方公里）"], ["1,006", " 個", "社屋中專為體弱長者設計的單位"]],
    body: "澳門人口密度居全球前列，約 30.5 平方公里的土地承載逾六十萬人口，澳門半島的實際密度更達每平方公里約十萬人。人口老化使長者集中於樓齡較高的舊區，而無電梯唐樓對長者的可達性問題最為尖銳。家庭結構小型化提高了單位需求數量，在單位總量受限的條件下加劇供需張力。",
    note: "高武洲推算，按人口增加計算需增加住宅單位約 5.16 萬個，而 2004 年起十二年間每年新建成住宅單位平均僅 3,352 個。",
  },
  {
    n: "因素四", t: "地理和物理環境", sub: "土地稀缺與建築存量老化", img: IMG(10),
    stats: [["2.9", " 平方公里", "商住及住宅用地面積"], ["5–8", " 年", "填海沉澱期"], ["4,838", " 幢", "樓齡 30 年以上樓宇"]],
    body: "土地面積限制是所有房屋問題的物理前提。澳門總陸地面積僅 30.5 平方公里，其中商住及住宅用地只有 2.9 平方公里，佔不到總面積一成，且 2009 至 2017 年間基本無變化。更關鍵的是填海的物理時間成本：按沉澱期 5 至 8 年、住宅建造週期 2 年計算，即使填海工程 2018 年完成，該區可建成住宅的最早時間也是 2025 年。",
    note: "這解釋了為何土地供應無法對價格作出即時反應。舊區的高密度佈局又使重建期間的居民安置缺乏鄰近可用空間。",
  },
];

factors.forEach((f) => {
  const s = slide();
  bleed(s, { file: f.img, x: 9.05, y: 0, w: W - 9.05, h: 3.6 });
  label(s, f.n, { x: M, y: 0.68, w: 4, size: 13, cs: 3 });
  title(s, f.t, { y: 1.05, w: 8.0, size: 46, h: 1.1 });
  label(s, f.sub, { x: M, y: 2.25, w: 8.0, size: 13.5 });
  hr(s, M, 2.72, 8.0, 0.02);
  body(s, f.body, { x: M, y: 2.95, w: 8.0, h: 2.3, size: 13 });
  hr(s, M, 5.42, 8.0);
  body(s, f.note, { x: M, y: 5.6, w: 8.0, h: 0.9, size: 12, bold: true });
  let sy = 4.0;
  f.stats.forEach(([v, u, l]) => {
    s.addText([
      { text: v, options: { fontFace: FEN, fontSize: 26, bold: true, color: RED } },
      { text: u, options: { fontFace: FZH, fontSize: 12, bold: true, color: RED } },
    ], { x: 9.05, y: sy, w: 3.7, h: 0.5, isTextBox: true, margin: 0, valign: "middle" });
    label(s, l, { x: 9.05, y: sy + 0.46, w: 3.7, size: 10.5, cs: 0.8 });
    hr(s, 9.05, sy + 0.92, 3.7);
    sy += 1.06;
  });
  s.addNotes(`${f.t}：先講機制，再講它如何同時作用於三個問題。右側三個數字用來支撐，不要逐個唸，挑一個最有力的說。`);
});

/* ================= 第四部分 · 馬克思理論 ================= */
divider("第四部分", "應用馬克思\n理論解釋", "與社會因素合計佔 20 分", "老師明確要求：不必複述整套馬克思主義，重點是應用於澳門房屋問題。以下六個理論工具，每個都掛回第二部分的實際數據。", IMG(14, "png"), "老師要求的是應用而非複述，所以每個工具都只用一句講理論，其餘時間全部用來講澳門的數據對應。六個工具不必平均分配時間，工具四的租隙理論與工具六的國家角色最有力，可多花時間。");

{
  const s = slide();
  title(s, "六個理論工具", { size: 44, h: 1.1 });
  body(s, "前兩個來自馬克思本人，中間兩個來自新馬克思主義城市理論，最後兩個回到階級與國家。每個工具都有澳門的數據對應。", {
    x: M, y: 1.8, w: 9, h: 0.55, size: 13.5,
  });
  ruledList(s, {
    x: M, y: 2.6, w: CW, gap: 0.62, size: 13,
    items: [
      ["工具一　使用價值與交換價值", "樓花每平方米 103,752 元　對比現貨 67,611 元，溢價逾五成"],
      ["工具二　地租理論與土地壟斷", "樓價收入比約 10.3 倍　即十年勞動所得換取居住權"],
      ["工具三　哈維：資本的第二循環", "價格 −34.1%、成交量 −71.3%　過度積累後的貶值過程"],
      ["工具四　史密斯：租隙理論", "祐漢 121 元 對比 黑沙環新填海區 165 元　租隙 44 元"],
      ["工具五　階級結構與住房分化", "舊樓租金 119 元 僅及新樓 182 元的 65%"],
      ["工具六　勞動力再生產與國家角色", "財政儲備 4,351.3 億　置換房 1,700 多個單位待售"],
    ],
  });
  s.addNotes("這頁是第四部分的地圖。強調每個工具都不是空談，右欄就是它對應的澳門數據。");
}

const tools = [
  {
    n: "工具一", t: "使用價值與\n交換價值的矛盾", img: IMG(3),
    lead: "馬克思區分商品的使用價值與交換價值。住宅的使用價值是遮風擋雨的居住功能，交換價值是其在市場上可換取的貨幣量。房屋問題的根源在於交換價值支配了使用價值。",
    evid: [["103,752", " 元", "住宅樓花每平方米均價"], ["67,611", " 元", "現貨住宅每平方米均價"], ["+53", "%", "樓花溢價"]],
    close: "樓花尚未建成、不具任何即時居住功能，卻取得逾五成的價格溢價 —— 買家支付的是對未來交換價值的預期，而非當下的使用價值。同一邏輯解釋了空置與買不起並存：空置對使用價值是純粹浪費，對持有者的交換價值卻完全合理。",
    cite: "可引用恩格斯《論住宅問題》：住房短缺並非資本主義的偶然缺陷，而是其固有產物。另可引高武洲（2017，第 69 頁）：住宅已不僅僅是居住場所，還是投資的工具。",
  },
  {
    n: "工具二", t: "地租理論與\n土地壟斷", img: IMG(5),
    lead: "馬克思的地租理論指出，土地所有者憑藉土地的不可再生與壟斷性質，無須參與生產即可持續收取地租，而地租最終來自社會總剩餘價值的分配。",
    evid: [["30.5", " 平方公里", "澳門總陸地面積"], ["2.9", " 平方公里", "商住及住宅用地"], ["10.3", " 倍", "雙職家庭樓價收入比"]],
    close: "澳門的地理條件使這一機制格外突出：土地不可擴張，博彩業帶來的資本積累又不斷推高對土地的競爭性需求。結果是土地與房產的持有者取得與其勞動無關的資產增值，而僅擁有勞動力的居民則須以勞動收入的長期流向換取居住權。",
    cite: "樓價收入比約十倍的意義在此框架下可如此表述：一個家庭須將約十年的全部勞動所得轉移給房產持有者與地產資本，方能取得居住空間的所有權。這不是市場摩擦，而是剩餘價值的分配結果。",
  },
  {
    n: "工具三", t: "哈維：\n資本的第二循環", img: IMG(4),
    lead: "哈維（Harvey, 1978）延伸馬克思的資本循環理論：當資本在生產領域（第一循環）出現過度積累，便會轉向建成環境（第二循環）—— 房地產與基建 —— 尋求出路。",
    evid: [["26.1", "%", "就業居民從事博彩及服務業"], ["−34.1", "%", "價格由高峰回落"], ["−71.3", "%", "成交量萎縮"]],
    close: "澳門是這一模型近乎教科書式的案例：博彩業構成第一循環，其龐大盈餘與政府博彩稅收轉入土地與地產，使建成環境成為資本增值的關鍵場域。第二循環的理論要點是它會週期性崩潰，而澳門數據正好記錄了這個過程。",
    cite: "疫情是觸發點，但結構成因是資本大量湧入建成環境後，超出了實際居住需求所能支撐的水平。空置單位與買不起樓並存，正是過度積累的表徵而非市場失靈的意外。",
  },
  {
    n: "工具四", t: "史密斯：\n租隙理論", img: IMG(6),
    lead: "史密斯（Smith, 1979）的租隙理論指出，當現時地租與潛在地租之間的差距擴大到足以覆蓋重建成本並提供利潤時，資本便會進場再開發。這解釋了仕紳化為何是資本回到城市而非人回到城市。",
    evid: [["121", " 元", "黑沙環及祐漢區每平方米租金"], ["165", " 元", "黑沙環新填海區每平方米租金"], ["44", " 元", "租隙　潛在高出約 36%"]],
    close: "澳門的租金數據為此提供了可量化的證據。祐漢與新橋屬全澳租金最低之列，而都市更新的首個項目正是祐漢七棟樓群，住商戶共 2,556 戶。租隙最大的地方，就是資本再開發最先進場的地方 —— 這並非巧合，而是租隙理論的直接預測。",
    cite: "哈維的剝奪式積累進一步指出：若原居民因補償不足或更新後租金上升而被置換，土地增值便由資本攫取。祐漢住戶以長者與低收入租戶為主，正屬最缺乏議價能力的一群。業權門檻由實際上的 100% 降至 85／80／60%，在加快更新效率的同時也降低了少數業主拒絕被收購的能力 —— 法律的效果具有兩面性。",
  },
  {
    n: "工具五", t: "階級結構與\n住房的階級分化", img: IMG(12),
    lead: "馬克思以是否佔有生產資料界定階級。在當代住房議題上，此界線體現為是否佔有房產這一資產：持有物業者在資產升值中獲益，僅靠工資收入者則被排除於資產積累之外。",
    evid: [["119", " 元", "樓齡 30 年以上租金"], ["182", " 元", "樓齡 5 年以下租金"], ["168", " 元", "少於 50 平方米單位租金（最高）"]],
    close: "澳門的夾心階層正是這一結構的產物 —— 收入超出公共房屋的資格上限，卻不足以進入私人市場，其困境並非源於個人選擇失當，而是階級結構在住房分配制度中的必然位置。居住條件的差異是階級不平等在空間上的投射。",
    cite: "更尖銳的是買與租的反轉：細單位每平方米售價最低，租金卻最高。負擔不起首期而只能租住細單位的家庭，按單位面積計付出最高的居住成本，且付出的是租金而非本金 —— 支出不會轉化為資產。兩者的差距因此不是靜態的，而是持續擴大的。",
  },
  {
    n: "工具六", t: "勞動力再生產與\n國家的調節角色", img: IMG(13),
    lead: "馬克思指出資本主義體系須維持勞動力的再生產，而住房是勞動力再生產的必要條件。當住房成本超出工資可負擔範圍，再生產即出現危機，表現為延遲成家、生育率下降與青年人口外流。",
    evid: [["4,351.3", " 億元", "財政儲備資產（2016 年 4 月）"], ["6.3", "%", "社屋佔全澳住宅單位比例"], ["1,700+", " 個", "置換房待售單位"]],
    close: "國家介入因此具有雙重性：階梯房屋政策以公共資源提供市場以外的居住選項，緩和了階級矛盾並維持勞動力再生產。但這類政策調節的是矛盾的表現形式，而非產生矛盾的分配結構本身 —— 社屋僅佔全澳住宅約 6.3%，房產作為資本增值載體的性質未被改變。",
    cite: "在資源充足、單位現成、需求存在的三重條件同時成立時，政策選擇仍受「不影響私人房地產市場」這一考慮所約束。這正是馬克思主義國家理論所預期的：國家介入的邊界，止於不動搖資本積累的基本結構。",
  },
];

tools.forEach((tl) => {
  const s = slide();
  bleed(s, { file: tl.img, x: 9.15, y: 0, w: W - 9.15, h: 2.95 });
  label(s, tl.n, { x: M, y: 0.66, w: 4, size: 13, cs: 3 });
  title(s, tl.t, { y: 1.02, w: 8.2, size: 34, lsm: 1.02, h: 1.5 });
  hr(s, M, 2.62, 8.2, 0.02);
  body(s, tl.lead, { x: M, y: 2.82, w: 8.2, h: 1.5, size: 12.5 });
  hr(s, M, 4.36, 8.2);
  label(s, "澳門的數據對應", { x: M, y: 4.52, w: 8.2, size: 12 });
  body(s, tl.close, { x: M, y: 4.92, w: 8.2, h: 1.6, size: 12 });
  label(s, "引用與延伸", { x: 9.15, y: 3.12, w: 3.55, size: 11.5 });
  body(s, tl.cite, { x: 9.15, y: 3.52, w: 3.55, h: 1.25, size: 10.5, lsm: 1.4 });
  let sy = 4.92;
  tl.evid.forEach(([v, u, l]) => {
    hr(s, 9.15, sy, 3.55);
    s.addText([
      { text: v, options: { fontFace: FEN, fontSize: 19, bold: true, color: RED } },
      { text: u, options: { fontFace: FZH, fontSize: 10.5, bold: true, color: RED } },
    ], { x: 9.15, y: sy + 0.06, w: 3.55, h: 0.34, isTextBox: true, margin: 0, valign: "middle" });
    label(s, l, { x: 9.15, y: sy + 0.4, w: 3.55, size: 9.5, cs: 0.5 });
    sy += 0.62;
  });
  s.addNotes(`${tl.t.replace(/\n/g, "")}：先用一句講清理論，再落到右下的數據。不要停留在概念，一定要把數字唸出來。`);
});

{
  const s = slide();
  label(s, "第四部分小結", { x: M, y: 0.68, w: 5, size: 14, cs: 2.4 });
  title(s, "理論的解釋力\n落在哪裡", { y: 1.1, w: 9, size: 48, lsm: 0.98, h: 2.1 });
  hr(s, M, 3.35, CW, 0.02);
  body(s, "馬克思理論對澳門房屋問題的解釋力在於：它不把房屋問題歸因於個別家庭的儲蓄不足或投資失當，而指向住宅商品化條件下交換價值對使用價值的支配、土地壟斷產生的地租分配，以及由此形成的階級化住房分配結構。", {
    x: M, y: 3.6, w: 6.3, h: 2.0, size: 14,
  });
  label(s, "三個問題的共同根源", { x: 7.3, y: 3.6, w: 5.4, size: 13 });
  body(s, "這一視角同時解釋了三個具體問題的共同根源，也說明了為何在樓價下跌的年份，可負擔性問題依然存在，而租金甚至上升。\n\n如果只看供求，樓價跌了問題就該緩解；但把住宅看成資本增值的載體，就能理解為何跌價受益的是有資本的人，而無資產者的居住成本反而上升。", {
    x: 7.3, y: 4.05, w: 5.4, h: 2.2, size: 12.5,
  });
  s.addNotes("這頁收束第四部分。核心對比：供求解釋不了「樓價跌、租金升」，階級與資本的視角可以。");
}

/* ================= 第五部分 · 紓解方案 ================= */
divider("第五部分", "紓解方案", "4 項具體措施", "老師強調要具體：不能只寫增建公屋，須說明建多少、哪一類、在哪裡、如何定價。四項措施分別對應三個問題，最後一項與第四部分的理論分析呼應。", IMG(12), "四項措施要講得具體：建多少、哪一類、在哪裡、如何定價。最後一項措施與第四部分的理論呼應，記得明確指出這個閉環，評分上有加成。");

{
  const s = slide();
  title(s, "措施一與措施二", { size: 42, h: 1.0 });
  label(s, "措施一　針對問題一", { x: M, y: 1.75, w: 5.9, size: 12.5, cs: 2 });
  s.addText("以樓價收入比為公共房屋\n供應量的定錨指標", {
    x: M, y: 2.15, w: 5.9, h: 1.1, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: 22, bold: true, color: RED, lineSpacingMultiple: 1.06, valign: "top",
  });
  hr(s, M, 3.35, 5.9);
  body(s, "現行公共房屋規劃以需求推算量為依據，例如推算 2025 年社屋需求區間中值 17,394 間，對比現有 15,037 間。建議改為同時以可負擔性指標定錨：設定樓價收入比的政策目標區間，當比率超出上限時自動觸發公共房屋供應量的上調與推地計劃的檢討。", {
    x: M, y: 3.55, w: 5.9, h: 2.0, size: 12.5,
  });
  label(s, "使供應決策與居民實際負擔能力掛鈎，而非僅與登記需求掛鈎", { x: M, y: 5.62, w: 5.9, size: 11.5 });
  label(s, "措施二　針對階梯斷鏈", { x: 6.9, y: 1.75, w: 5.8, size: 12.5, cs: 2 });
  s.addText("重啟夾心階層住房並\n明確定價與供應時間表", {
    x: 6.9, y: 2.15, w: 5.8, h: 1.1, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: 22, bold: true, color: RED, lineSpacingMultiple: 1.06, valign: "top",
  });
  hr(s, 6.9, 3.35, 5.8);
  body(s, "2026 年政府評估夾屋需求不算迫切，快環順利樓北側地塊用途仍在檢討。但這與政府自己委託的研究矛盾：《澳門未來房屋需求研究》估算需要夾屋的家團佔比達 10.97%，每年新增需求 939 至 1,760 戶，2030 年總需求中性估算 7,737 至 10,093 戶。同一研究對社屋結論是「很大機會滿足需求」，對經屋亦預期「能夠有效滿足」—— 五個階梯中唯一供應明顯落後的，正是被判定為不迫切的夾屋。", {
    x: 6.9, y: 3.55, w: 5.8, h: 2.2, size: 12,
  });
  label(s, "建議公布該地塊的夾屋用途、單位數量與落成時間表", { x: 6.9, y: 5.82, w: 5.8, size: 11.5 });
  s.addNotes("措施一的賣點是把指標從「登記需求」換成「負擔能力」，這是制度設計層面的建議，不是喊口號。措施二要指出具體地塊。");
}

{
  const s = slide();
  title(s, "措施三與措施四", { size: 42, h: 1.0 });
  label(s, "措施三　針對問題二與問題三", { x: M, y: 1.75, w: 5.9, size: 12.5, cs: 2 });
  s.addText("以維修基金與強制業主會\n制度切入三無大廈", {
    x: M, y: 2.15, w: 5.9, h: 1.1, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: 22, bold: true, color: RED, lineSpacingMultiple: 1.06, valign: "top",
  });
  hr(s, M, 3.35, 5.9);
  body(s, "4,838 幢樓齡 30 年以上樓宇中超過 3,500 幢為低層唐樓，且絕大部分無業主會、無管理公司、無維修基金。在業權門檻難以進一步下調的現實下，建議將政策重心由重建前移至維修與管理：對樓齡達標的樓宇強制設立業主會與維修基金，並以現行低層樓宇共同設施維修資助計劃為基礎擴大資助覆蓋與金額。", {
    x: M, y: 3.55, w: 5.9, h: 2.1, size: 12.5,
  });
  label(s, "在重建不可行時延緩老化並改善即時居住安全", { x: M, y: 5.72, w: 5.9, size: 11.5 });
  label(s, "措施四　與理論部分呼應", { x: 6.9, y: 1.75, w: 5.8, size: 12.5, cs: 2 });
  s.addText("在都市更新中設置原居民\n安置與防仕紳化條款", {
    x: 6.9, y: 2.15, w: 5.8, h: 1.1, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: 22, bold: true, color: RED, lineSpacingMultiple: 1.06, valign: "top",
  });
  hr(s, 6.9, 3.35, 5.8);
  body(s, "現行補償方式已包括單位置換、公平市值現金補償與搬遷津貼。建議進一步設置原居民回遷比例下限與更新後租金管制年期，使更新的收益不全數轉化為資本增值。並回應明珠都滙的教訓：放寬置換房申請資格至所有受都市更新影響的業權人，以及容許彈性選擇不同戶型，解決戶型匹配問題。", {
    x: 6.9, y: 3.55, w: 5.8, h: 2.1, size: 12.5,
  });
  label(s, "直接回應第四部分指出的置換風險，在評分上有加成作用", { x: 6.9, y: 5.72, w: 5.8, size: 11.5 });
  s.addNotes("措施三是本組最務實的一項：既然重建難，就先做維修。措施四要明確說它回應了第四部分的理論分析，讓理論與建議形成閉環。");
}

/* ================= 收尾 ================= */
{
  const s = slide();
  bleed(s, { file: IMG(11), x: 8.3, y: 0, w: W - 8.3, h: 4.2 });
  title(s, "訪問交代", { size: 44, h: 1.0 });
  body(s, "課程指引要求訪問一至兩位相關社會人士。訪問內容當作文獻引用入正文，主要補充社會因素與具體措施兩部分。", {
    x: M, y: 1.72, w: 7.3, h: 0.8, size: 13,
  });
  ruledList(s, {
    x: M, y: 2.62, w: 7.3, gap: 0.46, size: 12.5, labelText: "受訪對象",
    items: [
      ["受訪者一", "＿＿＿＿＿＿＿＿　職銜與機構"],
      ["受訪者二", "＿＿＿＿＿＿＿＿　職銜與機構"],
      ["訪問日期", "＿＿＿＿＿＿＿＿"],
      ["訪問方式", "＿＿＿＿＿＿＿＿"],
    ],
  });
  hr(s, M, 4.95, 7.3, 0.02);
  label(s, "交代方式", { x: M, y: 5.12, w: 7.3, size: 12.5 });
  body(s, "願意公開身份者附相片一張加兩至三行背景介紹；不願公開身份者仍須說明其工作與相關性，以證明訪問確實進行且對象具相關資格。", {
    x: M, y: 5.52, w: 7.3, h: 0.9, size: 12,
  });
  label(s, "訪問技巧提醒", { x: 8.5, y: 4.45, w: 4.2, size: 12.5 });
  body(s, "受訪者不是社會學家，不要問馬克思理論。\n\n若受訪者談的是個人因素，要自行把其中的社會結構成分抽出來使用，不可原話照搬當作社會因素。", {
    x: 8.5, y: 4.88, w: 4.2, h: 1.5, size: 11.5,
  });
  s.addNotes("匯報時要具名交代受訪者背景，證明訪問確實進行。這頁的空格在匯報前必須填好。");
}

{
  const s = slide();
  title(s, "參考文獻", { size: 44, h: 1.0 });
  label(s, "課程要求最少 10 份。下列為核心 12 項，完整 32 項清單見報告附錄。所有外文文獻的卷期頁碼已逐一核對。", { x: M, y: 1.72, w: CW, size: 11.5 });
  hr(s, M, 2.18, CW, 0.02);
  const left = [
    "澳門統計暨普查局（2025）。《私人建築及不動產交易：2024 年全年及第 4 季》。",
    "澳門統計暨普查局（2026）。《租金統計：2025 年全年及第四季》。",
    "澳門統計暨普查局（2025）。《就業調查：2025 年 7 月至 9 月》。",
    "第 18/2022 號法律《都市更新法律制度》。公報第 I 組第 52 期，2022 年 12 月 28 日。",
    "高武洲（2017）。〈澳門公共房屋在城巿設計方面的關鍵問題〉。《澳門研究》2017 年第 3 期，68–82 頁。",
    "高岸聲議員（2026 年 3 月）。〈關於修改暫住房及置換房法律推進都市更新的書面質詢〉。",
  ];
  const right = [
    "Engels, F. (1872). The Housing Question.",
    "Harvey, D. (1978). The urban process under capitalism. IJURR, 2(1–4), 101–131.",
    "Smith, N. (1979). Toward a theory of gentrification. JAPA, 45(4), 538–548.",
    "Kan, K. (2019). Accumulation without dispossession? IJURR, 43(4), 633–648.",
    "Wu, Q., Zhang, X., & Waley, P. (2017). When Neil Smith met Pierre Bourdieu in Nanjing. Housing Studies, 32(5), 659–677.",
    "Chang, H.-C. (2013). Housing affordability in Macau. China Economic Journal, 6(1), 46–56.",
  ];
  [[M, left, "中文　政府統計與官方文件"], [6.9, right, "外文　理論與應用"]].forEach(([x, arr, cap]) => {
    label(s, cap, { x, y: 2.38, w: 5.8, size: 12 });
    let cy = 2.72;
    arr.forEach((t) => {
      s.addText(t, {
        x, y: cy, w: 5.8, h: 0.5, isTextBox: true, margin: 0,
        fontFace: FZH, fontSize: 10.5, color: RED, lineSpacingMultiple: 1.3, valign: "top",
      });
      cy += 0.5;
      hr(s, x, cy, 5.8);
      cy += 0.1;
    });
  });
  s.addNotes("不必逐條唸。指出三點：政府統計為主、有《澳門研究》的本地學術文獻、有馬克思理論原典與當代應用。");
}

{
  const s = slide();
  title(s, "數據限制聲明", { size: 44, h: 1.0 });
  label(s, "凡未能核實或未有公開數字者一律註明，並未作任何自行推算以外的填補，以符合學術誠信要求。", { x: M, y: 1.72, w: CW, size: 12.5 });
  hr(s, M, 2.2, CW, 0.02);
  ruledList(s, {
    x: M, y: 2.45, w: CW, gap: 0.72, size: 12.5,
    items: [
      ["樓價序列已全鏈核實", "五年全年數值取自 DSEC 各年年度報告，並以按年變動率交叉驗證：93,500 × 0.91 ≈ 85,114；85,114 × 0.833 ≈ 70,935。初稿階段曾把 2024 年誤記為 88,874 元（實為第 4 季新口岸區分區價），已更正。"],
      ["30 年以上樓宇幢數各方說法不一", "4,838 幢、約 5,000 幢、逾 4,000 棟、5,173 幢（2019 年 6 月底）。本報告只採單一時點，不並列不同來源作趨勢。"],
      ["部分數據未有公開彙總", "人均居住面積、無電梯舊樓數量、劏房統計、社屋輪候人數與輪候時間，以及濫用社屋經屋的個案彙總，均未能定位到可直接引用的公開數字。"],
      ["樓價收入比為本報告自行推算", "計算式已完整列出以便查核。Demographia 並不包含澳門，Numbeo 澳門數字為眾包估算，兩者不可並列比較。"],
    ],
  });
  s.addNotes("這頁是加分項，展示我們知道數據的邊界在哪裡。老師最怕的是學生把查不到的數字硬填，我們反過來把限制講清楚。");
}

{
  const s = slide({ noPage: true });
  s.addImage({
    path: IMG(1, "png"), x: 8.6, y: 1.25, w: 4.2, h: 5.4,
    sizing: { type: "contain", w: 4.2, h: 5.4 },
  });
  label(s, "結論", { x: M, y: 1.35, w: 4, size: 14, cs: 3 });
  s.addText("不是沒有房子\n是房子不用來住", {
    x: M, y: 1.82, w: 8.0, h: 2.6, isTextBox: true, margin: 0,
    fontFace: FZH, fontSize: 54, bold: true, color: RED, lineSpacingMultiple: 0.98,
  });
  hr(s, M, 4.6, 7.8, 0.02);
  body(s, "澳門樓價四年累計下跌逾三成，成交量萎縮七成，而租金逆勢上升、收入中位數下跌。同一時期，政府握有數千億財政儲備，建成的置換房有一千七百多個單位待售、兩千八百多個暫住房完全未啟用，而舊區仍有四千八百多幢樓齡三十年以上的樓宇等待更新。", {
    x: M, y: 4.85, w: 7.8, h: 1.4, size: 13.5,
  });
  label(s, "問題不在供應總量，而在住宅被當作資本增值的載體而非居住空間 ——\n這是馬克思理論的解釋，也是本報告全部數據指向的結論。", {
    x: M, y: 6.3, w: 7.8, h: 0.75, size: 13,
  });
  s.addNotes(
    "結語。標題一句話收束全報告：不是沒有房子，是房子不用來住。\n" +
    "然後把四個關鍵數字再唸一次：−31.7%、−71.3%、+2.1%、10.3 倍。\n" +
    "最後回到理論：問題不在供應總量，而在住宅的性質。留時間答問。"
  );
}

/* ---------- 輸出 ---------- */
pres.writeFile({ fileName: "澳門房屋問題-小組研習報告.pptx" }).then((f) => {
  console.log("WROTE:", f, "| slides:", pageNo + 2);
});

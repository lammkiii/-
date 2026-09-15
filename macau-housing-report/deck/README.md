# 簡報生成器

`deck.js` 生成 `澳門房屋問題-小組研習報告.pptx`（51 頁）。

設計語言沿用組員提供的 Canva 模板：奶白 `EEEBE3` 配純紅 `CA0013`、
巨型標題配極緊行距、細紅線作列表分隔、相片出血到版邊、括號頁碼。
中文字體用微軟正黑體（Windows 標準繁體介面字），數字與拉丁字用
Inter（與模板一致，Canva 內建）。

## 重新生成

```bash
npm install pptxgenjs
node deck.js
```

## 檢查

本沙箱的 LibreOffice 載不到 pptx，所以無法用 soffice 出圖。
改以兩種方式檢查：

1. 幾何審計 —— 以 python-pptx 讀出每個形狀的實際框界，按中文全寬
   1.0em、拉丁 0.52em 估算行數與所需高度，檢查文字溢出、出界，以及
   頁碼與頁腳是否壓在出血相片上。
2. `render.py` —— 以 pymupdf 近似渲染指定頁面為 PDF 供目視檢查。
   斷行為粗略估算，與 PowerPoint 實際斷行不同，只用於確認版式。

```bash
python3 render.py deck.pptx x 1,14,22,41    # 指定頁碼
```

## 圖片

`img/` 內的相片來自組員提供的 Canva 模板本身（該範本的素材），
已裁掉透明留白並壓縮至約 1700px、JPEG 品質 82。

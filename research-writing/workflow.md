# 論文初稿協作流程

搭配 `writing-rules.md` 使用。規則是「怎麼寫」，本檔是「按什麼順序寫、我需要你給什麼」。

---

## A. 場景 → Prompt 路由表

專案 Part I 的 18 個 prompt 按用途歸類，撰稿過程中按需切換：

| 我要做的事 | 用哪個 prompt | 輸入 | 產出 |
|---|---|---|---|
| 中文草稿 → 英文論文片段 | 中轉英-latex / 中轉英-word | 中文草稿 | 英文正文 + 中文直譯核對 |
| 讀懂英文論文段落 | 英轉中-latex | 英文 LaTeX | 直譯中文（不潤色） |
| 零散中文要點 → 中文論文段落 | 中轉中-word | 口語化草稿、要點 | 重寫段落 + 重構思路 |
| 篇幅超 / 不足一點 | 縮寫 / 擴寫 | 英文 LaTeX | ±5–15 詞的微調 |
| 提升語言品質 | 表達潤色（英文 / 中文） | 段落 | 潤色稿 + 修改日誌 |
| 投稿前語言體檢 | 去 AI 味（LaTeX 英文 / Word 中文） | 段落或全文 | 自然化文本 + 日誌 |
| 終稿紅線核對 | 邏輯檢查 | 英文 LaTeX | 通過 / 分點問題 |
| 主圖、架構圖 | 論文架構圖（中文版 + 英文版都試，取審美最優） | Abstract + Method | 生圖 prompt |
| 選圖表類型 | 實驗繪圖推薦 | 原始 Excel/CSV + 想強調的結論 | 1–2 種方案 + 視覺設計規範 |
| 寫 caption | 生成圖的標題 / 生成表的標題 | 中文描述 | 規範英文標題 |
| 實驗結果 → 分析段落 | 實驗分析 | 實驗數據 | `\paragraph{}` 分析段 |
| 全篇自檢 | Reviewer 視角審視 | 論文 PDF + 投稿目標 | 審稿報告 + 改稿策略 |

Part II 的 skills（需 Cursor / Claude Code + `npx openskills install`）與上表互補：
`20-ml-paper-writing`（會議模板起稿、BibTeX 核實、booktabs 表格、投稿 checklist、換會議格式遷移）、
`humanizer`（去 AI 痕跡）、`docx`（Word 模板填稿、tracked changes 修訂）、
`doc-coauthoring`（分節三階段協作）、`canvas-design`（概念圖 / 框架圖）。

---

## B. 撰稿順序

專案的 `20-ml-paper-writing` 輸出順序是 Abstract → Introduction → Methods → Experiments → Related Work → Limitations。
實際起草建議倒過來從最確定的部分開始，避免 Abstract 反覆改：

1. **確認一句話貢獻**（先對齊，不對齊不往下寫）
2. **Method**：問題定義 → 符號 → 模組 → 資料流 → 關鍵公式
3. **Experiments**：主表 → 消融 → 分析段（用「實驗分析」prompt 的 `\paragraph{}` 格式）
4. **Introduction**：背景 → gap → 我們的做法 → 貢獻列點（正文仍用連貫段落）
5. **Related Work**：分支劃界 + 與本文的差異點
6. **Abstract**：最後寫，從已定稿的 Intro + 主結果壓縮
7. **Limitations / Broader Impact**：按會議要求
8. **收尾三連**：去 AI 味 → 邏輯檢查 → Reviewer 視角審視

每節產出後給 Part 1 正文 + Part 2 中文直譯，方便核對邏輯是否走偏。

---

## C. 我需要你提供的材料

按重要性排序。**1–3 是起草的前提，缺了只能瞎猜；4–9 可以邊寫邊補。**

1. **投稿目標**：會議 / 期刊名稱與年份、頁數限制、截稿日。（決定模板、篇幅分配、Limitations 與 Broader Impact 是否必需）
2. **載體與語言**：LaTeX 還是 Word？英文還是中文？（直接決定轉義、Markdown、標點這組硬約束走哪一支）
3. **一句話核心貢獻** + 2–4 條 claim。
4. **方法**：問題定義、符號約定、模組組成、資料流向、關鍵公式、與最接近的已有工作的差異點。
5. **實驗**：資料集、baseline 名稱與版本、評測指標、主表數值（**直接貼 Excel / CSV 原始行列結構最好**）、消融設置、超參敏感性、效率數據（參數量 / 顯存 / 延遲）、隨機種子數與方差。
6. **圖表**：已有的圖、每張圖想強調的核心結論。
7. **Related Work**：領域分支與代表作（能給 BibTeX 更好）。
8. **已知限制與弱點**：用於寫 Limitations、以及提前降低 rebuttal 攻擊面。
9. **現成素材**：repo 路徑、README、`results/`、實驗筆記、之前寫過的草稿片段。

### 兩條我不會越界的地方

- **不編數據、不編文獻**：缺的數值標 `[DATA NEEDED]`，未核實的引用標 `[CITATION NEEDED]`，不會拿相近數字湊或憑記憶寫 BibTeX。
- **不替你拔高結論**：資料撐不起的 claim 我會直接說撐不起，並給可行的補實驗建議，而不是換個說法把它寫得更好聽。

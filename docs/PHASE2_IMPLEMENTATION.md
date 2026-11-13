# Báo Cáo Triển Khai Hoàn Thiện Phase 2: Search Engine Technologies (Điểm Mới)

Dự án môn học: **SEG301 — Search Engine Technologies**  
Đơn vị: **Đại học FPT**  
Nhóm sinh viên thực hiện:
- **Trần Trung Tín** (MSSV: SE201619)
- **Võ Hiếu Thắng** (MSSV: SE200932)

---

## 1. Tổng quan Kiến trúc Phase 2 Search Engine

Trong Phase 2, hệ thống Tạp chí điện tử **Điểm Mới** đã chuyển mình từ mô hình tìm kiếm cơ bản (SQL `ILIKE`) sang một hệ thống Thu hồi Thông tin (Information Retrieval - IR) hiện đại với kiến trúc phân tầng:

```
[Người dùng / Web UI]
         │ (Gửi truy vấn q, thuật toán: bm25 | tfidf | hybrid | ilike)
         ▼
[Search API Gateway & Rate Limiter] (/api/v1/search)
         │
         ├───► [Query Autocomplete & Suggestions] (/api/v1/search/suggestions)
         │           └─ Tra cứu tiền tố từ Từ vựng Index & Lịch sử tìm kiếm
         │
         ▼
[Text Processing & Tokenizer Engine]
         ├─ Unicode NFC Normalization
         ├─ Vietnamese Diacritics Folding (accent-insensitive)
         ├─ Vietnamese Stop Words Filter (65+ từ dừng chuyên dụng)
         └─ Compound N-Gram Extraction (e.g., "trí tuệ", "học máy")
         │
         ▼
[Two-Stage Search Pipeline]
  Stage 1: Candidate Retrieval
         └─ Truy vấn nhanh ứng viên hợp lệ từ PostgreSQL Document Store
  Stage 2: Scoring & Relevance Ranking
         ├─ Okapi BM25F (Field-Weighted Relevance: Title=3.0, Summary=2.0, Content=1.0)
         ├─ TF-IDF Vector Space Model (Cosine Similarity với log TF)
         ├─ Hybrid Model (BM25F + Implicit Click Feedback Boost + Recency Boost)
         └─ Dynamic Keyword Highlighting & Snippet Extraction (<mark>)
         │
         ▼
[Interaction Telemetry & Feedback Loop]
         ├─ Tự động ghi nhận phiên tìm kiếm (SEARCH event)
         ├─ Xác thực click hợp lệ theo vị trí trang (CLICK event qua /search/clicks)
         └─ Cập nhật trọng số CTR cho mô hình Hybrid thời gian thực
```

---

## 2. Chi tiết các Module Thuật toán IR

### 2.1. Module Xử lý Ngôn ngữ & Tách từ (`apps/api/src/modules/search/tokenizer.ts`)
- **Chuẩn hóa Unicode:** Chuẩn hóa NFC đồng nhất trên toàn bộ tập văn bản tiếng Việt.
- **Lọc từ dừng (Stop Words):** Danh mục từ dừng tiếng Việt kết hợp tiếng Anh kỹ thuật (65+ từ) loại bỏ các hư từ không mang tải trọng thông tin (`và`, `là`, `của`, `những`, `trong`, `được`...).
- **Tạo n-gram ghép từ:** Tự động sinh các cụm từ ghép đôi (bigram) phổ biến trong tiếng Việt kỹ thuật (như `trí tuệ nhân tạo`, `học máy`, `chuyển đổi số`).

### 2.2. Inverted Index Engine (`apps/api/src/modules/search/indexer.ts`)
- Lưu trữ danh sách đảo (Posting List) dạng bộ nhớ đệm: `Term -> Map<DocId, Posting>`.
- Mỗi Posting lưu chi tiết tần số xuất hiện theo từng trường văn bản:
  - $TF_{title}$: Tần số từ trong Tiêu đề bài viết.
  - $TF_{summary}$: Tần số từ trong Tóm tắt bài viết.
  - $TF_{content}$: Tần số từ trong Nội dung bài viết.
- Tự động duy trì độ dài trung bình từng trường ($avgdl_{title}, avgdl_{summary}, avgdl_{content}$) để phục vụ chuẩn hóa độ dài tài liệu.
- Cung cấp API chẩn đoán `/api/v1/search/stats` và API tái lập chỉ mục `/api/v1/search/reindex` (bảo vệ bằng quyền `documents.publish`).

### 2.3. Các Mô hình Xếp hạng Độ phù hợp (`apps/api/src/modules/search/ranking.ts` & `service.ts`)
1. **Okapi BM25F (Field-weighted BM25):**
   - Trọng số trường: $W_{title} = 3.0$, $W_{summary} = 2.0$, $W_{content} = 1.0$.
   - Tham số chuẩn hóa: $k_1 = 1.2$, $b = 0.75$.
   - Tính toán nghịch đảo tần số văn bản Robertson-Spärck Jones IDF:
     $$\text{IDF}(t) = \ln\left(1 + \frac{N - DF(t) + 0.5}{DF(t) + 0.5}\right)$$
   - Chuẩn hóa độ dài trường:
     $$B_f = 1 - b + b \cdot \frac{L_{d,f}}{\text{avgdl}_f}$$
   - Cộng điểm ưu tiên đặc biệt nếu tiêu đề chứa cụm từ truy vấn chính xác.

2. **TF-IDF Vector Space Model:**
   - Sử dụng hàm logarit tần số xuất hiện $1 + \ln(TF)$ kết hợp trọng số trường để tính toán độ tương đồng không gian vector.

3. **Hybrid Model (BM25 + CTR Feedback + View Count):**
   - Tận dụng bảng nhật ký tương tác `search_click_logs`.
   - Tính toán tỉ lệ nhấp chuột (Click-Through Rate) của tài liệu tương ứng với từ khóa truy vấn:
     $$\text{Score}_{\text{hybrid}} = \text{Score}_{\text{BM25}} \times (1 + \min(0.5, \text{clicks} \times 0.1)) \times (1 + 0.05 \times \log_{10}(\text{views}))$$
   - Giúp hệ thống tự học từ hành vi người dùng: tài liệu nào được người dùng nhấp nhiều sẽ được đẩy lên vị trí cao hơn trong các truy vấn tiếp theo.

4. **Trích xuất Snippet & Đánh dấu Từ khóa:**
   - Tự động tìm đoạn văn bản ngắn (160 ký tự) xung quanh vị trí xuất hiện đầu tiên của từ khóa khớp.
   - Bọc từ khóa bằng thẻ `<mark>` được tạo kiểu nổi bật trên giao diện người dùng.

---

## 3. Giao diện Người dùng Tìm kiếm Đã Tích Hợp (`apps/web/src/pages/Public.tsx`)
- **Bộ chọn Thuật toán:** Người dùng và giảng viên có thể trực tiếp chuyển đổi giữa 4 chế độ tìm kiếm:
  1. *Okapi BM25F (Khuyên dùng)*
  2. *TF-IDF Vector Space*
  3. *Hybrid BM25 + CTR Boost*
  4. *SQL ILIKE (Phase 1 Baseline)*
- **Thanh chẩn đoán hiệu năng:** Hiển thị thời gian truy vấn theo mili-giây (ví dụ: `1.2 ms`), thuật toán đang kích hoạt, và tổng số tài liệu trong chỉ mục đảo.
- **Thẻ điểm số độ phù hợp (Relevance Score Badge):** Hiển thị điểm số số học cụ thể trên từng thẻ kết quả (ví dụ: `Độ khớp: 5.48`).
- **Thanh gợi ý truy vấn nhanh:** Cung cấp các nhãn gợi ý tìm kiếm tức thì.
- **Đánh dấu từ khóa:** Highlight các từ khóa tìm thấy trong phần trích dẫn tóm tắt.

---

## 4. Kết quả Kiểm thử Tự động (SQA Test Suite)
- **Tổng số bộ kiểm thử:** 11/11 test files đạt 100% PASS.
- **Tổng số kịch bản kiểm thử:** 36/36 tests PASSED.
- Bao gồm bộ kiểm thử chuyên biệt Phase 2 `apps/api/tests/phase2-search.test.ts` kiểm định toàn diện:
  - Khả năng chuẩn hóa tiếng Việt, tách từ, lọc từ dừng, tạo bigram.
  - Cấu trúc chỉ mục đảo, tính toán RSJ IDF, trích xuất snippet `<mark>`.
  - So sánh điểm số BM25F giữa tiêu đề và nội dung.
  - Thuật toán TF-IDF và mô phỏng phản hồi CTR trong mô hình Hybrid.
  - Quyền hạn bảo mật của API Reindex và API Diagnostics Stats.


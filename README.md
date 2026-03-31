# Japanese Typing Assistant

Ứng dụng web hỗ trợ người Việt học tiếng Nhật bằng cách nhập `romaji` và nhận ngay `hiragana`, `katakana`, gợi ý `kanji`, nghĩa tiếng Việt, lịch sử học và mini quiz ôn tập.

Project gồm:
- Backend `Node.js + Express` để phục vụ static files và proxy 2 API chuyển đổi/dịch.
- Frontend thuần `HTML/CSS/JavaScript` chạy trên trình duyệt.
- Thư viện `WanaKana` để chuyển `romaji -> kana` ngay trên client.

## Mục tiêu

Project này tập trung vào một luồng học rất thực dụng:
- Gõ romaji nhanh.
- Xem ngay hiragana và katakana.
- Tự lấy gợi ý kanji sau khi dừng gõ.
- Dịch sang tiếng Việt.
- Lưu lại từ/câu đã học để ôn lại và làm quiz.

## Tính năng chính

- Chuyển đổi thời gian thực:
  nhập romaji và hiển thị ngay `Romaji`, `Hiragana`, `Katakana`.
- Tự động chuyển kanji:
  sau khoảng 2 giây dừng gõ, app gọi `/api/convert` để lấy gợi ý kanji.
- Dịch sang tiếng Việt:
  app gọi `/api/translate` để hiển thị nghĩa tiếng Việt.
- Chọn kanji thủ công:
  khi có nhiều candidate, người dùng có thể bấm chọn candidate mong muốn.
- Lưu từ bằng phím Enter:
  thêm mục hiện tại vào lịch sử và nối vào phần "Văn bản đã soạn".
- Xóa nhanh bằng phím Esc:
  reset ô nhập và các panel hiện tại.
- Copy từng phần:
  copy romaji, hiragana, katakana, kanji, nghĩa Việt hoặc toàn bộ văn bản đã soạn.
- Copy All có cấu hình:
  bật/tắt từng trường, đổi thứ tự kéo thả, chỉnh separator, lưu preset custom.
- Study Hub:
  có sẵn bộ câu mẫu để luyện cho người Việt học tiếng Nhật.
- Mini quiz:
  hỗ trợ 3 chế độ:
  `JP -> VI`, `VI -> JP`, `Kana -> Romaji`.
- Phát âm tiếng Nhật:
  dùng `speechSynthesis` của trình duyệt cho câu mẫu.
- Lưu trạng thái cục bộ:
  lịch sử, văn bản đã soạn, quiz state và copy settings được lưu trong `localStorage`.

## Stack kỹ thuật

- Runtime: `Node.js 18.19+`
- Server: `Express 4`
- Client: `HTML`, `CSS`, `Vanilla JavaScript`
- Kana conversion: `wanakana`
- Translation/Kanji suggestion:
  proxy qua các endpoint Google đang được gọi từ server

## Kiến trúc tổng quan

### Frontend

Frontend là một file HTML chính với script inline:
- nhận input romaji
- render các panel kết quả
- debounce 2 giây trước khi gọi kanji/translate
- lưu lịch sử học
- quản lý copy presets
- dựng quiz từ dữ liệu lịch sử + câu mẫu

### Backend

Server có 3 trách nhiệm:
- serve static files từ thư mục `public/`
- expose thư mục `/libs` để frontend dùng `wanakana.min.js`
- proxy 2 API:
  `/api/convert` và `/api/translate`

Ngoài ra server có endpoint:
- `/healthz` để health check khi deploy

## Cấu trúc thư mục

```text
.
├── package.json
├── package-lock.json
├── server.js
├── render.yaml
├── public/
│   ├── index.html
│   └── styles.css
└── README.md
```

## Luồng sử dụng

### 1. Nhập từ/câu bằng romaji

Ví dụ:

```text
ohayou
arigatou gozaimasu
nihongo o benkyou shiteimasu
```

Ngay khi nhập:
- `romaji` được giữ nguyên
- `hiragana` và `katakana` được sinh ngay trên client bằng `WanaKana`

### 2. Dừng gõ để lấy kanji và nghĩa

Sau khoảng 2 giây không gõ:
- app gọi `/api/convert?text=...`
- sau đó gọi `/api/translate?text=...`

### 3. Nhấn Enter để lưu

Khi nhấn `Enter`:
- mục hiện tại được đưa vào lịch sử
- văn bản kanji hiện tại được nối vào vùng "Văn bản đã soạn"
- quiz pool được cập nhật

### 4. Ôn tập trong Study Hub

Study Hub tạo quiz từ:
- dữ liệu đang nhập
- lịch sử đã lưu
- bộ câu mẫu có sẵn trong app

## Keyboard shortcuts

- `Enter`: chuyển đổi và lưu vào lịch sử
- `Esc`: xóa input hiện tại

## Dữ liệu được lưu trên trình duyệt

App không dùng database. Toàn bộ trạng thái người dùng được lưu ở `localStorage`.

Các key hiện tại:
- `jta-history`: lịch sử từ/câu đã lưu, tối đa 50 mục
- `jta-composed`: văn bản đã soạn
- `jta-quiz-state`: điểm, số câu đã trả lời, streak và mode quiz
- `jta-copy-settings`: cấu hình Copy All và custom cards

## API nội bộ

### `GET /api/convert`

Chuyển từ `hiragana` sang candidate `kanji`.

Query params:
- `text`: chuỗi hiragana cần chuyển đổi

Ví dụ:

```http
GET /api/convert?text=にほんご
```

Response mẫu:

```json
{
  "success": true,
  "results": [
    {
      "input": "にほんご",
      "candidates": ["日本語", "二本語"]
    }
  ]
}
```

### `GET /api/translate`

Dịch từ tiếng Nhật sang tiếng Việt.

Query params:
- `text`: chuỗi tiếng Nhật cần dịch

Ví dụ:

```http
GET /api/translate?text=日本語を勉強しています
```

Response mẫu:

```json
{
  "success": true,
  "translation": "Tôi đang học tiếng Nhật"
}
```

### `GET /healthz`

Health check cho môi trường deploy.

Response:

```json
{
  "status": "ok"
}
```

## Chạy local

### Yêu cầu

- `Node.js >= 18.19.0`
- `npm`

### Cài đặt

```bash
npm ci
```

### Chạy development/local

```bash
npm start
```

App mặc định chạy tại:

```text
http://localhost:3000
```

## Scripts

- `npm start`: chạy server
- `npm run dev`: alias chạy server local
- `npm run render-build`: cài dependency theo lockfile để build trên Render

## Deploy lên Render

Project đã có sẵn file `render.yaml`.

### Cách 1: Deploy bằng Blueprint

1. Push repo lên GitHub.
2. Vào Render.
3. Chọn `New +`.
4. Chọn `Blueprint`.
5. Chọn repo này.

Render sẽ tự nhận:
- Runtime: `Node`
- Build command: `npm run render-build`
- Start command: `npm start`
- Health check path: `/healthz`

### Cách 2: Tạo Web Service thủ công

Thiết lập:
- Runtime: `Node`
- Build command: `npm run render-build`
- Start command: `npm start`
- Health check path: `/healthz`

### Biến môi trường

Hiện tại app không bắt buộc biến môi trường tùy chỉnh.

Runtime sẽ dùng:
- `PORT`: do Render cấp
- `HOST`: mặc định `0.0.0.0`
- `NODE_ENV=production`: đã khai báo trong `render.yaml`

## Giới hạn hiện tại

- App đang dựa vào các endpoint Google không chính thức cho transliterate và translate.
- Nếu endpoint đổi format, chặn request hoặc rate limit, tính năng kanji/dịch có thể lỗi.
- Không có database hoặc user account, nên dữ liệu học chỉ nằm trên trình duyệt hiện tại.
- Không có test suite tự động riêng cho frontend/backend.

## Hướng mở rộng hợp lý

- Tách script trong `public/index.html` sang file JS riêng để dễ maintain.
- Thêm test cho API route và các utility quiz/copy config.
- Dùng API dịch/chuyển đổi chính thức thay cho endpoint public.
- Thêm export/import dữ liệu học dưới dạng JSON.
- Thêm bộ từ vựng theo JLPT hoặc chủ đề.
- Tách dữ liệu câu mẫu sang file JSON riêng.

## Ghi chú kỹ thuật

- Server dùng `fetch` native của Node 18+, nên version Node thấp hơn có thể gây lỗi runtime.
- `server.js` chỉ `listen()` khi chạy trực tiếp, và export `app` để dễ smoke test.
- Frontend load `wanakana` từ `/libs/wanakana/wanakana.min.js`, nên production cần `node_modules` được cài đầy đủ trong bước build.

## Trạng thái xác minh

Đã kiểm tra:
- `npm ci` cài dependency thành công
- `node --check server.js` pass
- smoke test `/healthz` trả `200` với body `{"status":"ok"}`

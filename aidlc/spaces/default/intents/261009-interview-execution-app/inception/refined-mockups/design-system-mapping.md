# Ánh xạ bộ giao diện — Material 3 trên Flutter

## Sources

- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/refined-mockups/mockups.md`
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/refined-mockups/interaction-spec.md`
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/refined-mockups/refined-mockups-questions.md` — Q2 = A (Material 3, một màu chủ đạo), Q6 = A (chỉ tiếng Việt)
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/practices-discovery/team-practices.md` — frontend Flutter; `flutter analyze` và `dart format` trong CI
- Kết quả tính tỷ lệ tương phản WCAG chạy ngày 2026-10-09 trên các cặp màu trong bảng bên dưới.

## Nguyên tắc

- Dùng thành phần có sẵn của Material 3; chỉ tự viết những thành phần ghi ở bảng "Thành phần tự viết".
- Không thêm gói giao diện ngoài trong MVP. Mọi hiệu ứng (kính mờ, khung xương, chuyển động) làm bằng widget có sẵn của Flutter. **Một ngoại lệ:** trình xem CV (FR-A8) cần xem PDF, mà Flutter không có sẵn. Cần một gói xem PDF hỗ trợ cả web và điện thoại, hoặc nhúng trình xem của trình duyệt trên web. Việc chọn gói (và kiểm tra giấy phép, phiên bản cố định) để bước thiết kế kỹ thuật quyết định; mockup không phụ thuộc vào lựa chọn đó.
- Một nguồn duy nhất cho màu, chữ, khoảng cách và chuỗi chữ để đổi được mà không sửa từng màn hình.

## Cấu hình chủ đề

| Mục | Giá trị |
|---|---|
| Phiên bản | `useMaterial3: true` |
| Màu nguồn | Xanh chàm `#4F46E5` làm màu chủ đạo (PO có thể đổi) |
| Chế độ | Sáng và tối, theo `ThemeMode.system` |
| Font | Một họ sans-serif duy nhất cho toàn app (gợi ý Roboto, giấy phép Apache 2.0, hỗ trợ tiếng Việt), đóng gói trong asset để web và điện thoại hiển thị giống nhau; bốn độ đậm 400 / 500 / 600 / 700; đặt bằng `ThemeData.fontFamily` và `TextTheme`; không widget nào đặt họ phông khác (NFR-9). Bản HTML xem trước dùng dãy dự phòng Roboto, Noto Sans, Segoe UI, system-ui, Arial |
| Độ bo góc | Thẻ 16 px, nút và ô nhập 12 px, nhãn trạng thái 8 px |
| Khoảng cách | Thang 4 px: 4, 8, 12, 16, 24, 32 |
| Chuỗi chữ | Gom vào một nơi (ví dụ `lib/l10n/strings_vi.dart`) |

## Màu và độ tương phản (đã tính)

Tỷ lệ tương phản WCAG 2.1 tính từ màu thật; yêu cầu tối thiểu 4,5:1 cho chữ và 3:1 cho thành phần giao diện.

### Chế độ sáng

| Dùng cho | Màu chữ / thành phần | Màu nền | Tỷ lệ | Đạt |
|---|---|---|---|---|
| Chữ chính | `#1B1B21` | `#F7F7FB` | 16,04:1 | Có |
| Chữ phụ trên thẻ | `#5B5B66` | `#FFFFFF` | 6,70:1 | Có |
| Chữ trên nút chính | `#FFFFFF` | `#4F46E5` | 6,29:1 | Có |
| Nhãn `Đã chấm` | `#0B6B3A` | `#E3F5EA` | 5,83:1 | Có |
| Nhãn `Chưa chấm` | `#8A4B00` | `#FFF1DC` | 6,11:1 | Có |
| Chữ lỗi | `#B3261E` | `#FFFFFF` | 6,54:1 | Có |
| Nhãn kết luận `Loại` | `#B3261E` | `#FCE8E6` | 5,55:1 | Có |
| Chữ trắng trên nút `Loại` đã chọn | `#FFFFFF` | `#B3261E` | 6,54:1 | Có |
| Viền ô nhập | `#79747E` | `#FFFFFF` | 4,55:1 | Có (cần 3:1) |

### Chế độ tối

| Dùng cho | Màu chữ / thành phần | Màu nền | Tỷ lệ | Đạt |
|---|---|---|---|---|
| Chữ chính | `#E6E6F0` | `#12121A` | 15,03:1 | Có |
| Chữ phụ trên thẻ | `#B4B4C4` | `#1C1C27` | 8,25:1 | Có |
| Chữ trên nút chính | `#1B1B21` | `#A5A0FF` | 7,40:1 | Có |
| Nhãn `Đã chấm` | `#8FE0B0` | `#12301F` | 9,17:1 | Có |
| Nhãn `Chưa chấm` | `#FFD59E` | `#3A2606` | 10,46:1 | Có |
| Chữ lỗi | `#FFB4AB` | `#1C1C27` | 9,94:1 | Có |
| Nhãn kết luận `Loại` | `#FFB4AB` | `#4A1612` | 8,74:1 | Có |
| Viền ô nhập | `#938F99` | `#1C1C27` | 5,33:1 | Có (cần 3:1) |

Chưa tính: chữ trên thẻ kính mờ thật (phụ thuộc nền phía sau). Mục này kiểm lại khi dựng giao diện thật (xem `accessibility-checklist.md`).

## Ánh xạ thành phần

| Thành phần thiết kế | Thành phần Flutter / Material 3 | Ghi chú |
|---|---|---|
| Ô email, mật khẩu | `TextField` / `TextFormField` với `InputDecoration` | Mật khẩu có `suffixIcon` hiện/ẩn |
| Nút Đăng nhập, Hoàn thành đánh giá | `FilledButton` | Vô hiệu bằng `onPressed: null` |
| Nút phụ (Thử lại, Kiểm tra lại) | `OutlinedButton` / `TextButton` | |
| Thanh trên cùng | `AppBar` bọc kính mờ | Kính mờ chỉ ở đây và thẻ đăng nhập |
| Menu người dùng, Đăng xuất | `PopupMenuButton` | |
| Thẻ HĐPV, thẻ ứng viên, thẻ tiêu chí | `Card` (kiểu filled/elevated của M3) | Bo 16 px |
| Thanh tiến độ | `LinearProgressIndicator` | Kèm chữ "5/12 đã chấm" |
| Nhãn Online/Offline | `Chip` (chỉ hiển thị) | |
| Nhãn trạng thái chấm | `Chip` hoặc `Container` bo 8 px + `Icon` + `Text` | Luôn có biểu tượng và chữ |
| Chọn điểm 1..5 | `SegmentedButton<int>` 5 đoạn, chọn một | Tùy chỉnh để cao 48 px và có dấu tích khi chọn |
| Ô nhận xét | `TextField` nhiều dòng, `maxLength: 2000`, `buildCounter` | |
| Hộp thoại D1, D2 | `AlertDialog` | Nút mặc định theo quy tắc ở `interaction-spec.md` |
| Thông báo B2 | `SnackBar` | |
| Biểu ngữ lỗi B1, thanh "Chưa hoàn thành được" | `MaterialBanner` | |
| Bố cục hai khung | `LayoutBuilder` + `Row` + `Expanded` | Chỉ khi rộng trên 1024 px |
| Lưới bento S2 | `LayoutBuilder` + `Wrap` hoặc `GridView` với số cột theo chiều rộng | Thẻ ngày gần nhất rộng gấp đôi |
| Khung xương | Widget tự viết: khối bo góc với `AnimatedOpacity` | Không thêm gói |
| Điều hướng | `Navigator` / `go_router` (quyết ở bước thiết kế kỹ thuật) | |
| Chọn kết luận Đạt / Loại / Cân nhắc / Khác | Bốn nút chọn một (`ChoiceChip` hoặc `SegmentedButton<String>` 4 đoạn), có biểu tượng và vòng tròn chọn trong mỗi nút | Điện thoại xếp hai hàng hai cột bằng `Wrap` hoặc `GridView`; tùy chỉnh để cao 48 px. Khối refer bọc `Visibility` / `AnimatedSwitcher`, ẩn thì không tham gia thứ tự Tab |
| Ô chọn vị trí refer | `DropdownMenu` hoặc `DropdownButtonFormField` | Điện thoại có thể dùng `showModalBottomSheet` |
| Lý do refer | `TextField` nhiều dòng, `maxLength: 500` | |
| Nhãn kết luận trên thẻ ứng viên | `Chip` có `Icon` + `Text` | `Đạt` dấu tích, `Loại` dấu gạch chéo, `Cân nhắc` dấu hỏi, `Khác` mũi tên chéo |
| Trình xem CV | Thành phần xem PDF (cần gói ngoài, xem mục bên dưới) trong `Dialog.fullscreen` trên điện thoại, lớp phủ bên phải trên máy tính | Không có nút tải/in |
| Khối Điểm trung bình | `Card` với `Text` lớn (cỡ 32, đậm) màu chủ đạo, bọc `Semantics(liveRegion: true)` | Tính bằng hàm thuần để kiểm thử đơn vị; cột Điểm TB trên thẻ ứng viên là `Chip` |
| Tab "CV" / "Tóm tắt AI" (điện thoại) | `TabBar` + `TabBarView` (có sẵn của Flutter) | Máy tính để bàn dùng `Row` hai cột thay cho tab |
| Khung Tóm tắt AI | `Card`, `ListView`, `ListTile`/`Container` bo 12 px | Nhãn loại bằng `Chip` |
| Công tắc làm nổi bật | `SwitchListTile` hoặc `CheckboxListTile` | Có nhãn chữ |
| Làm nổi bật trong CV | Lớp phủ vẽ lên trình xem PDF theo vị trí đoạn trích (cần trình xem PDF hỗ trợ tìm chữ và tọa độ), hoặc hiển thị bản văn bản của trang kèm đánh dấu | Phụ thuộc gói xem PDF; chọn ở thiết kế kỹ thuật |
| Khung xương khi AI đang tạo | `Skeleton` dùng chung | |

### Thành phần tự viết

| Tên | Lý do |
|---|---|
| `GlassSurface` | Bọc `BackdropFilter` + `ImageFilter.blur`; tự chuyển sang nền đặc khi `MediaQuery.highContrast` hoặc người dùng tắt hiệu ứng |
| `ScoreSelector` | Tùy chỉnh `SegmentedButton` cho vùng chạm 48 px, dấu tích và nhãn đọc màn hình |
| `Skeleton` | Khung xương dùng chung |
| `CandidateCard`, `HdpvCard`, `SubmitBar` | Ghép từ `Card`, `Chip` và các widget ở trên |

## Làm nổi bật trong CV (đợt 2, AI)

Trang CV luôn có nền trắng và chữ `#1B1B21`, cả ở chế độ tối (giống tệp PDF thật). Ba loại làm nổi bật:

| Loại | Nền | Gạch chân | Nhãn | Tương phản chữ `#1B1B21` trên nền |
|---|---|---|---|---|
| Kinh nghiệm | `#CFE3FF` | liền, `#1D4ED8` | KN | 13,13:1 |
| Trình độ | `#C9EBD3` | nét đứt, `#0B6B3A` | TĐ | 13,31:1 |
| Chứng chỉ | `#FFE2A8` | chấm 2 px, `#8A4B00` | CC | 13,63:1 |

Nền làm nổi bật so với nền trắng của trang chỉ đạt 1,31:1, nên loại làm nổi bật **không** được truyền chỉ bằng màu: mỗi loại có nhãn chữ KN, TĐ, CC và kiểu gạch chân khác nhau. Chữ vẫn đọc rõ (trên 13:1). Đoạn đang được liên kết "Xem trong CV" trỏ tới có khung viền màu chủ đạo trong 2 giây.

## Kính mờ — quy tắc dùng

- Chỉ dùng cho `AppBar` và thẻ đăng nhập.
- Độ mờ nền vừa phải; lớp phủ đủ đặc để chữ đạt 4,5:1 trên mọi vùng nền phía sau.
- Có nền đặc dự phòng khi: bật tương phản cao, bật giảm hiệu ứng hoặc thiết bị yếu.
- Không đặt đoạn văn dài hoặc biểu mẫu chấm điểm lên bề mặt kính.

## Chuyển động và giảm chuyển động

- Mọi hiệu ứng ở `interaction-spec.md` đọc cờ `MediaQuery.disableAnimations`; khi bật thì chuyển cảnh tức thì.
- Khung xương đổi thành khối tĩnh khi giảm chuyển động.

## Điểm ngắt

Trùng với `mockups.md`: dưới 768 px điện thoại; 768 đến 1024 px một cột rộng; trên 1024 px lưới thẻ và hai khung. Dùng `LayoutBuilder`, không dựa vào loại thiết bị.

## Ngôn ngữ

- Chỉ tiếng Việt (Q6 = A). Mọi chữ hiển thị lấy từ một tệp chuỗi chung; không viết chữ cứng trong widget.
- Định dạng ngày `dd/mm/yyyy`, giờ `hh:mm` 24 giờ.

## Assumptions & Open Questions

- **[assumption]** Màu nguồn xanh chàm `#4F46E5` chỉ là gợi ý; nếu PO cung cấp mã màu thương hiệu thì tính lại bảng tương phản trước khi dùng.
- **[assumption]** Không dùng gói giao diện ngoài để kịp 2 ngày; khung xương và kính mờ tự viết bằng widget có sẵn.
- **Open question:** Chọn thư viện điều hướng (`Navigator` thuần hay `go_router`) — để bước thiết kế kỹ thuật quyết định, không ảnh hưởng mockup.

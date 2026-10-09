/// Công thức điểm trung bình dùng chung với backend (ADR-003, BR6.1, BR6.2). Cùng bộ ví dụ
/// `shared/average-score-examples.json`. Tính bằng số nguyên để khớp tuyệt đối với bản Node.js.
library;

/// Một điểm đã chọn và thang tối đa của tiêu chí (1..5).
class ScoreTerm {
  const ScoreTerm(this.diem, this.max);
  final int diem;
  final int max;
}

class AverageScore {
  const AverageScore({required this.stored100, required this.display10});

  /// Điểm trung bình nhân 100, làm tròn nửa lên: giá trị server lưu.
  final int stored100;

  /// Điểm hiển thị nhân 10, làm tròn nửa lên từ [stored100].
  final int display10;

  @override
  bool operator ==(Object other) =>
      other is AverageScore &&
      other.stored100 == stored100 &&
      other.display10 == display10;

  @override
  int get hashCode => Object.hash(stored100, display10);
}

const _common = 60;

/// Trả null khi chưa có điểm nào.
AverageScore? averageScore(List<ScoreTerm> scores) {
  if (scores.isEmpty) return null;
  var sum = 0;
  for (final s in scores) {
    if (s.max < 1 || s.max > 5 || s.diem < 0) {
      throw RangeError('Điểm hoặc thang không hợp lệ: ${s.diem}/${s.max}');
    }
    sum += s.diem * 5 * (_common ~/ s.max);
  }
  final n = scores.length;
  final stored100 = (200 * sum + _common * n) ~/ (2 * _common * n);
  final display10 = (stored100 + 5) ~/ 10;
  return AverageScore(stored100: stored100, display10: display10);
}

/// Đổi điểm trung bình server trả về (ví dụ 3.44) sang dạng hiển thị một chữ số thập phân.
int display10FromServer(double value) {
  final stored100 = (value * 100).round();
  return (stored100 + 5) ~/ 10;
}

/// "3,7" từ display10 = 37 (dấu phẩy thập phân, BR6.7).
String formatDisplay10(int display10) => '${display10 ~/ 10},${display10 % 10}';

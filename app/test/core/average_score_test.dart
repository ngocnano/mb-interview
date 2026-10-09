import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:interview_app/core/average_score.dart';

/// Chạy cùng tệp ví dụ với test backend (BR6.6): không có bản sao.
void main() {
  final file = File('../shared/average-score-examples.json');
  final examples =
      (jsonDecode(file.readAsStringSync()) as Map<String, dynamic>)['examples']
          as List<dynamic>;

  test('có ít nhất 6 ví dụ dùng chung', () {
    expect(examples.length, greaterThanOrEqualTo(6));
  });

  for (final raw in examples) {
    final ex = raw as Map<String, dynamic>;
    test('ví dụ dùng chung: ${ex['name']}', () {
      final scores = [
        for (final s in ex['scores'] as List<dynamic>)
          ScoreTerm(
            (s as Map<String, dynamic>)['diem'] as int,
            s['max'] as int,
          ),
      ];
      final r = averageScore(scores);
      if (ex['stored100'] == null) {
        expect(r, isNull);
      } else {
        expect(
          r,
          AverageScore(
            stored100: ex['stored100'] as int,
            display10: ex['display10'] as int,
          ),
        );
      }
    });
  }

  test('định dạng dấu phẩy một chữ số thập phân (BR6.7)', () {
    expect(formatDisplay10(37), '3,7');
    expect(formatDisplay10(42), '4,2');
    expect(formatDisplay10(30), '3,0');
  });

  test('điểm server trả về đổi sang hiển thị nửa lên từ giá trị đã lưu', () {
    expect(display10FromServer(3.44), 34);
    expect(display10FromServer(3.65), 37);
    expect(display10FromServer(4.2), 42);
  });

  test('từ chối thang ngoài 1..5', () {
    expect(() => averageScore([const ScoreTerm(3, 6)]), throwsRangeError);
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:interview_app/core/models.dart';

import '../support/fakes.dart';

void main() {
  group('S2 danh sách HĐPV', () {
    testWidgets(
      'hiện mã, tên, ngày, hình thức, địa điểm và tổng ứng viên (AC2.1.3)',
      (tester) async {
        final api = FakeInterviewApi()
          ..onListPanels = () async => [panel(ma: 'P1', total: 5)];
        await pumpApp(tester, api: api);
        expect(find.text('HĐPV P1'), findsOneWidget);
        expect(find.textContaining('09/10/2026'), findsOneWidget);
        expect(find.textContaining('Online'), findsOneWidget);
        expect(find.textContaining('Phòng họp A'), findsOneWidget);
        expect(find.textContaining('5 ứng viên'), findsOneWidget);
      },
    );

    testWidgets('danh sách rỗng hiện thông báo (AC2.1.5)', (tester) async {
      final api = FakeInterviewApi()..onListPanels = () async => [];
      await pumpApp(tester, api: api);
      expect(
        find.text('Bạn chưa được gán vào hội đồng phỏng vấn nào đang diễn ra'),
        findsOneWidget,
      );
    });

    testWidgets('hiện "đã chấm/tổng" chỉ tính bài của tôi (AC2.1.3)', (
      tester,
    ) async {
      final api = FakeInterviewApi()
        ..onListPanels = (() async => [panel(ma: 'P1', total: 5)])
        ..onMyEvaluations = ((ma) async => [
          MyEvaluation(maUngVien: 'C1', submittedAt: DateTime(2026, 10, 9)),
          MyEvaluation(maUngVien: 'C2', submittedAt: DateTime(2026, 10, 9)),
        ]);
      await pumpApp(tester, api: api);
      expect(find.text('Đã chấm 2/5'), findsOneWidget);
    });

    testWidgets('không có bài nào thì "Đã chấm 0/tổng"', (tester) async {
      final api = FakeInterviewApi()
        ..onListPanels = (() async => [panel(ma: 'P1', total: 3)]);
      await pumpApp(tester, api: api);
      expect(find.text('Đã chấm 0/3'), findsOneWidget);
    });

    testWidgets(
      'lỗi đếm một HĐPV chỉ ảnh hưởng dòng đó: "—/tổng" kèm nút thử lại (BR8.4)',
      (tester) async {
        var fail = true;
        final api = FakeInterviewApi()
          ..onListPanels = (() async => [
            panel(ma: 'P1', total: 4),
            panel(ma: 'P2', total: 2),
          ])
          ..onMyEvaluations = ((ma) async {
            if (ma == 'P1' && fail) {
              throw const ApiException(
                status: 0,
                code: 'NETWORK',
                message: 'x',
                isNetwork: true,
              );
            }
            return [
              MyEvaluation(maUngVien: 'C1', submittedAt: DateTime(2026, 10, 9)),
            ];
          });
        await pumpApp(tester, api: api);
        expect(find.text('Đã chấm —/4'), findsOneWidget);
        expect(find.text('Đã chấm 1/2'), findsOneWidget);
        fail = false;
        await tester.tap(find.byKey(const Key('scored-retry-P1')));
        await tester.pumpAndSettle();
        expect(find.text('Đã chấm 1/4'), findsOneWidget);
      },
    );

    testWidgets('số đã chấm không vượt quá tổng (BR8.4)', (tester) async {
      final api = FakeInterviewApi()
        ..onListPanels = (() async => [panel(ma: 'P1', total: 1)])
        ..onMyEvaluations = ((ma) async => [
          MyEvaluation(maUngVien: 'C1', submittedAt: DateTime(2026, 10, 9)),
          MyEvaluation(maUngVien: 'C2', submittedAt: DateTime(2026, 10, 9)),
        ]);
      await pumpApp(tester, api: api);
      expect(find.text('Đã chấm 1/1'), findsOneWidget);
    });

    testWidgets('lỗi hiện thông báo và nút Thử lại tải lại được (AC2.1.7)', (
      tester,
    ) async {
      var fail = true;
      final api = FakeInterviewApi()
        ..onListPanels = () async {
          if (fail) {
            throw const ApiException(
              status: 0,
              code: 'NETWORK',
              message: 'x',
              isNetwork: true,
            );
          }
          return [panel()];
        };
      await pumpApp(tester, api: api);
      expect(find.byKey(const Key('retry')), findsOneWidget);
      fail = false;
      await tester.tap(find.byKey(const Key('retry')));
      await tester.pumpAndSettle();
      expect(find.text('HĐPV P1'), findsOneWidget);
    });
  });

  group('S3 danh sách ứng viên', () {
    FakeInterviewApi apiWith(
      List<CandidateRow> rows, {
      List<MyEvaluation> mine = const [],
    }) {
      return FakeInterviewApi()
        ..onListPanels = (() async => [panel()])
        ..onListCandidates = ((ma) async =>
            CandidateList(panel: panel(), items: rows))
        ..onMyEvaluations = ((ma) async => mine);
    }

    testWidgets(
      'giữ đúng thứ tự server trả về, mỗi dòng có vị trí riêng và khung giờ (AC4.1.1, AC4.1.4, AC4.1.7)',
      (tester) async {
        final api = apiWith([
          candidate('C2', 'Trần Thị B', '08:00', job: 'Lập trình'),
          candidate('C1', 'Lê Văn C', '09:15', job: 'Kế toán'),
        ]);
        await pumpApp(tester, api: api);
        await tester.tap(find.text('HĐPV P1'));
        await tester.pumpAndSettle();
        final names = tester
            .widgetList<Text>(find.byKey(const Key('candidate-name')))
            .map((t) => t.data)
            .toList();
        expect(names, ['Trần Thị B', 'Lê Văn C']);
        expect(find.textContaining('Lập trình'), findsOneWidget);
        expect(find.textContaining('Kế toán'), findsOneWidget);
        expect(find.textContaining('09/10/2026 08:00 – 08:59'), findsOneWidget);
      },
    );

    testWidgets(
      'ghép nhãn Đã chấm và Chưa chấm từ my-evaluations (AC4.1.3, BR2.11)',
      (tester) async {
        final api = apiWith(
          [
            candidate('C1', 'Đã chấm rồi', '08:00'),
            candidate('C2', 'Chưa chấm', '09:00'),
          ],
          mine: [
            MyEvaluation(
              maUngVien: 'C1',
              submittedAt: DateTime(2026, 10, 9, 10),
            ),
          ],
        );
        await pumpApp(tester, api: api);
        await tester.tap(find.text('HĐPV P1'));
        await tester.pumpAndSettle();
        expect(find.byKey(const Key('status-C1')), findsOneWidget);
        expect(
          find.descendant(
            of: find.byKey(const Key('status-C1')),
            matching: find.text('Đã chấm'),
          ),
          findsOneWidget,
        );
        expect(
          find.descendant(
            of: find.byKey(const Key('status-C2')),
            matching: find.text('Chưa chấm'),
          ),
          findsOneWidget,
        );
      },
    );

    testWidgets(
      'dòng đã chấm có nhãn kết luận (chữ và biểu tượng) và Điểm TB một chữ số với dấu phẩy; chưa chấm thì không (AC4.1.11, AC4.1.12, AC5.8.7)',
      (tester) async {
        final api = apiWith(
          [
            candidate('C1', 'Đã chấm rồi', '08:00'),
            candidate('C2', 'Chưa chấm', '09:00'),
            candidate('C3', 'Bài cũ', '10:00'),
          ],
          mine: [
            MyEvaluation(
              maUngVien: 'C1',
              submittedAt: DateTime(2026, 10, 9, 10),
              ketLuan: KetLuan.canNhac,
              diemTrungBinh: 3.75,
            ),
            MyEvaluation(
              maUngVien: 'C3',
              submittedAt: DateTime(2026, 10, 9, 11),
              diemTrungBinh: 3.2,
            ),
          ],
        );
        await pumpApp(tester, api: api);
        await tester.tap(find.text('HĐPV P1'));
        await tester.pumpAndSettle();
        final badge = find.byKey(const Key('ketluan-C1'));
        expect(
          find.descendant(of: badge, matching: find.text('Cân nhắc')),
          findsOneWidget,
        );
        expect(
          find.descendant(of: badge, matching: find.byIcon(Icons.help_outline)),
          findsOneWidget,
        );
        expect(find.text('Điểm TB 3,8'), findsOneWidget);
        expect(find.byKey(const Key('ketluan-C2')), findsNothing);
        expect(find.byKey(const Key('avg-C2')), findsNothing);
        // Bài cũ không có kết luận (AC6.3.6)
        expect(
          find.descendant(
            of: find.byKey(const Key('ketluan-C3')),
            matching: find.text('Chưa ghi kết luận'),
          ),
          findsOneWidget,
        );
        expect(find.text('Điểm TB 3,2'), findsOneWidget);
      },
    );

    testWidgets(
      'chọn ứng viên đã chấm mở màn chỉ đọc, chưa chấm mở form (BR7.6)',
      (tester) async {
        final api =
            apiWith(
                [
                  candidate('C1', 'Đã chấm rồi', '08:00'),
                  candidate('C2', 'Chưa chấm', '09:00'),
                ],
                mine: [
                  MyEvaluation(
                    maUngVien: 'C1',
                    submittedAt: DateTime(2026, 10, 9, 10),
                    ketLuan: KetLuan.dat,
                    diemTrungBinh: 4,
                  ),
                ],
              )
              ..onGetCandidate = ((ma, uv) async => detail(uv, 'Tên $uv'))
              ..onListCriteria = (() async => criteria);
        await pumpApp(tester, api: api);
        await tester.tap(find.text('HĐPV P1'));
        await tester.pumpAndSettle();
        await tester.tap(find.byKey(const Key('row-C1')));
        await tester.pumpAndSettle();
        expect(find.text('Bài đã hoàn thành'), findsOneWidget);
        await tester.pageBack();
        await tester.pumpAndSettle();
        await tester.tap(find.byKey(const Key('row-C2')));
        await tester.pumpAndSettle();
        expect(find.byKey(const Key('complete-button')), findsOneWidget);
      },
    );

    testWidgets(
      'không có ứng viên xác nhận hiện thông báo (AC4.1.5) và lỗi có nút Thử lại (AC4.1.10)',
      (tester) async {
        final api = apiWith([]);
        await pumpApp(tester, api: api);
        await tester.tap(find.text('HĐPV P1'));
        await tester.pumpAndSettle();
        expect(find.text('Chưa có ứng viên xác nhận lịch'), findsOneWidget);
      },
    );
  });
}

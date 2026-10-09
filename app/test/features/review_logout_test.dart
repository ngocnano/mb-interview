import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:interview_app/core/models.dart';
import 'package:interview_app/core/token_store.dart';

import '../support/fakes.dart';

FakeInterviewApi api0() => FakeInterviewApi()
  ..onListPanels = (() async => [panel()])
  ..onListCandidates = ((ma) async => CandidateList(
    panel: panel(),
    items: [candidate('C1', 'Lê Văn C', '09:00')],
  ))
  ..onGetCandidate = ((ma, uv) async => detail(uv, 'Lê Văn C'));

Future<void> openReview(WidgetTester tester, FakeInterviewApi api) => pumpApp(
  tester,
  api: api,
  initialLocation: '/panels/P1/candidates/C1/review',
);

void main() {
  group(
    'S5 bài đã hoàn thành, chỉ đọc (AC6.3.1..AC6.3.6, AC5.4.4, AC5.8.8)',
    () {
      testWidgets(
        'hiện điểm từng tiêu chí, kết luận, điểm trung bình, nhận xét, thời điểm; không có nút sửa',
        (tester) async {
          await openReview(tester, api0());
          expect(find.text('Lê Văn C'), findsWidgets);
          expect(find.byKey(const Key('review-score-TC1')), findsOneWidget);
          expect(
            tester.widget<Text>(find.byKey(const Key('review-score-TC1'))).data,
            '4/5',
          );
          expect(
            tester.widget<Text>(find.byKey(const Key('review-score-TC2'))).data,
            '5/5',
          );
          expect(
            tester.widget<Text>(find.byKey(const Key('review-avg'))).data,
            '4,5 / 5',
          );
          expect(
            find.descendant(
              of: find.byKey(const Key('review-ketluan')),
              matching: find.text('Đạt'),
            ),
            findsOneWidget,
          );
          expect(find.text('Đã chấm xong'), findsOneWidget);
          expect(find.textContaining('Đã hoàn thành lúc'), findsOneWidget);
          expect(find.byKey(const Key('complete-button')), findsNothing);
          expect(find.byType(TextField), findsNothing);
          expect(find.byKey(const Key('review-refer')), findsNothing);
        },
      );

      testWidgets('kết luận Khác hiện vị trí refer và lý do ở dạng chỉ đọc', (
        tester,
      ) async {
        final api = api0()
          ..onGetEvaluation = ((ma, uv) async => evaluationDetail(
            ketLuan: KetLuan.khac,
            refer: const Position(
              maViTri: 'VT9',
              job: 'Lập trình',
              dvql: 'Phòng B',
            ),
            lyDo: 'Hợp vị trí khác hơn',
          ));
        await openReview(tester, api);
        final refer = find.byKey(const Key('review-refer'));
        expect(refer, findsOneWidget);
        expect(
          find.descendant(
            of: refer,
            matching: find.textContaining('Lập trình'),
          ),
          findsOneWidget,
        );
        expect(
          find.descendant(
            of: refer,
            matching: find.textContaining('Hợp vị trí khác hơn'),
          ),
          findsOneWidget,
        );
      });

      testWidgets('kết luận khác Khác thì không có khối refer (AC6.3.4)', (
        tester,
      ) async {
        final api = api0()
          ..onGetEvaluation = ((ma, uv) async =>
              evaluationDetail(ketLuan: KetLuan.loai));
        await openReview(tester, api);
        expect(find.byKey(const Key('review-refer')), findsNothing);
        expect(
          find.descendant(
            of: find.byKey(const Key('review-ketluan')),
            matching: find.text('Loại'),
          ),
          findsOneWidget,
        );
      });

      testWidgets(
        'bài cũ không có kết luận: "Chưa ghi kết luận", vẫn có điểm trung bình (AC6.3.6)',
        (tester) async {
          final api = api0()
            ..onGetEvaluation = ((ma, uv) async =>
                evaluationDetail(ketLuan: null, avg: 3.5));
          await openReview(tester, api);
          expect(
            find.descendant(
              of: find.byKey(const Key('review-ketluan')),
              matching: find.text('Chưa ghi kết luận'),
            ),
            findsOneWidget,
          );
          expect(
            tester.widget<Text>(find.byKey(const Key('review-avg'))).data,
            '3,5 / 5',
          );
        },
      );

      testWidgets('tiêu chí đã ngừng vẫn hiện cùng điểm đã chấm (AC6.3.2)', (
        tester,
      ) async {
        final api = api0()
          ..onGetEvaluation = ((ma, uv) async => EvaluationDetail(
            evaluationId: 'EV1',
            diem: const [
              DetailScore(
                maTieuChi: 'TCX',
                tenTieuChi: 'Tiêu chí đã ngừng',
                diemToiDa: 3,
                diem: 2,
              ),
            ],
            ketLuan: KetLuan.dat,
            diemTrungBinh: 3.33,
            submittedAt: DateTime.utc(2026, 10, 9),
          ));
        await openReview(tester, api);
        expect(find.text('Tiêu chí đã ngừng'), findsOneWidget);
        expect(
          tester.widget<Text>(find.byKey(const Key('review-score-TCX'))).data,
          '2/3',
        );
      });

      testWidgets(
        'HĐPV đã Completed (không mở được thông tin ứng viên): vẫn xem lại, dùng mã ứng viên',
        (tester) async {
          final api = api0()
            ..onGetCandidate = ((ma, uv) async => throw const ApiException(
              status: 404,
              code: 'PANEL_NOT_AVAILABLE',
              message: 'x',
            ));
          await openReview(tester, api);
          expect(
            tester.widget<Text>(find.byKey(const Key('review-name'))).data,
            'C1',
          );
          expect(find.byKey(const Key('review-score-TC1')), findsOneWidget);
        },
      );

      testWidgets('chưa có bài (404): báo lỗi có nút Thử lại', (tester) async {
        final api = api0()
          ..onGetEvaluation = ((ma, uv) async => throw const ApiException(
            status: 404,
            code: 'EVALUATION_NOT_FOUND',
            message: 'Bạn chưa hoàn thành đánh giá cho ứng viên này',
          ));
        await openReview(tester, api);
        expect(
          find.text('Bạn chưa hoàn thành đánh giá cho ứng viên này'),
          findsOneWidget,
        );
        expect(find.byKey(const Key('retry')), findsOneWidget);
      });
    },
  );

  group('đăng xuất (AC1.2.1, AC1.2.2)', () {
    testWidgets(
      'xóa token khỏi máy và về màn đăng nhập; không còn màn nghiệp vụ',
      (tester) async {
        final store = MemoryTokenStore();
        await store.write(
          StoredSession(
            token: 'tok',
            expiresAt: DateTime.now().add(const Duration(hours: 8)),
            user: testUser,
          ),
        );
        final api = api0();
        await pumpApp(tester, api: api, store: store);
        expect(find.text('HĐPV P1'), findsOneWidget);
        await tester.tap(find.byKey(const Key('logout')));
        await tester.pumpAndSettle();
        expect(await store.read(), isNull);
        expect(find.text('HĐPV P1'), findsNothing);
        expect(find.text('Đăng nhập'), findsWidgets);
        expect(find.byKey(const Key('logout')), findsNothing);
      },
    );

    testWidgets('đăng xuất từ màn danh sách ứng viên cũng về đăng nhập', (
      tester,
    ) async {
      await pumpApp(tester, api: api0(), initialLocation: '/panels/P1');
      await tester.tap(find.byKey(const Key('logout')));
      await tester.pumpAndSettle();
      expect(find.text('Đăng nhập'), findsWidgets);
      expect(find.text('Lê Văn C'), findsNothing);
    });
  });
}

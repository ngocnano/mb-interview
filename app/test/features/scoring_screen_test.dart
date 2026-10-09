import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:interview_app/core/models.dart';

import '../support/fakes.dart';

FakeInterviewApi baseApi() {
  return FakeInterviewApi()
    ..onListPanels = (() async => [panel()])
    ..onListCandidates = ((ma) async => CandidateList(
      panel: panel(),
      items: [candidate('C1', 'Lê Văn C', '09:00')],
    ))
    ..onMyEvaluations = ((ma) async => [])
    ..onGetCandidate = ((ma, uv) async => detail(uv, 'Lê Văn C'))
    ..onListCriteria = (() async => criteria)
    ..onReferablePositions = ((ma, uv) async => const [
      Position(maViTri: 'VT9', job: 'Lập trình', dvql: 'Phòng B'),
    ])
    ..onComplete = ((r) async => CompletionResult(
      evaluationId: 'EV1',
      submittedAt: DateTime(2026, 10, 9, 10),
      replayed: false,
      ketLuan: r.ketLuan,
      diemTrungBinh: 4.5,
    ));
}

Future<void> openScoring(WidgetTester tester, FakeInterviewApi api) async {
  await pumpApp(tester, api: api, initialLocation: '/panels/P1/candidates/C1');
}

Finder score(String code, int n) => find.byKey(Key('score-$code-$n'));
Finder conclusion(KetLuan k) => find.byKey(Key('ketluan-${k.code}'));

Future<void> tapVisible(WidgetTester tester, Finder f) async {
  await tester.ensureVisible(f);
  await tester.pump();
  await tester.tap(f);
  await tester.pump();
}

Future<void> scoreAll(WidgetTester tester) async {
  await tapVisible(tester, score('TC1', 4));
  await tapVisible(tester, score('TC2', 5));
}

Future<void> fillValid(WidgetTester tester, {KetLuan k = KetLuan.dat}) async {
  await scoreAll(tester);
  await tapVisible(tester, conclusion(k));
}

Future<void> confirmComplete(WidgetTester tester) async {
  await tapVisible(tester, find.byKey(const Key('complete-button')));
  await tester.pumpAndSettle();
  await tester.tap(find.byKey(const Key('confirm-complete')));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets(
    'hiện thông tin ứng viên và đủ tiêu chí, không có dữ liệu cá nhân (AC5.1.1, AC5.1.3)',
    (tester) async {
      await openScoring(tester, baseApi());
      expect(find.text('Lê Văn C'), findsWidgets);
      expect(find.textContaining('Kế toán'), findsOneWidget);
      expect(find.textContaining('5 năm'), findsOneWidget);
      expect(find.text('Chuyên môn'), findsOneWidget);
      expect(find.text('Giao tiếp'), findsOneWidget);
      for (var n = 1; n <= 5; n++) {
        expect(score('TC1', n), findsOneWidget);
      }
    },
  );

  group('nút Hoàn thành và kết luận bắt buộc (AC5.2.1, AC5.3.2)', () {
    testWidgets('khóa khi còn thiếu điểm; bấm đánh dấu tiêu chí thiếu', (
      tester,
    ) async {
      final api = baseApi();
      await openScoring(tester, api);
      await tapVisible(tester, score('TC1', 3));
      expect(find.byKey(const Key('complete-locked')), findsOneWidget);
      await tapVisible(tester, find.byKey(const Key('complete-button')));
      expect(find.byKey(const Key('missing-TC2')), findsOneWidget);
      expect(find.byKey(const Key('missing-TC1')), findsNothing);
      expect(api.completeCalls, isEmpty);
    });

    testWidgets(
      'đủ điểm nhưng chưa chọn kết luận: vẫn khóa và đánh dấu "Chưa chọn kết luận"',
      (tester) async {
        final api = baseApi();
        await openScoring(tester, api);
        await scoreAll(tester);
        expect(find.byKey(const Key('complete-locked')), findsOneWidget);
        await tapVisible(tester, find.byKey(const Key('complete-button')));
        expect(find.byKey(const Key('missing-ketluan')), findsOneWidget);
        expect(find.text('Chưa chọn kết luận'), findsOneWidget);
        expect(api.completeCalls, isEmpty);
      },
    );

    testWidgets(
      'chọn kết luận thì mở khóa; nhận xét để trống vẫn hoàn thành được (AC5.3.3)',
      (tester) async {
        final api = baseApi();
        await openScoring(tester, api);
        await fillValid(tester, k: KetLuan.loai);
        expect(find.byKey(const Key('complete-locked')), findsNothing);
        await confirmComplete(tester);
        expect(api.completeCalls.single.ketLuan, KetLuan.loai);
        expect(api.completeCalls.single.nhanXet, '');
      },
    );
  });

  group('khối Kết luận (AC5.3.1, AC5.3.4, AC5.3.6, AC5.3.7)', () {
    testWidgets(
      'bốn lựa chọn có biểu tượng riêng và chữ, không chọn sẵn, kèm chú thích',
      (tester) async {
        await openScoring(tester, baseApi());
        for (final e in {
          KetLuan.dat: ['Đạt', Icons.check],
          KetLuan.loai: ['Loại', Icons.close],
          KetLuan.canNhac: ['Cân nhắc', Icons.help_outline],
          KetLuan.khac: ['Khác', Icons.north_east],
        }.entries) {
          final f = conclusion(e.key);
          expect(f, findsOneWidget);
          expect(
            find.descendant(of: f, matching: find.text(e.value[0] as String)),
            findsOneWidget,
          );
          expect(
            find.descendant(
              of: f,
              matching: find.byIcon(e.value[1] as IconData),
            ),
            findsOneWidget,
          );
          expect(
            find.byKey(Key('ketluan-selected-${e.key.code}')),
            findsNothing,
          );
        }
        expect(
          find.text('Đề xuất của người phỏng vấn, không phải kết luận cuối'),
          findsOneWidget,
        );
      },
    );

    testWidgets('chọn đúng một: có dấu tích và chữ, chọn lại chuyển dấu tích', (
      tester,
    ) async {
      await openScoring(tester, baseApi());
      await tapVisible(tester, conclusion(KetLuan.dat));
      expect(find.byKey(const Key('ketluan-selected-DAT')), findsOneWidget);
      await tapVisible(tester, conclusion(KetLuan.canNhac));
      expect(find.byKey(const Key('ketluan-selected-DAT')), findsNothing);
      expect(
        find.byKey(const Key('ketluan-selected-CAN_NHAC')),
        findsOneWidget,
      );
    });

    testWidgets('máy tính xếp một hàng, mỗi ô cao tối thiểu 48 px', (
      tester,
    ) async {
      await openScoring(tester, baseApi());
      final tops = [
        for (final k in KetLuan.values) tester.getTopLeft(conclusion(k)).dy,
      ];
      expect(tops.toSet().length, 1);
      for (final k in KetLuan.values) {
        expect(tester.getSize(conclusion(k)).height, greaterThanOrEqualTo(48));
      }
    });

    testWidgets('điện thoại xếp hai hàng hai cột', (tester) async {
      await openScoring(tester, baseApi());
      tester.view.physicalSize = const Size(400, 1600);
      await tester.pumpAndSettle();
      double top(KetLuan k) => tester.getTopLeft(conclusion(k)).dy;
      double left(KetLuan k) => tester.getTopLeft(conclusion(k)).dx;
      expect(top(KetLuan.dat), top(KetLuan.loai));
      expect(top(KetLuan.canNhac), top(KetLuan.khac));
      expect(top(KetLuan.canNhac), greaterThan(top(KetLuan.dat)));
      expect(left(KetLuan.dat), left(KetLuan.canNhac));
      for (final k in KetLuan.values) {
        expect(tester.getSize(conclusion(k)).height, greaterThanOrEqualTo(48));
      }
    });
  });

  group('khối Điểm trung bình (AC5.8.1..AC5.8.5)', () {
    String value(WidgetTester t) =>
        t.widget<Text>(find.byKey(const Key('avg-value'))).data!;

    testWidgets('chưa chọn điểm: "—" và "Chưa chọn điểm nào"', (tester) async {
      await openScoring(tester, baseApi());
      expect(value(tester), '—');
      expect(find.text('Chưa chọn điểm nào'), findsOneWidget);
    });

    testWidgets(
      'tạm tính khi chọn một phần, rồi trung bình đủ; đổi điểm cập nhật ngay',
      (tester) async {
        await openScoring(tester, baseApi());
        await tapVisible(tester, score('TC1', 4));
        expect(value(tester), '4,0 / 5');
        expect(find.text('Tạm tính theo 1/2 tiêu chí đã chọn'), findsOneWidget);
        await tapVisible(tester, score('TC2', 5));
        expect(value(tester), '4,5 / 5');
        expect(find.text('Trung bình 2 tiêu chí'), findsOneWidget);
        await tapVisible(tester, score('TC2', 2));
        expect(value(tester), '3,0 / 5');
        // Trình đọc màn hình nghe giá trị mới (AC5.8.4).
        expect(
          find.bySemanticsLabel(RegExp('Điểm trung bình: 3,0 / 5')),
          findsOneWidget,
        );
      },
    );

    testWidgets(
      'có chú thích tham khảo, không có ô nhập, không đặt sẵn hay chặn kết luận (AC5.8.5, AC5.8.6)',
      (tester) async {
        await openScoring(tester, baseApi());
        expect(
          find.text('Chỉ để tham khảo, không thay thế kết luận của bạn'),
          findsOneWidget,
        );
        expect(
          find.descendant(
            of: find.byKey(const Key('avg-block')),
            matching: find.byType(TextField),
          ),
          findsNothing,
        );
        await tapVisible(tester, score('TC1', 1));
        await tapVisible(tester, score('TC2', 1));
        expect(find.byKey(const Key('ketluan-selected-DAT')), findsNothing);
        await tapVisible(
          tester,
          conclusion(KetLuan.dat),
        ); // điểm thấp vẫn chọn được Đạt
        expect(find.byKey(const Key('ketluan-selected-DAT')), findsOneWidget);
      },
    );
  });

  group('khối Giới thiệu sang vị trí khác (AC5.4.x)', () {
    testWidgets(
      'ẩn khi chưa chọn hoặc chọn Đạt, Loại, Cân nhắc; chưa gọi API vị trí (AC5.4.0)',
      (tester) async {
        final api = baseApi();
        await openScoring(tester, api);
        expect(find.byKey(const Key('refer-block')), findsNothing);
        for (final k in [KetLuan.dat, KetLuan.loai, KetLuan.canNhac]) {
          await tapVisible(tester, conclusion(k));
          expect(find.byKey(const Key('refer-block')), findsNothing);
        }
        expect(api.referableCalls, 0);
      },
    );

    testWidgets(
      'chọn Khác: hiện khối, mặc định "Không refer", lý do vô hiệu, tải vị trí một lần (AC5.4.1, AC5.4.3)',
      (tester) async {
        final semantics = tester.ensureSemantics();
        final api = baseApi();
        await openScoring(tester, api);
        await tapVisible(tester, conclusion(KetLuan.khac));
        await tester.pumpAndSettle();
        expect(find.byKey(const Key('refer-block')), findsOneWidget);
        // Trình đọc màn hình nghe thông báo khi khối vừa hiện ra (AC5.4.8).
        expect(
          find.bySemanticsLabel('Đã hiện ô giới thiệu sang vị trí khác'),
          findsOneWidget,
        );
        expect(find.text('Không refer'), findsOneWidget);
        expect(
          tester
              .widget<TextField>(find.byKey(const Key('refer-reason')))
              .enabled,
          isFalse,
        );
        await tapVisible(tester, conclusion(KetLuan.dat));
        await tapVisible(tester, conclusion(KetLuan.khac));
        await tester.pumpAndSettle();
        expect(api.referableCalls, 1);
        semantics.dispose();
      },
    );

    testWidgets(
      'chọn vị trí thì lý do được nhập; đổi sang Đạt xóa giá trị và không gửi (AC5.4.7)',
      (tester) async {
        final api = baseApi();
        await openScoring(tester, api);
        await scoreAll(tester);
        await tapVisible(tester, conclusion(KetLuan.khac));
        await tester.pumpAndSettle();
        await tapVisible(tester, find.byKey(const Key('refer-select')));
        await tester.pumpAndSettle();
        await tester.tap(find.text('Lập trình · Phòng B').last);
        await tester.pumpAndSettle();
        expect(
          tester
              .widget<TextField>(find.byKey(const Key('refer-reason')))
              .enabled,
          isTrue,
        );
        await tester.enterText(
          find.byKey(const Key('refer-reason')),
          'Hợp hơn',
        );
        await tapVisible(tester, conclusion(KetLuan.dat));
        expect(find.byKey(const Key('refer-block')), findsNothing);
        await confirmComplete(tester);
        final call = api.completeCalls.single;
        expect(call.ketLuan, KetLuan.dat);
        expect(call.referMaViTri, isNull);
        expect(call.toJson().containsKey('referMaViTri'), isFalse);
        expect(call.toJson().containsKey('referLyDo'), isFalse);
      },
    );

    testWidgets('Khác kèm refer: gửi vị trí và lý do (AC5.4.1, AC6.1.9)', (
      tester,
    ) async {
      final api = baseApi();
      await openScoring(tester, api);
      await scoreAll(tester);
      await tapVisible(tester, conclusion(KetLuan.khac));
      await tester.pumpAndSettle();
      await tapVisible(tester, find.byKey(const Key('refer-select')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Lập trình · Phòng B').last);
      await tester.pumpAndSettle();
      await tester.enterText(
        find.byKey(const Key('refer-reason')),
        '  Hợp hơn ',
      );
      await confirmComplete(tester);
      final call = api.completeCalls.single;
      expect(call.ketLuan, KetLuan.khac);
      expect(call.referMaViTri, 'VT9');
      expect(call.referLyDo, 'Hợp hơn');
    });

    testWidgets('Khác không refer vẫn hoàn thành được (AC5.4.5)', (
      tester,
    ) async {
      final api = baseApi();
      await openScoring(tester, api);
      await fillValid(tester, k: KetLuan.khac);
      await tester.pumpAndSettle();
      await confirmComplete(tester);
      expect(api.completeCalls.single.referMaViTri, isNull);
    });

    testWidgets(
      'tải vị trí lỗi: báo lỗi, Thử lại tải được; không chặn hoàn thành',
      (tester) async {
        final api = baseApi();
        var fail = true;
        api.onReferablePositions = (ma, uv) async {
          if (fail) {
            throw const ApiException(
              status: 0,
              code: 'NETWORK',
              message: 'x',
              isNetwork: true,
            );
          }
          return const [
            Position(maViTri: 'VT9', job: 'Lập trình', dvql: 'Phòng B'),
          ];
        };
        await openScoring(tester, api);
        await tapVisible(tester, conclusion(KetLuan.khac));
        await tester.pumpAndSettle();
        expect(find.text('Không tải được danh sách vị trí'), findsOneWidget);
        fail = false;
        await tapVisible(tester, find.byKey(const Key('refer-retry')));
        await tester.pumpAndSettle();
        expect(find.byKey(const Key('refer-select')), findsOneWidget);
      },
    );
  });

  group('hoàn thành và lỗi gửi (AC6.1.13, AC6.2.2, AC6.2.3)', () {
    testWidgets(
      'xác nhận rồi hoàn thành: gọi API đúng, báo thành công, chuyển sang màn chỉ đọc',
      (tester) async {
        final api = baseApi();
        await openScoring(tester, api);
        await fillValid(tester);
        await tester.enterText(
          find.byKey(const Key('comment')),
          'Ứng viên tốt',
        );
        await tapVisible(tester, find.byKey(const Key('complete-button')));
        await tester.pumpAndSettle();
        expect(
          find.text('Sau khi hoàn thành sẽ không sửa được'),
          findsOneWidget,
        );
        await tester.tap(find.byKey(const Key('confirm-complete')));
        await tester.pumpAndSettle();
        final call = api.completeCalls.single;
        expect(call.maHdpv, 'P1');
        expect(call.maUngVien, 'C1');
        expect(call.idempotencyKey, 'key-fixed-0001');
        expect(call.scores, {'TC1': 4, 'TC2': 5});
        expect(call.ketLuan, KetLuan.dat);
        expect(call.nhanXet, 'Ứng viên tốt');
        expect(find.text('Đã hoàn thành đánh giá'), findsOneWidget);
        expect(find.byKey(const Key('complete-button')), findsNothing);
        expect(find.text('Bài đã hoàn thành'), findsOneWidget);
        expect(find.byKey(const Key('review-ketluan')), findsOneWidget);
      },
    );

    testWidgets('hủy ở hộp thoại xác nhận thì không gọi API', (tester) async {
      final api = baseApi();
      await openScoring(tester, api);
      await fillValid(tester);
      await tapVisible(tester, find.byKey(const Key('complete-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Hủy'));
      await tester.pumpAndSettle();
      expect(api.completeCalls, isEmpty);
    });

    testWidgets(
      'mất mạng: giữ nguyên toàn bộ form, báo chưa hoàn thành, thử lại dùng cùng khóa',
      (tester) async {
        final api = baseApi();
        var attempts = 0;
        final ok = api.onComplete!;
        api.onComplete = (r) async {
          if (++attempts == 1) {
            throw const ApiException(
              status: 0,
              code: 'NETWORK',
              message: 'x',
              isNetwork: true,
            );
          }
          return ok(r);
        };
        await openScoring(tester, api);
        await fillValid(tester, k: KetLuan.canNhac);
        await tester.enterText(find.byKey(const Key('comment')), 'Giữ nguyên');
        await confirmComplete(tester);
        expect(find.text('Chưa hoàn thành được'), findsOneWidget);
        expect(find.text('Đã hoàn thành đánh giá'), findsNothing);
        expect(
          tester
              .widget<TextField>(find.byKey(const Key('comment')))
              .controller!
              .text,
          'Giữ nguyên',
        );
        expect(
          find.byKey(const Key('ketluan-selected-CAN_NHAC')),
          findsOneWidget,
        );
        await tapVisible(tester, find.byKey(const Key('retry')));
        await tester.pumpAndSettle();
        expect(api.completeCalls.map((c) => c.idempotencyKey), [
          'key-fixed-0001',
          'key-fixed-0001',
        ]);
        expect(api.completeCalls.last.ketLuan, KetLuan.canNhac);
        expect(find.text('Đã hoàn thành đánh giá'), findsOneWidget);
      },
    );

    testWidgets(
      'gửi lại nhận 200 (bản đã lưu) được coi là thành công như 201 (BR7.2)',
      (tester) async {
        final api = baseApi()
          ..onComplete = (r) async => CompletionResult(
            evaluationId: 'EV1',
            submittedAt: DateTime(2026, 10, 9, 10),
            replayed: true,
            ketLuan: KetLuan.dat,
            diemTrungBinh: 4.5,
          );
        await openScoring(tester, api);
        await fillValid(tester);
        await confirmComplete(tester);
        expect(find.text('Đã hoàn thành đánh giá'), findsOneWidget);
        expect(find.text('Bài đã hoàn thành'), findsOneWidget);
      },
    );

    testWidgets(
      '409 đã hoàn thành: thông báo riêng và chuyển sang bài chỉ đọc',
      (tester) async {
        final api = baseApi()
          ..onComplete = (r) async => throw const ApiException(
            status: 409,
            code: 'ALREADY_COMPLETED',
            message: 'x',
          );
        await openScoring(tester, api);
        await fillValid(tester);
        await confirmComplete(tester);
        expect(
          find.text('Bạn đã hoàn thành đánh giá cho ứng viên này'),
          findsOneWidget,
        );
        expect(find.text('Bài đã hoàn thành'), findsOneWidget);
      },
    );

    testWidgets(
      '400 từ server: giữ form và báo dữ liệu chưa hợp lệ, không có nút Thử lại',
      (tester) async {
        final api = baseApi()
          ..onComplete = (r) async => throw const ApiException(
            status: 400,
            code: 'VALIDATION_FAILED',
            message: 'x',
          );
        await openScoring(tester, api);
        await fillValid(tester);
        await confirmComplete(tester);
        expect(
          find.text('Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại'),
          findsOneWidget,
        );
        expect(find.byKey(const Key('retry')), findsNothing);
        expect(find.byKey(const Key('ketluan-selected-DAT')), findsOneWidget);
      },
    );

    testWidgets(
      'đang gửi: nút bị vô hiệu, bấm lần hai không gửi request thứ hai (AC6.2.3)',
      (tester) async {
        final api = baseApi();
        final gate = Completer<CompletionResult>();
        api.onComplete = (r) => gate.future;
        await openScoring(tester, api);
        await fillValid(tester);
        await tapVisible(tester, find.byKey(const Key('complete-button')));
        await tester.pumpAndSettle();
        await tester.tap(find.byKey(const Key('confirm-complete')));
        await tester.pump();
        final button = tester.widget<FilledButton>(
          find.byKey(const Key('complete-button')),
        );
        expect(button.onPressed, isNull);
        await tester.tap(
          find.byKey(const Key('complete-button')),
          warnIfMissed: false,
        );
        await tester.pump();
        expect(api.completeCalls, hasLength(1));
        gate.complete(
          CompletionResult(
            evaluationId: 'EV1',
            submittedAt: DateTime(2026, 10, 9, 10),
            replayed: false,
            ketLuan: KetLuan.dat,
            diemTrungBinh: 4.5,
          ),
        );
        await tester.pumpAndSettle();
      },
    );
  });

  testWidgets(
    'chưa cấu hình tiêu chí thì báo lỗi và không cho chấm (AC5.1.6)',
    (tester) async {
      final api = baseApi()..onListCriteria = () async => [];
      await openScoring(tester, api);
      expect(find.text('Chưa cấu hình tiêu chí'), findsOneWidget);
      expect(find.byKey(const Key('complete-button')), findsNothing);
    },
  );

  testWidgets(
    'rời màn khi đã nhập dữ liệu thì cảnh báo; Ở lại giữ nguyên, Rời đi thoát (AC5.2.5)',
    (tester) async {
      await openScoring(tester, baseApi());
      await tapVisible(tester, score('TC1', 2));
      await tester.pageBack();
      await tester.pumpAndSettle();
      expect(find.text('Dữ liệu chưa lưu sẽ mất'), findsOneWidget);
      await tester.tap(find.text('Ở lại'));
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('complete-button')), findsOneWidget);
      await tester.pageBack();
      await tester.pumpAndSettle();
      await tester.tap(find.text('Rời đi'));
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('complete-button')), findsNothing);
    },
  );

  testWidgets(
    'chỉ chọn kết luận cũng được coi là đã nhập: rời màn có cảnh báo (BR7.8)',
    (tester) async {
      await openScoring(tester, baseApi());
      await tapVisible(tester, conclusion(KetLuan.dat));
      await tester.pageBack();
      await tester.pumpAndSettle();
      expect(find.text('Dữ liệu chưa lưu sẽ mất'), findsOneWidget);
    },
  );

  testWidgets('bộ đếm ký tự nhận xét giới hạn 2000 (AC5.2.4)', (tester) async {
    await openScoring(tester, baseApi());
    expect(
      tester.widget<TextField>(find.byKey(const Key('comment'))).maxLength,
      2000,
    );
  });

  testWidgets('mở thẳng ứng viên đã chấm thì chuyển sang màn chỉ đọc (BR7.6)', (
    tester,
  ) async {
    final api = baseApi()
      ..onMyEvaluations = ((ma) async => [
        MyEvaluation(
          maUngVien: 'C1',
          submittedAt: DateTime(2026, 10, 9, 10),
          ketLuan: KetLuan.dat,
          diemTrungBinh: 4.5,
        ),
      ]);
    await openScoring(tester, api);
    expect(find.text('Bài đã hoàn thành'), findsOneWidget);
    expect(find.byKey(const Key('complete-button')), findsNothing);
  });

  testWidgets('đăng xuất khi đang chấm dở: hỏi xác nhận trước (US1.2, BR7.8)', (
    tester,
  ) async {
    await openScoring(tester, baseApi());
    await tapVisible(tester, score('TC1', 2));
    await tester.tap(find.byKey(const Key('logout')));
    await tester.pumpAndSettle();
    expect(find.text('Dữ liệu chưa lưu sẽ mất'), findsOneWidget);
    await tester.tap(find.text('Rời đi'));
    await tester.pumpAndSettle();
    expect(find.text('Đăng nhập'), findsWidgets);
  });
}

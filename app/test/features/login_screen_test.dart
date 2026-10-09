import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:interview_app/core/models.dart';

import '../support/fakes.dart';

Future<void> fill(WidgetTester tester, String email, String password) async {
  await tester.enterText(find.byKey(const Key('login-email')), email);
  await tester.enterText(find.byKey(const Key('login-password')), password);
}

FakeInterviewApi apiThatFails(int status, String code) {
  final api = FakeInterviewApi()
    ..onLogin = ((e, p) async =>
        throw ApiException(status: status, code: code, message: 'x'))
    ..onListPanels = (() async => []);
  return api;
}

void main() {
  testWidgets(
    'chặn ngay khi email sai định dạng hoặc mật khẩu trống, không gọi API (AC1.1.4)',
    (tester) async {
      final api = FakeInterviewApi();
      await pumpApp(tester, api: api, loggedIn: false);
      await fill(tester, 'khong-phai-email', '');
      await tester.tap(find.byKey(const Key('login-submit')));
      await tester.pump();
      expect(find.text('Email không đúng định dạng'), findsOneWidget);
      expect(find.text('Vui lòng nhập mật khẩu'), findsOneWidget);
      expect(api.loginCalls, 0);
    },
  );

  testWidgets(
    'nút hiện/ẩn mật khẩu đổi dạng hiển thị và có nhãn cho trình đọc màn hình (AC1.1.7)',
    (tester) async {
      await pumpApp(tester, api: FakeInterviewApi(), loggedIn: false);
      TextField field() =>
          tester.widget<TextField>(find.byKey(const Key('login-password')));
      expect(field().obscureText, true);
      expect(find.byTooltip('Hiện mật khẩu'), findsOneWidget);
      await tester.tap(find.byKey(const Key('login-toggle-password')));
      await tester.pump();
      expect(field().obscureText, false);
      expect(find.byTooltip('Ẩn mật khẩu'), findsOneWidget);
    },
  );

  testWidgets(
    'đăng nhập đúng chuyển sang danh sách HĐPV và hiện tên người dùng (AC1.1.1)',
    (tester) async {
      final api = FakeInterviewApi()
        ..onLogin = ((e, p) async => LoginResult(
          token: 't',
          expiresAt: DateTime.now().add(const Duration(hours: 8)),
          user: testUser,
        ))
        ..onListPanels = (() async => [panel()]);
      await pumpApp(tester, api: api, loggedIn: false);
      await fill(tester, ' A@x.vn ', 'matkhau123');
      await tester.tap(find.byKey(const Key('login-submit')));
      await tester.pumpAndSettle();
      expect(find.text('Nguyễn Văn A'), findsOneWidget);
      expect(find.text('HĐPV P1'), findsOneWidget);
    },
  );

  testWidgets('sai thông tin hiện thông báo chung (AC1.1.2)', (tester) async {
    await pumpApp(
      tester,
      api: apiThatFails(401, 'INVALID_CREDENTIALS'),
      loggedIn: false,
    );
    await fill(tester, 'a@x.vn', 'sai-mat-khau');
    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pumpAndSettle();
    expect(find.text('Email hoặc mật khẩu không đúng'), findsOneWidget);
  });

  testWidgets(
    'tài khoản khóa 403 và tạm khóa 429 có thông báo riêng (AC1.1.3, AC1.1.9)',
    (tester) async {
      await pumpApp(
        tester,
        api: apiThatFails(403, 'ACCOUNT_LOCKED'),
        loggedIn: false,
      );
      await fill(tester, 'a@x.vn', 'matkhau123');
      await tester.tap(find.byKey(const Key('login-submit')));
      await tester.pumpAndSettle();
      expect(find.text('Tài khoản đã bị khóa'), findsOneWidget);
    },
  );

  testWidgets('429 hiện thông báo tạm khóa 15 phút (AC1.1.9)', (tester) async {
    await pumpApp(
      tester,
      api: apiThatFails(429, 'LOGIN_LOCKED'),
      loggedIn: false,
    );
    await fill(tester, 'a@x.vn', 'matkhau123');
    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pumpAndSettle();
    expect(
      find.text('Đăng nhập tạm khóa, thử lại sau 15 phút'),
      findsOneWidget,
    );
  });

  testWidgets('mất mạng khi đăng nhập hiện thông báo và cho thử lại', (
    tester,
  ) async {
    final api = FakeInterviewApi()
      ..onLogin = ((e, p) async => throw const ApiException(
        status: 0,
        code: 'NETWORK',
        message: 'x',
        isNetwork: true,
      ));
    await pumpApp(tester, api: api, loggedIn: false);
    await fill(tester, 'a@x.vn', 'matkhau123');
    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pumpAndSettle();
    expect(
      find.text('Không kết nối được máy chủ, vui lòng thử lại'),
      findsOneWidget,
    );
    expect(api.loginCalls, 1);
  });
}

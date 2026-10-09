import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:interview_app/core/auth.dart';
import 'package:interview_app/core/models.dart';
import 'package:interview_app/core/providers.dart';
import 'package:interview_app/core/token_store.dart';

import '../support/fakes.dart';

ProviderContainer containerWith(MemoryTokenStore store, FakeInterviewApi api) {
  final c = ProviderContainer(
    overrides: [
      tokenStoreProvider.overrideWithValue(store),
      interviewApiProvider.overrideWithValue(api),
    ],
  );
  addTearDown(c.dispose);
  return c;
}

void main() {
  test('khôi phục đăng nhập khi token còn hạn (AC1.1.8)', () async {
    final store = MemoryTokenStore();
    await store.write(
      StoredSession(
        token: 't',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        user: testUser,
      ),
    );
    final c = containerWith(store, FakeInterviewApi());
    await c.read(authControllerProvider.notifier).restore();
    final s = c.read(authControllerProvider);
    expect(s.status, AuthStatus.loggedIn);
    expect(s.user?.hoTen, 'Nguyễn Văn A');
  });

  test(
    'token hết hạn thì xóa và về trạng thái chưa đăng nhập (AC1.1.8)',
    () async {
      final store = MemoryTokenStore();
      await store.write(
        StoredSession(
          token: 't',
          expiresAt: DateTime.now().subtract(const Duration(minutes: 1)),
          user: testUser,
        ),
      );
      final c = containerWith(store, FakeInterviewApi());
      await c.read(authControllerProvider.notifier).restore();
      expect(c.read(authControllerProvider).status, AuthStatus.loggedOut);
      expect(await store.read(), isNull);
    },
  );

  test('đăng nhập thành công lưu phiên; sessionExpired xóa phiên', () async {
    final store = MemoryTokenStore();
    final api = FakeInterviewApi()
      ..onLogin = (e, p) async => LoginResult(
        token: 'tok',
        expiresAt: DateTime.now().add(const Duration(hours: 8)),
        user: testUser,
      );
    final c = containerWith(store, api);
    await c.read(authControllerProvider.notifier).login('a@x.vn', 'matkhau123');
    expect(c.read(authControllerProvider).status, AuthStatus.loggedIn);
    expect((await store.read())?.token, 'tok');
    await c.read(authControllerProvider.notifier).sessionExpired();
    expect(c.read(authControllerProvider).status, AuthStatus.loggedOut);
    expect(await store.read(), isNull);
  });
}

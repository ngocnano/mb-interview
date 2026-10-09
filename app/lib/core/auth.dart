import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'models.dart';
import 'providers.dart';
import 'token_store.dart';

enum AuthStatus { unknown, loggedOut, loggedIn }

class AuthState {
  const AuthState(this.status, [this.user]);
  final AuthStatus status;
  final AppUser? user;
}

class AuthController extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState(AuthStatus.unknown);

  /// Khôi phục phiên đã lưu nếu token còn hạn (AC1.1.8).
  Future<void> restore() async {
    final store = ref.read(tokenStoreProvider);
    final s = await store.read();
    if (s != null && s.expiresAt.isAfter(DateTime.now())) {
      state = AuthState(AuthStatus.loggedIn, s.user);
      return;
    }
    if (s != null) await store.clear();
    state = const AuthState(AuthStatus.loggedOut);
  }

  Future<void> login(String email, String password) async {
    final r = await ref.read(interviewApiProvider).login(email, password);
    await ref
        .read(tokenStoreProvider)
        .write(
          StoredSession(token: r.token, expiresAt: r.expiresAt, user: r.user),
        );
    state = AuthState(AuthStatus.loggedIn, r.user);
  }

  /// Đăng xuất: xóa token khỏi máy, về màn đăng nhập; request kế tiếp không còn kèm token (BR8.1).
  /// JWT không bị thu hồi ở server, chỉ hết hạn sau 8 giờ (BR8.2).
  Future<void> logout() => sessionExpired();

  /// Token hết hạn hoặc bị từ chối: xóa phiên và về màn đăng nhập (BR1.4).
  Future<void> sessionExpired() async {
    await ref.read(tokenStoreProvider).clear();
    state = const AuthState(AuthStatus.loggedOut);
  }
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(
  AuthController.new,
);

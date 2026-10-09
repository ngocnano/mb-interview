import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'models.dart';

/// Phiên đăng nhập được lưu: token, hạn dùng và thông tin người dùng (để giữ đăng nhập khi mở lại, AC1.1.8).
class StoredSession {
  const StoredSession({
    required this.token,
    required this.expiresAt,
    required this.user,
  });
  final String token;
  final DateTime expiresAt;
  final AppUser user;

  Map<String, dynamic> toJson() => {
    'token': token,
    'expiresAt': expiresAt.toIso8601String(),
    'user': user.toJson(),
  };

  factory StoredSession.fromJson(Map<String, dynamic> j) => StoredSession(
    token: j['token'] as String,
    expiresAt: DateTime.parse(j['expiresAt'] as String),
    user: AppUser.fromJson(j['user'] as Map<String, dynamic>),
  );
}

abstract class TokenStore {
  Future<StoredSession?> read();
  Future<void> write(StoredSession session);
  Future<void> clear();
}

class MemoryTokenStore implements TokenStore {
  StoredSession? _session;

  @override
  Future<StoredSession?> read() async => _session;

  @override
  Future<void> write(StoredSession session) async => _session = session;

  @override
  Future<void> clear() async => _session = null;
}

/// Điện thoại dùng kho an toàn của hệ điều hành; web dùng bộ nhớ trình duyệt do plugin cung cấp (SD-14, NFR1.16).
class SecureTokenStore implements TokenStore {
  SecureTokenStore([FlutterSecureStorage? storage])
    : _storage = storage ?? const FlutterSecureStorage();
  final FlutterSecureStorage _storage;
  static const _key = 'interview.session';

  @override
  Future<StoredSession?> read() async {
    try {
      final raw = await _storage.read(key: _key);
      if (raw == null) return null;
      return StoredSession.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      // Dữ liệu hỏng thì coi như chưa đăng nhập.
      await clear();
      return null;
    }
  }

  @override
  Future<void> write(StoredSession session) =>
      _storage.write(key: _key, value: jsonEncode(session.toJson()));

  @override
  Future<void> clear() => _storage.delete(key: _key);
}

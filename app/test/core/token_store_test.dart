import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:interview_app/core/token_store.dart';
import 'package:interview_app/features/shared/async_view.dart';
import 'package:interview_app/core/models.dart';

import '../support/fakes.dart';

void main() {
  group('SecureTokenStore (SD-14)', () {
    test('ghi, đọc lại và xóa phiên', () async {
      FlutterSecureStorage.setMockInitialValues({});
      final store = SecureTokenStore();
      expect(await store.read(), isNull);
      await store.write(
        StoredSession(
          token: 'abc',
          expiresAt: DateTime.utc(2030, 1, 1),
          user: testUser,
        ),
      );
      final s = await store.read();
      expect(s?.token, 'abc');
      expect(s?.user.employedId, 'E1');
      await store.clear();
      expect(await store.read(), isNull);
    });

    test('dữ liệu hỏng được coi như chưa đăng nhập và bị xóa', () async {
      FlutterSecureStorage.setMockInitialValues({
        'interview.session': 'không phải json',
      });
      final store = SecureTokenStore();
      expect(await store.read(), isNull);
      expect(await store.read(), isNull);
    });
  });

  group('describeError', () {
    test(
      'lỗi mạng, hệ thống không khả dụng, có mã tương quan và lỗi chung',
      () {
        expect(
          describeError(
            const ApiException(
              status: 0,
              code: 'NETWORK',
              message: 'x',
              isNetwork: true,
            ),
          ),
          'Không kết nối được máy chủ, vui lòng thử lại',
        );
        expect(
          describeError(
            const ApiException(
              status: 503,
              code: 'DB_UNAVAILABLE',
              message: 'x',
            ),
          ),
          'Hệ thống tạm thời không khả dụng, vui lòng thử lại',
        );
        expect(
          describeError(
            const ApiException(
              status: 500,
              code: 'INTERNAL',
              message: 'Hệ thống gặp lỗi',
              correlationId: 'abc-1',
            ),
          ),
          'Hệ thống gặp lỗi (Mã lỗi: abc-1)',
        );
        expect(
          describeError(StateError('x')),
          'Có lỗi xảy ra, vui lòng thử lại',
        );
      },
    );

    test('định dạng ngày giờ', () {
      expect(formatDate('2026-10-09'), '09/10/2026');
      expect(formatDate('khong hop le'), 'khong hop le');
      expect(formatDateTime(DateTime(2026, 10, 9, 7, 5)), '09/10/2026 07:05');
    });
  });
}

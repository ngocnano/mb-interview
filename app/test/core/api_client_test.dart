import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:interview_app/core/api_client.dart';
import 'package:interview_app/core/token_store.dart';

import '../support/fakes.dart';

ApiClient clientWith(
  FakeAdapter adapter,
  MemoryTokenStore store, {
  void Function()? onUnauthorized,
}) {
  final dio = Dio()..httpClientAdapter = adapter;
  return ApiClient(
    baseUrl: 'http://api.test/api/v1',
    tokenStore: store,
    onUnauthorized: onUnauthorized ?? () {},
    dio: dio,
    retryDelays: const [Duration.zero, Duration.zero],
    idGenerator: () => 'corr-123',
  );
}

void main() {
  test(
    'gắn Bearer token và X-Correlation-Id vào mọi request (NFR3.2, SD-14)',
    () async {
      final store = MemoryTokenStore();
      await store.write(
        StoredSession(token: 'abc', expiresAt: DateTime(2100), user: testUser),
      );
      final adapter = FakeAdapter((o) async => jsonBody({'items': []}));
      await clientWith(adapter, store).get('/panels');
      final h = adapter.requests.single.headers;
      expect(h['Authorization'], 'Bearer abc');
      expect(h['X-Correlation-Id'], 'corr-123');
      expect(
        adapter.requests.single.uri.toString(),
        'http://api.test/api/v1/panels',
      );
    },
  );

  test('GET thử lại tối đa 2 lần khi mất mạng rồi thành công (RD-2)', () async {
    var n = 0;
    final adapter = FakeAdapter((o) async {
      if (++n < 3) throw networkError(o);
      return jsonBody({'ok': true});
    });
    final res = await clientWith(adapter, MemoryTokenStore()).get('/criteria');
    expect(res['ok'], true);
    expect(adapter.requests.length, 3);
  });

  test('GET hết số lần thử thì báo lỗi mạng', () async {
    final adapter = FakeAdapter((o) async => throw networkError(o));
    await expectLater(
      clientWith(adapter, MemoryTokenStore()).get('/criteria'),
      throwsA(
        isA<ApiException>().having((e) => e.isNetwork, 'isNetwork', true),
      ),
    );
    expect(adapter.requests.length, 3); // 1 lần đầu + 2 lần thử lại
  });

  test('POST không tự thử lại (RD-2)', () async {
    final adapter = FakeAdapter((o) async => throw networkError(o));
    await expectLater(
      clientWith(adapter, MemoryTokenStore()).post('/x', {'a': 1}),
      throwsA(isA<ApiException>()),
    );
    expect(adapter.requests.length, 1);
  });

  test('401 ở API nghiệp vụ xóa token và gọi onUnauthorized (BR1.4)', () async {
    final store = MemoryTokenStore();
    await store.write(
      StoredSession(token: 'abc', expiresAt: DateTime(2100), user: testUser),
    );
    var called = 0;
    final adapter = FakeAdapter(
      (o) async => jsonBody({
        'code': 'UNAUTHENTICATED',
        'message': 'hết hạn',
      }, status: 401),
    );
    await expectLater(
      clientWith(adapter, store, onUnauthorized: () => called++).get('/panels'),
      throwsA(isA<ApiException>().having((e) => e.status, 'status', 401)),
    );
    expect(called, 1);
    expect(await store.read(), isNull);
  });

  test(
    '401 ở đăng nhập không xóa token cũ và không gọi onUnauthorized',
    () async {
      var called = 0;
      final adapter = FakeAdapter(
        (o) async => jsonBody({
          'code': 'INVALID_CREDENTIALS',
          'message': 'sai',
        }, status: 401),
      );
      await expectLater(
        clientWith(
          adapter,
          MemoryTokenStore(),
          onUnauthorized: () => called++,
        ).post('/auth/login', {}, authenticated: false),
        throwsA(
          isA<ApiException>().having(
            (e) => e.code,
            'code',
            'INVALID_CREDENTIALS',
          ),
        ),
      );
      expect(called, 0);
    },
  );

  test('ánh xạ lỗi: code, message, details và mã tương quan (SD-15)', () async {
    final adapter = FakeAdapter(
      (o) async => jsonBody({
        'code': 'VALIDATION_FAILED',
        'message': 'Dữ liệu không hợp lệ',
        'details': [
          {'field': 'diem.TC1', 'message': 'Chưa có điểm'},
        ],
        'correlationId': 'srv-9',
      }, status: 400),
    );
    try {
      await clientWith(adapter, MemoryTokenStore()).post('/x', {});
      fail('phải ném lỗi');
    } on ApiException catch (e) {
      expect(e.status, 400);
      expect(e.code, 'VALIDATION_FAILED');
      expect(e.details.single.field, 'diem.TC1');
      expect(e.correlationId, 'srv-9');
      expect(e.isNetwork, false);
    }
  });
}

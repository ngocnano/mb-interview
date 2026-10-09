import 'dart:math';

import 'package:dio/dio.dart';

import 'models.dart';
import 'token_store.dart';

export 'models.dart' show ApiException;

String generateId() {
  final r = Random.secure();
  String hex(int n) =>
      List.generate(n, (_) => r.nextInt(16).toRadixString(16)).join();
  final variant = (8 + r.nextInt(4)).toRadixString(16);
  return '${hex(8)}-${hex(4)}-4${hex(3)}-$variant${hex(3)}-${hex(12)}';
}

/// Gọi API: gắn Bearer và X-Correlation-Id, thời gian chờ 10 giây, GET thử lại tối đa 2 lần, 401 xóa phiên (RD-2, SD-14).
class ApiClient {
  ApiClient({
    required this.baseUrl,
    required this.tokenStore,
    required this.onUnauthorized,
    Dio? dio,
    this.retryDelays = const [
      Duration(milliseconds: 300),
      Duration(milliseconds: 900),
    ],
    this.timeout = const Duration(seconds: 10),
    String Function()? idGenerator,
  }) : _dio = dio ?? Dio(),
       _id = idGenerator ?? generateId {
    _dio.options
      ..connectTimeout = timeout
      ..sendTimeout = timeout
      ..receiveTimeout = timeout;
  }

  final String baseUrl;
  final TokenStore tokenStore;
  final void Function() onUnauthorized;
  final List<Duration> retryDelays;
  final Duration timeout;
  final Dio _dio;
  final String Function() _id;

  Future<Map<String, dynamic>> get(String path) =>
      _send('GET', path, null, true);

  Future<Map<String, dynamic>> post(
    String path,
    Object? body, {
    bool authenticated = true,
  }) => _send('POST', path, body, authenticated);

  Future<Map<String, dynamic>> _send(
    String method,
    String path,
    Object? body,
    bool authenticated,
  ) async {
    final headers = <String, String>{'X-Correlation-Id': _id()};
    if (authenticated) {
      final session = await tokenStore.read();
      if (session != null) headers['Authorization'] = 'Bearer ${session.token}';
    }
    var attempt = 0;
    while (true) {
      try {
        final res = await _dio.request<Object?>(
          '$baseUrl$path',
          data: body,
          options: Options(
            method: method,
            headers: headers,
            responseType: ResponseType.json,
          ),
        );
        final data = res.data;
        final map = data is Map<String, dynamic> ? data : <String, dynamic>{};
        // Trả kèm mã trạng thái để biết 200 hay 201 (dùng cho gửi lại cùng khóa).
        return {...map, '_status': res.statusCode};
      } on DioException catch (e) {
        final ex = _toApiException(e);
        final retryable =
            method == 'GET' &&
            (ex.isNetwork || const [502, 503, 504].contains(ex.status));
        if (retryable && attempt < retryDelays.length) {
          await Future<void>.delayed(retryDelays[attempt]);
          attempt++;
          continue;
        }
        if (ex.status == 401 && authenticated) {
          await tokenStore.clear();
          onUnauthorized();
        }
        throw ex;
      }
    }
  }

  ApiException _toApiException(DioException e) {
    final res = e.response;
    if (res == null) {
      return ApiException(
        status: 0,
        code: 'NETWORK',
        message: e.message ?? 'Mất kết nối',
        isNetwork: true,
      );
    }
    final data = res.data;
    final map = data is Map<String, dynamic> ? data : const <String, dynamic>{};
    final rawDetails = map['details'];
    return ApiException(
      status: res.statusCode ?? 0,
      code: (map['code'] ?? 'HTTP_${res.statusCode}') as String,
      message: (map['message'] ?? 'Lỗi không xác định') as String,
      details: rawDetails is List
          ? [
              for (final d in rawDetails.whereType<Map<String, dynamic>>())
                ErrorDetail(
                  field: (d['field'] ?? '') as String,
                  message: (d['message'] ?? '') as String,
                ),
            ]
          : const [],
      correlationId: map['correlationId'] as String?,
    );
  }
}

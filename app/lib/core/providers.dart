import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api_client.dart';
import 'auth.dart';
import 'config.dart';
import 'interview_api.dart';
import 'token_store.dart';

final tokenStoreProvider = Provider<TokenStore>((ref) => SecureTokenStore());

/// Sinh mã (UUID) cho mã tương quan và khóa idempotency; test ghi đè để cố định.
final idGeneratorProvider = Provider<String Function()>((ref) => generateId);

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
    baseUrl: AppConfig.apiBaseUrl,
    tokenStore: ref.watch(tokenStoreProvider),
    onUnauthorized: () =>
        ref.read(authControllerProvider.notifier).sessionExpired(),
    idGenerator: ref.watch(idGeneratorProvider),
  );
});

final interviewApiProvider = Provider<InterviewApi>(
  (ref) => HttpInterviewApi(ref.watch(apiClientProvider)),
);

/// Cấu hình lúc build: `--dart-define=API_BASE_URL=https://...`. Mặc định cùng nguồn với bản web do backend phục vụ.
class AppConfig {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '/api/v1',
  );
}

import 'api_client.dart';
import 'models.dart';

/// Giao diện gọi nghiệp vụ; widget chỉ phụ thuộc giao diện này nên test được bằng API giả.
abstract class InterviewApi {
  Future<LoginResult> login(String email, String password);
  Future<List<PanelSummary>> listPanels();
  Future<CandidateList> listCandidates(String maHdpv);
  Future<CandidateDetail> getCandidate(String maHdpv, String maUngVien);
  Future<List<Criterion>> listCriteria();
  Future<List<MyEvaluation>> myEvaluations(String maHdpv);
  Future<CompletionResult> complete(CompleteRequest request);
  Future<EvaluationDetail> getEvaluation(String maHdpv, String maUngVien);
  Future<List<Position>> referablePositions(String maHdpv, String maUngVien);
}

class HttpInterviewApi implements InterviewApi {
  HttpInterviewApi(this._client);
  final ApiClient _client;

  List<Map<String, dynamic>> _items(Map<String, dynamic> body) =>
      ((body['items'] ?? const []) as List).cast<Map<String, dynamic>>();

  @override
  Future<LoginResult> login(String email, String password) async =>
      LoginResult.fromJson(
        await _client.post('/auth/login', {
          'email': email,
          'password': password,
        }, authenticated: false),
      );

  @override
  Future<List<PanelSummary>> listPanels() async =>
      _items(await _client.get('/panels')).map(PanelSummary.fromJson).toList();

  @override
  Future<CandidateList> listCandidates(String maHdpv) async {
    final body = await _client.get('/panels/$maHdpv/candidates');
    return CandidateList(
      panel: PanelSummary.fromJson(body['panel'] as Map<String, dynamic>),
      items: _items(body).map(CandidateRow.fromJson).toList(),
    );
  }

  @override
  Future<CandidateDetail> getCandidate(String maHdpv, String maUngVien) async =>
      CandidateDetail.fromJson(
        await _client.get('/panels/$maHdpv/candidates/$maUngVien'),
      );

  @override
  Future<List<Criterion>> listCriteria() async =>
      _items(await _client.get('/criteria')).map(Criterion.fromJson).toList();

  @override
  Future<List<MyEvaluation>> myEvaluations(String maHdpv) async =>
      _items(await _client.get('/panels/$maHdpv/my-evaluations'))
          .map(MyEvaluation.fromJson)
          .toList();

  @override
  Future<CompletionResult> complete(CompleteRequest r) async {
    final body = await _client.post(
      '/panels/${r.maHdpv}/candidates/${r.maUngVien}/evaluation',
      r.toJson(),
    );
    return CompletionResult(
      evaluationId: body['evaluationId'] as String,
      submittedAt: DateTime.parse(body['submittedAt'] as String),
      replayed: body['_status'] == 200,
      ketLuan: KetLuan.fromCode(body['ketLuan']),
      diemTrungBinh: (body['diemTrungBinh'] as num?)?.toDouble(),
    );
  }

  @override
  Future<EvaluationDetail> getEvaluation(
    String maHdpv,
    String maUngVien,
  ) async => EvaluationDetail.fromJson(
    await _client.get('/panels/$maHdpv/candidates/$maUngVien/evaluation'),
  );

  @override
  Future<List<Position>> referablePositions(
    String maHdpv,
    String maUngVien,
  ) async => _items(
    await _client.get(
      '/panels/$maHdpv/candidates/$maUngVien/referable-positions',
    ),
  ).map(Position.fromJson).toList();
}

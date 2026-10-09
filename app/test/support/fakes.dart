import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:interview_app/app.dart';
import 'package:interview_app/core/auth.dart';
import 'package:interview_app/core/interview_api.dart';
import 'package:interview_app/core/models.dart';
import 'package:interview_app/core/providers.dart';
import 'package:interview_app/core/token_store.dart';

/// Dio adapter giả: mỗi request đi qua [handler] và được ghi lại.
class FakeAdapter implements HttpClientAdapter {
  FakeAdapter(this.handler);
  final Future<ResponseBody> Function(RequestOptions options) handler;
  final List<RequestOptions> requests = [];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) {
    requests.add(options);
    return handler(options);
  }

  @override
  void close({bool force = false}) {}
}

ResponseBody jsonBody(
  Object body, {
  int status = 200,
  Map<String, List<String>>? headers,
}) {
  return ResponseBody.fromString(
    jsonEncode(body),
    status,
    headers: {
      Headers.contentTypeHeader: ['application/json'],
      ...?headers,
    },
  );
}

DioException networkError(RequestOptions o) => DioException(
  requestOptions: o,
  type: DioExceptionType.connectionError,
  message: 'mất mạng',
);

/// API giả cho test widget: mỗi hàm có thể thay đổi hành vi.
class FakeInterviewApi implements InterviewApi {
  Future<LoginResult> Function(String email, String password)? onLogin;
  Future<List<PanelSummary>> Function()? onListPanels;
  Future<CandidateList> Function(String maHdpv)? onListCandidates;
  Future<CandidateDetail> Function(String maHdpv, String maUngVien)?
  onGetCandidate;
  Future<List<Criterion>> Function()? onListCriteria;
  Future<List<MyEvaluation>> Function(String maHdpv)? onMyEvaluations;
  Future<CompletionResult> Function(CompleteRequest request)? onComplete;
  Future<EvaluationDetail> Function(String maHdpv, String maUngVien)?
  onGetEvaluation;
  Future<List<Position>> Function(String maHdpv, String maUngVien)?
  onReferablePositions;

  final List<CompleteRequest> completeCalls = [];
  int referableCalls = 0;
  int loginCalls = 0;

  @override
  Future<LoginResult> login(String email, String password) {
    loginCalls++;
    return onLogin!(email, password);
  }

  @override
  Future<List<PanelSummary>> listPanels() => onListPanels!();

  @override
  Future<CandidateList> listCandidates(String maHdpv) =>
      onListCandidates!(maHdpv);

  @override
  Future<CandidateDetail> getCandidate(String maHdpv, String maUngVien) =>
      onGetCandidate!(maHdpv, maUngVien);

  @override
  Future<List<Criterion>> listCriteria() => onListCriteria!();

  @override
  Future<List<MyEvaluation>> myEvaluations(String maHdpv) =>
      onMyEvaluations != null
      ? onMyEvaluations!(maHdpv)
      : Future.value(const []);

  @override
  Future<CompletionResult> complete(CompleteRequest request) {
    completeCalls.add(request);
    return onComplete!(request);
  }

  @override
  Future<EvaluationDetail> getEvaluation(String maHdpv, String maUngVien) =>
      onGetEvaluation != null
      ? onGetEvaluation!(maHdpv, maUngVien)
      : Future.value(evaluationDetail());

  @override
  Future<List<Position>> referablePositions(String maHdpv, String maUngVien) {
    referableCalls++;
    return onReferablePositions != null
        ? onReferablePositions!(maHdpv, maUngVien)
        : Future.value(const []);
  }
}

EvaluationDetail evaluationDetail({
  KetLuan? ketLuan = KetLuan.dat,
  Position? refer,
  String? lyDo,
  double? avg = 4.5,
  String? nhanXet = 'Đã chấm xong',
}) => EvaluationDetail(
  evaluationId: 'EV1',
  diem: const [
    DetailScore(
      maTieuChi: 'TC1',
      tenTieuChi: 'Chuyên môn',
      diemToiDa: 5,
      diem: 4,
    ),
    DetailScore(
      maTieuChi: 'TC2',
      tenTieuChi: 'Giao tiếp',
      diemToiDa: 5,
      diem: 5,
    ),
  ],
  nhanXet: nhanXet,
  ketLuan: ketLuan,
  referViTri: refer,
  referLyDo: lyDo,
  diemTrungBinh: avg,
  submittedAt: DateTime.utc(2026, 10, 9, 3),
);

const testUser = AppUser(
  userId: 'U1',
  employedId: 'E1',
  hoTen: 'Nguyễn Văn A',
  email: 'a@x.vn',
);

PanelSummary panel({String ma = 'P1', int total = 2}) => PanelSummary(
  maHdpv: ma,
  ten: 'HĐPV $ma',
  ngay: '2026-10-09',
  hinhThuc: 'Online',
  diaDiem: 'Phòng họp A',
  soUngVienXacNhan: total,
);

CandidateRow candidate(
  String ma,
  String ten,
  String from, {
  String job = 'Kế toán',
}) => CandidateRow(
  maUngVien: ma,
  ten: ten,
  viTri: Position(maViTri: 'VT-$ma', job: job, dvql: 'Phòng A'),
  tuThoiGian: from,
  denThoiGian: '${from.substring(0, 2)}:59',
);

CandidateDetail detail(String ma, String ten) => CandidateDetail(
  row: candidate(ma, ten, '09:00'),
  kinhNghiem: '5 năm',
  trinhDo: 'Đại học',
  panel: panel(),
);

const criteria = [
  Criterion(
    maTieuChi: 'TC1',
    tenTieuChi: 'Chuyên môn',
    diemToiThieu: 1,
    diemToiDa: 5,
    thuTu: 1,
  ),
  Criterion(
    maTieuChi: 'TC2',
    tenTieuChi: 'Giao tiếp',
    diemToiThieu: 1,
    diemToiDa: 5,
    thuTu: 2,
  ),
];

/// Dựng toàn bộ ứng dụng với API giả và kho token trong bộ nhớ.
Future<ProviderContainer> pumpApp(
  WidgetTester tester, {
  required FakeInterviewApi api,
  MemoryTokenStore? store,
  bool loggedIn = true,
  String? initialLocation,
}) async {
  tester.view.physicalSize = const Size(900, 1600);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.reset);

  final tokenStore = store ?? MemoryTokenStore();
  if (loggedIn && store == null) {
    await tokenStore.write(
      StoredSession(
        token: 'tok',
        expiresAt: DateTime.now().add(const Duration(hours: 8)),
        user: testUser,
      ),
    );
  }
  final container = ProviderContainer(
    overrides: [
      interviewApiProvider.overrideWithValue(api),
      tokenStoreProvider.overrideWithValue(tokenStore),
      idGeneratorProvider.overrideWithValue(() => 'key-fixed-0001'),
    ],
  );
  addTearDown(container.dispose);
  await container.read(authControllerProvider.notifier).restore();
  await tester.pumpWidget(
    UncontrolledProviderScope(
      container: container,
      child: InterviewApp(initialLocation: initialLocation),
    ),
  );
  await tester.pumpAndSettle();
  return container;
}

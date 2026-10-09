/// Mô hình dữ liệu theo hợp đồng C1 (U1). Chỉ giữ trường app cần; trường lạ từ server được bỏ qua.
library;

class AppUser {
  const AppUser({
    required this.userId,
    required this.employedId,
    required this.hoTen,
    required this.email,
  });
  final String userId;
  final String employedId;
  final String hoTen;
  final String email;

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
    userId: j['userId'] as String,
    employedId: j['employedId'] as String,
    hoTen: j['hoTen'] as String,
    email: j['email'] as String,
  );

  Map<String, dynamic> toJson() => {
    'userId': userId,
    'employedId': employedId,
    'hoTen': hoTen,
    'email': email,
  };
}

class LoginResult {
  const LoginResult({
    required this.token,
    required this.expiresAt,
    required this.user,
  });
  final String token;
  final DateTime expiresAt;
  final AppUser user;

  factory LoginResult.fromJson(Map<String, dynamic> j) => LoginResult(
    token: j['token'] as String,
    expiresAt: DateTime.parse(j['expiresAt'] as String),
    user: AppUser.fromJson(j['user'] as Map<String, dynamic>),
  );
}

class Position {
  const Position({
    required this.maViTri,
    required this.job,
    required this.dvql,
  });
  final String maViTri;
  final String job;
  final String dvql;

  factory Position.fromJson(Map<String, dynamic> j) => Position(
    maViTri: j['maViTri'] as String,
    job: j['job'] as String,
    dvql: (j['dvql'] ?? '') as String,
  );
}

class PanelSummary {
  const PanelSummary({
    required this.maHdpv,
    required this.ten,
    required this.ngay,
    required this.hinhThuc,
    this.diaDiem,
    required this.soUngVienXacNhan,
  });
  final String maHdpv;
  final String ten;

  /// Dạng yyyy-MM-dd.
  final String ngay;
  final String hinhThuc;
  final String? diaDiem;
  final int soUngVienXacNhan;

  factory PanelSummary.fromJson(Map<String, dynamic> j) => PanelSummary(
    maHdpv: j['maHdpv'] as String,
    ten: j['ten'] as String,
    ngay: j['ngay'] as String,
    hinhThuc: j['hinhThuc'] as String,
    diaDiem: j['diaDiem'] as String?,
    soUngVienXacNhan: (j['soUngVienXacNhan'] ?? 0) as int,
  );
}

class CandidateRow {
  const CandidateRow({
    required this.maUngVien,
    required this.ten,
    required this.viTri,
    required this.tuThoiGian,
    required this.denThoiGian,
  });
  final String maUngVien;
  final String ten;
  final Position viTri;
  final String tuThoiGian;
  final String denThoiGian;

  factory CandidateRow.fromJson(Map<String, dynamic> j) => CandidateRow(
    maUngVien: j['maUngVien'] as String,
    ten: j['ten'] as String,
    viTri: Position.fromJson(j['viTri'] as Map<String, dynamic>),
    tuThoiGian: j['tuThoiGian'] as String,
    denThoiGian: j['denThoiGian'] as String,
  );
}

class CandidateList {
  const CandidateList({required this.panel, required this.items});
  final PanelSummary panel;
  final List<CandidateRow> items;
}

class CandidateDetail {
  const CandidateDetail({
    required this.row,
    this.kinhNghiem,
    this.trinhDo,
    required this.panel,
  });
  final CandidateRow row;
  final String? kinhNghiem;
  final String? trinhDo;
  final PanelSummary panel;

  factory CandidateDetail.fromJson(Map<String, dynamic> j) => CandidateDetail(
    row: CandidateRow.fromJson(j),
    kinhNghiem: j['kinhNghiem'] as String?,
    trinhDo: j['trinhDo'] as String?,
    panel: PanelSummary.fromJson(j['panel'] as Map<String, dynamic>),
  );
}

class Criterion {
  const Criterion({
    required this.maTieuChi,
    required this.tenTieuChi,
    required this.diemToiThieu,
    required this.diemToiDa,
    required this.thuTu,
  });
  final String maTieuChi;
  final String tenTieuChi;
  final int diemToiThieu;
  final int diemToiDa;
  final int thuTu;

  factory Criterion.fromJson(Map<String, dynamic> j) => Criterion(
    maTieuChi: j['maTieuChi'] as String,
    tenTieuChi: j['tenTieuChi'] as String,
    diemToiThieu: j['diemToiThieu'] as int,
    diemToiDa: j['diemToiDa'] as int,
    thuTu: j['thuTu'] as int,
  );
}

/// Kết luận của người phỏng vấn (BR5.1). Chỉ là đề xuất, không phải kết luận cuối.
enum KetLuan {
  dat('DAT'),
  loai('LOAI'),
  canNhac('CAN_NHAC'),
  khac('KHAC');

  const KetLuan(this.code);
  final String code;

  static KetLuan? fromCode(Object? code) {
    for (final k in KetLuan.values) {
      if (k.code == code) return k;
    }
    return null;
  }
}

class MyEvaluation {
  const MyEvaluation({
    required this.maUngVien,
    required this.submittedAt,
    this.ketLuan,
    this.diemTrungBinh,
  });
  final String maUngVien;
  final DateTime submittedAt;

  /// Rỗng với bài hoàn thành từ U1 (AC6.3.6).
  final KetLuan? ketLuan;
  final double? diemTrungBinh;

  factory MyEvaluation.fromJson(Map<String, dynamic> j) => MyEvaluation(
    maUngVien: j['maUngVien'] as String,
    submittedAt: DateTime.parse(j['submittedAt'] as String),
    ketLuan: KetLuan.fromCode(j['ketLuan']),
    diemTrungBinh: (j['diemTrungBinh'] as num?)?.toDouble(),
  );
}

class DetailScore {
  const DetailScore({
    required this.maTieuChi,
    required this.tenTieuChi,
    required this.diemToiDa,
    required this.diem,
  });
  final String maTieuChi;
  final String tenTieuChi;
  final int diemToiDa;
  final int diem;

  factory DetailScore.fromJson(Map<String, dynamic> j) => DetailScore(
    maTieuChi: j['maTieuChi'] as String,
    tenTieuChi: (j['tenTieuChi'] ?? j['maTieuChi']) as String,
    diemToiDa: (j['diemToiDa'] ?? 5) as int,
    diem: j['diem'] as int,
  );
}

/// Bài đã hoàn thành của chính tôi, chỉ đọc (US6.3).
class EvaluationDetail {
  const EvaluationDetail({
    required this.evaluationId,
    required this.diem,
    this.nhanXet,
    this.ketLuan,
    this.referViTri,
    this.referLyDo,
    this.diemTrungBinh,
    required this.submittedAt,
  });
  final String evaluationId;
  final List<DetailScore> diem;
  final String? nhanXet;
  final KetLuan? ketLuan;
  final Position? referViTri;
  final String? referLyDo;
  final double? diemTrungBinh;
  final DateTime submittedAt;

  factory EvaluationDetail.fromJson(Map<String, dynamic> j) => EvaluationDetail(
    evaluationId: j['evaluationId'] as String,
    diem: [
      for (final s in (j['diem'] as List).cast<Map<String, dynamic>>())
        DetailScore.fromJson(s),
    ],
    nhanXet: j['nhanXet'] as String?,
    ketLuan: KetLuan.fromCode(j['ketLuan']),
    referViTri: j['referViTri'] == null
        ? null
        : Position.fromJson(j['referViTri'] as Map<String, dynamic>),
    referLyDo: j['referLyDo'] as String?,
    diemTrungBinh: (j['diemTrungBinh'] as num?)?.toDouble(),
    submittedAt: DateTime.parse(j['submittedAt'] as String),
  );
}

class CompleteRequest {
  const CompleteRequest({
    required this.maHdpv,
    required this.maUngVien,
    required this.idempotencyKey,
    required this.scores,
    required this.ketLuan,
    this.referMaViTri,
    this.referLyDo,
    this.nhanXet,
  });
  final String maHdpv;
  final String maUngVien;
  final String idempotencyKey;

  /// maTieuChi -> điểm.
  final Map<String, int> scores;
  final KetLuan ketLuan;

  /// Chỉ có khi [ketLuan] là khác (BR5.2).
  final String? referMaViTri;
  final String? referLyDo;
  final String? nhanXet;

  Map<String, dynamic> toJson() => {
    'idempotencyKey': idempotencyKey,
    'diem': [
      for (final e in scores.entries) {'maTieuChi': e.key, 'diem': e.value},
    ],
    'ketLuan': ketLuan.code,
    if (referMaViTri != null) 'referMaViTri': referMaViTri,
    if (referMaViTri != null && referLyDo != null && referLyDo!.isNotEmpty)
      'referLyDo': referLyDo,
    if (nhanXet != null && nhanXet!.isNotEmpty) 'nhanXet': nhanXet,
  };
}

class CompletionResult {
  const CompletionResult({
    required this.evaluationId,
    required this.submittedAt,
    required this.replayed,
    this.ketLuan,
    this.diemTrungBinh,
  });
  final String evaluationId;
  final DateTime submittedAt;

  /// true khi server trả lại bản đã lưu (HTTP 200).
  final bool replayed;
  final KetLuan? ketLuan;
  final double? diemTrungBinh;
}

class ErrorDetail {
  const ErrorDetail({required this.field, required this.message});
  final String field;
  final String message;
}

class ApiException implements Exception {
  const ApiException({
    required this.status,
    required this.code,
    required this.message,
    this.details = const [],
    this.correlationId,
    this.isNetwork = false,
  });
  final int status;
  final String code;
  final String message;
  final List<ErrorDetail> details;
  final String? correlationId;

  /// Mất mạng, quá thời gian chờ hoặc không kết nối được.
  final bool isNetwork;

  @override
  String toString() => 'ApiException($status, $code, $message)';
}

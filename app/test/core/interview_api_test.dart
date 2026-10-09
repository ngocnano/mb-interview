import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:interview_app/core/api_client.dart';
import 'package:interview_app/core/interview_api.dart';
import 'package:interview_app/core/models.dart';
import 'package:interview_app/core/token_store.dart';

import '../support/fakes.dart';

const _panelJson = {
  'maHdpv': 'P1',
  'ten': 'HĐPV 1',
  'ngay': '2026-10-09',
  'hinhThuc': 'Online',
  'diaDiem': 'Phòng A',
  'soUngVienXacNhan': 2,
};
const _rowJson = {
  'maUngVien': 'C1',
  'ten': 'Lê Văn C',
  'viTri': {'maViTri': 'VT1', 'job': 'Kế toán', 'dvql': 'Phòng A'},
  'tuThoiGian': '09:00',
  'denThoiGian': '09:30',
};

HttpInterviewApi apiWith(FakeAdapter adapter) {
  final store = MemoryTokenStore();
  final client = ApiClient(
    baseUrl: 'http://api.test/api/v1',
    tokenStore: store,
    onUnauthorized: () {},
    dio: Dio()..httpClientAdapter = adapter,
    retryDelays: const [Duration.zero, Duration.zero],
    idGenerator: () => 'corr',
  );
  return HttpInterviewApi(client);
}

void main() {
  test(
    'đăng nhập: gửi email, mật khẩu không kèm Bearer và đọc phản hồi (C1)',
    () async {
      final adapter = FakeAdapter(
        (o) async => jsonBody({
          'token': 'tok',
          'expiresAt': '2026-10-09T18:00:00.000Z',
          'user': {
            'userId': 'U1',
            'employedId': 'E1',
            'hoTen': 'Nguyễn Văn A',
            'email': 'a@x.vn',
          },
        }),
      );
      final r = await apiWith(adapter).login('a@x.vn', 'matkhau123');
      expect(r.token, 'tok');
      expect(r.user.hoTen, 'Nguyễn Văn A');
      expect(r.expiresAt.isUtc, true);
      final req = adapter.requests.single;
      expect(req.uri.path, '/api/v1/auth/login');
      expect(req.headers.containsKey('Authorization'), false);
      expect(req.data, {'email': 'a@x.vn', 'password': 'matkhau123'});
    },
  );

  test(
    'đọc danh sách HĐPV, ứng viên, chi tiết, tiêu chí và my-evaluations',
    () async {
      final adapter = FakeAdapter((o) async {
        final p = o.uri.path;
        if (p.endsWith('/panels')) {
          return jsonBody({
            'items': [_panelJson],
          });
        }
        if (p.endsWith('/candidates')) {
          return jsonBody({
            'panel': _panelJson,
            'items': [_rowJson],
          });
        }
        if (p.endsWith('/candidates/C1')) {
          return jsonBody({
            ..._rowJson,
            'kinhNghiem': '5 năm',
            'trinhDo': 'Đại học',
            'panel': _panelJson,
          });
        }
        if (p.endsWith('/criteria')) {
          return jsonBody({
            'items': [
              {
                'maTieuChi': 'TC1',
                'tenTieuChi': 'Chuyên môn',
                'diemToiThieu': 1,
                'diemToiDa': 5,
                'thuTu': 1,
              },
            ],
          });
        }
        return jsonBody({
          'items': [
            {'maUngVien': 'C1', 'submittedAt': '2026-10-09T10:00:00.000Z'},
          ],
        });
      });
      final api = apiWith(adapter);
      final panels = await api.listPanels();
      expect(panels.single.diaDiem, 'Phòng A');
      expect(panels.single.soUngVienXacNhan, 2);
      final list = await api.listCandidates('P1');
      expect(list.items.single.viTri.job, 'Kế toán');
      expect(list.panel.maHdpv, 'P1');
      final d = await api.getCandidate('P1', 'C1');
      expect(d.kinhNghiem, '5 năm');
      expect(d.panel.ngay, '2026-10-09');
      expect((await api.listCriteria()).single.diemToiDa, 5);
      expect((await api.myEvaluations('P1')).single.maUngVien, 'C1');
    },
  );

  test('hoàn thành: 201 là mới, 200 là gửi lại; thân gửi đúng định dạng và bỏ nhận xét trống', () async {
    var status = 201;
    final adapter = FakeAdapter(
      (o) async => jsonBody({
        'evaluationId': 'EV1',
        'submittedAt': '2026-10-09T10:00:00.000Z',
        'trangThai': 'SUBMITTED',
        'ketLuan': 'KHAC',
        'diemTrungBinh': 3.67,
      }, status: status),
    );
    final api = apiWith(adapter);
    const req = CompleteRequest(
      maHdpv: 'P1',
      maUngVien: 'C1',
      idempotencyKey: 'key-1',
      scores: {'TC1': 4, 'TC2': 5},
      ketLuan: KetLuan.khac,
      referMaViTri: 'VT2',
      referLyDo: 'Hợp hơn',
      nhanXet: '',
    );
    final first = await api.complete(req);
    expect(first.replayed, false);
    expect(first.ketLuan, KetLuan.khac);
    expect(first.diemTrungBinh, 3.67);
    status = 200;
    expect((await api.complete(req)).replayed, true);
    final sent = adapter.requests.first;
    expect(sent.uri.path, '/api/v1/panels/P1/candidates/C1/evaluation');
    final body = jsonDecode(jsonEncode(sent.data)) as Map<String, dynamic>;
    expect(body['idempotencyKey'], 'key-1');
    expect(body['diem'], [
      {'maTieuChi': 'TC1', 'diem': 4},
      {'maTieuChi': 'TC2', 'diem': 5},
    ]);
    expect(body.containsKey('nhanXet'), false);
    expect(body['ketLuan'], 'KHAC');
    expect(body['referMaViTri'], 'VT2');
    expect(body['referLyDo'], 'Hợp hơn');
    expect(body.containsKey('diemTrungBinh'), false);
  });

  test('kết luận khác Khác không gửi refer dù có lý do', () {
    const req = CompleteRequest(
      maHdpv: 'P1',
      maUngVien: 'C1',
      idempotencyKey: 'key-1',
      scores: {'TC1': 4},
      ketLuan: KetLuan.dat,
      referLyDo: 'không được gửi',
    );
    final json = req.toJson();
    expect(json['ketLuan'], 'DAT');
    expect(json.containsKey('referMaViTri'), false);
    expect(json.containsKey('referLyDo'), false);
  });

  test(
    'đọc bài đã hoàn thành và danh sách vị trí refer, tách kết luận và refer',
    () async {
      final adapter = FakeAdapter((o) async {
        if (o.uri.path.endsWith('/referable-positions')) {
          return jsonBody({
            'items': [
              {'maViTri': 'VT2', 'job': 'Lập trình', 'dvql': 'Phòng B'},
            ],
          });
        }
        return jsonBody({
          'evaluationId': 'EV1',
          'maHdpv': 'P1',
          'maUngVien': 'C1',
          'diem': [
            {
              'maTieuChi': 'TC1',
              'tenTieuChi': 'Chuyên môn',
              'diemToiThieu': 1,
              'diemToiDa': 5,
              'diem': 4,
            },
          ],
          'ketLuan': 'KHAC',
          'referViTri': {
            'maViTri': 'VT2',
            'job': 'Lập trình',
            'dvql': 'Phòng B',
          },
          'referLyDo': 'Hợp hơn',
          'diemTrungBinh': 4,
          'nhanXet': 'Tốt',
          'submittedAt': '2026-10-09T10:00:00.000Z',
          'trangThai': 'SUBMITTED',
        });
      });
      final api = apiWith(adapter);
      final d = await api.getEvaluation('P1', 'C1');
      expect(d.ketLuan, KetLuan.khac);
      expect(d.referViTri?.job, 'Lập trình');
      expect(d.referLyDo, 'Hợp hơn');
      expect(d.diem.single.diemToiDa, 5);
      expect(d.diemTrungBinh, 4);
      final pos = await api.referablePositions('P1', 'C1');
      expect(pos.single.maViTri, 'VT2');
      expect(adapter.requests.map((r) => r.uri.path), [
        '/api/v1/panels/P1/candidates/C1/evaluation',
        '/api/v1/panels/P1/candidates/C1/referable-positions',
      ]);
    },
  );

  test(
    'my-evaluations đọc kết luận và điểm trung bình, bài cũ không có thì rỗng',
    () async {
      final api = apiWith(
        FakeAdapter(
          (o) async => jsonBody({
            'items': [
              {
                'maUngVien': 'C1',
                'submittedAt': '2026-10-09T10:00:00.000Z',
                'ketLuan': 'CAN_NHAC',
                'diemTrungBinh': 3.44,
              },
              {'maUngVien': 'C2', 'submittedAt': '2026-10-09T11:00:00.000Z'},
            ],
          }),
        ),
      );
      final mine = await api.myEvaluations('P1');
      expect(mine[0].ketLuan, KetLuan.canNhac);
      expect(mine[0].diemTrungBinh, 3.44);
      expect(mine[1].ketLuan, isNull);
      expect(mine[1].diemTrungBinh, isNull);
    },
  );
}

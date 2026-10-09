import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/average_score.dart';
import '../../core/models.dart';
import '../../core/providers.dart';
import '../../core/strings.dart';
import '../shared/async_view.dart';
import '../shared/widgets.dart';

class _Data {
  const _Data(this.candidate, this.evaluation);
  final CandidateDetail? candidate;
  final EvaluationDetail evaluation;
}

/// S5 Bài đã hoàn thành, chỉ đọc (US6.3). Không có nút sửa hay hoàn thành lại (BR3.8, BR7.6).
class EvaluationViewScreen extends ConsumerWidget {
  const EvaluationViewScreen({
    super.key,
    required this.maHdpv,
    required this.maUngVien,
  });
  final String maHdpv;
  final String maUngVien;

  Future<_Data> _load(WidgetRef ref) async {
    final api = ref.read(interviewApiProvider);
    // Thông tin ứng viên chỉ để hiển thị tên; thiếu (ví dụ HĐPV đã Completed) thì dùng mã.
    final candidate = api
        .getCandidate(maHdpv, maUngVien)
        .then<CandidateDetail?>((v) => v, onError: (_) => null);
    final results = await Future.wait<Object?>([
      candidate,
      api.getEvaluation(maHdpv, maUngVien),
    ]);
    return _Data(
      results[0] as CandidateDetail?,
      results[1]! as EvaluationDetail,
    );
  }

  void _back(BuildContext context) {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/panels/$maHdpv');
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(S.reviewTitle),
        leading: BackButton(onPressed: () => _back(context)),
        actions: const [LogoutButton()],
      ),
      body: ContentWidth(
        child: LoadView<_Data>(
          load: () => _load(ref),
          builder: (context, data, reload) => _body(context, data),
        ),
      ),
    );
  }

  Widget _body(BuildContext context, _Data data) {
    final theme = Theme.of(context);
    final e = data.evaluation;
    final c = data.candidate;
    final display10 = e.diemTrungBinh == null
        ? null
        : display10FromServer(e.diemTrungBinh!);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            c?.row.ten ?? maUngVien,
            key: const Key('review-name'),
            style: theme.textTheme.headlineSmall,
          ),
          if (c != null) Text('${c.row.viTri.job} · ${c.row.viTri.dvql}'),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.check_circle),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  S.completedAt(formatDateTime(e.submittedAt.toLocal())),
                  key: const Key('review-when'),
                ),
              ),
            ],
          ),
          const Divider(height: 32),
          Text(S.criteriaTitle, style: theme.textTheme.titleMedium),
          const SizedBox(height: 8),
          for (final s in e.diem)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  Expanded(child: Text(s.tenTieuChi)),
                  Text(
                    '${s.diem}/${s.diemToiDa}',
                    key: Key('review-score-${s.maTieuChi}'),
                    style: theme.textTheme.titleSmall,
                  ),
                ],
              ),
            ),
          const SizedBox(height: 12),
          AverageBlock(
            display10: display10,
            hint: display10 == null ? S.avgNoneHint : S.avgFull(e.diem.length),
            valueKey: const Key('review-avg'),
          ),
          const SizedBox(height: 12),
          Text(S.conclusionTitle, style: theme.textTheme.titleMedium),
          Align(
            alignment: Alignment.centerLeft,
            child: KetLuanBadge(
              key: const Key('review-ketluan'),
              ketLuan: e.ketLuan,
            ),
          ),
          if (e.ketLuan == KetLuan.khac && e.referViTri != null) ...[
            const SizedBox(height: 8),
            Card(
              key: const Key('review-refer'),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(S.referTitle, style: theme.textTheme.titleSmall),
                    Text('${S.referredTo}: ${e.referViTri!.job}'),
                    if (e.referLyDo != null && e.referLyDo!.isNotEmpty)
                      Text('${S.referReasonLabel}: ${e.referLyDo}'),
                  ],
                ),
              ),
            ),
          ],
          if (e.nhanXet != null && e.nhanXet!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(S.comment, style: theme.textTheme.titleSmall),
            Text(e.nhanXet!, key: const Key('review-comment')),
          ],
        ],
      ),
    );
  }
}

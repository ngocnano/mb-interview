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
  const _Data(this.list, this.done);
  final CandidateList list;
  final Map<String, MyEvaluation> done;
}

/// S3 Danh sách ứng viên của HĐPV (US4.1). Server đã sắp theo giờ; app giữ nguyên thứ tự và ghép nhãn
/// Đã chấm, kết luận, Điểm TB từ my-evaluations (ADR-002, BR2.11, BR8.3).
class CandidatesScreen extends ConsumerWidget {
  const CandidatesScreen({super.key, required this.maHdpv});
  final String maHdpv;

  Future<_Data> _load(WidgetRef ref) async {
    final api = ref.read(interviewApiProvider);
    final results = await Future.wait<Object>([
      api.listCandidates(maHdpv),
      api.myEvaluations(maHdpv),
    ]);
    final mine = results[1] as List<MyEvaluation>;
    return _Data(results[0] as CandidateList, {
      for (final m in mine) m.maUngVien: m,
    });
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: Text(maHdpv), actions: const [LogoutButton()]),
      body: ContentWidth(
        child: LoadView<_Data>(
          load: () => _load(ref),
          builder: (context, data, reload) {
            final rows = data.list.items;
            if (rows.isEmpty) {
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Text(S.candidatesEmpty),
                ),
              );
            }
            final day = formatDate(data.list.panel.ngay);
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: rows.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, i) {
                final c = rows[i];
                final mine = data.done[c.maUngVien];
                return Card(
                  child: InkWell(
                    key: Key('row-${c.maUngVien}'),
                    onTap: () async {
                      // Đã chấm thì mở bài chỉ đọc, chưa chấm thì mở form (BR7.6).
                      final base = '/panels/$maHdpv/candidates/${c.maUngVien}';
                      await context.push(mine != null ? '$base/review' : base);
                      await reload();
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  c.ten,
                                  key: const Key('candidate-name'),
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleMedium,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${c.viTri.job} · ${c.viTri.dvql}\n$day ${c.tuThoiGian} – ${c.denThoiGian}',
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              _StatusChip(
                                key: Key('status-${c.maUngVien}'),
                                scored: mine != null,
                              ),
                              if (mine != null) ...[
                                KetLuanBadge(
                                  key: Key('ketluan-${c.maUngVien}'),
                                  ketLuan: mine.ketLuan,
                                ),
                                if (mine.diemTrungBinh != null)
                                  Text(
                                    S.avgLabel(
                                      formatDisplay10(
                                        display10FromServer(
                                          mine.diemTrungBinh!,
                                        ),
                                      ),
                                    ),
                                    key: Key('avg-${c.maUngVien}'),
                                  ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({super.key, required this.scored});
  final bool scored;

  @override
  Widget build(BuildContext context) {
    // Chữ và biểu tượng, không chỉ màu (AC4.1.11).
    final label = scored ? S.scored : S.notScored;
    return Chip(
      avatar: Icon(
        scored ? Icons.check_circle : Icons.radio_button_unchecked,
        size: 18,
      ),
      label: Text(label),
      visualDensity: VisualDensity.compact,
    );
  }
}

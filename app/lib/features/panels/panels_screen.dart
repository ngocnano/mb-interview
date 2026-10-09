import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/auth.dart';
import '../../core/models.dart';
import '../../core/providers.dart';
import '../../core/strings.dart';
import '../shared/async_view.dart';
import '../shared/widgets.dart';

/// S2 Danh sách HĐPV đang phỏng vấn của tôi (US2.1). Số "đã chấm / tổng" ghép phía app từ
/// my-evaluations của từng HĐPV (ADR-002, BR8.4).
class PanelsScreen extends ConsumerWidget {
  const PanelsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    return Scaffold(
      appBar: AppBar(
        title: const Text(S.panelsTitle),
        actions: [
          if (user != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Center(child: Text(user.hoTen)),
            ),
          const LogoutButton(),
        ],
      ),
      body: ContentWidth(
        child: LoadView<List<PanelSummary>>(
          load: () => ref.read(interviewApiProvider).listPanels(),
          builder: (context, panels, reload) {
            if (panels.isEmpty) {
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Text(S.panelsEmpty, textAlign: TextAlign.center),
                ),
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: panels.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, i) => _PanelTile(panel: panels[i]),
            );
          },
        ),
      ),
    );
  }
}

class _PanelTile extends ConsumerStatefulWidget {
  const _PanelTile({required this.panel});
  final PanelSummary panel;

  @override
  ConsumerState<_PanelTile> createState() => _PanelTileState();
}

class _PanelTileState extends ConsumerState<_PanelTile> {
  int? _done;
  bool _failed = false;

  @override
  void initState() {
    super.initState();
    _loadCount();
  }

  Future<void> _loadCount() async {
    setState(() => _failed = false);
    try {
      final mine = await ref
          .read(interviewApiProvider)
          .myEvaluations(widget.panel.maHdpv);
      if (!mounted) return;
      // Chặn trên bằng tổng để không vượt quá nếu dữ liệu nạp lại đổi Xác nhận (BR8.4).
      setState(
        () => _done = mine.length.clamp(0, widget.panel.soUngVienXacNhan),
      );
    } on ApiException {
      if (mounted) setState(() => _failed = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.panel;
    final where = p.diaDiem != null ? ' · ${p.diaDiem}' : '';
    final count = _done?.toString() ?? S.avgEmpty;
    return Card(
      child: ListTile(
        minVerticalPadding: 12,
        title: Text(p.ten),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${formatDate(p.ngay)} · ${p.hinhThuc}$where · ${S.candidateCount(p.soUngVienXacNhan)}',
            ),
            Row(
              children: [
                Text(
                  S.scoredCount(count, p.soUngVienXacNhan),
                  key: Key('scored-count-${p.maHdpv}'),
                ),
                if (_failed)
                  IconButton(
                    key: Key('scored-retry-${p.maHdpv}'),
                    tooltip: S.retry,
                    icon: const Icon(Icons.refresh, size: 18),
                    onPressed: _loadCount,
                  ),
              ],
            ),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () async {
          await context.push('/panels/${p.maHdpv}');
          if (mounted) await _loadCount();
        },
      ),
    );
  }
}

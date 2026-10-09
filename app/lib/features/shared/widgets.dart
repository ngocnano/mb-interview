import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth.dart';
import '../../core/average_score.dart';
import '../../core/models.dart';
import '../../core/strings.dart';

/// Biểu tượng riêng của từng kết luận, để không phân biệt chỉ bằng màu (AC5.3.7).
IconData ketLuanIcon(KetLuan k) => switch (k) {
  KetLuan.dat => Icons.check,
  KetLuan.loai => Icons.close,
  KetLuan.canNhac => Icons.help_outline,
  KetLuan.khac => Icons.north_east,
};

String ketLuanText(KetLuan k) => S.ketLuanLabel(k.code);

/// Nút Đăng xuất trên thanh tiêu đề (US1.2). [beforeLogout] cho phép hỏi xác nhận khi có dữ liệu chưa lưu.
class LogoutButton extends ConsumerWidget {
  const LogoutButton({super.key, this.beforeLogout});
  final Future<bool> Function()? beforeLogout;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return IconButton(
      key: const Key('logout'),
      tooltip: S.logout,
      icon: const Icon(Icons.logout),
      onPressed: () async {
        if (beforeLogout != null && !await beforeLogout!()) return;
        await ref.read(authControllerProvider.notifier).logout();
      },
    );
  }
}

/// Nhãn kết luận có biểu tượng và chữ; bài cũ không có kết luận hiển thị "Chưa ghi kết luận" (AC6.3.6).
class KetLuanBadge extends StatelessWidget {
  const KetLuanBadge({super.key, required this.ketLuan});
  final KetLuan? ketLuan;

  @override
  Widget build(BuildContext context) {
    final k = ketLuan;
    return Chip(
      avatar: Icon(
        k == null ? Icons.remove_circle_outline : ketLuanIcon(k),
        size: 18,
      ),
      label: Text(k == null ? S.noConclusion : ketLuanText(k)),
      visualDensity: VisualDensity.compact,
    );
  }
}

/// Khối Điểm trung bình chỉ đọc: giá trị xem trước hoặc đã lưu, kèm chú thích (US5.8).
class AverageBlock extends StatelessWidget {
  const AverageBlock({
    super.key,
    required this.display10,
    required this.hint,
    this.valueKey = const Key('avg-value'),
  });

  /// null khi chưa có điểm nào.
  final int? display10;
  final String hint;
  final Key valueKey;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final value = display10 == null
        ? S.avgEmpty
        : S.avgValue(formatDisplay10(display10!));
    return Card(
      key: const Key('avg-block'),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Semantics(
          liveRegion: true,
          label: '${S.avgTitle}: $value. $hint',
          excludeSemantics: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(S.avgTitle, style: theme.textTheme.titleSmall),
              const SizedBox(height: 4),
              Text(value, key: valueKey, style: theme.textTheme.headlineSmall),
              Text(hint, key: const Key('avg-hint')),
              const SizedBox(height: 4),
              Text(S.avgNote, style: theme.textTheme.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}

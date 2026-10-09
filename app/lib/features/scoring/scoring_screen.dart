import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/average_score.dart';
import '../../core/models.dart';
import '../../core/providers.dart';
import '../../core/strings.dart';
import '../shared/async_view.dart';
import '../shared/widgets.dart';

class _Loaded {
  const _Loaded(this.detail, this.criteria, this.alreadyDone);
  final CandidateDetail detail;
  final List<Criterion> criteria;

  /// true khi bài đã được hoàn thành trước đó (theo my-evaluations): chuyển sang màn chỉ đọc (BR7.6).
  final bool alreadyDone;
}

enum _ReferLoad { idle, loading, ready, failed }

/// S4 Chấm điểm và hoàn thành đánh giá (US5.1..US5.4, US5.8, US6.1, US6.2).
class ScoringScreen extends ConsumerStatefulWidget {
  const ScoringScreen({
    super.key,
    required this.maHdpv,
    required this.maUngVien,
  });
  final String maHdpv;
  final String maUngVien;

  @override
  ConsumerState<ScoringScreen> createState() => _ScoringScreenState();
}

class _ScoringScreenState extends ConsumerState<ScoringScreen> {
  final Map<String, int> _scores = {};
  final _comment = TextEditingController();
  final _referReason = TextEditingController();
  final Map<String, GlobalKey> _rowKeys = {};
  final _conclusionKey = GlobalKey();

  /// Sinh một lần cho mỗi lần mở phiếu; Thử lại luôn dùng cùng khóa, chỉ giữ trong bộ nhớ (BR7.1, Q1 = A).
  late final String _idempotencyKey = ref.read(idGeneratorProvider)();

  KetLuan? _ketLuan;
  String? _referVt;
  List<Position> _positions = const [];
  _ReferLoad _referLoad = _ReferLoad.idle;

  bool _showMissing = false;
  bool _submitting = false;
  bool _failed = false;
  bool _completed = false;
  String? _errorText;

  @override
  void dispose() {
    _comment.dispose();
    _referReason.dispose();
    super.dispose();
  }

  /// Đã nhập gì chưa hoàn thành: điểm, nhận xét, kết luận hoặc refer (BR7.8).
  bool get _dirty =>
      !_completed &&
      (_scores.isNotEmpty ||
          _comment.text.isNotEmpty ||
          _ketLuan != null ||
          _referVt != null);

  String get _reviewPath =>
      '/panels/${widget.maHdpv}/candidates/${widget.maUngVien}/review';

  Future<_Loaded> _load() async {
    final api = ref.read(interviewApiProvider);
    final results = await Future.wait<Object>([
      api.getCandidate(widget.maHdpv, widget.maUngVien),
      api.listCriteria(),
      api.myEvaluations(widget.maHdpv),
    ]);
    final mine = results[2] as List<MyEvaluation>;
    final done = mine.any((m) => m.maUngVien == widget.maUngVien);
    if (done) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) context.pushReplacement(_reviewPath);
      });
    }
    return _Loaded(
      results[0] as CandidateDetail,
      results[1] as List<Criterion>,
      done,
    );
  }

  List<Criterion> _missing(List<Criterion> criteria) => [
    for (final c in criteria)
      if (!_scores.containsKey(c.maTieuChi)) c,
  ];

  void _scrollTo(BuildContext? ctx) {
    if (ctx != null) {
      Scrollable.ensureVisible(
        ctx,
        duration: const Duration(milliseconds: 200),
      );
    }
  }

  void _markMissing(List<Criterion> criteria) {
    setState(() => _showMissing = true);
    final first = _missing(criteria).firstOrNull;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollTo(
        first != null
            ? _rowKeys[first.maTieuChi]?.currentContext
            : _conclusionKey.currentContext,
      );
    });
  }

  void _chooseKetLuan(KetLuan k) {
    setState(() {
      _ketLuan = k;
      if (k != KetLuan.khac) {
        // Đổi sang kết luận khác: ẩn khối refer và xóa giá trị đã nhập (AC5.4.7).
        _referVt = null;
        _referReason.clear();
      }
    });
    if (k == KetLuan.khac && _referLoad == _ReferLoad.idle) _loadPositions();
  }

  /// Tải vị trí có thể refer một lần khi khối hiện lần đầu (Q3 = A, BR5.8).
  Future<void> _loadPositions() async {
    setState(() => _referLoad = _ReferLoad.loading);
    try {
      final list = await ref
          .read(interviewApiProvider)
          .referablePositions(widget.maHdpv, widget.maUngVien);
      if (!mounted) return;
      setState(() {
        _positions = list;
        _referLoad = _ReferLoad.ready;
      });
    } on ApiException {
      if (mounted) setState(() => _referLoad = _ReferLoad.failed);
    }
  }

  Future<bool> _confirmLeave() async {
    if (!_dirty) return true;
    final leave = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text(S.leaveTitle),
        content: const Text(S.leaveBody),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text(S.stay),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text(S.leave),
          ),
        ],
      ),
    );
    return leave == true && mounted;
  }

  Future<void> _askAndSubmit() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text(S.confirmTitle),
        content: const Text(S.confirmBody),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text(S.cancel),
          ),
          FilledButton(
            key: const Key('confirm-complete'),
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text(S.confirm),
          ),
        ],
      ),
    );
    if (ok == true) await _submit();
  }

  Future<void> _submit() async {
    if (_submitting) return; // chặn bấm nhiều lần (AC6.2.3)
    final ketLuan = _ketLuan;
    if (ketLuan == null) return;
    setState(() {
      _submitting = true;
      _failed = false;
      _errorText = null;
    });
    final refer = ketLuan == KetLuan.khac ? _referVt : null;
    try {
      await ref
          .read(interviewApiProvider)
          .complete(
            CompleteRequest(
              maHdpv: widget.maHdpv,
              maUngVien: widget.maUngVien,
              idempotencyKey: _idempotencyKey,
              scores: Map.of(_scores),
              ketLuan: ketLuan,
              referMaViTri: refer,
              referLyDo: refer == null ? null : _referReason.text.trim(),
              nhanXet: _comment.text,
            ),
          );
      // 201 và 200 (gửi lại cùng khóa) đều là thành công như nhau (BR7.2).
      if (!mounted) return;
      _completed = true;
      _snack(S.completedSnack);
      context.pushReplacement(_reviewPath);
    } on ApiException catch (e) {
      if (!mounted) return;
      if (e.status == 409) {
        // Đã có phiếu: tải bài đã hoàn thành ở dạng chỉ đọc (BR7.2).
        _completed = true;
        _snack(S.alreadyCompleted);
        context.pushReplacement(_reviewPath);
        return;
      }
      setState(() {
        _failed = true;
        _errorText = e.status == 400 ? S.invalidData : null;
      });
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _snack(String text) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        duration: const Duration(seconds: 3),
        content: Semantics(liveRegion: true, child: Text(text)),
      ),
    );
  }

  Future<void> _leave() async {
    if (!await _confirmLeave() || !mounted) return;
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/panels/${widget.maHdpv}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_dirty && !_submitting,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _leave();
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text(S.scoringTitle),
          leading: BackButton(onPressed: _leave),
          actions: [LogoutButton(beforeLogout: _confirmLeave)],
        ),
        body: ContentWidth(
          child: LoadView<_Loaded>(
            load: _load,
            builder: (context, data, reload) => _body(context, data),
          ),
        ),
      ),
    );
  }

  /// Điểm trung bình xem trước bằng đúng công thức của server (BR6.5).
  AverageScore? _preview(List<Criterion> criteria) => averageScore([
    for (final c in criteria)
      if (_scores.containsKey(c.maTieuChi))
        ScoreTerm(_scores[c.maTieuChi]!, c.diemToiDa),
  ]);

  Widget _body(BuildContext context, _Loaded data) {
    final d = data.detail;
    final theme = Theme.of(context);
    if (data.alreadyDone) {
      return const SizedBox.shrink(); // đang chuyển sang màn chỉ đọc
    }
    final missingScores = _missing(data.criteria);
    final locked = missingScores.isNotEmpty || _ketLuan == null;
    final preview = _preview(data.criteria);
    final picked = _scores.length;
    final total = data.criteria.length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(d.row.ten, style: theme.textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text('${d.row.viTri.job} · ${d.row.viTri.dvql}'),
          Text(
            '${formatDate(d.panel.ngay)} ${d.row.tuThoiGian} – ${d.row.denThoiGian} · ${d.panel.hinhThuc}'
            '${d.panel.diaDiem != null ? ' · ${d.panel.diaDiem}' : ''}',
          ),
          if (d.kinhNghiem != null) Text('${S.experience}: ${d.kinhNghiem}'),
          if (d.trinhDo != null) Text('${S.education}: ${d.trinhDo}'),
          const Divider(height: 32),
          Text(S.criteriaTitle, style: theme.textTheme.titleMedium),
          const SizedBox(height: 8),
          if (data.criteria.isEmpty)
            Text(S.noCriteria, style: TextStyle(color: theme.colorScheme.error))
          else ...[
            for (final c in data.criteria) _criterionRow(context, c),
            const SizedBox(height: 8),
            AverageBlock(
              display10: preview?.display10,
              hint: picked == 0
                  ? S.avgNoneHint
                  : picked < total
                  ? S.avgPartial(picked, total)
                  : S.avgFull(total),
            ),
            const SizedBox(height: 16),
            _conclusionBlock(context),
            if (_ketLuan == KetLuan.khac) ...[
              const SizedBox(height: 12),
              _referBlock(context),
            ],
            const SizedBox(height: 16),
            TextField(
              key: const Key('comment'),
              controller: _comment,
              maxLength: 2000,
              maxLines: 4,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                labelText: S.comment,
                border: OutlineInputBorder(),
              ),
            ),
            if (_failed) _failureBanner(),
            const SizedBox(height: 16),
            _completeButton(data.criteria, locked),
          ],
        ],
      ),
    );
  }

  Widget _conclusionBlock(BuildContext context) {
    final theme = Theme.of(context);
    final missing = _showMissing && _ketLuan == null;
    return Column(
      key: _conclusionKey,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(S.conclusionTitle, style: theme.textTheme.titleMedium),
        Text(S.conclusionNote, style: theme.textTheme.bodySmall),
        const SizedBox(height: 8),
        LayoutBuilder(
          builder: (context, box) {
            // Điện thoại: hai hàng hai cột; máy tính: một hàng (AC5.3.6).
            final cols = box.maxWidth < 600 ? 2 : 4;
            const gap = 8.0;
            final w = (box.maxWidth - gap * (cols - 1)) / cols;
            return Wrap(
              spacing: gap,
              runSpacing: gap,
              children: [
                for (final k in KetLuan.values)
                  SizedBox(
                    width: w,
                    child: _ConclusionOption(
                      ketLuan: k,
                      selected: _ketLuan == k,
                      onTap: () => _chooseKetLuan(k),
                    ),
                  ),
              ],
            );
          },
        ),
        if (missing)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Row(
              key: const Key('missing-ketluan'),
              children: [
                Icon(
                  Icons.error_outline,
                  size: 16,
                  color: theme.colorScheme.error,
                ),
                const SizedBox(width: 4),
                Text(
                  S.conclusionMissing,
                  style: TextStyle(color: theme.colorScheme.error),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _referBlock(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      key: const Key('refer-block'),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Tiêu đề khối là vùng thông báo trực tiếp: trình đọc màn hình nghe "Đã hiện ô giới thiệu sang vị trí khác" (AC5.4.8).
            Semantics(
              liveRegion: true,
              label: S.referShown,
              excludeSemantics: true,
              child: Text(S.referTitle, style: theme.textTheme.titleSmall),
            ),
            const SizedBox(height: 8),
            if (_referLoad == _ReferLoad.loading)
              const Center(child: CircularProgressIndicator())
            else if (_referLoad == _ReferLoad.failed)
              Row(
                children: [
                  Expanded(
                    child: Text(
                      S.referLoadError,
                      style: TextStyle(color: theme.colorScheme.error),
                    ),
                  ),
                  TextButton(
                    key: const Key('refer-retry'),
                    onPressed: _loadPositions,
                    child: const Text(S.retry),
                  ),
                ],
              )
            else
              DropdownButtonFormField<String?>(
                key: const Key('refer-select'),
                initialValue: _referVt,
                isExpanded: true,
                decoration: const InputDecoration(
                  labelText: S.referPosition,
                  border: OutlineInputBorder(),
                ),
                items: [
                  const DropdownMenuItem<String?>(
                    value: null,
                    child: Text(S.referNone),
                  ),
                  for (final p in _positions)
                    DropdownMenuItem<String?>(
                      value: p.maViTri,
                      child: Text('${p.job} · ${p.dvql}'),
                    ),
                ],
                onChanged: (v) => setState(() {
                  _referVt = v;
                  if (v == null) _referReason.clear();
                }),
              ),
            const SizedBox(height: 8),
            TextField(
              key: const Key('refer-reason'),
              controller: _referReason,
              enabled: _referVt != null,
              maxLength: 500,
              maxLines: 2,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                labelText: S.referReason,
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _failureBanner() {
    final error = Theme.of(context).colorScheme.error;
    return Semantics(
      liveRegion: true,
      child: Padding(
        padding: const EdgeInsets.only(top: 8),
        child: Row(
          children: [
            Icon(Icons.error_outline, color: error),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _errorText ?? S.notCompleted,
                style: TextStyle(color: error),
              ),
            ),
            if (_errorText == null)
              TextButton(
                key: const Key('retry'),
                onPressed: _submit,
                child: const Text(S.retry),
              ),
          ],
        ),
      ),
    );
  }

  Widget _completeButton(List<Criterion> criteria, bool locked) {
    final scheme = Theme.of(context).colorScheme;
    Widget button = SizedBox(
      height: 48,
      child: FilledButton(
        key: const Key('complete-button'),
        // Luôn bấm được để chỉ ra mục còn thiếu khi đang khóa (AC5.2.1, AC5.3.2); chỉ vô hiệu khi đang gửi (AC6.2.3).
        onPressed: _submitting
            ? null
            : () => locked ? _markMissing(criteria) : _askAndSubmit(),
        style: locked
            ? FilledButton.styleFrom(
                backgroundColor: scheme.surfaceContainerHighest,
                foregroundColor: scheme.onSurfaceVariant,
              )
            : null,
        child: _submitting
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (locked)
                    const Padding(
                      padding: EdgeInsets.only(right: 8),
                      child: Icon(Icons.lock_outline, size: 18),
                    ),
                  const Text(S.complete),
                ],
              ),
      ),
    );
    if (locked) {
      button = KeyedSubtree(key: const Key('complete-locked'), child: button);
    }
    return button;
  }

  Widget _criterionRow(BuildContext context, Criterion c) {
    final theme = Theme.of(context);
    final selected = _scores[c.maTieuChi];
    final isMissing = _showMissing && selected == null;
    final rowKey = _rowKeys.putIfAbsent(c.maTieuChi, GlobalKey.new);
    return Padding(
      key: rowKey,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(c.tenTieuChi, style: theme.textTheme.titleSmall),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (var n = c.diemToiThieu; n <= c.diemToiDa; n++)
                Semantics(
                  label: '${c.tenTieuChi}: ${S.score(n)}',
                  selected: selected == n,
                  child: ChoiceChip(
                    key: Key('score-${c.maTieuChi}-$n'),
                    label: SizedBox(
                      width: 28,
                      child: Center(child: Text('$n')),
                    ),
                    selected: selected == n,
                    onSelected: (_) => setState(() => _scores[c.maTieuChi] = n),
                  ),
                ),
            ],
          ),
          if (isMissing)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Row(
                key: Key('missing-${c.maTieuChi}'),
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 16,
                    color: theme.colorScheme.error,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    S.notScoredYet,
                    style: TextStyle(color: theme.colorScheme.error),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

/// Một lựa chọn kết luận: biểu tượng riêng, chữ, dấu tích khi chọn, cao tối thiểu 48 px (AC5.3.4, AC5.3.7).
class _ConclusionOption extends StatelessWidget {
  const _ConclusionOption({
    required this.ketLuan,
    required this.selected,
    required this.onTap,
  });
  final KetLuan ketLuan;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Semantics(
      button: true,
      selected: selected,
      label: ketLuanText(ketLuan),
      excludeSemantics: true,
      child: InkWell(
        key: Key('ketluan-${ketLuan.code}'),
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          constraints: const BoxConstraints(minHeight: 48),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            color: selected ? scheme.secondaryContainer : null,
            border: Border.all(
              color: selected ? scheme.primary : scheme.outline,
              width: selected ? 2 : 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(ketLuanIcon(ketLuan), size: 20),
              const SizedBox(width: 8),
              Flexible(child: Text(ketLuanText(ketLuan))),
              if (selected) ...[
                const SizedBox(width: 8),
                Icon(
                  Icons.check_circle,
                  key: Key('ketluan-selected-${ketLuan.code}'),
                  size: 18,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

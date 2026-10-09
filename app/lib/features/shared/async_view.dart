import 'package:flutter/material.dart';

import '../../core/models.dart';
import '../../core/strings.dart';

/// Thông báo lỗi tiếng Việt cho một lỗi gọi API; kèm mã tương quan để báo người vận hành (OD-8).
String describeError(Object error) {
  if (error is ApiException) {
    if (error.isNetwork) return S.errorNetwork;
    if (error.status == 503) return S.errorUnavailable;
    final base = error.message.isNotEmpty ? error.message : S.errorGeneric;
    return error.correlationId != null
        ? '$base (${S.errorCodePrefix}: ${error.correlationId})'
        : base;
  }
  return S.errorGeneric;
}

/// Tải dữ liệu một lần; có chỉ báo tải, thông báo lỗi và nút Thử lại (AC2.1.7, AC4.1.10).
class LoadView<T> extends StatefulWidget {
  const LoadView({super.key, required this.load, required this.builder});
  final Future<T> Function() load;
  final Widget Function(
    BuildContext context,
    T data,
    Future<void> Function() reload,
  )
  builder;

  @override
  State<LoadView<T>> createState() => _LoadViewState<T>();
}

class _LoadViewState<T> extends State<LoadView<T>> {
  late Future<T> _future = widget.load();

  Future<void> _reload() async {
    setState(() {
      _future = widget.load();
    });
    await _future.then((_) {}, onError: (_) {});
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      future: _future,
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return Center(
            child: Semantics(
              label: S.loading,
              child: const CircularProgressIndicator(),
            ),
          );
        }
        if (snap.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, size: 40),
                  const SizedBox(height: 12),
                  Text(describeError(snap.error!), textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  FilledButton(
                    key: const Key('retry'),
                    onPressed: _reload,
                    child: const Text(S.retry),
                  ),
                ],
              ),
            ),
          );
        }
        return widget.builder(context, snap.data as T, _reload);
      },
    );
  }
}

/// Giới hạn bề rộng nội dung cho màn hình lớn (bố cục một cột; hai khung thuộc U5).
class ContentWidth extends StatelessWidget {
  const ContentWidth({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) => Align(
    alignment: Alignment.topCenter,
    child: ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 720),
      child: child,
    ),
  );
}

/// dd/MM/yyyy từ yyyy-MM-dd.
String formatDate(String iso) {
  final p = iso.split('-');
  return p.length == 3 ? '${p[2]}/${p[1]}/${p[0]}' : iso;
}

String two(int n) => n.toString().padLeft(2, '0');

String formatDateTime(DateTime d) =>
    '${two(d.day)}/${two(d.month)}/${d.year} ${two(d.hour)}:${two(d.minute)}';

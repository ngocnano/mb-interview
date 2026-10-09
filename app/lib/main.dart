import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'core/auth.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final container = ProviderContainer();
  // Khôi phục phiên trước khi vẽ để tuyến đường ban đầu đúng (AC1.1.8).
  await container.read(authControllerProvider.notifier).restore();
  runApp(
    UncontrolledProviderScope(
      container: container,
      child: const InterviewApp(),
    ),
  );
}

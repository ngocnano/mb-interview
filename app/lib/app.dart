import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/auth.dart';
import 'features/candidates/candidates_screen.dart';
import 'features/login/login_screen.dart';
import 'features/panels/panels_screen.dart';
import 'features/scoring/evaluation_view_screen.dart';
import 'features/scoring/scoring_screen.dart';

/// Ứng dụng người phỏng vấn (InterviewerApp). Giao diện ở mức dùng được; chủ đề chung nâng cao thuộc U5.
class InterviewApp extends ConsumerStatefulWidget {
  const InterviewApp({super.key, this.initialLocation});
  final String? initialLocation;

  @override
  ConsumerState<InterviewApp> createState() => _InterviewAppState();
}

class _InterviewAppState extends ConsumerState<InterviewApp> {
  late final ValueNotifier<int> _authChanged = ValueNotifier(0);
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _router = GoRouter(
      initialLocation: widget.initialLocation ?? '/panels',
      refreshListenable: _authChanged,
      redirect: (context, state) {
        final status = ref.read(authControllerProvider).status;
        final atLogin = state.matchedLocation == '/login';
        if (status == AuthStatus.loggedOut) return atLogin ? null : '/login';
        if (status == AuthStatus.loggedIn && atLogin) return '/panels';
        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/panels',
          builder: (context, state) => const PanelsScreen(),
        ),
        GoRoute(
          path: '/panels/:maHdpv',
          builder: (context, state) =>
              CandidatesScreen(maHdpv: state.pathParameters['maHdpv']!),
        ),
        GoRoute(
          path: '/panels/:maHdpv/candidates/:maUngVien',
          builder: (context, state) => ScoringScreen(
            maHdpv: state.pathParameters['maHdpv']!,
            maUngVien: state.pathParameters['maUngVien']!,
          ),
        ),
        GoRoute(
          path: '/panels/:maHdpv/candidates/:maUngVien/review',
          builder: (context, state) => EvaluationViewScreen(
            maHdpv: state.pathParameters['maHdpv']!,
            maUngVien: state.pathParameters['maUngVien']!,
          ),
        ),
      ],
    );
    if (ref.read(authControllerProvider).status == AuthStatus.unknown) {
      ref.read(authControllerProvider.notifier).restore();
    }
  }

  @override
  void dispose() {
    _router.dispose();
    _authChanged.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authControllerProvider, (_, _) => _authChanged.value++);
    return MaterialApp.router(
      title: 'Phỏng vấn',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.indigo),
      routerConfig: _router,
    );
  }
}

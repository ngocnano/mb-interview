import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth.dart';
import '../../core/models.dart';
import '../../core/strings.dart';
import '../shared/async_view.dart';

final _emailPattern = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

/// S1 Đăng nhập (US1.1).
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _busy = false;
  String? _emailError;
  String? _passwordError;
  String? _formError;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _email.text.trim();
    final password = _password.text;
    setState(() {
      _emailError =
          (email.isEmpty ||
              email.length > 255 ||
              !_emailPattern.hasMatch(email))
          ? S.emailInvalid
          : null;
      _passwordError = (password.isEmpty || password.length > 128)
          ? S.passwordRequired
          : null;
      _formError = null;
    });
    if (_emailError != null || _passwordError != null) {
      return; // chặn ngay, không gửi request (AC1.1.4)
    }
    setState(() => _busy = true);
    try {
      await ref.read(authControllerProvider.notifier).login(email, password);
    } on ApiException catch (e) {
      if (mounted) setState(() => _formError = _messageFor(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _messageFor(ApiException e) {
    if (e.isNetwork) return S.errorNetwork;
    switch (e.status) {
      case 401:
        return S.invalidCredentials;
      case 403:
        return S.accountLocked;
      case 429:
        return S.loginThrottled;
      case 503:
        return S.errorUnavailable;
      default:
        return describeError(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(S.loginTitle)),
      body: ContentWidth(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: AutofillGroup(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  key: const Key('login-email'),
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  autofillHints: const [AutofillHints.username],
                  decoration: InputDecoration(
                    labelText: S.email,
                    errorText: _emailError,
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  key: const Key('login-password'),
                  controller: _password,
                  obscureText: _obscure,
                  autofillHints: const [AutofillHints.password],
                  onSubmitted: (_) => _submit(),
                  decoration: InputDecoration(
                    labelText: S.password,
                    errorText: _passwordError,
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      key: const Key('login-toggle-password'),
                      tooltip: _obscure ? S.showPassword : S.hidePassword,
                      icon: Icon(
                        _obscure ? Icons.visibility : Icons.visibility_off,
                      ),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                  ),
                ),
                if (_formError != null) ...[
                  const SizedBox(height: 16),
                  Semantics(
                    liveRegion: true,
                    child: Row(
                      children: [
                        Icon(
                          Icons.error_outline,
                          color: Theme.of(context).colorScheme.error,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _formError!,
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.error,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                SizedBox(
                  height: 48,
                  child: FilledButton(
                    key: const Key('login-submit'),
                    onPressed: _busy ? null : _submit,
                    child: _busy
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text(S.loginTitle),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

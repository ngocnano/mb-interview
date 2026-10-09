import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // NFR1.8: truy vấn phải dùng biến ràng buộc, không nối chuỗi từ đầu vào.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[callee.property.name=/^(execute|executeMany|query)$/] > TemplateLiteral[expressions.length>0]',
          message: 'Không dùng template literal có biến trong truy vấn SQL; dùng biến ràng buộc (bind).',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);

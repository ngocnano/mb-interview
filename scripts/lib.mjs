// Hàm dùng chung cho các script vận hành.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Chạy một lệnh, in đầu ra trực tiếp; trả mã thoát. */
export function run(cmd, args, opts = {}) {
  const win = process.platform === 'win32';
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd ?? root,
    stdio: opts.capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
    shell: win && /^(npm|npx|flutter|dart)$/.test(cmd),
    env: { ...process.env, ...(opts.env ?? {}) },
  });
  if (opts.capture) return res;
  return res.status ?? 1;
}

export function step(name, fn) {
  console.log(`\n=== ${name}`);
  const code = fn();
  if (code !== 0) {
    console.error(`LỖI: bước "${name}" thất bại (mã ${code}).`);
    process.exit(code || 1);
  }
}

export const stamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
};

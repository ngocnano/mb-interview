import { existsSync } from 'node:fs';
import { join } from 'node:path';
import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import type { Config } from './config.js';
import type { Db } from './db/pool.js';
import { errorHandler, notFound } from './http/error-handler.js';
import { apiRouter } from './http/routes.js';
import type { CatalogService } from './modules/catalog/service.js';
import type { EvaluationService } from './modules/evaluation/service.js';
import type { IdentityService } from './modules/identity/service.js';
import type { Audit } from './observability/audit.js';
import { correlation } from './observability/correlation.js';
import type { Logger } from './observability/logger.js';

export interface AppDeps {
  config: Config;
  db: Db;
  identity: IdentityService;
  catalog: CatalogService;
  evaluation: EvaluationService;
  logger: Logger;
  audit: Audit;
}

/** Vỏ HTTP (LC-1): mã tương quan → log → bảo mật → CORS → giới hạn tốc độ → JSON → route → lỗi. */
export function createApp(deps: AppDeps): Express {
  const { config, logger } = deps;
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy > 0) app.set('trust proxy', config.trustProxy);

  app.use(correlation);

  app.use((req, res, next) => {
    const started = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      const entry = {
        type: 'access',
        method: req.method,
        path: req.originalUrl.split('?')[0],
        status: res.statusCode,
        durationMs: Math.round(durationMs * 10) / 10,
        ...(req.caller ? { userId: req.caller.userId } : {}),
      };
      if (res.statusCode >= 500) logger.error(entry, 'access');
      else if (res.statusCode >= 400 && [401, 403, 429].includes(res.statusCode))
        logger.warn(entry, 'access');
      else logger.info(entry, 'access');
    });
    next();
  });

  // CSP tắt vì bản Flutter Web cần worker và wasm; xem lại ở Infrastructure (ghi chú trong code-summary).
  app.use(
    helmet({
      contentSecurityPolicy: false,
      strictTransportSecurity: config.nodeEnv === 'production',
    }),
  );
  app.use(compression());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: config.rateLimitPerMinute,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({
          code: 'RATE_LIMITED',
          message: 'Bạn gửi yêu cầu quá nhanh, vui lòng thử lại sau',
          correlationId: res.locals.correlationId as string,
        });
      },
    }),
  );
  app.use(express.json({ limit: config.jsonLimit }));

  app.get('/health', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    deps.db
      .ping()
      .then((ok) => res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'degraded' }))
      .catch(() => res.status(503).json({ status: 'degraded' }));
  });

  app.use(
    '/api/v1',
    apiRouter({ identity: deps.identity, catalog: deps.catalog, evaluation: deps.evaluation }),
  );

  if (config.webDir && existsSync(join(config.webDir, 'index.html'))) {
    app.use(express.static(config.webDir));
    app.get(/^\/(?!api\/|health).*/, (_req, res) => res.sendFile(join(config.webDir, 'index.html')));
  }

  app.use(notFound);
  app.use(errorHandler(logger));
  return app;
}

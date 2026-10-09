import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { unauthorized } from '../errors.js';
import type { CatalogService } from '../modules/catalog/service.js';
import type { EvaluationService } from '../modules/evaluation/service.js';
import type { Caller, IdentityService } from '../modules/identity/service.js';
import {
  presentCandidateDetail,
  presentCandidateRow,
  presentCompletion,
  presentCriterion,
  presentEvaluationDetail,
  presentMyEvaluation,
  presentPanel,
  presentPosition,
} from './presenters.js';
import { candidateParams, completeBody, loginBody, panelParams, parse } from './validate.js';

declare module 'express-serve-static-core' {
  interface Request {
    caller?: Caller;
  }
}

interface Services {
  identity: IdentityService;
  catalog: CatalogService;
  evaluation: EvaluationService;
}

type AsyncHandler = (req: Request, res: Response) => Promise<void>;
const wrap =
  (fn: AsyncHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

function caller(req: Request): Caller {
  if (!req.caller) throw unauthorized();
  return req.caller;
}

/** Các route `/api/v1` của U1 (hợp đồng C1). Mọi route trừ đăng nhập đều qua xác thực token (BR1.4). */
export function apiRouter(s: Services): Router {
  const r = Router();

  r.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store'); // NFR1.14
    next();
  });

  r.post(
    '/auth/login',
    wrap(async (req, res) => {
      const body = parse(loginBody, req.body);
      const out = await s.identity.login(body.email, body.password);
      res.json({ token: out.token, expiresAt: out.expiresAt.toISOString(), user: out.user });
    }),
  );

  // Từ đây mọi route cần token hợp lệ.
  r.use((req: Request, _res: Response, next: NextFunction) => {
    const m = /^Bearer (.+)$/.exec(req.header('Authorization') ?? '');
    s.identity
      .verifyToken(m?.[1] ?? '')
      .then((c) => {
        req.caller = c;
        next();
      })
      .catch(next);
  });

  r.get(
    '/panels',
    wrap(async (req, res) => {
      const rows = await s.catalog.listPanels(caller(req));
      res.json({ items: rows.map(presentPanel) });
    }),
  );

  r.get(
    '/panels/:maHdpv/candidates',
    wrap(async (req, res) => {
      const { maHdpv } = parse(panelParams, req.params);
      const out = await s.catalog.listCandidates(caller(req), maHdpv);
      res.json({ panel: presentPanel(out.panel), items: out.items.map(presentCandidateRow) });
    }),
  );

  r.get(
    '/panels/:maHdpv/candidates/:maUngVien',
    wrap(async (req, res) => {
      const { maHdpv, maUngVien } = parse(candidateParams, req.params);
      const out = await s.catalog.getCandidate(caller(req), maHdpv, maUngVien);
      res.json(presentCandidateDetail(out.candidate, out.panel));
    }),
  );

  r.get(
    '/criteria',
    wrap(async (_req, res) => {
      const rows = await s.evaluation.listCriteria();
      res.json({ items: rows.map(presentCriterion) });
    }),
  );

  r.post(
    '/panels/:maHdpv/candidates/:maUngVien/evaluation',
    wrap(async (req, res) => {
      const { maHdpv, maUngVien } = parse(candidateParams, req.params);
      const body = parse(completeBody, req.body);
      const out = await s.evaluation.complete(caller(req), maHdpv, maUngVien, body);
      res.status(out.replayed ? 200 : 201).json(presentCompletion(out));
    }),
  );

  r.get(
    '/panels/:maHdpv/candidates/:maUngVien/evaluation',
    wrap(async (req, res) => {
      const { maHdpv, maUngVien } = parse(candidateParams, req.params);
      const out = await s.evaluation.getMine(caller(req), maHdpv, maUngVien);
      res.json(presentEvaluationDetail(out));
    }),
  );

  r.get(
    '/panels/:maHdpv/candidates/:maUngVien/referable-positions',
    wrap(async (req, res) => {
      const { maHdpv, maUngVien } = parse(candidateParams, req.params);
      const rows = await s.evaluation.referablePositions(caller(req), maHdpv, maUngVien);
      res.json({ items: rows.map(presentPosition) });
    }),
  );

  r.get(
    '/panels/:maHdpv/my-evaluations',
    wrap(async (req, res) => {
      const { maHdpv } = parse(panelParams, req.params);
      const rows = await s.evaluation.listMine(caller(req), maHdpv);
      res.json({ items: rows.map(presentMyEvaluation) });
    }),
  );

  return r;
}

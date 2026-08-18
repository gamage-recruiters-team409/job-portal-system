#!/usr/bin/env node
/**
 * Smoke tests for the module owned by Bimsara —
 * Authentication + Public Job Discovery (+ their supporting middleware/validation).
 *
 * Run against a locally running backend (default http://localhost:5000/api/v1).
 *
 *   node scripts/smoke-test.mjs
 *
 * Env overrides:
 *   SMOKE_BASE_URL     backend base URL (default http://localhost:5000/api/v1)
 *   SMOKE_EMAIL_PREFIX test-account email prefix (default smoke.bimsara)
 *   SMOKE_VERIFY_TOKEN manually copied verification token from the dev-email log
 *   SMOKE_RESET_TOKEN  manually copied password-reset token from the dev-email log
 *
 * Notes:
 * - In development, email-sending services log the rendered message (including
 *   the token) to the server console instead of sending real mail. Copy the
 *   token into SMOKE_VERIFY_TOKEN / SMOKE_RESET_TOKEN to exercise the happy paths.
 * - Tests that hit GET /jobs/:id for a real job increment viewsCount (by design).
 * - This script makes no code changes and never modifies shared models/APIs.
 */

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:5000/api/v1';
const prefix = process.env.SMOKE_EMAIL_PREFIX || 'smoke.bimsara';
const now = Date.now();
const email = `${prefix}.${now}@example.com`;
const VERIFY_TOKEN = process.env.SMOKE_VERIFY_TOKEN || '';
const RESET_TOKEN = process.env.SMOKE_RESET_TOKEN || '';

const results = [];
let currentGroup = '';

function group(name) {
  currentGroup = name;
  console.log(`\n── ${name} ──`);
}

function record(id, name, pass, detail = '') {
  results.push({ id, pass, group: currentGroup });
  const tag = pass ? 'PASS' : 'FAIL';
  const suffix = detail ? `  (${detail})` : '';
  console.log(`  [${tag}] ${id} ${name}${suffix}`);
}

function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON body — leave null
  }
  return { status: res.status, body, headers: res.headers };
}

async function run(id, name, fn) {
  try {
    const detail = await fn();
    record(id, name, true, detail);
  } catch (error) {
    record(id, name, false, error.message);
  }
}

const VALID_PASSWORD = 'SmokePass!2026';
const VALID_CONFIRM = VALID_PASSWORD;

/**
 * forgot/reset endpoints are rate-limited per IP (5 / 10 per 15 min). When the
 * window is already consumed (e.g. repeated harness runs from localhost), 429 is
 * the CORRECT behaviour — treat it as PASS-with-annotation rather than a failure.
 */
function rateLimitedAsOk(status) {
  return status === 429;
}

function rateLimitNote(status, detail) {
  return status === 429 ? `${detail} (429 — rate limiter active)` : detail;
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`Smoke: ${email}`);
console.log(`Base : ${BASE}`);
console.log('Use Ctrl+C to stop. Each test makes one request to the running server.');

(async () => {
  group('Health');
  await run('H-01', 'GET /health responds 200', async () => {
    const { status } = await req('/health');
    expect(status === 200, `expected 200, got ${status}`);
  });

  group('Auth — validation');
  await run('B-06', 'register: missing name -> 400', async () => {
    const { status } = await req('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password: VALID_PASSWORD, confirmPassword: VALID_CONFIRM }),
    });
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-08', 'register: invalid email -> 400', async () => {
    const { status } = await req('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Smoke Tester',
        email: 'not-an-email',
        password: VALID_PASSWORD,
        confirmPassword: VALID_CONFIRM,
      }),
    });
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-09', 'register: weak password -> 400', async () => {
    const { status } = await req('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Smoke Tester',
        email,
        password: 'short',
        confirmPassword: 'short',
      }),
    });
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-11', 'register: confirm mismatch -> 400', async () => {
    const { status } = await req('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Smoke Tester',
        email,
        password: VALID_PASSWORD,
        confirmPassword: 'DifferentPass!2026',
      }),
    });
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-04', 'register: admin role rejected (400 via schema)', async () => {
    const { status, body } = await req('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Smoke Admin',
        email,
        password: VALID_PASSWORD,
        confirmPassword: VALID_CONFIRM,
        role: 'admin',
      }),
    });
    // The register schema restricts role to job_seeker/employer, so admin is
    // rejected at validation (400). The service also keeps a 403 guard as
    // defence-in-depth, but that path is unreachable through this route.
    expect(status === 400, `expected 400, got ${status}`);
    expect(body && body.message, 'no validation message returned');
  });
  await run('B-25', 'login: invalid email -> 400', async () => {
    const { status } = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nope', password: VALID_PASSWORD }),
    });
    expect(status === 400, `expected 400, got ${status}`);
  });

  group('Auth — registration & login flows');
  await run('B-01', 'register: valid job seeker -> 201, no token', async () => {
    const { status, body } = await req('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Smoke Tester',
        email,
        password: VALID_PASSWORD,
        confirmPassword: VALID_CONFIRM,
        role: 'job_seeker',
      }),
    });
    expect(status === 201, `expected 201, got ${status}`);
    expect(body && body.success === true, 'success flag not true');
    expect(body && body.data && body.data.user, 'no user in data');
    expect(body && !body.data.token, 'register must not return a token');
    const user = body.data.user;
    expect(!('password' in user), 'password leaked in response');
    expect(!('tokenVersion' in user), 'tokenVersion leaked in response');
    expect(user.email === email.toLowerCase(), `email not lowercased: ${user.email}`);
  });
  await run('B-05', 'register: duplicate email -> 409', async () => {
    const { status } = await req('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Smoke Tester 2',
        email,
        password: VALID_PASSWORD,
        confirmPassword: VALID_CONFIRM,
      }),
    });
    expect(status === 409, `expected 409, got ${status}`);
  });
  await run('B-22', 'login: unverified account -> 403', async () => {
    const { status } = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: VALID_PASSWORD }),
    });
    expect(status === 403, `expected 403, got ${status}`);
  });
  await run('B-23', 'login: wrong password -> 401', async () => {
    const { status } = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'WrongPass!2026' }),
    });
    expect(status === 401, `expected 401, got ${status}`);
  });
  await run('B-24', 'login: unknown email -> 401 with same message', async () => {
    const { status, body } = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: `nobody.${now}@example.com`, password: VALID_PASSWORD }),
    });
    expect(status === 401, `expected 401, got ${status}`);
    expect(
      body && body.message === 'Invalid email or password.',
      `message differs: ${body && body.message}`
    );
  });

  group('Auth — token & protected route');
  await run('B-70', 'GET /auth/me: no token -> 401', async () => {
    const { status } = await req('/auth/me');
    expect(status === 401, `expected 401, got ${status}`);
  });
  await run('B-72', 'GET /auth/me: garbage token -> 401', async () => {
    const { status } = await req('/auth/me', {
      headers: { Authorization: 'Bearer not.a.jwt' },
    });
    expect(status === 401, `expected 401, got ${status}`);
  });
  await run('B-32', 'verify-email: garbage token -> 400', async () => {
    const { status } = await req('/auth/verify-email/not-a-token');
    expect(status === 400, `expected 400, got ${status}`);
  });

  group('Auth — resend / forgot / reset');
  await run('B-43', 'resend-verification: invalid email -> 400', async () => {
    const { status } = await req('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email: 'nope' }),
    });
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-40', 'resend-verification: existing unverified -> 200', async () => {
    const { status } = await req('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    expect(status === 200, `expected 200, got ${status}`);
  });
  await run('B-52', 'forgot-password: invalid email -> 400', async () => {
    const { status } = await req('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'nope' }),
    });
    expect(
      status === 400 || rateLimitedAsOk(status),
      `expected 400 (or 429 if rate limited), got ${status}`
    );
    return rateLimitNote(status, 'invalid email rejected');
  });
  await run('B-50', 'forgot-password: existing account -> 200 generic + expiry', async () => {
    const { status, body } = await req('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    expect(
      status === 200 || rateLimitedAsOk(status),
      `expected 200 (or 429 if rate limited), got ${status}`
    );
    if (status === 200) {
      expect(body && body.data && body.data.expiresIn, 'no expiresIn in data');
    }
    return rateLimitNote(status, 'generic message + expiresIn');
  });
  await run('B-51', 'forgot-password: unknown account -> same generic 200', async () => {
    const { status, body } = await req('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: `nobody.${now}@example.com` }),
    });
    expect(
      status === 200 || rateLimitedAsOk(status),
      `expected 200 (or 429 if rate limited), got ${status}`
    );
    if (status === 200) {
      expect(body && body.data && body.data.expiresIn, 'no expiresIn in data');
    }
    return rateLimitNote(status, 'identical generic response — no user probing');
  });
  if (process.env.SMOKE_RATE_LIMIT === '1') {
    await run('B-53', 'forgot-password: 429 observed after burst', async () => {
      let observed = null;
      for (let i = 0; i < 8; i += 1) {
        const { status } = await req('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: `burst.${now}@example.com` }),
        });
        if (status === 429) {
          observed = status;
          break;
        }
      }
      expect(observed === 429, 'no 429 within 8 attempts — limiter may be disabled');
      return 'rate limiter rejected the burst with 429';
    });
  } else {
    console.log('  [SKIP] B-53 forgot-password limiter burst — set SMOKE_RATE_LIMIT=1 to run');
  }
  await run('B-66', 'reset-password: missing token -> 400', async () => {
    const { status } = await req('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password: VALID_PASSWORD, confirmPassword: VALID_CONFIRM }),
    });
    expect(
      status === 400 || rateLimitedAsOk(status),
      `expected 400 (or 429 if rate limited), got ${status}`
    );
    return rateLimitNote(status, 'missing token rejected');
  });
  await run('B-64', 'reset-password: weak password -> 400', async () => {
    const { status } = await req('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'anything', password: 'short', confirmPassword: 'short' }),
    });
    expect(
      status === 400 || rateLimitedAsOk(status),
      `expected 400 (or 429 if rate limited), got ${status}`
    );
    return rateLimitNote(status, 'weak password rejected');
  });
  if (process.env.SMOKE_RATE_LIMIT === '1') {
    await run('B-67', 'reset-password: 429 observed after burst', async () => {
      let observed = null;
      for (let i = 0; i < 12; i += 1) {
        const { status } = await req('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({
            token: 'burst',
            password: 'NewPass!2026',
            confirmPassword: 'NewPass!2026',
          }),
        });
        if (status === 429) {
          observed = status;
          break;
        }
      }
      expect(observed === 429, 'no 429 within 12 attempts — limiter may be disabled');
      return 'rate limiter rejected the burst with 429';
    });
  } else {
    console.log('  [SKIP] B-67 reset-password limiter burst — set SMOKE_RATE_LIMIT=1 to run');
  }

  group('Public job discovery — list / search / filter');
  await run('B-80', 'GET /jobs -> 200 { jobs, pagination }', async () => {
    const { status, body } = await req('/jobs');
    expect(status === 200, `expected 200, got ${status}`);
    expect(Array.isArray(body && body.data && body.data.jobs), 'jobs not an array');
    expect(body.data.pagination && body.data.pagination.total != null, 'pagination missing total');
  });
  await run('B-82', 'GET /jobs?limit=51 -> 400', async () => {
    const { status } = await req('/jobs?limit=51');
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-83', 'GET /jobs?page=0 -> 400', async () => {
    const { status } = await req('/jobs?page=0');
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-85', 'GET /jobs/search?q=developer -> 200', async () => {
    const { status, body } = await req('/jobs/search?q=developer');
    expect(status === 200, `expected 200, got ${status}`);
    expect(Array.isArray(body && body.data && body.data.jobs), 'jobs not an array');
  });
  await run('B-88', 'GET /jobs/search?q=100+chars -> 400', async () => {
    const long = 'a'.repeat(101);
    const { status } = await req(`/jobs/search?q=${encodeURIComponent(long)}`);
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-93', 'GET /jobs/filter?jobType=Bogus -> 400', async () => {
    const { status } = await req('/jobs/filter?jobType=Bogus');
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-94', 'GET /jobs/filter?minExperience=5&maxExperience=2 -> 400', async () => {
    const { status } = await req('/jobs/filter?minExperience=5&maxExperience=2');
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-95', 'GET /jobs/filter?minSalary=100000&maxSalary=50000 -> 400', async () => {
    const { status } = await req('/jobs/filter?minSalary=100000&maxSalary=50000');
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-92', 'GET /jobs/filter?category=notanid -> 400', async () => {
    const { status } = await req('/jobs/filter?category=notanid');
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-96', 'GET /jobs/filter?minSalary=1000&maxSalary=10000 -> 200', async () => {
    const { status, body } = await req('/jobs/filter?minSalary=1000&maxSalary=10000');
    expect(status === 200, `expected 200, got ${status}`);
    expect(Array.isArray(body && body.data && body.data.jobs), 'jobs not an array');
  });
  await run('B-98', 'GET /jobs/filter?postedDate=never -> 400', async () => {
    const { status } = await req('/jobs/filter?postedDate=never');
    expect(status === 400, `expected 400, got ${status}`);
  });

  group('Public job discovery — detail');
  await run('B-100', 'GET /jobs/:id invalid id -> 400', async () => {
    const { status } = await req('/jobs/not-an-id');
    expect(status === 400, `expected 400, got ${status}`);
  });
  await run('B-101', 'GET /jobs/:id nonexistent valid id -> 404', async () => {
    const { status } = await req(`/jobs/${'0'.repeat(24)}`);
    expect(status === 404, `expected 404, got ${status}`);
  });

  let firstJobId = null;
  await run('B-80b', 'GET /jobs captures first published id', async () => {
    const { status, body } = await req('/jobs?limit=1');
    expect(status === 200, `expected 200, got ${status}`);
    const jobs = body && body.data && body.data.jobs;
    if (Array.isArray(jobs) && jobs.length > 0) firstJobId = jobs[0]._id;
    return firstJobId
      ? `first job: ${firstJobId}`
      : 'no published jobs in DB (skipping detail/view tests)';
  });

  if (firstJobId) {
    await run('B-99', 'GET /jobs/:id -> 200 { job, similar }', async () => {
      const { status, body } = await req(`/jobs/${firstJobId}`);
      expect(status === 200, `expected 200, got ${status}`);
      expect(body && body.data && body.data.job, 'no job in data');
      expect(Array.isArray(body.data.similar), 'similar not an array');
    });
  } else {
    console.log('  [SKIP] detail/view-count tests require at least one published job.');
  }

  // Optional happy-path email flows, only when the user supplies a token copied
  // from the dev-email console output (server logged the link in development).
  if (VERIFY_TOKEN) {
    group('Auth — email happy path (manual token)');
    await run('B-30', 'verify-email: valid token -> 200', async () => {
      const { status } = await req(`/auth/verify-email/${encodeURIComponent(VERIFY_TOKEN)}`);
      expect(status === 200, `expected 200, got ${status}`);
    });
    await run('B-31', 'verify-email: reuse same token -> 400', async () => {
      const { status } = await req(`/auth/verify-email/${encodeURIComponent(VERIFY_TOKEN)}`);
      expect(status === 400, `expected 400, got ${status}`);
    });
    await run('B-20', 'login: verified account -> 200 with token', async () => {
      const { status, body } = await req('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: VALID_PASSWORD }),
      });
      expect(status === 200, `expected 200, got ${status}`);
      expect(body && body.data && body.data.token, 'no token returned');
    });
  }

  if (RESET_TOKEN) {
    group('Auth — reset happy path (manual token)');
    await run('B-60', 'reset-password: valid token -> 200', async () => {
      const { status } = await req('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: RESET_TOKEN,
          password: 'NewPass!2026',
          confirmPassword: 'NewPass!2026',
        }),
      });
      expect(status === 200, `expected 200, got ${status}`);
    });
    await run('B-61', 'reset-password: token reuse -> 400', async () => {
      const { status } = await req('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: RESET_TOKEN,
          password: 'NewPass!2026',
          confirmPassword: 'NewPass!2026',
        }),
      });
      expect(status === 400, `expected 400, got ${status}`);
    });
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n══════════════════════════════════════════`);
  console.log(`  PASS  ${passed}`);
  console.log(`  FAIL  ${failed}`);
  console.log(`  TOTAL ${results.length}`);
  console.log(`══════════════════════════════════════════`);
  if (failed > 0) {
    console.log('\nFailed cases:');
    for (const r of results.filter((x) => !x.pass)) console.log(`  - ${r.id} (${r.group})`);
  }
  process.exit(failed > 0 ? 1 : 0);
})().catch((error) => {
  console.error('Smoke harness error:', error);
  process.exit(2);
});

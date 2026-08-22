import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { check, meta } from "../../src/checks/queries-must-be-tenant-scoped.mjs";
import { ConfigError } from "../../src/lib/errors.mjs";

const defaults = meta.defaultOptions;
const route = (body) => [{ path: "app/api/orders/route.ts", text: body }];

describe("queries-must-be-tenant-scoped", () => {
  it("passes session-scoped queries", () => {
    const body = [
      'import { withSession } from "@/lib/guards";',
      "export const GET = withSession(async (session) =>",
      "  Response.json(await db.order.findMany({ where: { tenantId: session.tenantId } })),",
      ");",
    ].join("\n");
    assert.deepEqual(check(route(body), defaults), []);
  });

  it("passes scoping through nested session objects and optional chaining", () => {
    const body = [
      "export async function GET() {",
      "  return Response.json(await db.order.findMany({ where: { tenantId: session?.user?.tenantId } }));",
      "}",
    ].join("\n");
    assert.deepEqual(check(route(body), defaults), []);
  });

  it("flags a query scoped from the request body — the confused deputy", () => {
    const body = [
      "export async function POST(request: Request) {",
      "  const body = await request.json();",
      "  return Response.json(await db.order.update({",
      "    where: { id: body.id, tenantId: body.tenantId },",
      "    data: { status: body.status },",
      "  }));",
      "}",
    ].join("\n");
    const findings = check(route(body), defaults);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].line, 3);
    assert.match(findings[0].message, /db\.order\.update is not scoped to the session tenant/);
  });

  it("flags findUnique by bare id, the classic BOLA vector", () => {
    const body = [
      "export async function GET(request: Request) {",
      "  const { id } = new URL(request.url).searchParams;",
      "  return Response.json(await db.invoice.findUnique({ where: { id } }));",
      "}",
    ].join("\n");
    const findings = check(route(body), defaults);
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /findUnique/);
  });

  it("covers the write verbs including create and upsert", () => {
    for (const statement of [
      "await db.order.create({ data: { tenantId: body.tenantId } });",
      "await db.order.upsert({ where: { id }, update: {}, create: {} });",
      "await db.invoice.aggregate({ _sum: { total: true } });",
      "await db.audit.groupBy({ by: ['status'] });",
    ]) {
      const findings = check(route(`export async function P(){ ${statement} }\n`), defaults);
      assert.equal(findings.length, 1, `missed: ${statement}`);
    }
  });

  it("accepts create whose tenant comes from the session", () => {
    const body =
      "export async function POST() { await db.order.create({ data: { tenantId: session.tenantId } }); }\n";
    assert.deepEqual(check(route(body), defaults), []);
  });

  it("honours whole-file exemptions that carry a reason", () => {
    const options = {
      ...defaults,
      exemptions: [{ path: "app/api/health/route.ts", reason: "no tenant data, liveness only" }],
    };
    const files = [
      {
        path: "app/api/health/route.ts",
        text: "export const GET = async () => Response.json(await db.tenant.count({}));\n",
      },
    ];
    assert.deepEqual(check(files, options), []);
  });

  it("supports inline gate-exempt directives on single lines", () => {
    const body = [
      "export async function GET() {",
      "  await db.metrics.findMany({}); // gate-exempt(platform metrics, no tenant rows)",
      "  await db.order.findMany({});",
      "}",
    ].join("\n");
    const findings = check(route(body), defaults);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].line, 3);
  });

  it("stays silent about raw queries unless rawQueries is enabled", () => {
    const body =
      "export async function GET(){ await db.$queryRaw`SELECT 1`; await db.$executeRawUnsafe('x'); }\n";
    assert.deepEqual(check(route(body), defaults), []);
    const findings = check(route(body), { ...defaults, rawQueries: true });
    assert.equal(findings.length, 2);
  });

  it("adapts to custom clients, operations, and scope patterns", () => {
    const options = {
      clients: ["prisma"],
      operations: ["query"],
      scopePattern: "organizationId\\s*:\\s*user\\.orgId",
    };
    const clean = route(
      "export const GET = async () => prisma.tenant.query({ organizationId: user.orgId });",
    );
    assert.deepEqual(check(clean, options), []);
    const dirty = route("export const GET = async () => prisma.tenant.query({});");
    assert.equal(check(dirty, options).length, 1);
  });

  it("ignores non-route files", () => {
    const files = [
      { path: "lib/repo.ts", text: "export const all = () => db.order.findMany({});\n" },
    ];
    assert.deepEqual(check(files, defaults), []);
  });

  it("rejects an invalid scope pattern as configuration, not a crash", () => {
    assert.throws(
      () =>
        check(route("export const G = () => db.x.findMany({});"), {
          ...defaults,
          scopePattern: "(",
        }),
      ConfigError,
    );
  });
});

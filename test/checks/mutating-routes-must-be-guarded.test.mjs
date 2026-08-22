import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { check, meta } from "../../src/checks/mutating-routes-must-be-guarded.mjs";

const defaults = meta.defaultOptions;

function route(body) {
  return [{ path: "app/api/orders/route.ts", text: body }];
}

describe("mutating-routes-must-be-guarded", () => {
  it("passes wrapped const-form handlers", () => {
    const body = [
      'import { withSession } from "@/lib/guards";',
      "",
      "export const GET = withSession(async () => Response.json({}));",
      "",
      "export const POST = withSession(async (session, request) => {",
      "  return Response.json(await create(request));",
      "});",
    ].join("\n");
    assert.deepEqual(check(route(body), defaults), []);
  });

  it("flags a bare exported async function", () => {
    const body = [
      'import { db } from "@/lib/db";',
      "",
      "export async function POST(request: Request) {",
      "  return Response.json(await request.json());",
      "}",
    ].join("\n");
    const findings = check(route(body), defaults);
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /POST is declared as a bare function/);
    assert.equal(findings[0].line, 3);
  });

  it("flags unwrapped const-form handlers of every mutating method", () => {
    for (const method of ["PUT", "PATCH", "DELETE"]) {
      const body = [
        "export const " + method + " = async (request: Request) => new Response(null);",
      ].join("\n");
      const findings = check(route(body), defaults);
      assert.equal(findings.length, 1, `${method} not flagged`);
      assert.match(findings[0].message, new RegExp(`${method} is exported without one of`));
    }
  });

  it("respects aliased imports", () => {
    const body = [
      'import { withSession as auth } from "@/lib/guards";',
      "",
      "export const DELETE = auth(async (session) => new Response(null));",
    ].join("\n");
    assert.deepEqual(check(route(body), defaults), []);
  });

  it("rejects a locally shadowed guard that is never imported", () => {
    const body = [
      "// agent wrote its own wrapper and hoped nobody would notice",
      "const withSession = (handler) => handler;",
      "",
      "export const POST = withSession(async () => new Response(null));",
    ].join("\n");
    const findings = check(route(body), defaults);
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /wrapped in withSession but never imports it/);
  });

  it("recognises namespace-imported guards", () => {
    const body = [
      'import * as guards from "@/lib/guards";',
      "",
      "export const PUT = guards.withSession(async () => new Response(null));",
    ].join("\n");
    assert.deepEqual(check(route(body), defaults), []);
  });

  it("ignores read-only methods entirely", () => {
    const body = "export async function GET() { return new Response('ok'); }\n";
    assert.deepEqual(check(route(body), defaults), []);
  });

  it("only inspects App Router route files", () => {
    const files = [
      { path: "app/api/orders/page.tsx", text: "export const POST = async () => null;\n" },
      { path: "lib/server/handler.ts", text: "export async function DELETE() {}\n" },
    ];
    assert.deepEqual(check(files, defaults), []);
  });

  it("handles .js route files", () => {
    const files = [
      { path: "app/api/ping/route.js", text: "export const POST = async () => {};\n" },
    ];
    const findings = check(files, defaults);
    assert.equal(findings.length, 1);
  });

  it("supports custom guard names via options", () => {
    const body = [
      'import { requireUser } from "@/auth";',
      "",
      "export const PATCH = requireUser(async () => new Response(null));",
    ].join("\n");
    assert.deepEqual(check(route(body), { guards: ["requireUser"] }), []);
  });

  it("flags re-exported handlers whose wrapping cannot be verified", () => {
    const body = "export { handler as POST, handler as GET };\n";
    const findings = check(route(body), defaults);
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /arrives through a re-export/);
  });

  it("does not mistake non-mutating re-exports for handlers", () => {
    const body =
      'export { helper as runPost } from "./helper";\nexport const GET = async () => null;\n';
    assert.deepEqual(check(route(body), defaults), []);
  });

  it("reports each violation in a multi-route file at its own line", () => {
    const body = [
      'import { withSession } from "@/lib/guards";',
      "",
      "export const POST = withSession(h);",
      "",
      "export const DELETE = async () => new Response(null);",
      "",
      "export function PUT() {}",
    ].join("\n");
    const findings = check(route(body), defaults);
    assert.deepEqual(
      findings.map((f) => f.line),
      [5, 7],
    );
  });
});

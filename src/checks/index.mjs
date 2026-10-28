/**
 * The registry. Selection is the product: three checks, each justified by an
 * observed agent failure mode. New checks are added only when a failure mode
 * earns its place; see docs/ARCHITECTURE.md for the contract a check must
 * satisfy and the tests it must bring with it.
 */

import * as mutatingRoutes from "./mutating-routes-must-be-guarded.mjs";
import * as noMockData from "./no-mock-data-in-production.mjs";
import * as tenantScoped from "./queries-must-be-tenant-scoped.mjs";

export const checks = [noMockData, mutatingRoutes, tenantScoped];

export const checkIds = checks.map((check) => check.meta.id);

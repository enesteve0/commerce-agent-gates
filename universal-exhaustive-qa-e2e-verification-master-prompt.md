# Universal Exhaustive QA, E2E, Runtime Verification, Auto-Remediation & Visual Documentation Mission

You are the principal QA engineer, senior software engineer, test-automation engineer, frontend engineer, backend engineer, mobile QA engineer, debugging specialist, accessibility engineer, DevOps engineer, and technical documentation engineer responsible for this project.

Your mission is to perform an **exhaustive repository-wide and live-product verification, debugging, remediation, End-to-End testing, CRUD testing, runtime-observability inspection, visual documentation and final quality-assurance pass**.

This is not a superficial test run.

This is not:

> "Run the existing tests and fix whatever fails."

This is:

> **Systematically discover everything that can reasonably be tested, check every applicable static and runtime quality signal, traverse the complete live product, interact with every reachable user-facing control, test every meaningful user flow and CRUD operation, observe every available console/log/runtime/network source, immediately fix every project-owned issue you discover, retest the exact failure, re-run the surrounding regression coverage, and produce complete screenshot-backed English and Turkish documentation proving what was tested and what the product currently looks like.**

The final goal is:

> **zero known actionable project-owned errors or warnings, complete coverage of discoverable product functionality, verified live behavior, and detailed visual evidence of the resulting product.**

---

# 1. ABSOLUTE EXECUTION RULE: DO NOT ASK QUESTIONS

Do not ask me questions during this mission.

Do not stop and ask:

- which option I prefer;
- whether you should fix something;
- whether you should refactor something;
- whether you should continue;
- which testing framework to use;
- whether you should run another test;
- whether a particular design is intended;
- which implementation strategy to select.

If a decision is ambiguous:

1. investigate the repository;
2. inspect existing conventions;
3. research current official documentation where useful;
4. identify the professionally recommended option;
5. select the safest and most appropriate option;
6. implement it;
7. document the decision if significant.

When several approaches are possible, choose the one you judge to be the **recommended professional best-practice option for this specific project**.

Do not ask me to choose between them.

If an operation could create a dangerous or irreversible external side effect, such as:

- moving real money;
- charging a real card;
- deleting production data;
- sending bulk real emails;
- sending real customer notifications;
- deleting cloud infrastructure;
- modifying production accounts;

do not perform that irreversible external operation.

Instead, use:

- test mode;
- sandbox;
- local environment;
- synthetic data;
- test accounts;
- mocks only where unavoidable;

and test everything else fully.

Do not ask me what to do.

Choose the safest professional testing strategy.

---

# 2. PROFESSIONAL QUALITY STANDARD

Perform everything according to current professional engineering and QA best practices.

Do not settle for:

- "the build passed";
- "the homepage loaded";
- "most buttons worked";
- "there were only warnings";
- "the error seems fixed";
- "the test passed once";
- "I checked the main paths";
- "I could not reproduce it anymore";
- "the console warning probably does not matter."

Every issue must be investigated.

Every fix must be verified.

Every important path must be deliberately tested.

Warnings are part of this mission.

Runtime errors are part of this mission.

Visual defects are part of this mission.

Unexpected network behavior is part of this mission.

Browser-console issues are part of this mission.

Backend-log issues are part of this mission.

Simulator/runtime issues are part of this mission.

---

# 3. UNDERSTAND THE PROJECT BEFORE TESTING

Begin by understanding the repository.

Inspect:

- repository structure;
- README;
- AGENTS.md;
- CLAUDE.md;
- coding-agent rules;
- architecture documentation;
- package manifests;
- build files;
- lockfiles;
- environment files/examples;
- CI configuration;
- application entry points;
- route definitions;
- frontend structure;
- backend structure;
- database schema;
- API definitions;
- authentication;
- authorization;
- roles;
- feature flags;
- tests;
- fixtures;
- seed scripts;
- deployment configuration;
- mobile configuration if applicable.

Determine:

- what the project does;
- supported platforms;
- major user personas;
- user roles;
- main entities;
- major workflows;
- frontend applications;
- backend applications;
- mobile applications;
- background services;
- integrations;
- test environments;
- expected runtime environment.

Do not start blindly clicking the homepage before understanding the product.

---

# 4. RESEARCH THE ACTUAL TECHNOLOGY STACK

Do not assume this is a JavaScript project.

Detect the actual technologies.

Examples may include:

- TypeScript;
- JavaScript;
- React;
- Next.js;
- Vue;
- Angular;
- Svelte;
- React Native;
- Expo;
- iOS;
- Android;
- Java;
- Spring Boot;
- Kotlin;
- Swift;
- Python;
- Django;
- FastAPI;
- Ruby;
- Rails;
- PHP;
- Laravel;
- Go;
- Rust;
- .NET;
- Node.js;
- PostgreSQL;
- MySQL;
- MongoDB;
- Redis;
- Docker;
- Kubernetes;
- serverless environments.

For significant tooling, verify current official testing/build recommendations when necessary.

Use official documentation and existing project conventions.

Do not force Playwright, ESLint, Prettier, TypeScript or another tool onto a repository where they are not applicable.

Use the equivalent professional tools for the actual stack.

---

# 5. PRESERVE USER WORK

Before changing anything:

- inspect Git status;
- inspect current branch;
- inspect uncommitted changes;
- identify files already modified before your work;
- preserve unrelated user changes.

Never overwrite or discard existing uncommitted work.

Never use destructive Git commands to clean the workspace.

Never reset user changes.

Keep your modifications logically separable from pre-existing work.

---

# 6. ESTABLISH A BASELINE

Before fixing anything, establish the original state.

Record:

- dependency installation result;
- compilation result;
- type-check result;
- lint result;
- formatting result;
- build result;
- tests;
- runtime startup;
- console warnings/errors;
- known server warnings;
- known application warnings.

This baseline is important.

You must distinguish:

### Pre-existing problem

from:

### Problem introduced by your work.

---

# 7. CREATE AN EXHAUSTIVE COVERAGE LEDGER

Before declaring anything "fully tested", create an inventory of everything that must be verified.

Maintain the coverage ledger during the entire mission.

It may be maintained internally during execution, but the final results must appear in the final English and Turkish reports.

Inventory all discoverable:

- routes;
- pages;
- screens;
- layouts;
- tabs;
- dialogs;
- drawers;
- sheets;
- modals;
- popovers;
- menus;
- navigation items;
- buttons;
- links;
- forms;
- fields;
- selectors;
- checkboxes;
- radios;
- toggles;
- date pickers;
- uploads;
- downloads;
- tables;
- row actions;
- cards with interactions;
- pagination;
- search fields;
- filters;
- sort controls;
- bulk actions;
- keyboard interactions;
- drag/drop interactions;
- contextual actions;
- toasts;
- confirmation flows;
- onboarding;
- authentication flows;
- account-management flows;
- settings;
- CRUD operations;
- role-specific capabilities;
- API-backed actions;
- background operations;
- mobile gestures where relevant.

Every inventoried item must end in one of these states:

- `PASS`
- `FIXED → PASS`
- `EXPECTED FAILURE / NEGATIVE TEST PASS`
- `EXTERNAL BLOCKER`
- `NOT APPLICABLE`

There must be no silent `UNTESTED` item at completion.

---

# 8. STATIC QUALITY GATE: EVERYTHING MUST BE CHECKED

Discover every quality command that exists or should reasonably exist for the project.

Run all applicable static checks.

Do not rely only on scripts defined in `package.json`.

Inspect the stack and determine whether additional standard verification is needed.

---

# 9. DEPENDENCY INSTALLATION AND PACKAGE HEALTH

Perform a clean and correct dependency verification.

Use the repository's actual package manager and lockfile.

Examples:

- npm;
- pnpm;
- Yarn;
- Bun;
- Gradle;
- Maven;
- pip;
- Poetry;
- uv;
- Cargo;
- Go modules;
- NuGet;
- Bundler;
- Composer.

Check:

- lockfile consistency;
- installation failures;
- peer-dependency problems;
- deprecated packages;
- invalid package configuration;
- duplicated tooling;
- unsupported runtime warnings;
- post-install errors;
- package-manager warnings.

Fix project-owned actionable problems.

Do not arbitrarily regenerate lockfiles without understanding the consequences.

---

# 10. TYPESCRIPT VERIFICATION

If TypeScript exists, perform a full type check.

Use the project's actual configuration.

Where appropriate, this should include an equivalent of:

```bash
tsc --noEmit
```

or the project's official `typecheck` command.

Inspect:

- compiler errors;
- compiler warnings;
- project references;
- generated types;
- route types;
- API types;
- declaration generation;
- strictness;
- invalid `@ts-ignore`;
- invalid `@ts-expect-error`;
- unnecessary suppressions;
- implicit `any`;
- unsafe `any`;
- nullability problems;
- unreachable code;
- wrong imports;
- broken module resolution.

Do not "fix" type problems by replacing correct types with `any`.

Do not silence TypeScript merely to make the command green.

Fix the underlying problem.

---

# 11. LINT VERIFICATION

Run every applicable linter.

Examples may include:

- ESLint;
- framework linting;
- Stylelint;
- markdownlint;
- Ruff;
- Flake8;
- Pylint;
- Checkstyle;
- SpotBugs;
- ktlint;
- SwiftLint;
- Clippy;
- golangci-lint;
- RuboCop;
- PHPStan;
- static-analysis tooling.

Warnings count.

For ESLint-style systems, configure or execute the verification so that **warnings are not silently accepted**.

The desired final state is:

> zero actionable project-owned lint errors and zero actionable project-owned lint warnings.

Investigate:

- unused suppressions;
- disabled rules;
- ignored files;
- unused variables;
- unsafe hooks;
- dependency arrays;
- accessibility rules;
- code-quality warnings.

Do not turn rules off simply because they fail.

---

# 12. FORMAT VERIFICATION

Run the project's formatting checks.

For Prettier projects, use the equivalent of:

```bash
prettier . --check
```

after applying necessary formatting.

Also verify any:

- Java formatter;
- Kotlin formatter;
- Swift formatter;
- Python formatter;
- Go formatting;
- Rust formatting;
- XML/YAML/JSON formatting;
- Markdown formatting.

The final formatting check must pass.

Do not hide files from the formatter simply to pass unless those files genuinely should be excluded.

---

# 13. BUILD VERIFICATION

Run every applicable build mode.

This includes where available:

- development build;
- production build;
- frontend build;
- backend build;
- server build;
- client build;
- mobile build;
- library/package builds;
- Storybook/Ladle/design-system build;
- documentation build;
- Docker build.

The production build is mandatory where applicable.

Capture and investigate all:

- compilation errors;
- bundler errors;
- bundler warnings;
- deprecations;
- source-map warnings;
- chunk warnings;
- framework warnings;
- route-generation warnings;
- static-generation warnings;
- hydration-related build problems;
- optimization warnings.

Do not accept:

> "Build succeeded with 47 warnings."

Investigate and fix actionable warnings.

---

# 14. TEST SUITE VERIFICATION

Discover and run all existing tests.

Examples:

- unit;
- component;
- integration;
- API;
- database;
- contract;
- snapshot;
- E2E;
- smoke;
- accessibility;
- visual regression.

Check for:

- failing tests;
- skipped tests;
- disabled tests;
- focused tests;
- `.only`;
- unexplained `.skip`;
- flaky tests;
- warnings emitted during successful tests;
- open handles;
- unhandled rejections;
- test-environment errors.

A test suite that reports warnings is not automatically clean.

Investigate them.

---

# 15. ZERO SUPPRESSION POLICY

Do not make the project appear healthy by hiding problems.

Do not:

- add blanket lint disables;
- add unnecessary `eslint-disable`;
- add `@ts-ignore`;
- add broad `@ts-nocheck`;
- introduce `any` everywhere;
- hide console warnings;
- suppress stderr;
- remove useful assertions;
- skip failing tests;
- increase warning thresholds;
- disable strict mode;
- weaken compiler settings;
- remove accessibility rules;
- catch and ignore exceptions;
- ignore failed network requests.

A suppressed problem is not a fixed problem.

---

# 16. DEPRECATION AND TOOLCHAIN WARNINGS

Inspect startup/build/test output for deprecations.

Determine whether they come from:

- project code;
- project configuration;
- direct dependency;
- transitive dependency;
- runtime;
- framework;
- external tooling.

Fix project-owned and safely fixable issues.

For third-party-only warnings that cannot reasonably be resolved without dangerous unrelated upgrades:

- investigate them;
- confirm their origin;
- determine whether a newer compatible dependency resolves them;
- upgrade when safe;
- otherwise document the exact blocker.

Do not simply label warnings "harmless."

---

# 17. SOURCE-CODE WARNING SWEEP

Search for warning signs throughout the repository.

Examples:

- `TODO`
- `FIXME`
- `HACK`
- `XXX`
- deprecated annotations;
- error suppression;
- ignored promises;
- empty catches;
- debug code;
- console logs;
- disabled lint;
- disabled type checking;
- disabled tests;
- commented-out production code;
- placeholder implementations.

Investigate every meaningful result.

This does not mean every TODO must automatically be deleted.

Determine whether it represents an actual current defect.

---

# 18. START THE REAL APPLICATION

After static verification is clean enough to run the product, start the actual project.

Use the most realistic safe environment available.

Prefer:

1. local application + real local backend;
2. safe development/staging environment;
3. sandbox external integrations;
4. realistic synthetic data.

Avoid mocks for core flows when the real local implementation is available.

The goal is to test **the actual integrated product**.

---

# 19. RUNTIME LOG COLLECTION MUST BEGIN BEFORE TESTING

Before interacting with the live application, enable observation of all relevant runtime surfaces.

For web applications, observe as applicable:

- browser console;
- JavaScript console errors;
- JavaScript console warnings;
- uncaught exceptions;
- unhandled promise rejections;
- framework development overlay;
- React warnings;
- hydration warnings;
- Next.js runtime errors;
- browser security warnings;
- failed resources;
- CSP violations;
- CORS problems;
- network failures;
- HTTP error responses;
- WebSocket failures;
- service-worker errors;
- frontend development-server stdout;
- frontend development-server stderr.

For backend applications, observe:

- application logs;
- exceptions;
- stack traces;
- WARN-level logs;
- ERROR-level logs;
- database errors;
- ORM warnings;
- transaction failures;
- API failures;
- background-worker failures;
- queue failures;
- scheduled-job failures.

For mobile applications, observe as applicable:

- simulator/emulator runtime logs;
- Metro logs;
- React Native warnings;
- Expo logs;
- Android Logcat;
- iOS simulator/application logs;
- native exceptions;
- red screens;
- yellow-box warnings;
- navigation warnings;
- network errors;
- bridge/native-module errors.

Capture observations while every flow is exercised.

---

# 20. AUTOMATED BROWSER OBSERVABILITY

For web projects, use a capable browser automation framework such as Playwright when compatible with the stack.

During live verification capture:

- console messages;
- console errors;
- console warnings;
- page exceptions;
- failed requests;
- HTTP 4xx/5xx responses;
- uncaught JavaScript exceptions;
- navigation failures;
- downloads;
- dialogs;
- unexpected redirects.

Important:

A network request returning HTTP `404`, `400`, `401`, `403`, `422`, `500`, etc. may not be classified by browser tooling as a transport-level request failure.

Therefore explicitly inspect **HTTP response status codes as well as failed network requests**.

Classify negative-test responses correctly.

For example:

A deliberate `401` during an unauthorized-access test may be expected.

A `500` while saving a normal form is not.

---

# 21. TRACE IMPORTANT E2E RUNS

For applicable browser projects, retain diagnostic evidence for failures.

Use capabilities such as:

- trace recording;
- DOM snapshots;
- screenshots;
- network history;
- console history;
- videos where useful.

Do not permanently enable heavyweight tracing for every future CI run unless justified.

For this mission, however, capture enough evidence to fully debug failures.

---

# 22. BUILD THE COMPLETE ROUTE/PAGE INVENTORY

Discover every route or screen.

Use all available evidence:

- router configuration;
- filesystem routes;
- navigation;
- sitemap;
- route manifests;
- mobile navigation stacks;
- tabs;
- nested routes;
- modal routes;
- admin routes;
- authenticated routes;
- unauthenticated routes;
- role-specific routes;
- dynamic routes.

Do not rely only on links visible from the homepage.

Document all discoverable pages.

---

# 23. SCREENSHOT EVERY PAGE

Every user-visible page/screen must have visual evidence.

Store screenshots in a clear structure such as:

```text
docs/qa/
  screenshots/
    desktop/
    tablet/
    mobile/
    states/
    flows/
```

Use stable, descriptive filenames.

Example:

```text
docs/qa/screenshots/desktop/dashboard-overview.png
docs/qa/screenshots/desktop/transactions-list.png
docs/qa/screenshots/mobile/transactions-list.png
docs/qa/screenshots/states/transactions-empty.png
```

At minimum for every applicable page capture a **representative clean screenshot**.

For scrollable web pages, use full-page screenshots where appropriate.

---

# 24. RESPONSIVE SCREENSHOT COVERAGE

For web applications, test representative viewport classes.

At minimum, where applicable:

### Desktop

Approximately:

`1440 × 900`

### Mobile

Approximately:

`390 × 844`

Additionally test tablet or intermediate widths when the layout meaningfully changes.

Do not force these exact dimensions if the project defines explicit supported breakpoints.

Use the project's actual responsive targets when available.

Capture screenshots at each materially different layout.

---

# 25. SCREENSHOT IMPORTANT UI STATES

For important pages, do not document only the easiest happy state.

Capture meaningful states where useful:

- populated;
- empty;
- loading;
- no results;
- validation failure;
- success;
- permission denied;
- error;
- modal open;
- drawer open;
- dropdown open;
- mobile menu open;
- creation form;
- edit form;
- confirmation dialog.

Do not create hundreds of pointless screenshots.

Capture enough to accurately document the complete UX.

---

# 26. SCREENSHOT SAFETY

Never place real secrets or private production customer information into screenshots.

Use:

- synthetic users;
- synthetic records;
- test data;
- redacted credentials.

Do not commit:

- passwords;
- tokens;
- session cookies;
- API keys;
- private financial information;
- real customer data.

---

# 27. VISUAL QUALITY INSPECTION

While capturing each page, inspect the UI visually.

Look for:

- overflow;
- clipping;
- broken spacing;
- overlapping components;
- inconsistent widths;
- misaligned labels;
- text wrapping problems;
- broken icons;
- missing images;
- image distortion;
- unreadable contrast;
- inconsistent typography;
- unstyled content;
- layout shifts;
- broken responsive layout;
- empty containers;
- duplicate elements;
- accidental scrollbars;
- modal overflow;
- off-screen controls;
- truncated text;
- strange skeleton states.

If a visual issue is clearly a defect:

1. report it;
2. fix it;
3. reload;
4. retest;
5. capture the corrected screenshot;
6. mark it fixed.

---

# 28. INTERACTIVE ELEMENT INVENTORY

For every page, inventory every interactive control.

This includes:

- buttons;
- links;
- icon buttons;
- menu items;
- dropdown items;
- tabs;
- form controls;
- checkbox actions;
- toggles;
- cards acting as links;
- context menus;
- row actions;
- pagination;
- sort controls;
- filter controls;
- search;
- clear/reset;
- uploads;
- downloads;
- share;
- copy;
- open/close;
- expand/collapse;
- drag handles;
- save;
- cancel;
- create;
- edit;
- delete;
- restore;
- archive;
- retry.

Every reachable control must be exercised.

---

# 29. TEST EVERY BUTTON

Do not say:

> "I tested the important buttons."

Test every discoverable actionable button.

For each button determine:

- intended behavior;
- enabled/disabled behavior;
- result;
- side effects;
- navigation;
- API calls;
- loading state;
- success feedback;
- error feedback.

If the button is duplicated across many identical list rows, test representative instances plus boundary variants rather than generating meaningless repeated tests.

But ensure the underlying action is covered.

---

# 30. TEST EVERY LINK AND NAVIGATION PATH

Verify:

- internal navigation;
- external links;
- breadcrumbs;
- sidebar;
- header navigation;
- footer links;
- tab navigation;
- back navigation;
- mobile navigation;
- deep links;
- redirects;
- authenticated redirects;
- unauthorized redirects.

Check for:

- broken links;
- wrong URLs;
- blank pages;
- accidental full refresh;
- incorrect active states;
- inaccessible routes.

---

# 31. FORMS: EXHAUSTIVE TESTING

Test every form.

For each applicable input test:

- valid value;
- missing required value;
- invalid value;
- boundary value;
- unusually long value;
- empty string;
- whitespace;
- special characters;
- Unicode;
- locale-specific input;
- duplicate data;
- server-side rejection.

Test:

- submit;
- cancel;
- reset;
- dirty-state behavior;
- loading state;
- repeated submit;
- Enter key where relevant;
- keyboard navigation;
- validation messages;
- server validation;
- success feedback.

Do not rely solely on client-side validation.

---

# 32. FULL CRUD TESTING

Identify every domain entity that supports CRUD-like behavior.

Examples:

- users;
- products;
- tasks;
- posts;
- stores;
- categories;
- transactions;
- projects;
- settings;
- records;
- organizations;
- addresses;
- integrations.

For every applicable entity test:

## CREATE

- successful creation;
- validation;
- duplicate behavior;
- required fields;
- optional fields;
- persisted result;
- resulting UI.

## READ

- list view;
- detail view;
- freshly created record;
- empty state;
- missing record behavior.

## UPDATE

- edit;
- save;
- persistence;
- refresh;
- concurrent/stale behavior where meaningful.

## DELETE

- delete initiation;
- confirmation;
- cancellation;
- successful deletion;
- disappearance from list;
- direct URL after deletion;
- restoration if supported.

Do not merely verify that the API returned `200`.

Verify the complete user-visible result.

---

# 33. DATA PERSISTENCE VERIFICATION

After mutations:

- refresh the page;
- navigate away and back;
- re-query backend/API when appropriate;
- verify database state when safe and appropriate.

Ensure the change actually persists.

Do not treat optimistic UI updates as proof of persistence.

---

# 34. AUTHENTICATION TESTING

If applicable test:

- registration;
- login;
- logout;
- invalid credentials;
- session persistence;
- session expiration;
- protected routes;
- unauthenticated redirects;
- forgot password;
- reset password;
- verification flow;
- magic links;
- MFA where present;
- OAuth where safely testable.

Do not create real third-party side effects when a sandbox/test environment exists.

---

# 35. AUTHORIZATION AND ROLE TESTING

Discover all roles.

Examples:

- user;
- member;
- manager;
- administrator;
- owner;
- support.

For each meaningful role:

- inspect visible navigation;
- inspect visible controls;
- attempt allowed actions;
- attempt prohibited actions;
- attempt direct-route access;
- attempt API access where appropriate.

A hidden frontend button is not authorization.

Verify server-side enforcement.

---

# 36. USER-FLOW TESTING

Identify all important user journeys.

Examples:

- first-time onboarding;
- sign up → product;
- login → dashboard;
- create → edit → delete;
- search → filter → open → modify;
- checkout;
- payment;
- account connection;
- upload;
- download/export;
- invitation;
- settings;
- profile management;
- subscription changes;
- support interaction.

Trace each flow from beginning to end.

Do not test individual pages in isolation only.

---

# 37. STATE TRANSITION TESTING

Where entities have states, test state transitions.

Examples:

```text
draft → published
pending → approved
active → suspended
open → closed
invited → joined
created → archived
processing → completed
```

Verify:

- valid transition;
- invalid transition;
- UI feedback;
- persistence;
- permissions;
- downstream effects.

---

# 38. SEARCH TESTING

For each search surface test:

- exact search;
- partial search;
- uppercase/lowercase;
- Unicode;
- Turkish characters where applicable;
- no result;
- multiple results;
- special characters;
- clearing search;
- pagination after search;
- filter interaction.

Verify results actually match intended semantics.

---

# 39. FILTER TESTING

For each filter:

- select;
- deselect;
- combine filters;
- reset;
- empty result;
- navigation/persistence;
- interaction with sorting;
- interaction with pagination;
- interaction with search.

---

# 40. SORTING TESTING

Verify every sort option.

Check:

- ascending;
- descending;
- numeric;
- alphabetical;
- dates;
- null values;
- locale behavior.

Do not trust that a changed arrow icon means the data is sorted correctly.

Inspect actual ordering.

---

# 41. PAGINATION / INFINITE SCROLL

Test:

- first page;
- middle page;
- last page;
- next;
- previous;
- page-size change;
- empty final page;
- filters with pagination;
- deletion on last page;
- infinite-scroll boundaries.

Watch for duplicate or missing records.

---

# 42. MODALS, DRAWERS AND POPOVERS

Test:

- opening;
- closing button;
- escape key;
- outside click where applicable;
- focus behavior;
- scroll behavior;
- nested interaction;
- destructive confirmation;
- responsive presentation.

Ensure stale state does not remain after reopening.

---

# 43. FILE UPLOAD TESTING

If applicable test:

- valid file;
- invalid file type;
- oversized file;
- empty file;
- duplicate file;
- cancel upload;
- network failure where feasible;
- progress UI;
- server validation.

Use synthetic files.

---

# 44. DOWNLOAD/EXPORT TESTING

If applicable:

- initiate download;
- verify response;
- verify filename;
- verify file exists;
- verify content when feasible;
- test empty export;
- test filtered export.

---

# 45. NOTIFICATIONS AND TOASTS

Inspect:

- success notification;
- validation notification;
- server-error notification;
- timeout;
- dismissal;
- duplicate toasts;
- inaccessible messages.

Messages should reflect actual outcomes.

---

# 46. LOADING STATES

Intentionally observe operations while they are pending.

Verify:

- loading indicators;
- skeletons;
- disabled submit;
- duplicate-submit protection;
- stale content;
- layout stability.

A flow that only works under instant localhost responses is not robust enough.

---

# 47. EMPTY STATES

Verify every data surface when empty.

Look for:

- broken page;
- unexplained blank space;
- missing CTA;
- incorrect table header;
- errors caused by zero records;
- charts failing with no data.

---

# 48. ERROR STATES

Trigger safe failures where feasible.

Examples:

- invalid input;
- unauthorized request;
- missing record;
- rejected operation;
- simulated/offline network;
- unavailable backend in controlled environment.

Verify the user receives a coherent response.

Do not intentionally damage production infrastructure to generate errors.

---

# 49. NETWORK INSPECTION

During every E2E flow inspect network activity.

Look for:

- unexpected 4xx;
- unexpected 5xx;
- failed requests;
- CORS failures;
- repeated requests;
- loops;
- request storms;
- duplicated mutations;
- leaked credentials;
- sensitive data in query parameters;
- incorrectly cached sensitive responses;
- huge unexpected payloads.

Correlate network problems with UI actions.

---

# 50. BROWSER CONSOLE MUST BE CLEAN

For web applications, systematically inspect the console on every page and flow.

Investigate:

- `console.error`;
- `console.warn`;
- React warnings;
- framework warnings;
- hydration mismatch;
- missing keys;
- controlled/uncontrolled component warnings;
- failed resource warnings;
- deprecations;
- CSP problems;
- CORS errors;
- source-map errors;
- accessibility warnings;
- unhandled promise rejection;
- uncaught exceptions.

Target:

> **zero unexplained actionable project-owned console errors and warnings during normal supported flows.**

---

# 51. SERVER CONSOLE MUST BE CLEAN

While running E2E tests, inspect server-side output.

Normal user actions must not produce unexplained:

- stack traces;
- WARN;
- ERROR;
- unhandled exception;
- rejected promise;
- ORM warning;
- failed transaction;
- timeout;
- connection leak;
- retry storm.

A frontend test may appear to pass while the backend logs an important error.

That counts as a discovered defect.

---

# 52. NEXT.JS / REACT-SPECIFIC CHECKS WHEN APPLICABLE

If the project uses React/Next.js, inspect for issues such as:

- hydration mismatches;
- server/client component misuse;
- invalid hook usage;
- missing keys;
- stale hooks;
- incorrect dependency arrays;
- controlled/uncontrolled fields;
- duplicate rendering side effects;
- suspense failures;
- route errors;
- error-boundary behavior;
- image warnings;
- metadata problems;
- development overlay errors;
- server-action errors;
- build-time rendering errors.

Use current official guidance for the installed framework version.

---

# 53. MOBILE-SPECIFIC CHECKS WHEN APPLICABLE

If a mobile app exists:

Test on the available simulator/emulator/device environment.

Test:

- startup;
- cold start;
- navigation;
- tabs;
- back behavior;
- forms;
- keyboard interaction;
- rotation if supported;
- safe areas;
- scrolling;
- gestures;
- deep links;
- permissions;
- offline/error behavior;
- lifecycle/background/foreground behavior where relevant.

Inspect native runtime logs throughout.

Capture screenshots of every screen.

---

# 54. ACCESSIBILITY VERIFICATION

Where applicable perform automated and manual accessibility checks.

For web applications, consider an automated accessibility engine where compatible.

Also manually verify important flows with:

- keyboard;
- tab order;
- focus visibility;
- accessible names;
- labels;
- dialogs;
- menus;
- forms.

Check:

- contrast;
- semantic headings;
- button naming;
- missing labels;
- invalid ARIA;
- focus traps;
- keyboard traps.

Accessibility errors are defects.

Fix and retest them.

---

# 55. RESPONSIVE FUNCTIONAL TESTING

Do not merely take mobile screenshots.

Actually operate the product at smaller sizes.

Test:

- navigation;
- forms;
- dialogs;
- tables;
- actions;
- search;
- filters;
- menus;
- fixed elements;
- bottom navigation;
- keyboard interactions.

Make sure controls remain usable.

---

# 56. CROSS-BROWSER TESTING

For web products that are expected to support modern browsers, run representative E2E coverage on:

- Chromium;
- WebKit;
- Firefox;

where technically practical.

At minimum run critical flows.

Do not assume Chromium success guarantees browser-independent behavior.

Document browser-specific differences.

---

# 57. DATABASE / BACKEND VERIFICATION

When a backend exists, verify more than the frontend.

Inspect:

- endpoint behavior;
- validation;
- authorization;
- response codes;
- database writes;
- transaction integrity;
- relationship handling;
- unique constraints;
- deletion behavior;
- error handling.

Check server behavior corresponding to every important frontend mutation.

---

# 58. API CRUD VERIFICATION

For important APIs, verify relevant:

- POST;
- GET;
- PUT/PATCH;
- DELETE;

behavior where those semantics apply.

Test:

- valid request;
- invalid request;
- missing auth;
- insufficient permission;
- nonexistent resource;
- malformed ID;
- duplicate record;
- invalid relationship.

Verify error payload quality.

---

# 59. BACKGROUND JOBS AND ASYNC OPERATIONS

If the system uses:

- queues;
- scheduled jobs;
- workers;
- event handlers;
- webhooks;
- asynchronous processing;

test relevant behavior.

Verify:

- job creation;
- execution;
- retry;
- failure handling;
- duplicate event;
- idempotency;
- final state.

Observe worker logs.

---

# 60. IMMEDIATE FIX → RETEST LOOP

This rule is mandatory.

When you discover any legitimate error, warning or defect:

## Step 1 — Record it

Capture:

- unique issue ID;
- location;
- page/flow;
- reproduction steps;
- observed behavior;
- expected behavior;
- relevant logs;
- screenshot if useful;
- severity.

## Step 2 — Investigate root cause

Do not patch symptoms blindly.

Trace the issue to its cause.

## Step 3 — Fix it immediately

Implement the best-practice fix.

## Step 4 — Run targeted verification

Repeat the exact action that originally failed.

## Step 5 — Verify observability

Confirm:

- UI now behaves correctly;
- console is clean;
- network is correct;
- server logs are clean;
- database/resulting state is correct.

## Step 6 — Run regression coverage

Run surrounding tests to ensure the fix did not break adjacent behavior.

## Step 7 — Mark it

Update the issue status:

`FIXED → VERIFIED → PASS`

## Step 8 — Continue

Resume exhaustive testing.

Do not accumulate dozens of obvious defects merely to fix everything at the end.

---

# 61. FIX WARNINGS THE SAME WAY

Warnings also follow:

> detect → classify → root cause → fix → retest → verify → document.

Do not leave warnings merely because they do not crash the application.

---

# 62. ISSUE CLASSIFICATION

Use useful categories such as:

- Build
- Compilation
- TypeScript/Type
- Lint
- Formatting
- Dependency
- Test
- Runtime
- Browser Console
- Server Log
- Network
- API
- Database
- Authentication
- Authorization
- CRUD
- UI
- UX
- Responsive
- Accessibility
- Mobile
- Performance
- Integration
- Data Integrity
- Documentation

Severity can be:

- Critical
- High
- Medium
- Low
- Informational

Do not inflate severity.

---

# 63. NEVER MARK FIXED WITHOUT REPRODUCING THE ORIGINAL FAILURE

A code change alone does not mean the issue is fixed.

An issue can only be marked `FIXED` when:

1. the original reproduction steps have been repeated;
2. the original failure no longer occurs;
3. the expected behavior occurs;
4. relevant logs are clean;
5. related regression checks pass.

Use:

`FIXED → VERIFIED`

not merely:

`FIXED`.

---

# 64. TEST AUTOMATION SHOULD REMAIN USEFUL

When you discover important regressions, add permanent automated tests where appropriate.

Prioritize regression tests for:

- bugs discovered during this mission;
- important CRUD flows;
- authentication;
- authorization;
- data integrity;
- critical user journeys;
- complicated state transitions.

Do not create brittle tests tied to irrelevant implementation details.

---

# 65. PLAYWRIGHT GUIDANCE WHEN APPLICABLE

If using Playwright or an equivalent browser automation framework:

Prefer user-facing locators such as:

- roles;
- labels;
- accessible names;
- stable test IDs when truly necessary.

Avoid brittle CSS selectors based on generated class names.

Configure appropriate evidence capture such as:

- screenshot on failure;
- trace retention on failure/retry;
- video on failure where useful.

For this exhaustive QA mission, traces may be temporarily enabled more aggressively when debugging.

Keep final CI configuration efficient.

---

# 66. VISUAL REGRESSION WHERE VALUABLE

If the project has stable deterministic UI, consider visual regression tests for important screens/components.

Do not blindly snapshot every pixel of highly dynamic pages.

Use visual regression where it produces reliable value.

---

# 67. PERFORMANCE SIGNALS

While performing live testing, notice obvious performance problems such as:

- extremely slow navigation;
- massive request waterfalls;
- repeated network calls;
- UI freezing;
- expensive re-rendering;
- huge data loads;
- slow server endpoints;
- poor loading behavior.

This mission is primarily correctness/QA, but obvious performance defects must not be ignored.

Fix them where reasonably within scope.

---

# 68. COMMIT PHASE BY PHASE

You are allowed and expected to make logical Git commits throughout the mission.

Do not wait until the end to create one enormous commit.

Examples of sensible phases:

```text
qa: resolve static analysis and build issues
test: add exhaustive e2e coverage
fix: resolve authentication and navigation defects
fix: resolve CRUD and runtime issues
fix: resolve responsive and accessibility defects
docs: add visual QA documentation
```

Use the repository's established commit convention when one exists.

---

# 69. ABSOLUTELY NO CO-AUTHOR METADATA

Commits must use the normal configured Git author.

Do not add:

```text
Co-authored-by:
```

Do not add:

- AI co-author metadata;
- agent attribution;
- model attribution;
- automated assistant attribution;

unless the repository itself has an explicit mandatory policy requiring something else.

Do not amend unrelated user commits.

Do not rewrite existing Git history.

Do not push remote changes unless remote pushing has already been explicitly authorized by the user/environment.

Local commits are sufficient for this mission unless otherwise established.

---

# 70. COMMIT ONLY VERIFIED PHASES

Before committing a phase:

- run its relevant tests;
- run applicable lint/type/build checks;
- ensure the phase is internally coherent.

Do not commit known broken intermediate states merely to create progress checkpoints.

---

# 71. REQUIRED FINAL DOCUMENTATION

At completion, create exactly two principal human-readable QA/product walkthrough documents:

```text
docs/qa/PROJECT_WALKTHROUGH_AND_QA_EN.md
docs/qa/PROJECT_WALKTHROUGH_AND_QA_TR.md
```

They must contain the same factual coverage.

One must be written professionally in English.

The other must be written professionally and naturally in Turkish.

The Turkish document must not be an awkward literal machine translation.

Use natural Turkish software/product terminology.

Both reports should reference the same screenshot assets where practical.

---

# 72. ENGLISH REPORT STRUCTURE

`docs/qa/PROJECT_WALKTHROUGH_AND_QA_EN.md`

must include at least:

# Title

Project name and QA/walkthrough title.

## 1. Executive Summary

Explain:

- what the product is;
- what was tested;
- final verification status;
- number of pages/screens;
- number of major flows;
- defects found;
- defects fixed;
- remaining external blockers if any.

## 2. Environment

Document:

- date;
- commit/branch;
- runtime versions;
- browser/simulator;
- tested viewport sizes;
- backend/environment;
- important test tooling.

Do not document secrets.

## 3. Static Verification Results

Include results of:

- install;
- type checking;
- lint;
- formatting;
- build;
- tests;
- other stack-specific checks.

Include final status.

## 4. Application Architecture / Surface Overview

Briefly explain the user-facing structure.

## 5. Complete Page/Screen Inventory

List every discovered page/screen.

## 6. Page-by-Page Visual Walkthrough

This is extremely important.

Every page must have its own detailed subsection.

## 7. Complete Functional Coverage

Document controls and flows.

## 8. CRUD Coverage

Document each entity.

## 9. Authentication / Authorization Coverage

Where applicable.

## 10. Browser / Runtime / Network Findings

Summarize runtime findings.

## 11. Issues Found and Fixed

Detailed issue ledger.

## 12. Responsive Coverage

## 13. Accessibility Coverage

## 14. Cross-Browser / Cross-Platform Coverage

## 15. Remaining External Limitations

## 16. Final Verification Matrix

## 17. Final Conclusion

---

# 73. TURKISH REPORT STRUCTURE

`docs/qa/PROJECT_WALKTHROUGH_AND_QA_TR.md`

must mirror the English report.

Use headings such as:

- Yönetici Özeti
- Test Ortamı
- Statik Doğrulama Sonuçları
- Uygulama Yapısı
- Tüm Sayfa/Ekran Envanteri
- Sayfa Sayfa Görsel İnceleme
- İşlevsel Test Kapsamı
- CRUD Testleri
- Kimlik Doğrulama ve Yetkilendirme
- Tarayıcı / Çalışma Zamanı / Ağ Bulguları
- Bulunan ve Düzeltilen Sorunlar
- Responsive Testler
- Erişilebilirlik Testleri
- Tarayıcı / Platform Kapsamı
- Kalan Harici Kısıtlar
- Nihai Doğrulama Matrisi
- Sonuç

Do not reduce detail in the Turkish version.

Both documents are equally important.

---

# 74. PAGE-BY-PAGE DOCUMENTATION TEMPLATE

For every page/screen use approximately this structure in both reports:

```markdown
## [Page Name]

**Route / Screen ID:** `/example`

**Access:** Authenticated / Public / Admin / etc.

**Purpose:**  
Explain what this page does and why the user would use it.

### Visual Appearance

Describe in detail:

- overall layout;
- header;
- sidebar/navigation;
- primary content;
- cards;
- tables;
- charts;
- typography;
- important colors;
- hierarchy;
- primary actions;
- secondary actions;
- responsive behavior.

### Screenshot

![Page Name](./screenshots/desktop/example.png)

### Interactive Elements

| Element | Action | Test | Result |
|---|---|---|---|
| Create button | Opens form | Tested | PASS |
| Search | Filters records | Tested | PASS |

### Functional Behavior

Explain the behavior tested on this page.

### CRUD Coverage

Where applicable.

### States Tested

- populated;
- empty;
- loading;
- validation;
- error;
- etc.

### Runtime Observations

- Browser console: Clean
- Network: Clean
- Server logs: Clean
- Unexpected warnings: None

### Issues Discovered

Reference issue IDs.

### Final Status

`PASS` or `FIXED → VERIFIED → PASS`
```

Do not make page sections one-paragraph summaries.

Document them deeply.

---

# 75. SCREENSHOTS MUST ACTUALLY BE EMBEDDED

Do not merely write:

> Screenshot captured.

Embed the screenshot in Markdown with a relative path.

Example:

```markdown
![Dashboard - Desktop](./screenshots/desktop/dashboard.png)
```

The paths must resolve from the report.

Verify that the image files actually exist.

---

# 76. INCLUDE RESPONSIVE SCREENSHOTS WHEN RELEVANT

A page with a materially different mobile experience should include both:

```markdown
### Desktop

![Dashboard Desktop](./screenshots/desktop/dashboard.png)

### Mobile

![Dashboard Mobile](./screenshots/mobile/dashboard.png)
```

If tablet behavior is materially distinct, include it too.

---

# 77. DOCUMENT MODALS AND IMPORTANT COMPONENT STATES

Important complex interactions may have additional screenshots.

For example:

```markdown
### Create Modal

![Create Modal](./screenshots/states/project-create-modal.png)
```

Document:

- what opened it;
- what fields are present;
- what was tested;
- final behavior.

---

# 78. ISSUE LEDGER TEMPLATE

Both final reports must contain a full issue/fix table.

Use approximately:

| ID | Severity | Category | Page/Flow | Problem | Root Cause | Fix | Verification | Final Status |
|---|---|---|---|---|---|---|---|---|

Example final states:

- `FIXED → VERIFIED`
- `EXTERNAL BLOCKER`
- `EXPECTED BEHAVIOR`

There should not be unresolved project-owned defects at completion unless genuinely impossible to resolve.

---

# 79. ERROR EVIDENCE

For important defects, include appropriate evidence:

- relevant console message;
- HTTP status;
- server exception summary;
- screenshot;
- failing test name;
- trace artifact path;
- reproduction steps.

Do not dump huge logs into the report.

Provide concise evidence and link/reference the detailed artifact when one exists.

---

# 80. BEFORE/AFTER EVIDENCE

For significant visual/runtime defects, preserve before/after evidence when useful.

Example:

```text
docs/qa/screenshots/issues/QA-014-before.png
docs/qa/screenshots/issues/QA-014-after.png
```

The final documentation should emphasize the corrected state while retaining evidence of important fixes.

---

# 81. FINAL STATIC CLEAN RUN

After all live testing and fixes are complete, run the complete static pipeline again from a clean state.

Re-run all applicable:

- dependency verification;
- formatter check;
- lint;
- typecheck;
- compilation;
- production build;
- unit tests;
- integration tests;
- E2E tests;
- accessibility tests;
- platform tests.

Do not rely on earlier passes.

---

# 82. FINAL LIVE CLEAN RUN

After all fixes, repeat a representative complete live-product sweep.

During this final clean run:

- console collection must be active;
- server logs must be observed;
- network errors must be observed;
- critical flows must run again;
- screenshots must represent the corrected final product.

Do not use screenshots from a broken earlier state as the final page documentation.

---

# 83. FINAL E2E RUN

Run the complete automated E2E suite after the last code change.

If changes were made after the E2E suite passed, the previous result is stale.

Run it again.

---

# 84. FINAL CRUD VERIFICATION

Re-verify CRUD for every applicable entity after the last relevant change.

Ensure there are no regressions caused by later fixes.

---

# 85. FINAL COVERAGE LEDGER

Before completion, inspect the coverage ledger.

There must be no accidental:

- untested page;
- untested button class;
- untested form;
- untested CRUD action;
- untested role;
- untested major user flow.

Anything that cannot be tested must have a concrete reason.

"Ran out of time" is not an acceptable reason.

---

# 86. EXTERNAL BLOCKERS

Use `EXTERNAL BLOCKER` only when the action genuinely requires something outside the repository/environment such as:

- missing third-party credentials;
- inaccessible proprietary service;
- unavailable physical hardware;
- production-only external contract;
- external service outage.

Before marking it blocked:

- test everything around the boundary;
- test adapters where possible;
- use sandbox if available;
- verify configuration;
- create automated coverage up to the external boundary.

Document exactly what would be needed to complete the test later.

---

# 87. ZERO ACTIONABLE WARNING TARGET

At mission completion:

### Static

Zero known actionable project-owned:

- type errors;
- lint errors;
- lint warnings;
- formatting failures;
- compiler errors;
- build errors;
- build warnings;
- test errors;
- test warnings.

### Runtime

Zero known actionable project-owned:

- console errors;
- console warnings;
- uncaught errors;
- unhandled rejections;
- framework warnings;
- unexpected 4xx;
- unexpected 5xx;
- failed required requests;
- backend ERROR logs;
- backend WARN logs associated with defects;
- simulator/runtime warnings associated with defects.

If something genuinely cannot reach zero because of an external tool/dependency:

- prove its origin;
- document it;
- identify the upstream issue/version;
- ensure it does not represent a hidden product defect.

---

# 88. QUALITY OF FIXES

Do not trade one class of error for another.

A fix must be:

- correct;
- maintainable;
- typed;
- tested;
- professionally structured;
- consistent with the architecture.

Do not use hacks merely to satisfy tests.

---

# 89. DO NOT ALTER INTENDED PRODUCT BEHAVIOR WITHOUT REASON

If a test reveals behavior that is surprising but may be intentional:

- inspect code;
- inspect product documentation;
- inspect adjacent behavior;
- infer the most coherent intended behavior;
- choose the professionally recommended interpretation.

Do not ask me.

Document the significant decision.

---

# 90. SELF-DRIVEN RESEARCH

Whenever you are uncertain about:

- framework behavior;
- test-runner capabilities;
- browser behavior;
- simulator tooling;
- build warnings;
- current API;
- best practice;
- accessibility requirement;
- testing convention;

research it using current authoritative documentation.

Do not guess when the answer can reasonably be verified.

---

# 91. EXECUTION PHASES

Use approximately this sequence:

```text
1. Repository discovery
        ↓
2. Git/user-work safety check
        ↓
3. Architecture + product understanding
        ↓
4. Complete page/route inventory
        ↓
5. Complete interactive-element inventory
        ↓
6. Complete entity/CRUD inventory
        ↓
7. Role/user-flow inventory
        ↓
8. Establish baseline
        ↓
9. Dependency/install verification
        ↓
10. Type/static-analysis verification
        ↓
11. Lint verification
        ↓
12. Format verification
        ↓
13. Build verification
        ↓
14. Existing test-suite verification
        ↓
15. Fix static/build/test problems
        ↓
16. Re-run static quality gate
        ↓
17. Start integrated live application
        ↓
18. Enable console/network/server/runtime monitoring
        ↓
19. Build/extend E2E automation
        ↓
20. Page-by-page traversal
        ↓
21. Screenshot every page
        ↓
22. Test every interactive element
        ↓
23. Test every form
        ↓
24. Test every CRUD entity
        ↓
25. Test every important user flow
        ↓
26. Test auth/roles
        ↓
27. Test search/filter/sort/pagination
        ↓
28. Test responsive behavior
        ↓
29. Test accessibility
        ↓
30. Test supported browsers/platforms
        ↓
31. Detect issue
        ↓
32. Fix immediately
        ↓
33. Reproduce original scenario
        ↓
34. Verify clean logs/network
        ↓
35. Add regression test
        ↓
36. Mark FIXED → VERIFIED
        ↓
37. Continue exhaustive traversal
        ↓
38. Phase commit
        ↓
39. Repeat until inventory is exhausted
        ↓
40. Final static clean run
        ↓
41. Final complete E2E run
        ↓
42. Final live runtime clean run
        ↓
43. Capture final corrected screenshots
        ↓
44. Produce English report
        ↓
45. Produce Turkish report
        ↓
46. Verify all screenshot links
        ↓
47. Verify coverage ledger has no silent gaps
        ↓
48. Final phase commit
```

---

# 92. DEFINITION OF DONE

This mission is **not complete** merely because:

- the code builds;
- tests pass;
- the homepage works;
- Playwright is green;
- lint is clean;
- screenshots exist.

It is complete only when all applicable statements below are true.

## Static Quality

- Type checking passes.
- Lint passes.
- Actionable lint warnings are zero.
- Formatting passes.
- Production build passes.
- Existing automated tests pass.
- New regression tests pass.

## Runtime Quality

- Supported pages load.
- Browser console is clean during normal flows.
- Unexpected network errors are absent.
- Server logs are clean during normal flows.
- Simulator/runtime logs are clean for tested mobile flows.

## Functionality

- Every discovered page was visited.
- Every meaningful button/action was exercised.
- Every form was tested.
- Every applicable CRUD entity was tested.
- Every important user flow was tested.
- Authentication was tested where applicable.
- Authorization was tested where applicable.
- Important negative states were tested.

## Visual

- Every user-visible page has screenshot evidence.
- Important responsive views were tested.
- Major visual states were inspected.
- Obvious visual defects were corrected.

## Verification

- Every discovered defect was either:
  - fixed and verified;
  - proven to be expected behavior;
  - or documented as a genuine external blocker.

## Documentation

Both files exist:

`docs/qa/PROJECT_WALKTHROUGH_AND_QA_EN.md`

`docs/qa/PROJECT_WALKTHROUGH_AND_QA_TR.md`

Both contain:

- page-by-page details;
- embedded screenshots;
- functional coverage;
- CRUD coverage;
- issue/fix history;
- runtime findings;
- final verification status.

## Git

- Logical phases were committed.
- Commits contain no AI co-author metadata.
- Existing unrelated user work was preserved.
- Existing history was not destructively rewritten.

---

# 93. FINAL QUESTIONS YOU MUST ASK YOURSELF, NOT ME

Before declaring completion, ask yourself:

> Did I actually visit every route I discovered?

If no, continue.

> Did I actually exercise every meaningful control?

If no, continue.

> Did I test CRUD rather than merely page rendering?

If no, continue.

> Did I monitor the browser console while testing?

If no, repeat the relevant tests.

> Did I monitor network responses?

If no, repeat them.

> Did I monitor server/runtime logs?

If no, repeat them.

> Did I test mobile/responsive layouts?

If applicable and no, continue.

> Did I take screenshots of every page?

If no, continue.

> Are the screenshots from the final corrected state?

If no, recapture them.

> Does every issue marked fixed have a successful reproduction-based retest?

If no, retest it.

> Do the English and Turkish reports contain the same factual coverage?

If no, correct them.

> Are there actionable warnings left?

If yes, investigate and fix them.

> Did I leave a test disabled just to make the suite pass?

If yes, restore it and fix the real problem.

> Did I silence an error rather than fix it?

If yes, fix the real problem.

> Does the coverage ledger contain an unexplained untested item?

If yes, continue testing.

---

# FINAL EXECUTION DIRECTIVE

Begin now.

Do not ask me for confirmation.

Do not present a plan and wait.

Do not stop after running TypeScript.

Do not stop after fixing ESLint.

Do not stop after the production build succeeds.

Do not stop after the existing tests pass.

Do not stop after creating E2E tests.

Do not stop after checking the homepage.

Do not test only the happy path.

Do not inspect only one browser surface while ignoring backend/runtime errors.

Do not write the reports before actually completing the live verification.

Proceed autonomously through the entire project.

Your responsibility is to:

> **discover every testable surface of the project, eliminate every reasonably fixable static error and warning, validate every build and quality gate, run the real integrated application, inspect every page and screen, capture screenshot evidence, exercise every meaningful control, test every relevant form and CRUD operation, test every major End-to-End user flow, continuously monitor browser/simulator/server/network runtime signals, immediately fix every legitimate defect or warning, reproduce and verify each fix, add useful regression coverage, commit completed phases without co-author metadata, repeat the full verification after the final changes, and produce exhaustive English and Turkish Markdown reports documenting the final working product page by page.**

Do not assume.

Inspect.

Do not ignore.

Investigate.

Do not suppress.

Fix.

Do not merely fix.

Retest.

Do not merely retest.

Verify the complete surrounding system.

Do not claim comprehensive coverage until the coverage ledger proves it.

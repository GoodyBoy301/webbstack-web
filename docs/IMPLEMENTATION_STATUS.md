# webbstack frontend implementation status

## Current frontend boundary

The current release is a browser-only product flow with in-memory workspace state. It intentionally does not claim durable projects, real `.webb` execution, authentication, or a remote analytics collector.

When the backend is connected, server state should own workspace identity, projects, builds, runtime sessions, and share settings. Local React state should remain responsible for active views, form drafts, device preferences, dialogs, and transient messages.

## Backend contract required for integration

The frontend needs API or event-stream equivalents for:

- project creation, metadata updates, archive and restore;
- `.webb` upload with documented size and validation errors;
- build status and progress snapshots, including a stable build/version identity;
- runtime session creation, readiness, failure, and capability diagnostics;
- visibility, slug, public URL, and embed settings;
- immutable build asset URLs with predictable newly-published cache behavior;
- browser capability detection and runtime support requirements.

A build is ready only when the build/runtime source of truth reports readiness. Client timers in the fixture exist only to exercise loading and recovery states.

## Telemetry boundary

`app/src/telemetry.ts` exposes privacy-safe event names and Performance API marks. Events are emitted as `webbstack:analytics` browser events and do not include source code, app user data, or runtime interaction payloads. A future collector can subscribe without changing product flows; analytics must remain optional and non-blocking.

The current performance marks are:

- `webbstack_navigation_start`
- `public_shell_ready`
- `runtime_ready`

The measured names are `public_shell_render` and `runtime_readiness`.

## Frontend MVP acceptance status

- Entry page explains the product and starts project creation.
- `.webb` upload validates extension and 100 MB size with visible progress.
- Build states include success, failure, retry, stop, cancellation, and interruption.
- Runtime preview supports reset, viewport, orientation, chrome, lifecycle, capabilities, and diagnostics fixtures.
- Required showcase metadata can be edited, saved, and protected against accidental navigation.
- Invalid or non-ready projects cannot be published.
- Public URLs, visibility states, direct-route fallback, sharing, and public runtime states are represented.
- Desktop, tablet, and mobile responsive behavior is covered by SCSS breakpoints.
- Dialog keyboard behavior, focus restoration, reduced motion, labels, and live regions are implemented.
- Performance and telemetry instrumentation exists without blocking the public shell.

Manual screen-reader review and real-runtime/backend validation remain release tasks once those systems exist.

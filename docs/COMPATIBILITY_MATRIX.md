# webbstack v1 compatibility matrix

Published: 2026-09-01

This matrix is the compatibility reference for `.webb` v1 packages. It describes the v1 contract and the behavior a runtime MUST report through capability discovery. It does not turn an optional browser API into a required launch dependency.

The active browser window is evaluated at every runtime release. `current`, `N-1`, and `N-2` below mean the current stable browser major and its previous two major releases at the time that runtime is released; they are intentionally not permanent numeric versions.

## Compatibility layers

A package declares compatibility independently for the format, bridge ABI, and runtime:

| Layer | v1 published range | Compatibility rule |
| --- | --- | --- |
| `.webb` format | `1.x` | The package manifest and archive follow the v1 package and manifest rules. |
| Bridge ABI | `1.x` | Author-facing bridge methods and structured errors remain compatible within the major version. |
| Public runtime | `>=1.0.0 <2.0.0` | The runtime provides the v1 core contract and reports optional capability states. |
| Creator preview | Preview fixture runtime matching the declared bridge/API contract | Deterministic fixtures may replace browser and hardware state; preview controls are host-only. |
| Embed runtime | `1.x` restricted profile | The baseline is cross-origin and sandboxed; host opt-ins and browser policy further constrain availability. |

A runtime MUST reject a package only when it cannot provide the package's declared minimum contract. An incompatible package MUST receive a compatibility screen and MUST NOT partially boot.

## Browser support

Webbstack v1 officially supports the current stable release and previous two major releases of each browser family below, provided the baseline launch requirements are met.

| Browser family | Desktop | Mobile | Baseline launch support | Notes |
| --- | --- | --- | --- | --- |
| Chrome | Supported: `N`, `N-1`, `N-2` | Chrome for Android: `N`, `N-1`, `N-2` | Required | Secure context, WebAssembly, storage fallback, input, and accessible focus/status behavior are required. |
| Edge | Supported: `N`, `N-1`, `N-2` | Where supported by the platform | Required | Chromium capability behavior applies, but availability is still discovered at runtime. |
| Firefox | Supported: `N`, `N-1`, `N-2` | Firefox for Android where supported | Required | Optional media, sensor, storage, and display APIs remain capability-dependent. |
| Safari | Supported: `N`, `N-1`, `N-2` | iOS Safari follows the supported iOS releases | Required | Storage persistence, media, sensors, fullscreen, and background behavior may be more restricted. |
| Android System WebView | Supported device release window: `N`, `N-1`, `N-2` | Android applications using the WebView | Required | The host application must provide a secure context and must not weaken the runtime isolation contract. |

The browser baseline requires:

- WebAssembly module instantiation;
- secure-context execution;
- the webbstack bridge and generated JavaScript glue;
- required storage primitives or the documented storage fallback;
- app-owned navigation and lifecycle events;
- available touch, pointer, keyboard, and system-back input handling;
- runtime diagnostics; and
- accessible focus and status behavior.

Unsupported optional browser APIs MUST be represented as `unsupported`, `unavailable`, `restricted`, or `denied` as appropriate. They MUST NOT make the browser unsupported when the core launch contract is available.

## Runtime mode matrix

| Runtime mode | Core capabilities | Optional capabilities | Creator controls | Isolation and policy |
| --- | --- | --- | --- | --- |
| Preview | Available through deterministic fixtures | Deterministic state may be available for permissions, battery, connectivity, notifications, network conditions, and inspection; physical camera, microphone, location, and sensor fixtures are not provided in v1 | Enabled for the host; resettable and traceable | Local creator tooling; app code receives runtime capability state, not workspace controls |
| Public | Available through the public runtime | Browser, device, user permission, publisher policy, and manifest determine state | Hidden from the app and viewer | Public runtime policy, secure context, package isolation, and declared-origin rules |
| Embed baseline | Available where the browser permits sandboxed execution | Host opt-in, manifest declaration, webbstack policy, browser support, and user permission must all permit access | Hidden from the app and parent page | Cross-origin sandboxed iframe, separate runtime origin, parent-origin validation, explicit `Permissions-Policy` |

Public and preview runtimes expose the same stable author-facing core APIs. Embed mode uses the same core contract where permitted, but its restricted policy can return `restricted` or `unavailable` without indicating a browser failure.

## Capability matrix

Status values are the expected default policy, not a promise that an individual device or permission decision will produce that status. Apps MUST query capability discovery before use and provide a fallback for every non-available state.

| Capability | Class | Creator preview | Public runtime | Embed baseline | Browser/device dependency |
| --- | --- | --- | --- | --- | --- |
| `runtime.identity` | Core | Available | Available | Available | None beyond the core runtime |
| `runtime.capabilities` | Core | Available | Available | Available | None beyond the core runtime |
| `lifecycle.app` | Core | Available; deterministic pause/resume | Available | Available | Page visibility and host lifecycle behavior |
| `navigation.app` | Core | Available | Available | Available | None beyond the core runtime |
| `navigation.system` | Core | Available; simulated system actions | Available | Restricted to embed-safe actions | Browser history and host navigation policy |
| `device.orientation` | Core | Available; deterministic fixture | Available; device/browser dependent | Available as reported by the embed viewport | Screen/orientation API support and host dimensions |
| `device.display` | Core | Available; viewport and safe-area fixture | Available | Available; limited to embed viewport | Viewport, safe-area, theme, contrast, and reduced-motion signals |
| `storage.app` | Core | Available; resettable namespaced fixture | Available; persistence may vary | Available where browser permits | Storage quota, privacy mode, eviction, and iframe policy |
| `debug.logs` | Core | Available | Available | Available with redaction and runtime limits | None beyond the core runtime |
| `device.motion` | Opt-in | Restricted; no physical sensor fixture | Permission and device dependent | Restricted by default | Sensor API, secure context, permission, and device hardware |
| `device.location` | Opt-in | Restricted; no physical location fixture | Permission and device dependent | Restricted by default | Geolocation API, secure context, permission, and device policy |
| `device.vibration` | Opt-in | Restricted or fixture state | Device/browser dependent | Restricted by default | Vibration API and device support |
| `device.battery` | Opt-in | Unavailable in the reference preview fixture | Browser/device dependent | Unavailable or restricted by default | Battery Status API availability and privacy policy |
| `device.connectivity` | Opt-in | Available as a deterministic fixture | Available with browser-reported state | Available as runtime-reported state | Network Information API is optional; online state may be coarser |
| `media.camera` | Opt-in | Restricted; no camera fixture in v1 | Permission, device, and browser dependent | Restricted by default | Media Capture API, secure context, permission, and host policy |
| `media.microphone` | Opt-in | Restricted; no microphone fixture in v1 | Permission, device, and browser dependent | Restricted by default | Media Capture API, secure context, permission, and host policy |
| `notifications` | Opt-in | Available as in-app notification fixture | Permission and browser policy dependent | In-app notifications available; browser notifications restricted by default | Notifications API, permission, service-worker, and host policy |
| `network.control` | Opt-in | Available as a deterministic preview control | Not a browser-controlled public capability; report restricted or unavailable | Restricted; host cannot inject conditions by default | Preview/runtime policy rather than a required browser API |
| `debug.network` | Opt-in | Available with redacted fixture diagnostics | Available subject to runtime redaction policy | Available with redaction and message limits | Runtime instrumentation and embed message policy |
| `debug.inspector` | Opt-in | Available to creator tooling | Restricted or unavailable | Restricted or unavailable | Runtime policy; never exposes workspace or host-page data |

### Embed restrictions

The baseline embed MUST NOT grant access to:

- the parent page DOM, JavaScript objects, cookies, or storage;
- top-level navigation or arbitrary popups;
- camera, microphone, location, motion, or other sensors;
- browser or operating-system notifications or push;
- downloads, clipboard, fullscreen, or pointer lock; or
- host-page account storage or cloud storage.

A host MAY opt into additional versioned capabilities where the browser and webbstack policy allow them. A capability is available only when the manifest declaration, host opt-in, policy, browser support, and required user permission all agree.

## Conformance and release handling

A compatibility report SHOULD include:

- package format, bridge ABI, and minimum runtime ranges;
- detected browser family and version;
- runtime mode and runtime version;
- each capability's `supported`, `enabled`, `availability`, `requiresPermission`, `permission`, and `version` fields; and
- the first missing baseline requirement or denied policy when launch cannot proceed.

When a browser or runtime falls outside this matrix, the viewer SHOULD still attempt capability discovery only if the core launch contract can be established. Otherwise it MUST show a compatibility screen rather than partially booting the app.

The creator preview and reference app are conformance fixtures, not evidence of physical hardware support. Passing preview tests confirms the reference app's mode and fallback behavior; it does not grant public or embed access to restricted capabilities.

## Source of truth

This document summarizes the browser and capability rules in [`WEBB_FORMAT_SPEC.md`](./WEBB_FORMAT_SPEC.md), especially sections 10, 18, 22, 27.3, and 27.5. If a future specification revision changes those rules, this matrix must be updated in the same change.

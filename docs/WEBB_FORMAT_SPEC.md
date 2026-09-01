# `.webb` Web Application Format Specification

**Status:** Draft proposal
**Version:** 0.1.0
**Date:** 2026-09-01
**Product:** webbstack
**Audience:** `.webb` app authors, webbstack runtime engineers, frontend engineers, tooling authors, and reviewers

## 1. Purpose

`.webb` is the application format for web applications that deliver mobile app experiences through the webbstack runtime. A `.webb` app is not a native Android or iOS application, and it is not merely a responsive website wrapped in a device frame. It is a web application that declares a predictable app lifecycle, device-oriented presentation model, capability contract, and runtime integration surface.

The format exists to give app authors a stable target for:

- building web-based mobile app experiences that compile to WebAssembly;
- running compiled app logic in a webbstack-managed WebAssembly runtime;
- running the same app in creator preview and public viewer modes;
- receiving webbstack-managed device and system capabilities;
- declaring permissions and required capabilities;
- handling lifecycle and navigation events predictably;
- exposing useful diagnostics and metadata;
- packaging and publishing an app as a portable, inspectable unit.

### 1.1 Design principle

A `.webb` app should feel complete inside webbstack without pretending to be a native app. The runtime owns the device experience; the app consumes a documented webbstack API rather than depending on undocumented browser behavior or native operating-system APIs.

### 1.2 Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**, and **MAY** are to be interpreted as requirements for conformance.

## 2. Scope

This specification covers:

- application packaging;
- manifest structure;
- entrypoint and asset loading;
- lifecycle events;
- app launch and native-style navigation;
- runtime capabilities;
- permission handling;
- storage;
- media and hardware simulation;
- notifications;
- network conditions;
- device-oriented system UI;
- diagnostics;
- security and isolation;
- versioning and compatibility;
- local development and validation.

This specification does not define:

- a programming language or UI framework;
- a visual design system;
- a backend API;
- a native mobile binary format;
- a specific database implementation;
- a guarantee that every browser supports every capability;
- a guarantee of parity with Android or iOS internals.

## 3. Runtime model

A `.webb` app is transformed by the `webbstitch` toolchain into a WebAssembly module and runs inside a webbstack-controlled runtime with five layers:

1. **App layer:** the application UI, views, navigation state, assets, and app logic authored by the developer.
2. **WebAssembly module:** the compiled `.webb` app logic and application state machine executed by the browser’s WebAssembly engine.
3. **Webbstack bridge:** the versioned host interface used by the WebAssembly module to access lifecycle, device state, permissions, storage, media, notifications, networking, navigation, and diagnostics.
4. **Runtime shell:** the device viewport, system chrome, safe areas, navigation controls, and environment controls.
5. **Host layer:** the browser, webbstack public viewer, creator preview, or embedded viewer that hosts the runtime.

The compiled application MUST treat the webbstack bridge as the source of truth for webbstack-managed capabilities. WebAssembly code MUST NOT access browser or host privileges directly. All browser integration MUST pass through the bridge or a reviewed JavaScript glue layer. The runtime MUST enforce capability permissions at the bridge boundary.

### 3.1 Runtime modes

The runtime MUST identify its current mode:

- `preview`: creator-only runtime with inspection and environment controls;
- `public`: published runtime for visitors;
- `embed`: runtime mounted inside a third-party page;
- `development`: local authoring runtime with hot reload and verbose diagnostics.

Apps MAY alter diagnostics or authoring affordances by mode, but user-facing behavior SHOULD remain consistent between `preview`, `public`, and `embed` unless the manifest declares a documented difference.

### 3.2 Runtime identity

The bridge MUST expose immutable runtime identity for the current session:

```ts
type WebbRuntimeInfo = {
  formatVersion: string;
  runtimeVersion: string;
  mode: "preview" | "public" | "embed" | "development";
  appId: string;
  appVersion: string;
  buildId: string;
  sessionId: string;
  capabilities: WebbCapabilityStatus[];
};
```

`sessionId` MUST change when the runtime starts a new app session. `buildId` MUST identify the exact published or previewed app version.

### 3.3 Author-facing bridge API

The official author-facing API MUST be an instance-based SDK created through `createWebbstackApp()`.

```ts
import { createWebbstackApp } from "@webbstack/sdk";

const app = await createWebbstackApp();

await app.lifecycle.ready();
app.navigation.push("settings");
await app.storage.set("theme", "dark");
```

The SDK MUST expose capability APIs through the app instance rather than requiring app code to access a mutable global object. At minimum, the instance SHOULD provide:

```ts
type WebbstackApp = {
  lifecycle: LifecycleApi;
  navigation: NavigationApi;
  permissions: PermissionsApi;
  storage: StorageApi;
  device: DeviceApi;
  media: MediaApi;
  notifications: NotificationsApi;
  network: NetworkApi;
  diagnostics: DiagnosticsApi;
  runtime: RuntimeApi;
};
```

`createWebbstackApp()` MUST bind the SDK to the current runtime session and MUST expose only capabilities declared by the package and allowed by the current runtime mode. App code MUST NOT access browser or host privileges directly. The SDK MAY be implemented using generated JavaScript glue over the versioned WebAssembly bridge ABI.

A global `webbstack` object is not the primary application API. A minimal global bootstrap surface MAY exist solely to initialize or discover the SDK. Custom elements and `postMessage` are host-page integration mechanisms for embeds, not the app-to-runtime bridge.

### 3.4 Internal bridge ABI

The v1 internal bridge MUST use versioned direct WebAssembly host functions. The runtime provides the imported functions when it instantiates the app’s WebAssembly module.

The bridge MUST be organized around stable capability namespaces, including runtime identity, lifecycle, navigation, permissions, storage, device state, media, notifications, networking, and diagnostics.

The generated JavaScript glue MAY adapt browser APIs and WebAssembly memory to the host-function ABI. It MUST NOT expose browser or host privileges directly to app code or bypass webbstack capability and permission checks.

The v1 ABI MUST define:

- an explicit bridge ABI version;
- UTF-8 string encoding;
- request and response identifiers for asynchronous operations;
- standard success and error result formats;
- memory ownership and buffer lifetime rules;
- event subscription and cleanup behavior;
- cancellation behavior;
- capability-denied and capability-unsupported behavior;
- compatibility and breaking-change rules.

The author-facing SDK MUST hide host-function names, pointers, memory management, and transport details. WebAssembly Component Model/WIT MAY be adopted in a future ABI revision or used as an adapter target without changing the author-facing SDK.

## 4. Package format

A `.webb` app MUST be distributed as a single archive file with the `.webb` extension. The archive’s extracted contents MUST follow the directory convention defined below. During development, tooling MAY expose the extracted archive as a directory for inspection, editing, and local preview, but that directory is a development representation of the same `.webb` package, not a separate format.

The canonical published extension is `.webb`. The archive container MUST be ZIP-compatible so standard archive tools can inspect it after changing or temporarily removing the `.webb` extension. Published archives MUST use DEFLATE compression for compressible files. Files that do not benefit from compression MAY be stored without compression.

### 4.1 Package layout

A conforming package MUST contain `webb.manifest.json` at its root, a browser bootstrap entrypoint, and a compiled WebAssembly module.

Recommended layout:

```text
weather.webb/
├── webb.manifest.json
├── runtime/
│   ├── app.wasm
│   ├── app.js
│   └── index.html
├── assets/
│   ├── icons/
│   └── chunks/
├── icons/
│   ├── icon.svg
│   └── icon-512.png
├── media/
├── locales/
└── source-map/
```

Required files:

- `webb.manifest.json`;
- the browser bootstrap file referenced by `entrypoint`;
- the WebAssembly module referenced by `wasm.module`;
- all JavaScript glue and runtime-loaded assets required by the module.

Optional files:

- JavaScript glue modules;
- icons and launch artwork;
- localized metadata;
- source maps for local or private diagnostics;
- capability fixtures used only in development and preview;
- documentation metadata;
- test or conformance manifests.

The package MUST NOT require a network request to an author-controlled origin for its core UI to boot unless the manifest explicitly declares a remote dependency and the runtime permits it.

### 4.2 Archive requirements

The uploaded `.webb` archive MUST:

- contain exactly one root manifest;
- extract into the canonical directory layout without an additional wrapper directory;
- preserve the same file paths and manifest references after extraction;
- use UTF-8 filenames;
- preserve case-sensitive paths;
- avoid path traversal entries such as `../`;
- avoid executable native binaries unless explicitly supported by a future format revision;
- declare all required remote origins;
- use content-addressable or integrity-checked assets where supported;
- use normalized, deterministic archive metadata, including stable file ordering and normalized timestamps;
- include SHA-256 integrity metadata for packaged files and the canonical package digest;
- report package and individual-file sizes to tooling and runtime diagnostics.

V1 does not define a webbstack-wide hard limit for total package size, extracted package size, initial boot resources, WebAssembly modules, or individual assets. Packages MUST still be valid, safe, and usable within the limits of the selected browser, device, storage environment, network, and host runtime. A deployment or embedding host MAY apply its own operational limits, but those limits MUST be reported clearly rather than presented as `.webb` format requirements.

`webbstitch` SHOULD report compressed archive size, extracted size, initial boot size, WebAssembly size, asset count, and the largest individual files. It MAY emit performance warnings for unusually large packages or assets, but size alone MUST NOT be a format validation error in v1.

The runtime MUST reject malformed or unsafe packages before app execution.

Source maps MUST be excluded from the public `.webb` archive by default. `webbstitch` MAY include source maps in local development packages or upload them to a private diagnostics store associated with the exact app build. A publisher MAY explicitly opt into public source maps for an inspectable or open-source app. Public source maps MUST be identified in publication metadata and MUST NOT be implied by the presence of private diagnostic maps.

Source maps MUST NOT be treated as a security boundary. Package authors MUST NOT include secrets or sensitive data in source code, comments, paths, or embedded source content.

### 4.3 Compilation pipeline

The canonical `.webb` delivery pipeline is:

```text
.webb source project
        ↓
webbstitch compiler and linker
        ↓
WebAssembly module + JavaScript glue + static assets
        ↓
validated .webb package
        ↓
webbstack runtime
```

The compiler MUST produce a WebAssembly module for the app’s core logic and application state. The module MUST be loadable by the browser WebAssembly engine and MUST communicate with browser and webbstack services through the versioned bridge ABI.

JavaScript glue is responsible for bootstrapping the module and may adapt DOM, canvas, event, media, networking, and browser APIs to the bridge. JavaScript glue MUST NOT bypass webbstack permission or security boundaries. Static assets such as fonts, images, styles, and localized content remain package resources and are not required to be compiled into WebAssembly.

The published `.webb` package is the compiled delivery artifact. Source code MAY be used by local development and private diagnostics, but it MUST NOT be required by the public runtime.

## 5. Manifest

The manifest is the machine-readable contract between the `.webb` app and webbstack.

### 5.1 Minimal manifest

The v1 minimal manifest is the smallest bootable contract. Its required fields are `format`, `formatVersion`, `appId`, `name`, `version`, `entrypoint`, `wasm`, and `navigation`. `display` is optional; it is shown below because it is useful to runtimes but is not required for package validity. The canonical JSON Schema is [`schemas/webb-manifest.v1.json`](schemas/webb-manifest.v1.json).

```json
{
  "$schema": "https://webbstack.dev/schemas/webb-manifest.v1.json",
  "format": "webb",
  "formatVersion": "1.0",
  "appId": "com.example.weather",
  "name": "Weather",
  "version": "1.0.0",
  "entrypoint": "runtime/index.html",
  "wasm": {
    "module": "runtime/app.wasm",
    "glue": "runtime/app.js",
    "abiVersion": "1.0"
  },
  "navigation": {
    "initialView": "home",
    "destinations": {
      "home": { "type": "view" }
    }
  },
  "display": {
    "orientation": "portrait",
    "themeColor": "#101828",
    "backgroundColor": "#101828"
  }
}
```

### 5.2 Manifest fields

| Field           | Type   | Required | Description                                                   |
| --------------- | ------ | -------: | ------------------------------------------------------------- |
| `$schema`       | string |       No | Schema URL for tooling and editor support.                    |
| `format`        | string |      Yes | MUST be `webb`.                                               |
| `formatVersion` | string |      Yes | Supported format version, using semantic versioning.          |
| `appId`         | string |      Yes | Globally stable app identifier.                               |
| `name`          | string |      Yes | Human-readable app name.                                      |
| `shortName`     | string |       No | Compact name for constrained shell surfaces.                  |
| `version`       | string |      Yes | App version using semantic versioning.                        |
| `entrypoint`    | string |      Yes | Package-relative browser bootstrap entrypoint.                |
| `wasm`          | object |      Yes | Compiled WebAssembly module and bridge ABI metadata.          |
| `description`   | string |       No | App summary used in project metadata.                         |
| `author`        | object |       No | Author or organization metadata.                              |
| `icons`         | object |       No | Icon files and sizes.                                         |
| `display`       | object |       No | Orientation, colors, viewport, and system UI preferences.     |
| `navigation`    | object |      Yes | Initial view, navigation destinations, and fallback behavior. |
| `permissions`   | object |       No | Declared webbstack capabilities and requested permissions.    |
| `storage`       | object |       No | Storage namespaces and persistence requirements.              |
| `media`         | object |       No | Camera, microphone, playback, and media input requirements.   |
| `notifications` | object |       No | Notification behavior and categories.                         |
| `network`       | object |       No | Required origins and network behavior.                        |
| `security`      | object |       No | CSP, iframe, and external-origin restrictions.                |
| `diagnostics`   | object |       No | Logging and inspection preferences.                           |
| `metadata`      | object |       No | Search, sharing, and presentation metadata.                   |

Unknown fields MUST be ignored by older runtimes unless the field is inside a namespace marked as required. Authors MUST NOT rely on unknown fields for core app behavior. The v1 schema therefore validates the frozen core fields and permits additional fields for forward-compatible extensions.

### 5.3 Identity rules

`appId` MUST:

- be stable across versions of the same app;
- contain only lowercase letters, digits, dots, hyphens, and underscores;
- begin and end with an alphanumeric character;
- be between 3 and 128 characters;
- not contain a creator username or public URL slug unless that identity is intentionally permanent.

`version` MUST be a valid semantic version. A version change SHOULD accompany any change that affects app behavior or runtime compatibility.

## 6. Entrypoint and boot contract

The entrypoint MUST be a browser-loadable HTML document served from the package origin. It bootstraps the WebAssembly module and bridge without access to creator authentication or workspace-only APIs.

The entrypoint MUST:

- use a valid document structure;
- declare a viewport suitable for the runtime;
- load assets using package-relative URLs or declared origins;
- handle a runtime where JavaScript is temporarily unavailable or delayed;
- display a meaningful loading state before the app is ready;
- initialize the webbstack bridge before instantiating the WebAssembly module or requesting protected capabilities;
- load the declared WebAssembly module with integrity validation;
- surface a meaningful error when WebAssembly or the declared ABI is unavailable.

Recommended boot sequence:

1. Runtime creates the app document and injects the bridge.
2. App reads runtime identity and capability availability.
3. App registers lifecycle and navigation handlers.
4. App renders its boot state and initial view.
5. App requests only the permissions it needs for the current flow.
6. App emits `app:ready` after its initial view and critical resources are ready.

### 6.1 Ready signal

The app MUST emit a ready signal through the bridge or dispatch a runtime-recognized event:

```ts
app.lifecycle.ready({
  view: "home",
  version: "1.0.0",
});
```

The ready signal MUST NOT be emitted before the app can accept core user input. If the app cannot boot, it MUST emit a structured failure signal or render the failure state described by the runtime contract.

## 7. Lifecycle

The lifecycle model gives `.webb` apps predictable behavior across preview, public, and embed modes.

### 7.1 Lifecycle states

```text
created -> booting -> active -> backgrounded -> suspended -> terminated
                         |               |
                         └──> stopped <──┘
```

States:

- `created`: runtime session exists but app code has not started;
- `booting`: entrypoint is loading and initializing;
- `active`: app can receive input and render;
- `backgrounded`: app remains mounted but is not the primary visible surface;
- `suspended`: app may have execution throttled or paused;
- `stopped`: runtime intentionally paused or closed by the user;
- `terminated`: session has ended and app resources are released.

### 7.2 Lifecycle events

The bridge MUST expose lifecycle events:

```ts
type WebbLifecycleEvent =
  | { type: "runtime:created"; timestamp: number }
  | { type: "app:booting"; timestamp: number }
  | { type: "app:ready"; timestamp: number; view: string }
  | { type: "app:background"; timestamp: number; reason: string }
  | { type: "app:foreground"; timestamp: number }
  | { type: "app:suspend"; timestamp: number }
  | { type: "app:resume"; timestamp: number }
  | { type: "app:stop"; timestamp: number; reason: string }
  | { type: "app:terminate"; timestamp: number; reason: string };
```

Apps MUST make lifecycle handlers idempotent. An app MUST NOT assume that `background` is always followed by `foreground`; it may be suspended or terminated instead.

### 7.3 Reset and reinstall

The runtime MUST distinguish:

- **Reload:** reloads the entrypoint while retaining persisted app data;
- **Reset session:** terminates and starts a new session while retaining persisted app data;
- **Clear app data:** removes app storage, cache, permissions, and notification state according to manifest rules;
- **Reinstall:** recreates the app installation state and starts a cold session.

The creator preview MUST expose these actions where the corresponding runtime operation is supported.

## 8. Views and native-style navigation

A `.webb` app MUST load one browser entrypoint as its launch boundary and render an initial view from that entrypoint. After boot, the app MUST behave like a native mobile application rather than a collection of browser pages. Navigation is app-owned and MUST switch between views inside the running WebAssembly application without loading a separate HTML document for each view.

A `.webb` app MUST declare a valid initial view or launch destination. Its primary navigation model SHOULD support native application patterns such as navigation stacks, tabs, modal presentation, nested flows, sheets, overlays, and view replacement. A route is an addressable view state; it is not a page or a separate document.

The webbstack runtime MUST preserve app navigation state across ordinary view transitions. System back MUST first be offered to the app’s navigation stack before leaving or closing the app. Home, close, suspend, resume, reset, and reinstall MUST be handled as runtime lifecycle operations rather than browser page changes.

Browser URLs and history are secondary integration surfaces. They MAY identify the app for sharing, refresh, accessibility, and public viewing, but the app’s navigation state remains authoritative. A browser back action SHOULD map to the app’s back behavior when the runtime can intercept it. A hard refresh MUST bootstrap the same entrypoint and start a new app session at `initialView`.

This is a webbstack-native navigation contract, not a direct replacement for native iOS or Android external-launch configuration. Native apps may use Android intent filters, Android App Links, iOS URL schemes, or iOS Universal Links to open a particular screen. `.webb` v1 does not infer screen navigation from external URL paths; the app starts at its declared initial view.

The `.webb` compiler and runtime MUST preserve the initial navigation state across WebAssembly boot. The initial view MUST be available before the app emits `app:ready`.

The navigation manifest declares app-owned destination identifiers. External URL deep linking is not part of the `.webb` v1 contract. A public app URL starts the app at `initialView`, just as launching a native app normally opens its default launch screen.

Example:

```json
{
  "navigation": {
    "initialView": "home",
    "fallbackView": "notFound",
    "destinations": {
      "home": {
        "type": "view"
      },
      "profile": {
        "type": "view"
      },
      "share": {
        "type": "view"
      },
      "notFound": {
        "type": "view"
      }
    }
  }
}
```

### 8.1 App launch contract

The `initialView` defines the launch destination for a normal app start. Destination identifiers define views in the app’s native-style navigation model. The `fallbackView` handles invalid internal navigation state. These declarations do not require separate HTML documents.

A webbstack public URL resolves to the app itself:

```text
/@username/:appSlug
```

Opening that URL starts a new app session at `initialView`. The public viewer MUST NOT interpret additional URL paths as arbitrary app destinations in v1. Navigation to other views happens through the app’s own navigation stack, tabs, modals, and system navigation controls.

The bridge MUST expose the current view and navigation state to the WebAssembly module. If a future release supports explicit launch intents from notifications or external links, those intents MUST be opt-in, declared separately, and delivered through a versioned API rather than inferred from arbitrary URL paths.

### 8.2 External links

The manifest MAY declare allowed external origins. The runtime MUST make external navigation behavior visible and predictable. A `.webb` app MUST provide an in-app way to return from an external navigation or the runtime MUST provide one through system navigation.

## 9. Device and system experience

webbstack owns the device-oriented experience around a `.webb` app. The app consumes state through the bridge and renders within the safe area supplied by the runtime.

### 9.1 Display contract

The runtime MUST expose:

```ts
type WebbDisplayState = {
  orientation: "portrait" | "landscape";
  viewport: { width: number; height: number; pixelRatio: number };
  safeArea: { top: number; right: number; bottom: number; left: number };
  theme: "light" | "dark" | "system";
  reducedMotion: boolean;
  highContrast: boolean;
};
```

Apps MUST respond to display changes without requiring a full reload. Safe-area values MUST be available through both the bridge and CSS custom properties where possible.

### 9.2 System navigation

The runtime MUST define behavior for:

- back;
- home or exit;
- close;
- reload;
- reset;
- system overlays;
- status-bar appearance;
- keyboard dismissal.

Apps MAY register a back handler. The handler MUST return quickly and MUST indicate whether it consumed the event.

### 9.3 Input

The runtime MUST support pointer and touch input. It SHOULD expose keyboard and gamepad input only when enabled by the runtime mode and manifest.

Apps MUST NOT depend on hover for essential actions. Touch targets SHOULD meet a minimum 44 by 44 CSS pixel interaction area.

## 10. Capability API

Capabilities are webbstack-owned services exposed through a versioned bridge. Each capability has:

- a stable name;
- a support status;
- a permission model;
- a default state;
- a reset behavior;
- a preview control where applicable;
- a public viewer behavior;
- structured errors;
- a version or feature flag.

### 10.1 Capability status

```ts
type WebbCapabilityStatus = {
  name: string;
  supported: boolean;
  enabled: boolean;
  permission: "not-requested" | "prompt" | "granted" | "denied" | "restricted";
  version: string;
};
```

Apps MUST check capability status before use. Unsupported and denied capabilities MUST be distinguishable.

### 10.2 Mandatory and opt-in capabilities

V1 uses a core-plus-opt-in capability model.

Every conforming runtime MUST provide the following core capabilities to every app:

- runtime identity and capability discovery;
- app lifecycle state and lifecycle events;
- app-owned navigation, including views, stacks, tabs, modals, sheets, and overlays;
- system back handling;
- basic display, orientation, safe-area, and device profile information;
- app-scoped storage with the runtime's default quota;
- structured app diagnostics and logging;
- runtime mode and compatibility information.

Core capabilities define the minimum `.webb` runtime contract. They MUST NOT require a user permission prompt, but the runtime MAY restrict their data, quota, or behavior by runtime mode.

The following capabilities are privileged and MUST be declared in the manifest before the app requests them:

- camera and microphone;
- motion, location, and other sensor data;
- notifications;
- network condition controls;
- external file access or user data access;
- advanced storage quotas;
- host-page or embed integration;
- debug inspection beyond standard app diagnostics.

A declaration authorizes the app to request a capability; it MUST NOT grant access automatically. The runtime MUST evaluate the request against user permission, runtime mode, browser support, device availability, embed policy, and publisher policy.

An undeclared privileged capability request MUST fail with a stable `CAPABILITY_NOT_DECLARED` error. A declared capability MAY still be returned as denied, unsupported, unavailable, or restricted. `webbstitch validate` SHOULD detect capability usage that is not declared and SHOULD warn about declared capabilities that are not used.

Capability profiles MAY be provided by authoring tools as a convenience, but the packaged manifest MUST resolve them to explicit capability declarations.

### 10.3 Proposed capability names

| Capability             | V1 class | Purpose                                                |
| ---------------------- | -------- | ------------------------------------------------------ |
| `runtime.identity`     | Core     | Read runtime, app, mode, and compatibility identity.   |
| `runtime.capabilities` | Core     | Discover support and permission state.                 |
| `lifecycle.app`        | Core     | Observe app launch, active, inactive, and termination. |
| `navigation.app`       | Core     | Control app-owned views and navigation state.          |
| `navigation.system`    | Core     | Access back, home, close, and system overlay actions.  |
| `device.orientation`   | Core     | Read and control simulated orientation.                |
| `device.display`       | Core     | Read display, safe-area, and device profile values.    |
| `storage.app`          | Core     | Persist app data in a namespaced store.                |
| `debug.logs`           | Core     | Emit structured app logs.                              |
| `device.motion`        | Opt-in   | Provide controlled motion and acceleration values.     |
| `device.location`      | Opt-in   | Provide simulated location and permission state.       |
| `device.vibration`     | Opt-in   | Trigger runtime vibration feedback.                    |
| `device.battery`       | Opt-in   | Expose controlled battery and charging state.          |
| `device.connectivity`  | Opt-in   | Read online state and connection type.                 |
| `media.camera`         | Opt-in   | Provide a camera stream or controlled fixture.         |
| `media.microphone`     | Opt-in   | Provide microphone input or controlled fixture.        |
| `notifications`        | Opt-in   | Schedule and receive webbstack-managed notifications.  |
| `network.control`      | Opt-in   | Read or simulate network conditions in preview.        |
| `debug.network`        | Opt-in   | Inspect declared network activity and failures.        |
| `debug.inspector`      | Opt-in   | Expose app state or view inspection where implemented. |

Capability names are provisional until the runtime API is implemented. Renaming a capability after public apps depend on it requires a compatibility alias or major format revision.

## 11. Permissions

Permissions are declared in the manifest and requested at runtime. Declaring a permission does not grant it.

Example:

```json
{
  "permissions": {
    "device.location": {
      "required": false,
      "reason": "Used to show local weather"
    },
    "media.camera": {
      "required": false,
      "reason": "Used to scan a receipt"
    },
    "notifications": {
      "required": false,
      "reason": "Used for saved forecast alerts"
    }
  }
}
```

### 11.1 Permission rules

The runtime MUST:

- show a webbstack-owned permission prompt;
- identify the requesting app and capability;
- show the app-provided reason;
- support grant, deny, and dismiss outcomes;
- allow creators to reset permission state in preview;
- return a structured result to the app;
- avoid granting permissions silently on first request;
- preserve the permission decision according to the runtime mode.

Apps SHOULD request permissions at the point of need, not all at boot. Required permissions MUST include a fallback experience when denied.

### 11.2 Permission API

```ts
const result = await app.permissions.request("media.camera");

if (result.status === "granted") {
  await openScanner();
} else {
  showCameraPermissionFallback(result.status);
}
```

## 12. Sensors and device hardware

webbstack provides controlled device signals instead of claiming access to a viewer’s physical device.

### 12.1 Required behavior

Creator preview MUST provide deterministic display and system-state controls for:

- viewport profile and device dimensions;
- portrait and landscape orientation;
- safe-area insets;
- light and dark appearance;
- reduced-motion and contrast preferences;
- touch, mouse, and keyboard input;
- battery percentage and charging state;
- online, offline, and connection state;
- locale, language, timezone, and current time;
- permission state;
- app lifecycle state;
- notification state;
- app installation, reset, and reinstall state;
- system back, home, close, and overlay actions.

V1 creator preview MUST NOT require physical camera, microphone, location, motion sensor, or other hardware access. These capabilities MAY be reported as denied, unsupported, unavailable, or restricted according to runtime policy.

The public viewer MUST use safe defaults and MUST NOT expose creator-only controls to visitors.

### 12.2 Device profiles

Preview MUST provide behavior-oriented device profiles rather than implying official emulation of a specific iOS or Android device. V1 SHOULD include:

- compact phone;
- standard phone;
- large phone;
- tablet;
- foldable or compact-width profile.

A profile MUST define viewport dimensions, pixel density, safe-area behavior, and supported orientation modes. Creators MUST be able to override orientation and safe-area settings independently when testing.

### 12.3 Determinism

Preview environment state SHOULD be saveable and repeatable. A creator SHOULD be able to reproduce a lifecycle, permission, storage, network, or system-state bug using a named environment preset. Resetting a preset MUST restore its declared values without changing the app package.

## 13. Camera and microphone

Camera and microphone behavior MUST be mediated by webbstack. Apps MUST NOT assume direct physical device access.

V1 creator preview does not provide camera or microphone fixtures. The preview MUST expose their state through capability diagnostics and MUST allow creators to test denied, unsupported, unavailable, and restricted fallback paths. Future runtime versions MAY add controlled media fixtures or explicitly granted browser input.

Apps MUST handle denied, unavailable, muted, and interrupted media states.

## 14. Notifications

`.webb` apps MAY use webbstack-managed in-app notifications. In-app notifications are rendered by the webbstack runtime inside the app shell and are available consistently in `preview`, `public`, `embed`, and `development` modes.

The v1 notification contract MUST NOT use browser or operating-system notification surfaces. It MUST NOT use web push, service-worker push delivery, or host-page notification delivery. A notification is visible only while the app runtime is active or when its notification center is opened by the user.

The notification contract SHOULD support:

- app-scoped notification preference and authorization state;
- immediate notifications;
- scheduled notifications while the runtime can execute them;
- notification categories or actions;
- notification history for the current app installation;
- clear and dismiss actions;
- open actions that resume the app or navigate through the app-owned navigation API.

Opening a notification MUST NOT interpret a browser URL as an app destination. If a notification is opened after a new session is required, the runtime MUST start the app at `initialView` and deliver the notification context to the app. The app MAY then navigate to an allowed destination through its own navigation stack.

Preview MUST provide deterministic test triggers, simulated scheduling, history inspection, and reset controls. Public and embed runtimes MUST expose the same in-app notification behavior, subject to app, viewer, and embed policy. When the runtime is suspended or closed, scheduled notifications MAY be deferred until the app is opened again; v1 does not promise background delivery.

Example:

```ts
await app.notifications.schedule({
  id: "forecast-alert",
  title: "Rain expected soon",
  body: "Take an umbrella before you leave.",
  at: "2026-09-01T09:00:00Z",
  data: { destination: "alerts" },
});
```

The `destination` value is an app-owned destination identifier, not a URL or browser route.

## 15. Storage

V1 uses fixed, per-app, per-viewer storage quotas. Runtime storage MUST be isolated by `appId`, installation identity, and runtime environment. Apps MUST NOT access another app’s storage.

An installation identity represents the local viewer installation of an app. It does not require a webbstack account and is not guaranteed to follow a viewer across browsers or devices. Public viewer storage is local to the installation and MUST NOT be treated as synchronized or private cloud storage.

The runtime MUST expose these storage classes with the following v1 defaults:

| Storage class | Purpose                               | Default quota | Retention                                      |
| ------------- | ------------------------------------- | ------------: | ---------------------------------------------- |
| `session`     | Temporary interaction state           |          1 MB | Cleared when the runtime session ends          |
| `app`         | Preferences, drafts, and app progress |          5 MB | Persists across reloads and normal sessions    |
| `cache`       | Disposable downloaded resources       |         25 MB | Evictable at any time                          |
| `secure`      | Small sensitive values                |        256 KB | Cleared by clear-data and reinstall operations |

The runtime MAY reduce an effective quota when storage is unavailable or restricted by the browser, private browsing, embed policy, device capacity, or publisher policy. A manifest MAY request a lower quota, but v1 MUST NOT assume that a request for a higher quota will be granted.

Retention rules:

- `session` data MUST be cleared when the runtime session ends.
- `app` data MUST persist across reloads and normal sessions when storage is available.
- `app` data MUST be cleared by an explicit viewer clear-data action and by reinstall. The runtime MAY clear it when required by platform storage eviction or a declared retention policy.
- `cache` data MUST be recreatable and MAY be evicted without notice based on age, size, or device pressure.
- `secure` data MUST be subject to runtime policy, size limits, and capability state. Apps MUST handle unavailable, denied, and restricted secure storage.
- Clear-data and reinstall operations MUST remove the app’s storage according to these class rules and MUST emit a clear-data lifecycle event when the app is running.

Storage is not guaranteed to synchronize across devices, browsers, or runtime modes in v1. Account-backed or cloud storage requires a future explicit capability.

Example:

```ts
await app.storage.set("preferences", {
  temperatureUnit: "celsius",
});

const preferences = await app.storage.get("preferences");
```

When a write exceeds the effective quota, the runtime MUST return a structured `STORAGE_QUOTA_EXCEEDED` error. Apps MUST handle quota errors, unavailable storage, and clear-data events. Apps MUST NOT store secrets in `.webb` packages or assume that public viewer storage is private.

## 16. Network behavior

The manifest MUST declare external origins required for core behavior.

Example:

```json
{
  "network": {
    "origins": [
      {
        "origin": "https://api.example.com",
        "purpose": "Weather data",
        "required": true
      }
    ],
    "offline": "fallback"
  }
}
```

The runtime MUST enforce declared-origin policy and MUST expose useful errors when a request is blocked.

V1 preview and development runtimes MUST use runtime-level fault injection. Requests MUST be intercepted before they leave the controlled runtime, and the simulator MUST apply failures using safe request metadata such as declared origin, HTTP method, normalized path, request size, and request ID. The simulator MUST NOT require access to request bodies, response bodies, authorization headers, cookies, API keys, bearer tokens, uploaded files, or raw personal data.

Preview SHOULD expose controllable network conditions:

- online;
- offline;
- DNS failure;
- connection reset;
- slow latency;
- bandwidth throttling;
- request timeout;
- selected status-code failure;
- intermittent connection;
- reconnect.

The creator MUST be able to apply a condition globally or to a declared origin. Preview network conditions SHOULD be deterministic, resettable, and visible in the runtime fixture state. Network diagnostics MAY show redacted metadata including request ID, origin, method, normalized path, status, duration, and failure type. The runtime MUST redact sensitive headers and values and MUST NOT persist raw request or response payloads by default.

Fault injection MUST be limited to preview, development, and automated test runtimes. Public and embed runtimes MUST use real network behavior and MUST NOT expose creator fault-injection controls.

Apps MUST render an intentional offline or degraded experience when their manifest allows it. They MUST NOT silently treat a blocked origin as a successful empty response.

## 17. Debugging and inspection

Debugging is a first-class part of the `.webb` format because creators need to understand app behavior inside a managed runtime.

### 17.1 Logging

Apps SHOULD emit structured logs through the bridge:

```ts
app.diagnostics.log({
  level: "info",
  scope: "checkout",
  message: "Payment form submitted",
  data: { method: "card" },
});
```

Supported log levels:

- `debug`;
- `info`;
- `warn`;
- `error`;
- `fatal`.

Sensitive values MUST be redacted before emission. The runtime MUST support filtering by level and scope.

### 17.2 Runtime diagnostics

The preview diagnostics panel SHOULD show:

- app and build identity;
- runtime and format versions;
- lifecycle state;
- view and navigation history;
- permission state;
- capability support;
- app logs;
- errors and warnings;
- network activity;
- storage usage;
- media state;
- environment fixture values;
- copyable diagnostic report.

Diagnostics MUST NOT expose private app data or user data by default.

### 17.3 Source maps

Source maps are optional debugging artifacts. V1 uses the following policy:

- local development and creator preview MAY use source maps;
- private source maps MAY be stored separately from the public package and accessed only by authorized workspace members;
- public packages MUST omit source maps unless the publisher explicitly opts in;
- public source maps MUST be labeled in publication metadata;
- private source maps MUST match the app version, build ID, artifact digests, and runtime-compatible symbols they describe;
- `webbstitch` SHOULD detect embedded original source content and warn before public publication;
- source-map access MUST NOT expose creator workspace data or viewer data.

The runtime MAY provide unsymbolicated stack traces when source maps are unavailable. Apps MUST remain debuggable at the structured error and runtime-diagnostics level without requiring source maps.

### 17.4 Error contract

Errors returned by the bridge MUST be structured:

```ts
type WebbError = {
  code: string;
  message: string;
  capability?: string;
  recoverable: boolean;
  details?: Record<string, unknown>;
};
```

Error codes MUST be stable within a major format version. Human-readable messages MAY change.

## 18. Security and isolation

A `.webb` app runs as untrusted web content from the runtime’s security perspective.

The runtime MUST:

- isolate apps from the webbstack workspace and account APIs;
- enforce origin and content-security policies;
- prevent package path traversal;
- restrict privileged bridge methods to declared capabilities;
- validate all bridge input and output;
- prevent an app from reading another app’s storage or session;
- make embed restrictions explicit;
- protect creator and viewer identity data;
- avoid exposing runtime secrets to app JavaScript.

The app MUST:

- treat all external input as untrusted;
- use the bridge only through documented APIs;
- avoid embedding long-lived secrets in package assets;
- declare remote origins;
- provide a fallback when a capability is unavailable;
- avoid collecting unnecessary viewer data.

### 18.1 Embed security

V1 embeds MUST use a cross-origin, sandboxed iframe with an Option A isolation baseline and an Option B explicit capability allowlist. Same-origin execution as a custom element MUST NOT be the default embed path.

The baseline embed MUST allow only the runtime behavior required to execute the packaged app, including scripts, WASM, rendering, app-owned navigation, lifecycle, display and safe-area information, accessibility preferences, input, in-app notifications, declared network access, diagnostics, and app-scoped storage where the browser permits it.

The baseline embed MUST NOT grant access to:

- the parent page DOM, JavaScript objects, cookies, or storage;
- top-level navigation or arbitrary popups;
- camera, microphone, location, motion, or other sensors;
- browser or operating-system notifications or push;
- downloads, clipboard, fullscreen, or pointer lock;
- host-page account storage or cloud storage.

The embed runtime MUST support:

- fixed or responsive dimensions;
- a separate webbstack-controlled origin;
- iframe sandboxing;
- parent-origin validation;
- explicit `Permissions-Policy` and capability declarations;
- message-based host communication;
- a restricted capability profile;
- graceful failure when the host page blocks required behavior.

A host MAY opt into additional capabilities through an explicit embed configuration. A capability is available only when all of the following permit it:

1. the `.webb` manifest declares the capability;
2. the host explicitly allows the capability;
3. webbstack policy permits it for the app and embed;
4. the browser supports it; and
5. user permission is granted when required.

Host opt-ins MAY include fullscreen, clipboard access, downloads, external navigation, file selection, and versioned host messaging. Camera, microphone, location, sensors, browser notifications, push, host cookies, top-level navigation, and account-backed storage MUST remain disabled by default in v1 embeds.

The runtime MUST validate the parent origin before accepting host messages, validate message schemas and sizes, reject unknown commands, use request identifiers and timeouts, and prevent arbitrary top-level navigation. Apps MUST receive distinguishable `denied`, `unsupported`, `unavailable`, and `restricted` capability states when an embed policy prevents access.

## 19. Accessibility

Accessibility of `.webb` app content is the developer's responsibility. Webbstack does not provide an accessibility certification, automated accessibility gate, or required accessibility checks for publication in v1. An app MAY be published without passing accessibility validation.

The runtime cannot make inaccessible app content accessible automatically. Authors SHOULD consider semantic names and roles, keyboard and assistive technology interaction, visible focus, reduced-motion and contrast preferences, accessible error and status announcements, non-color-only meaning, hover-independent core actions, and text alternatives for meaningful images and media.

The webbstack-owned device shell, controls, status messages, and diagnostics remain platform responsibilities and MUST be accessible independently of app content.

## 20. Performance

A conforming app SHOULD:

- render a meaningful boot state quickly;
- emit `app:ready` only after core interaction is possible;
- lazy-load noncritical routes and media;
- avoid blocking on optional capabilities;
- handle slow network and offline states;
- clean up lifecycle listeners and media resources;
- provide a lightweight fallback for constrained devices.

The runtime SHOULD report boot duration, time to ready, asset failures, and major runtime errors without requiring app authors to add custom instrumentation.

## 21. Metadata and publishing

The manifest and project metadata SHOULD provide enough information for the webbstack public viewer to create a clear presentation.

Recommended metadata:

```json
{
  "metadata": {
    "title": "Weather",
    "summary": "A calm weather experience for planning the day.",
    "tags": ["weather", "mobile experience"],
    "language": "en",
    "thumbnail": "icons/preview.png"
  }
}
```

The runtime MUST distinguish app metadata from webbstack project metadata. The creator may override public title, description, thumbnail, or accent without changing the app package itself.

Publishing MUST record:

- `appId`;
- app version;
- format version;
- runtime compatibility range;
- package checksum;
- package signature algorithm and key identifier;
- build identifier;
- declared capabilities;
- declared remote origins;
- generated public URL;
- publication timestamp.

## 22. Compatibility and versioning

The format has three compatibility layers:

1. **Format version:** package and manifest rules.
2. **Bridge version:** JavaScript APIs and capability behavior.
3. **Runtime version:** implementation details and available features.

The manifest SHOULD declare compatibility:

```json
{
  "runtime": {
    "minimum": "1.0.0",
    "tested": "1.2.0",
    "bridge": "1.x"
  }
}
```

A runtime MUST reject an app only when it cannot provide the minimum contract. For optional capabilities, it MUST expose a clear unsupported status and allow the app to render a fallback.

### 22.1 Browser support

Webbstack v1 officially supports the current stable release and the previous two major releases of:

- Chrome, including Chrome for Android;
- Edge;
- Firefox;
- Safari;
- iOS Safari, subject to the corresponding supported iOS releases; and
- Android System WebView.

The supported-browser window MUST be evaluated at each webbstack runtime release rather than treated as a permanent version list. Creator tooling SHOULD display the active support window and the detected browser version.

A browser MUST provide the following baseline capabilities to launch a `.webb` app:

- WebAssembly module instantiation;
- secure-context execution;
- the webbstack bridge and generated JavaScript glue;
- required storage primitives or the documented storage fallback;
- app-owned navigation and lifecycle events;
- available touch, pointer, keyboard, and system-back input handling;
- runtime diagnostics; and
- accessible focus and status behavior.

Runtime capability detection MUST supplement version-based support. Optional capabilities such as persistent storage, secure storage, fullscreen, clipboard, downloads, pointer lock, media input, sensors, background execution, and advanced graphics MAY be unavailable without making the browser unsupported. The runtime MUST expose such states as `granted`, `denied`, `unsupported`, `unavailable`, or `restricted` as applicable.

If a browser cannot provide the baseline contract, the viewer MUST show a compatibility screen identifying the missing capability and the detected browser version. It MUST NOT partially boot the app. If only an optional capability is unavailable, the app MUST launch normally and receive the corresponding capability state.

Breaking changes require a major version increment. Additive fields and optional capabilities SHOULD use minor versions. Bug fixes and clarifications SHOULD use patch versions.

## 23. Conformance levels

To make adoption incremental, `.webb` may define conformance levels:

### Level 1: Core app

Required:

- valid manifest;
- entrypoint;
- boot and ready signal;
- routing;
- lifecycle events;
- responsive viewport;
- basic diagnostics;
- accessible web UI;
- secure package structure.

### Level 2: Device experience

Adds:

- orientation;
- safe areas;
- webbstack navigation;
- permissions;
- app storage;
- controlled device state.

### Level 3: Full runtime experience

Adds:

- notifications;
- camera and microphone;
- network condition controls;
- sensor fixtures;
- lifecycle reset and reinstall behavior;
- network inspection;
- advanced diagnostics;
- embed policy support.

The webbstack product may require Level 2 or Level 3 for publication depending on the app’s declared capabilities. The runtime MUST display an app’s conformance level in creator diagnostics.

## 24. Local development

The `webbstitch` authoring tool SHOULD provide:

```text
webbstitch validate
webbstitch dev
webbstitch preview
webbstitch package
webbstitch publish
```

### 24.1 Validation

`webbstitch validate` SHOULD check:

- manifest schema;
- required files;
- package paths;
- app and format versions;
- entrypoint bootability;
- declared origins;
- permissions and reasons;
- capability usage;
- accessibility basics;
- package and individual-file size reporting;
- unsafe content;
- runtime compatibility.

Validation output SHOULD separate errors, warnings, and informational notices. It SHOULD include file paths and actionable remediation.

### 24.2 Local preview

Local preview SHOULD provide the same capability controls and lifecycle events as the hosted creator preview wherever possible. Differences MUST be visible in runtime identity and diagnostics.

## 25. Example manifest

```json
{
  "$schema": "https://webbstack.dev/schemas/webb-manifest.v1.json",
  "format": "webb",
  "formatVersion": "1.0",
  "appId": "com.example.weather",
  "name": "Weather",
  "shortName": "Weather",
  "version": "1.4.0",
  "description": "A mobile weather experience for planning the day.",
  "entrypoint": "runtime/index.html",
  "wasm": {
    "module": "runtime/app.wasm",
    "glue": "runtime/app.js",
    "abiVersion": "1.0"
  },
  "runtime": {
    "minimum": "1.0.0",
    "tested": "1.2.0",
    "bridge": "1.x"
  },
  "display": {
    "orientation": "portrait",
    "themeColor": "#101828",
    "backgroundColor": "#101828",
    "statusBar": "dark",
    "safeAreas": true
  },
  "navigation": {
    "initialView": "home",
    "fallbackView": "notFound",
    "destinations": {
      "home": { "type": "view" },
      "city": { "type": "view" },
      "alerts": { "type": "view" },
      "notFound": { "type": "view" }
    }
  },
  "permissions": {
    "device.location": {
      "required": false,
      "reason": "Used to show local weather"
    },
    "notifications": {
      "required": false,
      "reason": "Used for saved forecast alerts"
    }
  },
  "storage": {
    "app": {
      "quota": "5MB"
    }
  },
  "network": {
    "origins": [
      {
        "origin": "https://api.example.com",
        "purpose": "Weather data",
        "required": true
      }
    ],
    "offline": "fallback"
  },
  "metadata": {
    "title": "Weather",
    "summary": "A calm weather experience for planning the day.",
    "tags": ["weather", "mobile experience"],
    "language": "en",
    "thumbnail": "icons/preview.png"
  }
}
```

## 26. Conformance checklist

An app is ready for webbstack validation when:

- [ ] The package is a single `.webb` archive whose extracted contents follow the canonical directory layout.
- [ ] The package contains one valid `webb.manifest.json`.
- [ ] `format` is `webb` and `formatVersion` is supported.
- [ ] `appId` and `version` are valid and stable.
- [ ] The entrypoint loads from the package origin.
- [ ] The app emits a ready signal after core UI interaction is available.
- [ ] The app handles boot failure and runtime errors.
- [ ] Lifecycle handlers are registered and idempotent.
- [ ] An initial view and native-style navigation destinations are declared.
- [ ] Permissions are declared with user-facing reasons.
- [ ] The app handles granted, denied, restricted, and unsupported capabilities.
- [ ] App storage is namespaced and quota-aware.
- [ ] Media flows handle denied and unavailable states.
- [ ] Network failures and offline behavior are intentional.
- [ ] Logs do not contain secrets or unnecessary personal data.
- [ ] The app responds to safe areas, orientation, reduced motion, and contrast preferences.
- [ ] External origins are declared.
- [ ] The app passes package security validation.
- [ ] The app has been tested in preview, public, and embed modes where applicable.
- [ ] Runtime compatibility is declared.
- [ ] Public metadata is complete.

## 27. Open decisions

`webbstitch` is the official authoring, compiling, validating, packaging, and publishing tool for `.webb` apps. It produces the WebAssembly module, JavaScript glue, static assets, and final `.webb` archive.

### 27.1 Resolved packaging and signing requirements

For v1, `.webb` packages use Option A: a ZIP-compatible archive with DEFLATE compression.

- Published packages MUST use DEFLATE for compressible files.
- Already-compressed files MAY be stored without compression.
- Archive file ordering and timestamps MUST be normalized for deterministic output.
- Package files MUST include SHA-256 integrity metadata.
- The package MUST include a canonical package digest.
- Every published package MUST be signed by webbstack using Ed25519.
- The signature MUST cover the canonical package digest rather than raw archive bytes.
- The signature key identifier MUST be recorded with the publication metadata.
- Local development and preview packages MAY be unsigned.
- Publisher-managed signing keys are not required for v1.

### 27.2 Resolved internal bridge ABI

For v1, the internal bridge uses versioned direct WebAssembly host functions. Generated JavaScript glue adapts browser integration and exposes the instance-based `createWebbstackApp()` SDK. WebAssembly Component Model/WIT is reserved as a future ABI or adapter target.

### 27.3 Resolved v1 capability model

For v1, `.webb` uses a hybrid core-plus-opt-in capability model.

- Every conforming runtime MUST provide the core capabilities defined in Section 10.2.
- Core capabilities MUST be available without a user permission prompt.
- Privileged capabilities MUST be declared in the manifest before the app requests them.
- A declaration authorizes a request but MUST NOT grant access automatically.
- The runtime MUST evaluate privileged requests against user permission, runtime mode, browser support, device availability, embed policy, and publisher policy.
- Undeclared privileged requests MUST fail with `CAPABILITY_NOT_DECLARED`.
- Declared capabilities MUST expose distinguishable granted, denied, unsupported, unavailable, and restricted states where applicable.
- `webbstitch` SHOULD infer capability usage where possible and MUST validate usage against packaged declarations.
- Authoring profiles MAY simplify configuration, but packaged manifests MUST contain explicit capability declarations.

The author-facing SDK MUST expose this model through the `WebbstackApp` instance. Apps MUST be able to discover capability state and provide a fallback when a privileged capability is unavailable.

Creator preview uses the display-plus-system-state fixture model for v1. It MUST provide deterministic controls for viewport profiles, orientation, safe areas, appearance, accessibility preferences, input, battery, connectivity, locale, permissions, lifecycle, notifications, installation state, reset/reinstall, and system navigation. V1 preview MUST NOT depend on physical hardware or provide camera, microphone, location, or sensor fixtures. Fixture state SHOULD be saveable, repeatable, and resettable.

### 27.4 Resolved compatibility and breaking-change policy

For v1, webbstack communicates breaking changes through independent semantic versions for the `.webb` format, bridge ABI, and runtime.

Every published package MUST declare:

- the `.webb` format version or supported format range;
- the bridge ABI version or supported bridge range; and
- the minimum compatible runtime version or supported runtime range.

Breaking changes MUST increment the major version of the affected compatibility layer:

- format major versions may change package structure or manifest rules;
- bridge major versions may change author-facing APIs or host-function behavior; and
- runtime major versions may change execution behavior or platform integration.

A runtime minor or patch release MUST NOT intentionally break a conforming app within its declared compatibility range. Runtime capability detection and package compatibility validation remain required because semantic versioning cannot describe browser, embed, permission, or device-specific availability by itself.

`webbstitch` MUST validate compatibility and SHOULD provide:

- compatibility reports;
- deprecated API and version warnings;
- migration guidance;
- automatic migrations for safe manifest or metadata changes; and
- a clear indication of when a rebuild or source change is required.

Deprecated versions SHOULD receive progressive warnings through development tooling, creator preview, the creator dashboard, and release documentation before their support window ends. Public apps MUST run only on a compatible runtime. An incompatible app MUST receive a clear compatibility screen rather than partially booting.

The runtime MAY provide adapters for safe compatibility changes such as renamed APIs, equivalent capability names, or mechanical metadata transformations. Adapters MUST NOT silently emulate materially changed semantics. Authors MUST migrate and republish when a bridge or format change requires source changes.

### 27.5 Resolved public and preview API policy

For v1, `preview` and `public` runtimes MUST expose the same stable author-facing core APIs. The core API surface includes runtime identity, lifecycle, app-owned navigation, permissions, storage, in-app notifications, network access, display and safe-area information, appearance preferences, and input.

Capability availability MAY differ by runtime mode, browser support, permission state, embed policy, and device availability. Apps MUST use capability discovery and explicit capability states rather than assuming that an API is usable because it exists.

Creator preview controls are primarily host tooling and MUST NOT be exposed as public app capabilities. Preview tooling MUST provide deterministic controls for fixtures, network fault injection, permissions, lifecycle simulation, installation state, reset/reinstall, diagnostics, event tracing, and package inspection without requiring app code to depend on those controls.

The SDK MAY expose an optional development-only `app.preview` namespace for test markers, preview assertions, or development diagnostics. The namespace MUST:

- be unavailable in `public` and `embed` modes;
- never be required for normal app operation;
- fail safely when called outside preview; and
- not expose secrets, host-page data, or raw request bodies.

Public mode uses real runtime, browser, permission, storage, network, and notification behavior subject to webbstack policy. Preview mode MAY replace those states with deterministic fixtures. Public and embed runtimes MUST NOT expose creator-only controls.

## 28. Recommended next implementation steps

1. Freeze the minimal manifest schema and write JSON Schema definitions.
2. Define the bridge bootstrap and ready signal.
3. Implement runtime identity and capability discovery.
4. Implement lifecycle, navigation, permissions, and storage before advanced hardware services.
5. Build a reference `.webb` app that exercises every v1 capability.
6. Build a creator-preview capability control panel.
7. Add package validation and security checks.
8. Add public and embed runtime modes.
9. Write conformance tests that run the reference app in every mode.
10. Publish a compatibility matrix for browsers, runtime versions, and capabilities.

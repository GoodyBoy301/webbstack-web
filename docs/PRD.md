# webbstack Frontend Product Requirements Document

**Status:** Draft
**Version:** 0.1
**Date:** 2026-09-01
**Product name:** webbstack
**Document owner:** Product / Design / Frontend

## 1. Product summary

webbstack is a browser-based presentation and runtime platform for `.webb` apps: web applications designed to deliver mobile app experiences in the browser. It turns a `.webb` app into a shareable, interactive experience that runs inside a faithful device-like shell. Developers use it to present work without requiring viewers to install an app, navigate a store listing, or understand the source repository.

The frontend should make the transition from **project build** to **credible, interactive showcase** feel immediate and trustworthy:

1. A developer creates or imports a project.
2. webbstack prepares a web runtime and validates the project.
3. The developer previews the app in a device shell, configures presentation details, and publishes it.
4. A viewer opens a clean creator-owned URL and interacts with the app in the browser.

The product is not an app store, a generic portfolio builder, or a raw code playground. Its defining experience is the bridge between a `.webb` app and a polished, device-oriented web container.

### 1.1 Brand direction

`webbstack` is the product name. The name should be presented as a developer-focused platform that brings `.webb` apps, web runtimes, and public showcases into one coherent stack.

Brand expression should balance technical credibility with approachability: the product should feel like dependable infrastructure that is simple to use, not an opaque emulator or a generic portfolio template.

The frontend should avoid hard-coding the brand into reusable UI primitives so the visual identity can evolve without a structural redesign.

## 2. Problem statement

Developers often have a working `.webb` app that delivers a mobile app experience but lacks a polished way to show it to other people. A raw URL or repository is difficult to evaluate, while screen recordings are passive, stale, and unable to demonstrate interaction. Existing browser previews frequently look like generic device mockups and do not explain whether the app is actually running.

Reviewers, clients, hiring teams, and collaborators need a fast way to:

- open a project from a link;
- understand what it is and who made it;
- interact with the app without setup;
- distinguish live runtime behavior from static media;
- move between projects and documentation without losing context.

webbstack needs to solve this with a coherent creator workspace and a high-confidence public viewer.

## 3. Goals and non-goals

### 3.1 Goals for the first frontend release

- Let a developer create a project showcase from a supported `.webb` app or import source that produces one.
- Provide a clear runtime preparation and validation flow.
- Provide an interactive preview inside a device shell.
- Let creators configure title, description, thumbnail, accent, visibility, and share metadata.
- Publish a stable, creator-owned public URL for each `.webb` app.
- Give viewers a fast, accessible, distraction-light interactive experience.
- Make runtime state, loading progress, and errors understandable.
- Establish a reusable visual system for future project management features.

### 3.2 Non-goals for v1

- Replacing native app stores, native packaging, or mobile app signing/distribution.
- Full source-code editing or IDE functionality.
- Supporting every `.webb` implementation, runtime capability, or binary format at launch.
- Multiplayer collaboration or real-time co-editing.
- Monetization, subscriptions, or marketplace functionality.
- Automated visual comparison against physical devices.
- Promising pixel-perfect native behavior where the runtime cannot guarantee it.

## 4. Users and jobs to be done

### 4.1 Primary user: independent developer

**Context:** Has one or more `.webb` apps and needs a credible public presentation quickly.

**Job:** “When I finish a `.webb` app, I want to publish an interactive link so someone can evaluate the experience without installing anything.”

**Success:** Publishes a working project in under 10 minutes and can share one URL confidently.

### 4.2 Primary user: agency or product team

**Context:** Shows prototypes and client work across several projects.

**Job:** “When I need review feedback, I want a branded, controlled preview that is easy for a client to open.”

**Success:** Organizes projects, controls visibility, and presents a consistent identity across links.

### 4.3 Secondary user: reviewer or hiring manager

**Context:** Opens a link on desktop or mobile with little product context.

**Job:** “When I receive a project link, I want to understand the app and try the important flows immediately.”

**Success:** Starts interacting within seconds, knows when the app is live, and can find project details or contact information.

### 4.4 Secondary user: technical collaborator

**Context:** Needs to inspect a build and understand its runtime assumptions.

**Job:** “When I review an implementation, I want enough runtime and build information to reproduce or discuss it.”

**Success:** Can view supported metadata, runtime status, version, and known limitations without entering the creator workspace.

## 5. Product principles

1. **Runtime first.** The live app is the product; surrounding chrome should support, not compete with, it.
2. **Explain the bridge.** Make the relationship between project artifact and browser runtime legible.
3. **Trust through state.** Never make users guess whether a build is uploading, compiling, paused, or broken.
4. **One primary action per surface.** Preview, publish, and open the app should be visually decisive.
5. **Progressive disclosure.** Keep first-time flows simple while exposing technical detail when it is useful.
6. **Portable by default.** Public experiences should work from a deep link and remain understandable without the creator workspace.
7. **Respect the artifact.** Use restrained UI so the app itself remains the focus.

## 6. Information architecture

### Public

- `/` — marketing / product entry
- `/sign-in` — authentication entry
- `/@username/:appSlug` — public `.webb` app viewer
- `/@username/:appSlug/about` — optional app details and metadata
- `/@username/:appSlug/embed` — minimal embeddable viewer for v1 integrations

### Authenticated workspace

- `/@username` — creator dashboard and recent `.webb` apps
- `/new` — create/import `.webb` app
- `/@username/:projectId` — creator’s app overview (the same base route as the public app viewer when accessed by the owner)
- `/@username/:projectId/runtime` — preview and runtime diagnostics
- `/@username/:projectId/customize` — presentation settings
- `/settings` — profile and workspace settings

### Navigation model

- Public viewer uses a minimal top bar: webbstack mark, project title, creator identity, and actions.
- The base `@username/:appSlug` route is shared by the public app viewer and the authenticated owner overview; authentication state determines the available controls.
- Workspace uses persistent navigation: Projects, Activity or Builds, Settings, and profile/workspace menu.
- Project-level navigation uses tabs or a segmented subnav: Overview, Runtime, Customize.
- Sharing is a contextual project action available from the project header, dashboard project actions, and publish confirmation rather than a standalone destination.
- On small screens, persistent navigation collapses into a menu; project actions remain accessible.

## 7. Core user flows

### 7.1 Create a project showcase

1. User selects **New project**.
2. User chooses **Upload `.webb` app**, **Import repository**, or **Start from a supported template**.
3. User enters project name and optional description.
4. Frontend validates file type, size, required metadata, and supported runtime target before submission.
5. Upload screen shows determinate progress, transfer speed where available, and cancel/retry controls.
6. Preparation screen reports queued, extracting, compiling, validating, and ready states.
7. On success, user is taken to Runtime preview.
8. On failure, user sees a plain-language summary, technical details disclosure, and a next action.

### 7.2 Preview and validate

1. Runtime page opens with the device shell and project status.
2. App viewport shows boot state, live app, or recoverable error state.
3. User can reload the runtime, rotate device orientation where supported by the `.webb` runtime, toggle the device frame, and open diagnostics.
4. User verifies core `.webb` app interactions in the live preview.
5. User can save a new `.webb` app version as the active version or return to project settings.

The preview is intended to provide a complete webbstack device and runtime experience for `.webb` apps. It does not need to reproduce Android or iOS internally, but it must provide webbstack-owned equivalents for the capabilities an app needs to feel complete. These equivalents should have stable APIs, predictable behavior, visible state, and consistent behavior in both the creator preview and public viewer.

The webbstack runtime control layer must define and expose:

- **Permissions:** webbstack-managed permission prompts, grant/deny/reset state, and persisted decisions where appropriate.
- **Sensors and device hardware:** controllable simulated orientation, motion, location, vibration, battery, connectivity, and other supported device signals.
- **Notifications:** in-app and webbstack-managed notification delivery, permission state, notification history, and test triggers.
- **App install and lifecycle:** launch, background, foreground, suspend, resume, reload, close, reinstall/reset, and cold-start behavior.
- **Storage:** namespaced app storage, cache, session data, clear-data controls, and predictable persistence rules.
- **Camera and microphone:** permission-aware mock or connected media inputs with preview, selection, and test fixtures.
- **Network conditions:** online/offline state, latency, throttling, request failure, and reconnect behavior.
- **Deep links:** route opening, external-link handling, link copying, and cold/warm app launch behavior.
- **OS-level navigation:** webbstack back, home, close, multitasking, status-bar, safe-area, and system-overlay behavior where applicable.
- **Platform APIs:** a documented webbstack API surface for capabilities that `.webb` apps should consume instead of relying on native OS APIs directly.
- **Debugging:** logs, runtime events, network activity, errors, warnings, state inspection, and copyable diagnostic reports.

The frontend should maintain a capability matrix showing the control available for each capability, its default state, how it behaves in preview and public viewing, and how creators can test it. Unsupported functionality should be identified as outside the `.webb` contract, not silently omitted.

### 7.3 Customize and publish

1. User updates title, description, creator attribution, thumbnail, accent color, and optional tags.
2. User previews the public presentation alongside the editor.
3. User selects visibility: Unlisted, Public, or Private.
4. User selects **Publish**.
5. Frontend confirms the published URL and offers copy link, open public page, and share options.
6. If the runtime is not ready, publish is disabled with a clear explanation and link to Runtime.

### 7.4 Viewer opens a public project

1. Viewer lands on a project page from a direct link.
2. Page immediately establishes project identity and runtime loading state.
3. App shell loads with a short, informative status rather than a blank canvas.
4. Viewer interacts with the app.
5. Viewer can reset the runtime, view project details, copy/share the link, or open an optional full-screen mode.
6. If unsupported on the current device or browser, viewer receives a fallback summary and supported-viewer guidance.

## 8. Functional requirements

### 8.1 Dashboard

The dashboard must:

- show a clear empty state for a new workspace;
- list projects with thumbnail, title, status, updated time, visibility, and active build version;
- support search once there are more than five projects;
- expose New project as the dominant action;
- provide project-level actions: Open, Preview, Share, Duplicate, Archive;
- distinguish runtime states with text and icon, not color alone;
- preserve optimistic UI only when the backend operation can be safely reconciled.

### 8.2 Project creation and import

The create flow must:

- support drag-and-drop and file picker where uploads are supported;
- state accepted formats and size limits before the user selects a file;
- validate client-side before upload and repeat validation server-side;
- prevent accidental navigation during an active upload where feasible;
- support cancellation and retry;
- retain the project name and metadata if the upload fails;
- provide an accessible progress label and live status updates;
- show an explicit “what happens next” explanation for non-technical users.

### 8.3 Build and runtime status

Use a shared status model across dashboard, project overview, runtime, and public viewer:

- `draft`
- `uploading`
- `queued`
- `preparing`
- `validating`
- `ready`
- `running`
- `failed`
- `stopped`
- `archived`

Each status needs a label, visual treatment, short explanation, available actions, and retry behavior. Avoid exposing internal job names as the primary message.

### 8.4 Runtime preview

The runtime page must include:

- device shell with responsive viewport;
- live `.webb` app surface rendered by the webbstack runtime;
- loading, ready, paused, and error states;
- reload, reset, reinstall, and lifecycle controls;
- device and environment controls for the supported webbstack capability layer;
- orientation and viewport controls;
- full-screen or expanded preview control;
- device chrome and system UI toggles;
- runtime diagnostics drawer or panel with logs and inspection tools;
- build/version and runtime API indicators;
- keyboard-accessible controls and visible focus states.

Diagnostics should be hidden by default and include only actionable information in v1: build identifier, runtime target, load duration, last error, browser support, and copyable technical details.

### 8.5 Customization

The customization surface must support:

- project title, with required validation;
- short description and optional long description;
- creator or organization name;
- project thumbnail upload or generated preview;
- accent color with contrast validation;
- tags or category, if supported by the data model;
- public page layout preview;
- draft save, discard changes, and unsaved-change indication.

The form should autosave only where the product can clearly communicate save state. Otherwise use an explicit Save changes action.

### 8.6 Publishing and sharing

Sharing should be handled as a contextual modal or drawer opened from the project header, dashboard project actions, or publish confirmation. It must:

- show current visibility and its implications;
- provide a stable creator-owned app URL using the `/@username/:appSlug` format;
- validate the username and app slug before publishing, including reserved names and allowed characters;
- make the creator handle and app slug visible in the share preview so the final URL is understandable;
- support copy-to-clipboard with confirmation;
- allow the creator to close the modal or drawer without losing project context;
- provide a persistent public URL section in project settings for returning to sharing later;
- support opening the public viewer in a new tab;
- show an embeddable viewer option with documented embed permissions, sizing behavior, and runtime limitations;
- prevent publication of a project without a ready build and required metadata;
- explain that unlisted links are accessible to anyone with the URL, if applicable.

### 8.7 Public viewer

The public viewer must:

- load from a direct URL without requiring workspace context;
- identify project title and creator before or alongside runtime loading;
- prioritize the interactive app viewport above the fold on desktop;
- include a fallback state if the runtime cannot start;
- allow reset/reload without losing the page context;
- expose project details without forcing a separate navigation step;
- provide share/copy URL actions;
- support reduced motion and low-bandwidth conditions;
- avoid requiring a mouse for core interaction.

## 9. Screen requirements

### 9.1 Marketing / entry page

Purpose: communicate the value proposition and route users to create or view a project.

Required content:

- concise headline centered on “share a `.webb` app as an interactive web experience”;
- short explanation of the source-to-runtime bridge;
- primary CTA: Create a project;
- secondary CTA: View a demo;
- product visual showing the device shell and live app surface;
- three-step explanation: Import, Preview, Share;
- supported-runtime note without overclaiming compatibility;
- trust/supporting section for developers and teams;
- footer with documentation, status, privacy, and terms placeholders.

### 9.2 Dashboard

Required regions:

- workspace header and New project action;
- project list or empty state;
- status summary or recent activity;
- responsive project cards/table;
- loading skeleton and failure state.

### 9.3 Runtime page

Required regions:

- project header and build status;
- preview stage;
- runtime controls;
- diagnostics panel;
- “publish” or “customize” next action;
- responsive fallback for narrow screens where the device shell cannot fit.

### 9.4 Public viewer

Required regions:

- minimal identity header;
- runtime stage;
- compact project details panel or disclosure;
- share and reset controls;
- runtime fallback/error surface.

## 10. Visual and interaction direction

The visual identity should feel like a precise developer tool rather than a gaming emulator or consumer social network.

- Use a dark-first runtime stage to make the app viewport the focal point.
- Use a quiet neutral workspace surface with one distinctive brand accent.
- Use strong typographic hierarchy and compact metadata.
- Treat the device shell as a product object: crisp edge treatment, restrained depth, and no ornamental “futuristic” gradients unless they communicate state.
- Use motion for state transitions, upload progress, and panel reveals only; do not continuously animate the shell.
- Prefer short, direct labels: “Preview build”, “Publish project”, “Runtime error”, “Copy link”.
- Use status color plus icon plus text so meaning remains available to color-blind users and in grayscale.

### 10.1 Brand expression

- `webbstack`: technical, dependable, and platform-oriented; use clear language, structured layouts, and restrained visual polish.
- The product should feel like a reliable bridge between a developer’s build and its audience.
- Emphasize runtime clarity and project presentation without leaning on generic futuristic or emulator clichés.

## 11. Responsive behavior

### Desktop, 1200px and above

- Two-column project editor: controls on the left, public preview or runtime on the right.
- Runtime stage centered with diagnostics alongside or in a drawer.
- Dashboard can use a table or dense card grid.

### Tablet, 768–1199px

- Collapse editor to stacked sections with sticky primary action.
- Keep runtime viewport prominent; move diagnostics below or into a drawer.
- Use a two-column card grid where space allows.

### Mobile, below 768px

- Runtime stage takes the full available width and uses a compact shell mode.
- Controls become horizontally scrollable or grouped in a bottom action row.
- Project editor becomes a single-column form.
- Avoid forcing a phone frame inside a phone-sized viewport; show the live app directly with a clear runtime boundary.
- Keep title, status, and primary action visible without excessive scrolling.

## 12. Accessibility requirements

Target WCAG 2.2 AA for the product chrome and public viewer.

- All interactive controls must be keyboard reachable and operable.
- Focus order must follow the visual and task order.
- Use semantic headings, landmarks, buttons, links, and form labels.
- Provide accessible names for device controls and icon-only actions.
- Do not communicate status by color alone.
- Provide live-region announcements for upload progress, build completion, copy confirmation, and runtime errors.
- Support reduced motion with a media query and runtime setting where applicable.
- Maintain readable contrast for text, controls, disabled states, and status badges.
- Ensure the live app surface has an appropriate accessible label and does not trap focus outside its intended runtime boundary.
- If the emulated app is not fully accessible, the surrounding viewer must still expose project identity, status, and recovery controls accessibly.

## 13. Performance requirements

Initial targets, to be validated against real runtime payloads:

- Public viewer shell renders meaningful project identity within 1.5 seconds on a mid-tier mobile connection.
- Runtime loading provides visible progress or status within 300 ms after navigation.
- Workspace navigation should feel instant after the initial app shell loads.
- Defer diagnostics, noncritical thumbnails, and secondary metadata until requested.
- Avoid blocking the public shell on analytics or optional sharing integrations.
- Cache immutable build assets safely while ensuring a newly published build becomes visible predictably.
- Provide a lightweight fallback when WebAssembly, canvas, or required browser capabilities are unavailable.

## 14. Error, empty, and edge states

Every async surface must define at least these states:

- first-use empty state;
- loading skeleton or progress state;
- success state;
- recoverable failure with retry;
- permanent or unsupported failure with next steps;
- permission or visibility failure;
- offline/network interruption;
- stale build versus active build;
- deleted or archived project;
- expired or invalid public URL;
- runtime crash or unsupported browser;
- unsaved changes during navigation.

Error copy should answer three questions: **what happened, what is affected, and what can I do next?** Technical details should be available behind disclosure, not hidden from developers entirely.

## 15. Data and frontend state model

The frontend should model these core entities:

- **Workspace:** identity, plan or capability flags, project count.
- **Project:** id, slug, title, description, owner, visibility, thumbnail, accent, timestamps.
- **Build:** id, project id, version, source type, status, progress, created time, error summary.
- **Runtime session:** build id, state, capabilities, diagnostics, session timestamps.
- **Share settings:** visibility, public URL, embed setting, metadata.

Separate server state from local UI state. Server state includes project/build/session status and should be refreshable or subscribable. Local UI state includes active tab, open drawer, device chrome preference, form draft, and transient notifications.

The UI must not infer “ready” solely from elapsed time or local upload completion; readiness comes from the runtime/build source of truth.

## 16. Analytics and success metrics

Track events without capturing source code, app user data, or runtime interaction payloads that are not necessary for product decisions.

Suggested events:

- `project_create_started`
- `project_upload_started`
- `project_upload_completed`
- `project_upload_failed`
- `build_preparation_completed`
- `build_preparation_failed`
- `runtime_started`
- `runtime_failed`
- `runtime_reset`
- `customization_saved`
- `project_published`
- `share_link_copied`
- `public_view_started`
- `public_runtime_interacted`
- `public_runtime_failed`

North-star metric for v1: **successful public project sessions** — published projects that receive at least one runtime session reaching the ready state.

Supporting metrics:

- time from project creation to first ready preview;
- upload-to-publish conversion;
- runtime start success rate;
- public viewer ready rate;
- share-link copy rate;
- failure recovery rate after retry;
- percentage of public sessions on mobile versus desktop.

## 17. Technical assumptions and open dependencies

These assumptions must be confirmed before implementation is finalized:

- The backend exposes project, build, runtime, and share APIs.
- `.webb` app preparation has a stable status endpoint or event stream.
- The webbstack runtime can mount a `.webb` app into a controlled container and exposes lifecycle events.
- Runtime assets can be loaded from a secure origin with appropriate CSP and isolation rules.
- Public URLs can resolve independently of authenticated workspace routes.
- Thumbnail and build uploads have documented limits and failure codes.
- Supported browser capabilities are known and can be detected client-side.
- The first release has a defined `.webb` app format, runtime contract, and supported capability scope.

Open product decisions:

1. Which `.webb` app formats, source integrations, and runtime capabilities are supported at launch?
2. Which `.webb` app lifecycle and rendering behaviors does the webbstack runtime support? The UI copy must reflect the technical truth.
3. Does “unlisted” mean secret-by-URL, authenticated-only, or another permission model?
4. Are public viewer analytics visible to creators in v1?
5. What embed permissions, responsive sizing rules, and host-page restrictions apply to embedded viewers?
6. If a creator changes their username or app slug, should the previous public URL redirect to the new one?
7. What is the maximum acceptable cold-start time for a project runtime?
8. Which webbstack-owned device capabilities are included in the initial runtime contract, and which are deferred?

## 18. Delivery plan

### Phase 0: Foundation

- Confirm the webbstack brand system and technical runtime model.
- Define API contracts and status state machine.
- Establish tokens, typography, layout primitives, status patterns, and accessible form controls.
- Create a clickable flow covering create, prepare, preview, customize, and publish.

### Phase 1: Creator MVP

- Authentication entry and workspace shell.
- Dashboard with empty, loading, populated, and failure states.
- Project creation and upload flow.
- Build preparation status.
- Runtime preview with reset, responsive shell, and basic diagnostics.
- Customization and publish/share flow.

### Phase 2: Public viewer

- Public viewer route and direct-link handling.
- Runtime loading and fallback experience.
- Project details, share controls, and embeddable viewer.
- Mobile and accessibility hardening.
- Analytics instrumentation and performance measurement.

### Phase 3: Quality and expansion

- More build sources and integrations.
- Project history and build switching.
- Creator analytics.
- Team/workspace capabilities.

## 19. Acceptance criteria for frontend MVP

A release candidate is complete when:

- A first-time user can understand the product and begin creating a project from the entry page.
- A supported project can be uploaded with visible validation and progress.
- Build preparation exposes all meaningful states and a recoverable failure path.
- A ready `.webb` app can be launched in the runtime preview and reset without a full page reload.
- A creator can exercise the supported webbstack device and runtime capabilities, including permissions, lifecycle, storage, media, network conditions, deep links, system navigation, and diagnostics.
- A creator can edit required presentation metadata and save it.
- A creator cannot publish an invalid or non-ready project without an explanatory message.
- Publishing produces a copyable public URL and opens a viewer that works from a direct navigation.
- The public viewer communicates loading, ready, unsupported, and failure states.
- Core flows work at desktop, tablet, and mobile widths.
- Product chrome passes keyboard navigation and automated accessibility checks, followed by manual screen-reader review of critical flows.
- Performance instrumentation exists for public shell render and runtime readiness.
- No UI claim implies capabilities that the underlying runtime does not support.

## 20. Recommended initial component inventory

Build these as composable primitives rather than one-off page markup:

- AppShell
- WorkspaceNav
- ProjectCard / ProjectTableRow
- StatusBadge
- BuildProgress
- FileDropzone
- ProjectForm
- RuntimeStage
- DeviceShell
- RuntimeToolbar
- RuntimeStatus
- DiagnosticsPanel
- VisibilitySelector
- ShareLinkField
- PublicProjectHeader
- ProjectDetailsPanel
- EmptyState
- ErrorState
- ConfirmDialog
- Toast / LiveRegion

The first implementation should prioritize shared behavior and state handling over visual novelty. A reliable runtime status model and a polished public viewer are more important than an extensive dashboard feature set.

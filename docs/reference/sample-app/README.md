# Capability Lab

This is the reference `.webb` app for the v1 capability contract. It declares every capability from Section 10.3 and exercises the core bridge flows without requiring physical hardware.

## Source layout

- `manifest.json` declares the app, navigation destinations, storage classes, and all privileged capabilities.
- `index.html` is the browser-loadable entrypoint.
- `app.ts` is the reference app source. A `.webb` build must bundle it as `app.js` and provide the declared `runtime/app.wasm` and bridge glue artifacts.

The app deliberately reports camera, microphone, motion, location, and other hardware capabilities as restricted or unavailable in the reference environment. This demonstrates required fallback behavior rather than bypassing the bridge.

## Run in a real runtime

Build this source with `webbstitch`, place the generated `app.js` beside `index.html`, and provide the declared WebAssembly and bridge artifacts under `runtime/`. The manifest is valid against `docs/schemas/webb-manifest.v1.json`.

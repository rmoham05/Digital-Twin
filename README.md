# TwinOps Command Center

A professional digital twin operations app for Bluemouse AI. The first product direction is a smart facility / industrial asset twin with live telemetry, asset health, predictive maintenance, energy visibility, alerts, work orders, and scenario simulation.

## Targets

- Web app for isolated deployment under Bluemouse infrastructure.
- Windows desktop installer built from the same app with Electron.

## Development

```bash
npm install
npm run dev
```

## Web Build

```bash
npm run build
```

The static site is generated in `dist/`.

## Desktop Build

```bash
npm run desktop:build
```

The Windows installer is generated in `release/`.

## Deployment Isolation

To avoid impacting existing Bluemouse pages, deploy this app on a separate subdomain such as:

```text
twin.bluemouse.ai
```

Create an `A` record pointing that subdomain to:

```text
143.110.165.178
```

Then host the static `dist/` build from a dedicated web root and Nginx server block.

See [deploy/README.md](deploy/README.md) for the isolated server setup.

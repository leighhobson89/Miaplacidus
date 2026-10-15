# Demo build E2E coverage

This area exercises the production demo artifact. The area runner builds with `npm run build:demo`, serves the generated artifact through Vite Preview, then verifies the demo marker, a working Hydrogen collection action and the absence of development test dialogs. It must run through `npm run test:e2e:area -- demo-build` so the browser sees the production build rather than the normal test server.

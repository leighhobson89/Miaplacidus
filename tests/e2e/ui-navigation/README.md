# UI Navigation

This area owns main and child destination selection, visible source order, tab-to-panel association, keyboard focus, and responsive navigation reachability. Feature-specific content and interaction behavior stays in the owning feature area.

## Responsive Settings and Miaplaedia child navigation

The P-12 case visits all six Settings and seven Miaplaedia destinations at 320px and 768px. It checks selected tabs stay inside their rails, child tabs wrap without horizontal rail scrolling, each selected tab controls its labelled panel, panels follow the navigation row, and the document stays within the viewport.

On 14 October 2026, the moved canonical-path case passed in default Chromium: **1/1 in 13.5 seconds** on port 6556. The existing UI behaved as expected; no app changes or screenshot updates were needed.

```powershell
$env:MIAPLACIDUS_TEST_PORT='6556'
npm run test:e2e:focused -- tests/e2e/ui-navigation/p12-settings-miaplaedia-responsive-navigation.spec.ts --project=chromium
```


## Economy navigation cases (14 October 2026)
The fresh progression and P-65 layout cases formerly in the Economy catchall now live in [`economy-navigation.spec.ts`](economy-navigation.spec.ts) and [`p65-economy-presentation-layout.spec.ts`](p65-economy-presentation-layout.spec.ts).

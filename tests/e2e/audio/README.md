# Audio browser coverage

`audio-cues.spec.ts` uses a local Audio mock to check the source click, sale,
storage-upgrade, and Hydrogen-compressor cues through visible player actions.

Run it with:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/audio/audio-cues.spec.ts --project=chrome --workers=1 --retries=0
```

The sound source manifest is documented in the project audio asset records.

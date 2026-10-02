import { BUILD_INFO } from "./buildInfo";

export function App() {
  return (
    <main
      className="application-shell"
      data-build-mode={BUILD_INFO.mode}
      data-build-variant={BUILD_INFO.isDemo ? "demo" : "full"}
    >
      <h1>MIAPLACIDUS</h1>
    </main>
  );
}

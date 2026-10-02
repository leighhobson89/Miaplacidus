import { Component, type ErrorInfo, type ReactNode } from "react";

interface GameErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onRecover: () => void;
}

interface GameErrorBoundaryState {
  readonly failed: boolean;
}

export class GameErrorBoundary extends Component<GameErrorBoundaryProps, GameErrorBoundaryState> {
  state: GameErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): GameErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // The UI is isolated here; gameplay state remains owned by the engine store.
  }

  private recover = (): void => {
    this.props.onRecover();
    this.setState({ failed: false });
  };

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <main className="application-shell" role="alert">
          <section className="error-recovery" aria-labelledby="error-recovery-title">
            <h1 id="error-recovery-title">This screen could not be displayed</h1>
            <p>Your game state is safe. Restore the last valid state and continue.</p>
            <button type="button" onClick={this.recover}>
              Continue
            </button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

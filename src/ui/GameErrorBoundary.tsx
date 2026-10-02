import { Component, type ErrorInfo, type ReactNode } from "react";

interface GameErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onRecover: () => void;
  readonly messages: { readonly title: string; readonly detail: string; readonly continue: string };
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
            <h1 id="error-recovery-title">{this.props.messages.title}</h1>
            <p>{this.props.messages.detail}</p>
            <button type="button" onClick={this.recover}>
              {this.props.messages.continue}
            </button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

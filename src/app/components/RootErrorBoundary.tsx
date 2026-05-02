import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { err: Error | null };

/** Surfaces React render errors instead of a blank white screen (check console too). */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(error: Error): State {
    return { err: error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RootErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui,sans-serif', maxWidth: 720 }}>
          <h1 style={{ color: '#b91c1c' }}>App failed to load</h1>
          <p style={{ color: '#444' }}>{this.state.err.message}</p>
          <pre style={{ overflow: 'auto', fontSize: 12, background: '#f4f4f5', padding: 12 }}>
            {this.state.err.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

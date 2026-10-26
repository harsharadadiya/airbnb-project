// Catches unexpected crashes in any component and shows a friendly screen instead of a blank page.
import { Component } from 'react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI crashed:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-2xl font-extrabold">Oops, something broke.</h1>
        <p className="max-w-md text-muted-foreground">{this.state.error.message}</p>
        <Button onClick={() => window.location.assign('/')}>Back to home</Button>
      </div>
    );
  }
}

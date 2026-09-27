import { Component, type ErrorInfo, type PropsWithChildren } from 'react';

import { ERROR_MESSAGES } from '../../constants/messages';
import { logger } from '../../utils/logger';
import { Screen } from '../ui/Screen';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Last-resort boundary for unexpected render errors: logs the technical detail
 * and shows generic copy instead of a blank screen.
 */
export class ErrorBoundary extends Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('[ErrorBoundary] Unhandled render error', error, info);
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <Screen>
          <ErrorState
            message={ERROR_MESSAGES.unknown}
            onRetry={this.handleReset}
          />
        </Screen>
      );
    }

    return this.props.children;
  }
}

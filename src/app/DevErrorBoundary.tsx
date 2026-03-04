/**
 * Error boundary que en modo desarrollo muestra el error en pantalla.
 * En producción relanza para no exponer detalles.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { IS_DEV } from '@/config';
import { logger } from '@/lib';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class DevErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('ErrorBoundary caught:', error, errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error && IS_DEV) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Error en desarrollo</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Text style={styles.stack}>{this.state.error.stack ?? ''}</Text>
          {this.state.errorInfo?.componentStack && (
            <Text style={styles.stack}>{this.state.errorInfo.componentStack}</Text>
          )}
        </ScrollView>
      );
    }
    if (this.state.hasError && !IS_DEV) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Algo salió mal</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#ef4444', marginBottom: 8 },
  message: { fontSize: 14, color: '#fca5a5', marginBottom: 12 },
  stack: { fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', marginTop: 8 },
});

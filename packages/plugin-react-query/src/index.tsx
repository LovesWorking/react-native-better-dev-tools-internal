import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type {
  DevToolsPlugin,
  PluginContext,
} from 'react-native-better-dev-tools-internal';
// import { ReactQueryModal } from './components/modals/ReactQueryModal';
import { TanstackLogo } from './components/query-browser/svgs';
// import { onlineManager } from '@tanstack/react-query';
// import type { Query, Mutation } from '@tanstack/react-query';
// import { useModalManager } from './hooks/useModalManager';
import { BaseFloatingModal } from './_components/floating-bubble/modal/components/BaseFloatingModal';
import useAllQueries from './hooks/useAllQueries';

/**
 * Bubble component for the React Query plugin
 */
function ReactQueryBubbleComponent({
  context,
  isDragging,
}: {
  context: PluginContext;
  isDragging?: boolean;
}) {
  const queryClient = context.queryClient;

  if (!queryClient) {
    return null;
  }

  const handlePress = () => {
    context.events.emit('react-query:open-modal');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDragging}
      style={styles.bubbleContainer}
      accessibilityRole="button"
      accessibilityLabel="React Query DevTools"
    >
      <View style={styles.iconContainer}>
        <TanstackLogo />
      </View>
    </TouchableOpacity>
  );
}

/**
 * Modal component wrapper for the React Query plugin
 */
function ReactQueryModalComponent({
  context,
  onClose,
}: {
  context: PluginContext;
  onClose: () => void;
}) {
  // Simple state management without persistence for now
  const [activeTab, setActiveTab] = useState<'queries' | 'mutations'>(
    'queries'
  );

  if (!context.queryClient) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No QueryClient available</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const queries = useAllQueries();

  // Check for programmatically requested tab on mount
  useEffect(() => {
    const requestedTab = (global as any).__reactQueryRequestedTab;
    if (requestedTab) {
      setActiveTab(requestedTab);
      // Clear the global flag
      delete (global as any).__reactQueryRequestedTab;
    }
  }, []);

  const getQueryStatusLabel = (query: any) => {
    if (query.state.fetchStatus === 'fetching') return 'fetching';
    if (query.state.fetchStatus === 'paused') return 'paused';
    if (query.state.status === 'error') return 'error';
    if (query.state.status === 'pending') return 'pending';
    if (!query.isStale()) return 'fresh';
    return 'stale';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'fresh':
        return '#10B981'; // Green
      case 'stale':
      case 'inactive':
        return '#F59E0B'; // Orange
      case 'fetching':
        return '#3B82F6'; // Blue
      case 'paused':
        return '#8B5CF6'; // Purple
      case 'error':
        return '#EF4444'; // Red
      case 'pending':
        return '#6B7280'; // Gray
      default:
        return '#6B7280'; // Gray
    }
  };

  const getQueryText = (query: any) => {
    if (!query?.queryKey) return 'Unknown Query';
    const keys = Array.isArray(query.queryKey)
      ? query.queryKey
      : [query.queryKey];
    return (
      keys
        .filter((k: any) => k != null)
        .map((k: any) => String(k))
        .join(' › ') || 'Unknown Query'
    );
  };

  return (
    <BaseFloatingModal
      visible={true}
      onClose={onClose}
      header={
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>React Query DevTools</Text>
          <Text style={styles.modalSubtitle}>
            {activeTab === 'queries'
              ? `${queries.length} queries`
              : '0 mutations'}
          </Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'queries' && styles.activeTab]}
              onPress={() => setActiveTab('queries')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'queries' && styles.activeTabText,
                ]}
              >
                Queries
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'mutations' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('mutations')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'mutations' && styles.activeTabText,
                ]}
              >
                Mutations
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      footer={
        <TouchableOpacity onPress={onClose} style={styles.modalFooter}>
          <Text style={styles.modalFooterText}>Close</Text>
        </TouchableOpacity>
      }
    >
      <ScrollView style={styles.modalContent}>
        {activeTab === 'queries' ? (
          queries.length === 0 ? (
            <Text style={styles.emptyText}>No queries found</Text>
          ) : (
            queries.map((query) => {
              const status = getQueryStatusLabel(query);
              const statusColor = getStatusColor(status);
              const queryText = getQueryText(query);
              const observerCount = query.getObserversCount();

              return (
                <TouchableOpacity
                  key={query.queryHash}
                  style={styles.queryRow}
                  activeOpacity={0.8}
                >
                  <View style={styles.rowContent}>
                    <View style={styles.statusSection}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: statusColor },
                        ]}
                      />
                      <View style={styles.statusInfo}>
                        <Text
                          style={[styles.statusLabel, { color: statusColor }]}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                        <Text style={styles.observerText}>
                          {observerCount} observer
                          {observerCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.querySection}>
                      <Text style={styles.queryHash}>{queryText}</Text>
                    </View>

                    <View style={styles.badgeSection}>
                      <Text
                        style={[styles.statusBadge, { color: statusColor }]}
                      >
                        {observerCount}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )
        ) : (
          <Text style={styles.emptyText}>No mutations found</Text>
        )}
      </ScrollView>
    </BaseFloatingModal>
  );
}

/**
 * React Query DevTools Plugin
 * Comprehensive debugging tools for React Query with advanced features
 */
const reactQueryPlugin: DevToolsPlugin = {
  id: 'react-query',
  name: 'React Query DevTools',

  component: ReactQueryBubbleComponent,
  modalComponent: ReactQueryModalComponent,

  checkAvailability: () => {
    // In React Native, we can't use require.resolve
    // Just return true since we know the package is installed
    return true;
  },

  onMount: async (context) => {
    console.log('[React Query Plugin] Mounted - Comprehensive version!');

    if (!context.queryClient) {
      console.warn('[React Query Plugin] No QueryClient provided');
      return;
    }

    // Setup programmatic route opening for testing
    if (__DEV__ && context.events) {
      // Allow programmatic opening with specific route for testing
      context.events.on('react-query:open-route', (route: string) => {
        console.log('[React Query Plugin] Opening route:', route);

        // Store the requested route in global for the modal to pick up
        (global as any).__reactQueryRequestedRoute = route;

        // Open the modal
        context.events.emit('react-query:open-modal');
      });

      // Allow programmatic tab switching
      context.events.on(
        'react-query:switch-tab',
        (tab: 'queries' | 'mutations') => {
          console.log('[React Query Plugin] Switching to tab:', tab);
          (global as any).__reactQueryRequestedTab = tab;
        }
      );

      // Auto-open on mount for development testing
      const autoOpen = false; // Set to true when needed for testing
      if (autoOpen) {
        setTimeout(() => {
          // Open with Queries tab for testing
          (global as any).__reactQueryRequestedTab = 'queries';
          context.events.emit('react-query:open-modal');
        }, 2000);
      }
    }
  },

  onUnmount: async () => {
    console.log('[React Query Plugin] Unmounted');
  },

  defaultConfig: {
    enabled: true,
    settings: {
      showInBubble: true,
      enableLogging: true,
      persistModalState: true,
      defaultOpenModal: false,
    },
  },
};

const styles = StyleSheet.create({
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 4,
  },
  iconContainer: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '600',
  },
  testModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 20,
  },
  testModalText: {
    color: '#F3F4F6',
    fontSize: 18,
    marginBottom: 20,
  },
  modalHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalHeaderText: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#171717',
  },
  modalContentText: {
    color: '#F3F4F6',
    fontSize: 16,
    marginBottom: 10,
  },
  modalFooter: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    alignItems: 'center',
  },
  modalFooterText: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  queryRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 8,
    marginVertical: 3,
    padding: 12,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  observerText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  querySection: {
    flex: 2,
    paddingHorizontal: 12,
  },
  queryHash: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 16,
  },
  badgeSection: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#0F0F0F',
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#374151',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#F3F4F6',
  },
});

export default reactQueryPlugin;
export * from './types';
export * from './hooks';
export * from './utils';

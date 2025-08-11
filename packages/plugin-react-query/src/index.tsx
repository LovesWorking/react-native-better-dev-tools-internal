import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { Query, Mutation } from '@tanstack/react-query';
import type {
  DevToolsPlugin,
  PluginContext,
} from 'react-native-better-dev-tools-internal';

/**
 * Query snapshot for display
 */
interface QuerySnapshot {
  queryHash: string;
  queryKey: readonly unknown[];
  status: string;
  fetchStatus: string;
  dataUpdatedAt: number;
  errorUpdatedAt?: number;
  error?: any;
  isInvalidated?: boolean;
  observerCount?: number;
}

/**
 * Mutation snapshot for display
 */
interface MutationSnapshot {
  mutationId: number;
  mutationKey?: readonly unknown[];
  status: string;
  isPaused?: boolean;
  failureCount: number;
  submittedAt?: number;
  variables?: unknown;
  error?: any;
}

/**
 * Compact view component for the bubble
 */
function ReactQueryBubbleComponent({
  context,
  isDragging,
}: {
  context: PluginContext;
  isDragging?: boolean;
}) {
  const [queryCount, setQueryCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [mutationCount, setMutationCount] = useState(0);
  const { queryClient } = context;

  useEffect(() => {
    if (!queryClient) return;

    const updateCounts = () => {
      const queries = queryClient.getQueryCache().getAll();
      const mutations = queryClient.getMutationCache().getAll();

      setQueryCount(queries.length);
      setActiveCount(
        queries.filter((q: Query) => q.state.fetchStatus === 'fetching').length
      );
      setMutationCount(mutations.length);
    };

    updateCounts();

    // Subscribe to cache changes
    const unsubQuery = queryClient.getQueryCache().subscribe(() => {
      updateCounts();
    });

    const unsubMutation = queryClient.getMutationCache().subscribe(() => {
      updateCounts();
    });

    return () => {
      unsubQuery();
      unsubMutation();
    };
  }, [queryClient]);

  if (!queryClient) return null;

  const handlePress = () => {
    // Emit event to open modal
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
      <Text style={styles.bubbleText}>
        🔍 {queryCount}q {activeCount > 0 && `(${activeCount})`}
        {mutationCount > 0 && ` ${mutationCount}m`}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Expanded modal view component
 */
function ReactQueryModalComponent({
  context,
  onClose,
}: {
  context: PluginContext;
  onClose: () => void;
}) {
  const [queries, setQueries] = useState<QuerySnapshot[]>([]);
  const [mutations, setMutations] = useState<MutationSnapshot[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<QuerySnapshot | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'queries' | 'mutations'>(
    'queries'
  );
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const { queryClient } = context;

  useEffect(() => {
    if (!queryClient) return;

    const updateData = () => {
      // Get query snapshots
      const querySnapshots = queryClient
        .getQueryCache()
        .getAll()
        .map((query: Query) => ({
          queryHash: query.queryHash,
          queryKey: query.queryKey,
          status: query.state.status,
          fetchStatus: query.state.fetchStatus,
          dataUpdatedAt: query.state.dataUpdatedAt,
          errorUpdatedAt: query.state.errorUpdatedAt,
          error: query.state.error,
          isInvalidated: query.state.isInvalidated,
          observerCount: query.getObserversCount?.() || 0,
        }));

      // Get mutation snapshots
      const mutationSnapshots = queryClient
        .getMutationCache()
        .getAll()
        .map((mutation: Mutation, index: number) => ({
          mutationId: index,
          mutationKey: mutation.options?.mutationKey,
          status: mutation.state.status,
          isPaused: mutation.state.isPaused,
          failureCount: mutation.state.failureCount || 0,
          submittedAt: mutation.state.submittedAt,
          variables: mutation.state.variables,
          error: mutation.state.error,
        }));

      setQueries(querySnapshots);
      setMutations(mutationSnapshots);
    };

    updateData();

    // Update every second
    updateInterval.current = setInterval(updateData, 1000);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [queryClient]);

  const handleInvalidate = (queryKey: readonly unknown[]) => {
    if (!queryClient) return;
    queryClient.invalidateQueries({ queryKey });
    console.log('[React Query Plugin] Invalidated:', queryKey);
  };

  const handleRefetch = (queryKey: readonly unknown[]) => {
    if (!queryClient) return;
    queryClient.refetchQueries({ queryKey });
    console.log('[React Query Plugin] Refetched:', queryKey);
  };

  const handleRemove = (queryKey: readonly unknown[]) => {
    if (!queryClient) return;
    queryClient.removeQueries({ queryKey });
    console.log('[React Query Plugin] Removed:', queryKey);
  };

  const handleClearCache = () => {
    if (!queryClient) return;
    queryClient.clear();
    console.log('[React Query Plugin] Cache cleared');
  };

  if (!queryClient) return null;

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>React Query DevTools</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

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
            Queries ({queries.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mutations' && styles.activeTab]}
          onPress={() => setActiveTab('mutations')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'mutations' && styles.activeTabText,
            ]}
          >
            Mutations ({mutations.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {activeTab === 'queries' ? (
          <View>
            <TouchableOpacity
              onPress={handleClearCache}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Clear All Cache</Text>
            </TouchableOpacity>

            {queries.map((query, index) => (
              <TouchableOpacity
                key={`${query.queryHash}-${index}`}
                style={styles.queryItem}
                onPress={() =>
                  setSelectedQuery(
                    selectedQuery?.queryHash === query.queryHash ? null : query
                  )
                }
              >
                <View style={styles.queryHeader}>
                  <Text style={styles.queryKey}>
                    {JSON.stringify(query.queryKey)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(query.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{query.status}</Text>
                  </View>
                </View>

                <View style={styles.queryMeta}>
                  <Text style={styles.metaText}>
                    Fetch: {query.fetchStatus} | Observers:{' '}
                    {query.observerCount}
                  </Text>
                  {query.isInvalidated && (
                    <Text style={styles.invalidatedText}>INVALIDATED</Text>
                  )}
                </View>

                {selectedQuery?.queryHash === query.queryHash && (
                  <View style={styles.queryActions}>
                    <TouchableOpacity
                      onPress={() => handleInvalidate(query.queryKey)}
                      style={styles.queryActionButton}
                    >
                      <Text style={styles.queryActionText}>Invalidate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRefetch(query.queryKey)}
                      style={styles.queryActionButton}
                    >
                      <Text style={styles.queryActionText}>Refetch</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemove(query.queryKey)}
                      style={[styles.queryActionButton, styles.dangerButton]}
                    >
                      <Text style={styles.queryActionText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            {mutations.map((mutation) => (
              <View key={mutation.mutationId} style={styles.mutationItem}>
                <View style={styles.queryHeader}>
                  <Text style={styles.queryKey}>
                    {mutation.mutationKey
                      ? JSON.stringify(mutation.mutationKey)
                      : `Mutation #${mutation.mutationId}`}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(mutation.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{mutation.status}</Text>
                  </View>
                </View>

                {mutation.failureCount > 0 && (
                  <Text style={styles.errorText}>
                    Failed {mutation.failureCount} times
                  </Text>
                )}

                {mutation.variables !== undefined && (
                  <Text style={styles.metaText}>
                    Variables:{' '}
                    {JSON.stringify(mutation.variables).substring(0, 100)}...
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * Get color for status badge
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'pending':
      return '#F59E0B';
    case 'loading':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
}

/**
 * React Query Plugin
 * Comprehensive debugging tools for React Query
 */
const reactQueryPlugin: DevToolsPlugin = {
  id: 'react-query',
  name: 'React Query DevTools',

  component: ReactQueryBubbleComponent,
  modalComponent: ReactQueryModalComponent,

  // React Query is a peer dependency, so it's always available
  checkAvailability: () => true,

  onMount: async (context) => {
    console.log('[React Query Plugin] Mounted');

    if (!context.queryClient) {
      console.warn('[React Query Plugin] No QueryClient provided');
      return;
    }

    // Subscribe to cache events for logging
    const queryCache = context.queryClient.getQueryCache();
    const mutationCache = context.queryClient.getMutationCache();

    const unsubQuery = queryCache.subscribe((event: any) => {
      if (event?.type === 'added' || event?.type === 'removed') {
        console.log(
          `[React Query Plugin] Query ${event.type}:`,
          event.query?.queryKey
        );
      }
    });

    const unsubMutation = mutationCache.subscribe((event: any) => {
      if (event?.type === 'added' || event?.type === 'removed') {
        console.log(`[React Query Plugin] Mutation ${event.type}`);
      }
    });

    // Store unsubscribe functions for cleanup
    await context.storage.set('react-query:subscriptions', {
      queryUnsub: unsubQuery,
      mutationUnsub: unsubMutation,
    });
  },

  onUnmount: async () => {
    console.log('[React Query Plugin] Unmounted');
    // Subscriptions are cleaned up automatically
  },

  defaultConfig: {
    enabled: true,
    settings: {
      showInBubble: true,
      updateInterval: 1000,
      maxQueriesToShow: 50,
    },
  },
};

const styles = StyleSheet.create({
  bubbleContainer: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    maxHeight: 500,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#9CA3AF',
    fontSize: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  contentContainer: {
    maxHeight: 350,
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#374151',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#F3F4F6',
    fontWeight: '600',
  },
  queryItem: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  queryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  queryKey: {
    color: '#F3F4F6',
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  queryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  invalidatedText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '600',
  },
  queryActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  queryActionButton: {
    flex: 1,
    backgroundColor: '#4B5563',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  queryActionText: {
    color: '#F3F4F6',
    fontSize: 12,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#DC2626',
  },
  mutationItem: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default reactQueryPlugin;

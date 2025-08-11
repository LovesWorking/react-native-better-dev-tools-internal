import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import type {
  DevToolsPlugin,
  PluginContext,
} from 'react-native-better-dev-tools-internal';

/**
 * Simple bubble component showing query count
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

  const queryCache = queryClient.getQueryCache();
  const mutationCache = queryClient.getMutationCache();

  const queries = queryCache.getAll();
  const mutations = mutationCache.getAll();

  const handlePress = () => {
    context.events.emit('react-query:open-modal');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDragging}
      style={styles.bubbleContainer}
    >
      <Text style={styles.logo}>🔍</Text>
      <Text style={styles.countText}>
        {queries.length}q {mutations.length > 0 && `${mutations.length}m`}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Simple modal showing queries list
 */
function ReactQueryModalComponent({
  context,
  onClose,
}: {
  context: PluginContext;
  onClose: () => void;
}) {
  if (!context.queryClient) {
    return (
      <Modal visible={true} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.errorText}>No QueryClient available</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const queryCache = context.queryClient.getQueryCache();
  const queries = queryCache.getAll();

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>React Query DevTools</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Queries ({queries.length})</Text>
            {queries.map((query, index) => (
              <View key={index} style={styles.queryItem}>
                <Text style={styles.queryKey}>
                  {JSON.stringify(query.queryKey)}
                </Text>
                <Text style={styles.queryStatus}>
                  Status: {query.state.status}
                </Text>
                {query.state.data && (
                  <Text style={styles.queryData} numberOfLines={3}>
                    Data: {JSON.stringify(query.state.data).slice(0, 100)}...
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Minimal React Query Plugin
 */
const reactQueryPlugin: DevToolsPlugin = {
  id: 'react-query',
  name: 'React Query DevTools',

  component: ReactQueryBubbleComponent,
  modalComponent: ReactQueryModalComponent,

  checkAvailability: () => {
    console.log('[React Query Plugin] Checking availability...');
    // In React Native, we can't use require.resolve
    // Just return true since we know the package is installed
    return true;
  },

  onMount: async (context) => {
    console.log('[React Query Plugin] Mounted - Simple version');
    console.log(
      '[React Query Plugin] QueryClient available:',
      !!context.queryClient
    );
    return Promise.resolve();
  },

  onUnmount: async () => {
    console.log('[React Query Plugin] Unmounted');
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
  logo: {
    fontSize: 14,
  },
  countText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  queryItem: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  queryKey: {
    color: '#60A5FA',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  queryStatus: {
    color: '#10B981',
    fontSize: 12,
    marginBottom: 4,
  },
  queryData: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default reactQueryPlugin;

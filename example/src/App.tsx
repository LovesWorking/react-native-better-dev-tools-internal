import { useState, useEffect } from 'react';
import {
  View,
  Button,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import {
  DevToolsBubbleWithPlugins,
  type UserRole,
  type Environment,
} from 'react-native-better-dev-tools-internal';

// Import the NEW self-contained FloatingTools from rn-better-dev-tools
import {
  FloatingTools,
  EnvironmentIndicator,
  UserStatus,
  Divider,
} from '../../rn-better-dev-tools/src/components/bubble/floatingTools';
import { QueryClient, useQuery, onlineManager } from '@tanstack/react-query';
import { QueryClientWrapper } from './QueryClientWrapper';

// Import plugins from their packages
import wifiTogglePlugin from '@react-native-better-dev-tools/plugin-wifi-toggle';
import reactQueryPlugin from '@react-native-better-dev-tools/plugin-react-query';

// Create QueryClient as a true singleton that survives hot reloads
// Store it in global to persist across module reloads
declare global {
  var __queryClient: QueryClient | undefined;
}

if (!global.__queryClient) {
  console.log('🚀 Creating NEW QueryClient (first load)');
  global.__queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Keep cache for 5 minutes even if component unmounts
        gcTime: 1000 * 60 * 5,
        // Keep data fresh for 30 seconds
        staleTime: 1000 * 30,
        // Retry failed requests
        retry: 1,
        // Refetch on mount if data is stale
        refetchOnMount: 'always',
        // Don't refetch on window focus in development
        refetchOnWindowFocus: false,
      },
    },
  });
} else {
  console.log('♻️ Reusing existing QueryClient (hot reload)');
}

const queryClient = global.__queryClient;

// Component to show React Query online status
function OnlineStatusIndicator() {
  const [isOnline, setIsOnline] = useState(() => onlineManager.isOnline());
  useEffect(() => {
    const unsubscribe = onlineManager.subscribe((online) => {
      setIsOnline(online);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.statusContainer}>
      <Text style={styles.statusTitle}>React Query Status</Text>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            isOnline ? styles.statusDotOnline : styles.statusDotOffline,
          ]}
        />
        <Text style={styles.statusText}>
          {isOnline ? 'Online' : 'Offline'} - Queries{' '}
          {isOnline ? 'Active' : 'Paused'}
        </Text>
      </View>
    </View>
  );
}

// Example component that uses React Query
function ExampleDataFetcher() {
  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['example'],
    queryFn: async () => {
      // Simulate API call
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts/1'
      );
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    retry: 2,
  });

  return (
    <View style={styles.dataContainer}>
      <Text style={styles.title}>React Query Test</Text>
      {isLoading && <Text>Loading...</Text>}
      {isFetching && !isLoading && <Text>Refetching...</Text>}
      {error && <Text style={styles.error}>Error: {error.message}</Text>}
      {data && (
        <View>
          <Text style={styles.dataTitle}>{data.title}</Text>
          <Text style={styles.dataBody}>{data.body}</Text>
        </View>
      )}
      <Button title="Refetch" onPress={() => refetch()} color="#6366F1" />
    </View>
  );
}

function AppContent() {
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [environment, setEnvironment] = useState<Environment>('local');

  // Visibility states for bubble features
  const [hideEnvironment, setHideEnvironment] = useState(false);
  const [hideUserStatus, setHideUserStatus] = useState(false);
  const [hideWifiToggle, setHideWifiToggle] = useState(false);
  const [enablePositionPersistence, setEnablePositionPersistence] =
    useState(true);

  // Toggle for showing comparison mode
  const [showComparison, setShowComparison] = useState(true);

  return (
    <View style={styles.mainContainer}>
      {/* Show both implementations for comparison */}
      {showComparison ? (
        <>
          {/* Original DevToolsBubbleWithPlugins */}
          <DevToolsBubbleWithPlugins
            userRole={userRole}
            environment={environment}
            hideEnvironment={hideEnvironment}
            hideUserStatus={hideUserStatus}
            hideWifiToggle={true}
            enablePositionPersistence={false} // Disable persistence for first one to avoid conflicts
            onStatusPress={() => console.log('Original: Status pressed!')}
            onEnvironmentPress={() =>
              console.log('Original: Environment pressed!')
            }
            queryClient={queryClient}
            plugins={[wifiTogglePlugin, reactQueryPlugin]}
          />

          {/* NEW FloatingTools implementation from rn-better-dev-tools */}
          <View style={styles.floatingToolsContainer}>
            <FloatingTools enablePositionPersistence={false}>
              {!hideEnvironment && environment && (
                <>
                  <EnvironmentIndicator environment={environment} />
                  {!hideUserStatus && <Divider />}
                </>
              )}
              {!hideUserStatus && userRole && (
                <>
                  <UserStatus
                    userRole={userRole}
                    onPress={() =>
                      console.log('NEW FloatingTools: Status pressed!')
                    }
                  />
                </>
              )}
            </FloatingTools>
          </View>
        </>
      ) : (
        // Show only NEW FloatingTools
        <FloatingTools enablePositionPersistence={enablePositionPersistence}>
          {!hideEnvironment && environment && (
            <>
              <EnvironmentIndicator environment={environment} />
              {!hideUserStatus && <Divider />}
            </>
          )}
          {!hideUserStatus && userRole && (
            <>
              <UserStatus
                userRole={userRole}
                onPress={() => console.log('Status pressed!')}
              />
            </>
          )}
        </FloatingTools>
      )}
      <ScrollView style={styles.container}>
        {/* Toggle between implementations */}
        <View style={styles.implementationToggle}>
          <Text style={styles.toggleTitle}>
            {showComparison
              ? 'Comparison Mode: Both Visible'
              : 'Single Mode: FloatingTools Only'}
          </Text>
          <Button
            title={showComparison ? 'Show Single' : 'Show Comparison'}
            onPress={() => setShowComparison(!showComparison)}
            color="#8B5CF6"
          />
          <Text style={styles.toggleDescription}>
            {showComparison
              ? 'Top: Original DevToolsBubbleWithPlugins | Bottom: NEW FloatingTools'
              : 'Single NEW FloatingTools instance'}
          </Text>
        </View>

        <OnlineStatusIndicator />
        <Button
          title="Toggle WiFi"
          onPress={() => {
            const currentState = onlineManager.isOnline();
            const newState = !currentState;
            onlineManager.setOnline(newState);
          }}
          color="#6366F1"
        />
        <ExampleDataFetcher />

        <View style={styles.settingsContainer}>
          <Text style={styles.mainTitle}>Bubble Visibility Settings</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Environment</Text>
            <Switch
              value={!hideEnvironment}
              onValueChange={(value) => setHideEnvironment(!value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={!hideEnvironment ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show User Status</Text>
            <Switch
              value={!hideUserStatus}
              onValueChange={(value) => setHideUserStatus(!value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={!hideUserStatus ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show WiFi Toggle</Text>
            <Switch
              value={!hideWifiToggle}
              onValueChange={(value) => setHideWifiToggle(!value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={!hideWifiToggle ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Position Persistence</Text>
            <Switch
              value={enablePositionPersistence}
              onValueChange={setEnablePositionPersistence}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={enablePositionPersistence ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Text style={styles.sectionTitle}>User Role</Text>
          <View style={styles.buttonRow}>
            <Button
              title="Admin"
              onPress={() => setUserRole('admin')}
              color="#10B981"
            />
            <Button
              title="Internal"
              onPress={() => setUserRole('internal')}
              color="#6366F1"
            />
            <Button
              title="User"
              onPress={() => setUserRole('user')}
              color="#6B7280"
            />
          </View>

          <Text style={styles.sectionTitle}>Environment</Text>
          <View style={styles.buttonRow}>
            <Button
              title="Local"
              onPress={() => setEnvironment('local')}
              color="#06B6D4"
            />
            <Button
              title="Dev"
              onPress={() => setEnvironment('dev')}
              color="#F97316"
            />
            <Button
              title="QA"
              onPress={() => setEnvironment('qa')}
              color="#8B5CF6"
            />
            <Button
              title="Staging"
              onPress={() => setEnvironment('staging')}
              color="#10B981"
            />
            <Button
              title="Prod"
              onPress={() => setEnvironment('prod')}
              color="#DC2626"
            />
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.buttonRow}>
            <Button
              title="Hide All"
              onPress={() => {
                setHideEnvironment(true);
                setHideUserStatus(true);
                setHideWifiToggle(true);
              }}
              color="#EF4444"
            />
            <Button
              title="Show All"
              onPress={() => {
                setHideEnvironment(false);
                setHideUserStatus(false);
                setHideWifiToggle(false);
              }}
              color="#10B981"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function App() {
  return (
    <QueryClientWrapper queryClient={queryClient}>
      <AppContent />
    </QueryClientWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  floatingToolsContainer: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
  },
  container: {
    paddingTop: 75,
    paddingBottom: 150,
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  implementationToggle: {
    margin: 20,
    padding: 15,
    backgroundColor: '#F3E8FF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    gap: 10,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B21A8',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#6B21A8',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  statusContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusDotOnline: {
    backgroundColor: '#10B981',
  },
  statusDotOffline: {
    backgroundColor: '#DC2626',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
  settingsContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    padding: 20,
    gap: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  dataContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginVertical: 10,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  dataBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
});

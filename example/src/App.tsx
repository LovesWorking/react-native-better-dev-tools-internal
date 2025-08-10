import { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import {
  DevToolsBubble,
  type UserRole,
} from 'react-native-better-dev-tools-internal';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>('admin');

  return (
    <View style={styles.container}>
      <DevToolsBubble
        userRole={userRole}
        environment="dev"
        onStatusPress={() => console.log('Status pressed!')}
        onEnvironmentPress={() => console.log('Environment pressed!')}
      />
      
      <View style={styles.buttonContainer}>
        <Button
          title="Set Admin"
          onPress={() => setUserRole('admin')}
          color="#10B981"
        />
        <Button
          title="Set Internal"
          onPress={() => setUserRole('internal')}
          color="#6366F1"
        />
        <Button
          title="Set User"
          onPress={() => setUserRole('user')}
          color="#6B7280"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});
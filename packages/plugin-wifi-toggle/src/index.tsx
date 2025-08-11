import { useState, useEffect } from 'react';
import { TouchableOpacity, type ViewStyle } from 'react-native';
import { onlineManager } from '@tanstack/react-query';
import type { DevToolsPlugin, PluginContext } from 'react-native-better-dev-tools-internal';
import Svg, { Path } from 'react-native-svg';

// WiFi Icon component
function WifiIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <Path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <Path d="M12 20h.01" />
    </Svg>
  );
}

// WiFi Off Icon component
function WifiOffIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="m3 3 18 18" />
      <Path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <Path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <Path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <Path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <Path d="M12 20h.01" />
    </Svg>
  );
}

/**
 * WifiToggle component for the plugin
 */
function WifiToggleComponent({
  context,
  isDragging,
}: {
  context: PluginContext;
  isDragging?: boolean;
}) {
  const { queryClient } = context;

  // Initialize state with current online status
  const [isOnline, setIsOnline] = useState(() => {
    return onlineManager.isOnline();
  });

  // Subscribe to online status changes
  useEffect(() => {
    const unsubscribe = onlineManager.subscribe((online: boolean) => {
      console.log('[WifiToggle Plugin] Online status changed to:', online);
      setIsOnline(online);

      // Notify other plugins
      context.events.emit('wifi:status-changed', { online });
    });

    return unsubscribe;
  }, [context.events]);

  const handleWifiToggle = () => {
    const newStatus = !isOnline;
    console.log('[WifiToggle Plugin] Toggling WiFi to:', newStatus ? 'Online' : 'Offline');

    // Use setOnline to change the status
    onlineManager.setOnline(newStatus);

    // Log query cache info if available
    if (queryClient) {
      const queries = queryClient.getQueryCache().getAll();
      console.log('[WifiToggle Plugin] Active queries:', queries.length);

      // Notify host about the toggle
      context.notifyHost({
        type: 'wifi:toggled',
        online: newStatus,
        queriesCount: queries.length,
      });
    }
  };

  const buttonStyle: ViewStyle = {
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`WiFi ${isOnline ? 'On' : 'Off'}`}
      accessibilityHint={`Tap to turn WiFi ${isOnline ? 'off' : 'on'} for React Query`}
      onPress={handleWifiToggle}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      disabled={isDragging}
      activeOpacity={0.7}
      style={buttonStyle}
    >
      {isOnline ? (
        <WifiIcon size={16} color="#10B981" />
      ) : (
        <WifiOffIcon size={16} color="#DC2626" />
      )}
    </TouchableOpacity>
  );
}

/**
 * WiFi Toggle Plugin
 * Allows toggling React Query's online/offline state
 */
export const wifiTogglePlugin: DevToolsPlugin = {
  id: 'wifi-toggle',
  name: 'WiFi Toggle',

  // Use WiFi icon
  icon: WifiIcon,

  // Component for bubble view
  component: WifiToggleComponent,

  // No modal needed for this simple toggle
  modalComponent: undefined,

  // React Query with onlineManager is always available since it's a peer dep
  checkAvailability: () => true,

  // Plugin lifecycle
  onMount: async (context) => {
    console.log('[WifiToggle Plugin] Mounted');

    const isOnline = onlineManager.isOnline();
    console.log('[WifiToggle Plugin] Initial online state:', isOnline);
    
    // Save initial state to storage
    await context.storage.set('wifi-toggle:last-state', isOnline);
  },

  onUnmount: async () => {
    console.log('[WifiToggle Plugin] Unmounted');
  },

  // Default configuration
  defaultConfig: {
    enabled: true,
    settings: {
      showInBubble: true,
      persistState: false,
    },
  },
};

export default wifiTogglePlugin;
// Import type only - removed at runtime
import type { QueryClient } from '@tanstack/react-query';

export type UserRole = 'admin' | 'internal' | 'user';

export type Environment = 'local' | 'dev' | 'qa' | 'staging' | 'prod';

export interface DevToolsBubbleProps {
  /**
   * The current user's role in the application
   * Used to display user status indicator in the bubble
   * @example "admin" | "internal" | "user"
   */
  userRole?: UserRole;

  /**
   * The current application environment
   * Used to display environment indicator in the bubble
   * @example "local" | "dev" | "qa" | "staging" | "prod"
   */
  environment?: Environment;

  /**
   * Hide the environment indicator in the bubble
   * @default false
   */
  hideEnvironment?: boolean;

  /**
   * Hide the user status indicator in the bubble
   * Only applies when userRole prop is provided
   * @default false
   */
  hideUserStatus?: boolean;

  /**
   * Hide the WiFi toggle button in the bubble
   * Only works when @tanstack/react-query is installed
   * @default false
   */
  hideWifiToggle?: boolean;

  /**
   * Enable persisting bubble position to AsyncStorage (if available)
   * When AsyncStorage is not installed, falls back to in-memory storage
   * @default true
   */
  enablePositionPersistence?: boolean;

  /**
   * Callback when user status is pressed
   */
  onStatusPress?: () => void;

  /**
   * Callback when environment indicator is pressed
   */
  onEnvironmentPress?: () => void;

  /**
   * QueryClient instance from @tanstack/react-query
   * Required for WiFi toggle functionality
   * Pass this to enable toggling React Query's online/offline state
   */
  queryClient?: QueryClient;
}
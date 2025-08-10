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
   * Callback when user status is pressed
   */
  onStatusPress?: () => void;

  /**
   * Callback when environment indicator is pressed
   */
  onEnvironmentPress?: () => void;
}
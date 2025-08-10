import {
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import type { UserRole } from '../types';

interface UserStatusProps {
  userRole: UserRole;
  onPress?: () => void;
  isDragging: boolean;
}

function getUserStatusConfig(userRole: UserRole) {
  switch (userRole) {
    case 'admin':
      return {
        label: 'Admin',
        dotColor: '#10B981',
        textColor: '#10B981',
      };
    case 'internal':
      return {
        label: 'Internal',
        dotColor: '#6366F1',
        textColor: '#A5B4FC',
      };
    case 'user':
    default:
      return {
        label: 'User',
        dotColor: '#6B7280',
        textColor: '#9CA3AF',
      };
  }
}

export function UserStatus({ userRole, onPress, isDragging }: UserStatusProps) {
  const statusConfig = getUserStatusConfig(userRole);

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexShrink: 0,
  };

  const dotStyle: ViewStyle = {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: statusConfig.dotColor,
    marginRight: 4,
  };

  const textStyle: TextStyle = {
    fontSize: 10,
    fontWeight: '500',
    color: statusConfig.textColor,
    letterSpacing: 0.3,
  };

  if (!onPress) {
    return (
      <View style={containerStyle}>
        <View style={dotStyle} />
        <Text style={textStyle}>{statusConfig.label}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      disabled={isDragging}
      activeOpacity={0.85}
      style={containerStyle}
    >
      <View style={dotStyle} />
      <Text style={textStyle}>{statusConfig.label}</Text>
    </TouchableOpacity>
  );
}
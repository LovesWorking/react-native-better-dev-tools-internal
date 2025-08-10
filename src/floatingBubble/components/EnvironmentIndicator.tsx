import { Text, View, type ViewStyle, type TextStyle } from 'react-native';
import type { Environment } from '../types';

interface EnvironmentIndicatorProps {
  environment: Environment;
}

interface EnvironmentConfig {
  label: string;
  backgroundColor: string;
}

function getEnvironmentConfig(environment: Environment): EnvironmentConfig {
  switch (environment) {
    case 'local':
      return {
        label: 'LOCAL',
        backgroundColor: '#06B6D4', // Cyan
      };
    case 'dev':
      return {
        label: 'DEV',
        backgroundColor: '#F97316', // Orange
      };
    case 'qa':
      return {
        label: 'QA',
        backgroundColor: '#8B5CF6', // Purple
      };
    case 'staging':
      return {
        label: 'STAGING',
        backgroundColor: '#10B981', // Green
      };
    case 'prod':
      return {
        label: 'PROD',
        backgroundColor: '#DC2626', // Red
      };
    default:
      return {
        label: 'LOCAL',
        backgroundColor: '#06B6D4',
      };
  }
}

export function EnvironmentIndicator({ environment }: EnvironmentIndicatorProps) {
  const envConfig = getEnvironmentConfig(environment);

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexShrink: 0,
  };

  const dotStyle: ViewStyle = {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: envConfig.backgroundColor,
    marginRight: 6,
    shadowColor: envConfig.backgroundColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  };

  const textStyle: TextStyle = {
    fontSize: 11,
    fontWeight: '600',
    color: '#F9FAFB',
    letterSpacing: 0.5,
  };

  return (
    <View style={containerStyle}>
      <View style={dotStyle} />
      <Text style={textStyle}>{envConfig.label}</Text>
    </View>
  );
}
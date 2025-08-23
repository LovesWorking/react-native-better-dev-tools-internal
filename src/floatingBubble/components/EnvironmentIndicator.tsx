import { Text, View, type ViewStyle, type TextStyle } from 'react-native';
import type { Environment } from '../types';
import { gameUIColors } from '../../../rn-better-dev-tools/src/shared/ui/gameUI/constants/gameUIColors';

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
        backgroundColor: gameUIColors.info,
      };
    case 'dev':
      return {
        label: 'DEV',
        backgroundColor: gameUIColors.warning,
      };
    case 'qa':
      return {
        label: 'QA',
        backgroundColor: gameUIColors.optional,
      };
    case 'staging':
      return {
        label: 'STAGING',
        backgroundColor: gameUIColors.success,
      };
    case 'prod':
      return {
        label: 'PROD',
        backgroundColor: gameUIColors.error,
      };
    default:
      return {
        label: 'LOCAL',
        backgroundColor: gameUIColors.info,
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
    color: gameUIColors.primaryLight,
    letterSpacing: 0.5,
  };

  return (
    <View style={containerStyle}>
      <View style={dotStyle} />
      <Text style={textStyle}>{envConfig.label}</Text>
    </View>
  );
}
const path = require('path');
const { getConfig } = require('react-native-builder-bob/babel-config');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

module.exports = function (api) {
  api.cache(true);

  return getConfig(
    {
      presets: [
        [
          'babel-preset-expo',
          {
            jsxImportSource: 'react',
            // Disable reanimated plugin since we migrated to React Native's Animated API
            // babel-preset-expo includes reanimated by default which causes build errors
            // even when reanimated isn't installed as a dependency
            reanimated: false,
          },
        ],
      ],
    },
    { root, pkg }
  );
};

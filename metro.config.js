const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resetCache: true,
  resolver: {
    extraNodeModules: {
      '@features': path.resolve(__dirname, 'package/src/features'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

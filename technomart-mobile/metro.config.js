const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.watchFolders = Array.from(
  new Set([...(config.watchFolders || []), path.resolve(__dirname, '..')])
);

config.resolver = config.resolver || {};
config.resolver.nodeModulesPaths = Array.from(
  new Set([path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '..', 'node_modules')])
);

module.exports = withNativeWind(config, { input: './global.css' });

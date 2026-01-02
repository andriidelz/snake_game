const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@reown/appkit': path.resolve(__dirname, 'node_modules/@reown/appkit'),
  '@reown/appkit/core': path.resolve(__dirname, 'node_modules/@reown/appkit/dist/esm/exports/core.js'),
  '@reown/appkit/react-native': path.resolve(__dirname, 'node_modules/@reown/appkit/dist/esm/exports/react-native.js'),

  '../core/Address.js': path.resolve(__dirname, 'node_modules/viem/_types/types/address.js'),
  '../core/Bytes.js': path.resolve(__dirname, 'node_modules/viem/_types/types/bytes.js'),
  '../core/Errors.js': path.resolve(__dirname, 'node_modules/viem/_types/errors/index.js'),
  '../core/Hex.js': path.resolve(__dirname, 'node_modules/viem/_types/types/hex.js'),
  
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer/'),
  crypto: require.resolve('react-native-crypto'),

  '@noble/hashes/crypto': path.resolve(__dirname, 'node_modules/@noble/hashes/crypto.js'),
};   

config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

config.resolver.extraNodeModules['../core/Address.js'] = path.resolve(__dirname, 'node_modules/viem/_types/core/Address.js');

module.exports = config;
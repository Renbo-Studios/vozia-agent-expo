const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch the @vozia/agent package for changes
const agentPackagePath = path.resolve(__dirname, '../packages/agent');

config.watchFolders = [agentPackagePath];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(agentPackagePath, 'node_modules'),
];

// Ensure Metro can resolve the symlinked package
config.resolver.extraNodeModules = {
  '@vozia/agent': agentPackagePath,
};

module.exports = config;

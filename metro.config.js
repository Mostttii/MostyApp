const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { resolver: { sourceExts, assetExts } } = config;

  return {
    ...config,
    transformer: {
      ...config.transformer,
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      ...config.resolver,
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      extraNodeModules: {
        // Polyfills for node modules
        stream: require.resolve('readable-stream'),
        util: require.resolve('util/'),
        url: require.resolve('whatwg-url'),
        assert: require.resolve('assert/'),
        buffer: require.resolve('buffer/'),
      },
    },
  };
})(); 
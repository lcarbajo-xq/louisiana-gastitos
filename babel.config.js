module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated plugin should be listed last if installed
      // 'react-native-reanimated/plugin',
    ]
  }
}

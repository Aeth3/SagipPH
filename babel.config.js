module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          package: './package',
          '@features': './package/src/features',
        },
      },
    ],
    ['module:react-native-dotenv', { moduleName: '@env', path: '.env' }],
    'react-native-reanimated/plugin', // must be last
  ],
};

/** @format */

const Webpack = require('webpack');
const resolveTsconfigPaths = require('../tsconfig-paths-to-webpack-alias');

module.exports = {
  stories: ['../apps/portal/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-viewport/register',
    '@storybook/addon-knobs/register',
    '@storybook/addon-actions/register',
    '@storybook/addon-links/register',
    // 'storybook-addon-i18n/register',
    // 'storybook-addon-material-ui/register',
    '@storybook/addons',
    {
      name: '@storybook/preset-typescript',
      // options: {
      //   tsLoaderOptions: {
      //     configFile: '../apps/portal/tsconfig.json',
      //   }
      // }
    }
  ],
  webpackFinal: async (config) => {

    config.plugins = [
      ...(config.plugins || []),
      new Webpack.DefinePlugin({
        __DEV__: JSON.stringify(true),
        __PRODUCTION__: JSON.stringify(false),
        __TEST__: JSON.stringify(process.env.NODE_ENV === 'test'),
        __SERVER__: JSON.stringify(false),
      }),
    ];

    config.resolve = {
      ...(config.resolve || []),
      alias: {
        ...config.resolve.alias,
        ...resolveTsconfigPaths({ tsconfigPaths: '../tsconfig.json' }),
      },
    };

    console.log(config);
    // config.plugins.forEach((plugin) => plugin instanceof Webpack.NormalModuleReplacementPlugin && console.log(plugin.newResource));

    return config;
  },
};

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
    'storybook-addon-i18n/register',
    'storybook-addon-material-ui/register',
    '@storybook/addons',
    {
      name: '@storybook/preset-typescript',
      options: {
        tsLoaderOptions: {
          configFile: '../apps/portal/tsconfig.app.json',
        }
      }
    }
  ],
  webpackFinal: async (config) => {

    config.plugins = [
      ...(config.plugins || []),
      new Webpack.IgnorePlugin({
        resourceRegExp: /next-i18next/
      }),
    ];

    config.resolve = {
      ...(config.resolve || []),
      alias: {
        ...config.resolve.alias,
        ...resolveTsconfigPaths({ tsconfigPaths: '../apps/portal/tsconfig.app.json' }),
      },
    };

    console.log(config);

    return config;
  },
};

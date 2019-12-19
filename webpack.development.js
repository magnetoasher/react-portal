/** @format */

// const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = (original) => {
  return {
    watch: true,
    target: 'node',
    externals: [nodeExternals({ whitelist: ['webpack/hot/poll?100'] })],
    devServer: {
      inline: true,
      hot: true,
    },
    plugins: [
      ...(original.plugins || []),
      new webpack.IgnorePlugin({
        /**
         * There is a small problem with Nest's idea of lazy require() calls,
         * Webpack tries to load these lazy imports that you may not be using,
         * so we must explicitly handle the issue.
         * Refer to: https://github.com/nestjs/nest/issues/1706
         */
        checkResource(resource) {
          const lazyImports = [
            // '@nestjs/microservices',
            // '@nestjs/platform-express',
            // 'class-validator',
            // 'class-transformer',
            // 'google-libphonenumber',
            // '@nestjs/graphql',
            // 'cache-manager',
            // 'typeorm',
            // 'graphql',
          ];
          if (!lazyImports.includes(resource)) {
            return false;
          }
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
          return false;
        },
      }),
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
    ],
    stats: {
      // This is optional, but it hides noisey warnings
      warningsFilter: [
        'node_modules/express/lib/view.js',
        'node_modules/@nestjs/common/utils/load-package.util.js',
        'node_modules/@nestjs/core/helpers/load-adapter.js',
        'node_modules/optional/optional.js',
        (/* warning */) => false,
      ],
    },
  };
};

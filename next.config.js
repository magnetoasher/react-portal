/** @format */
/* eslint no-param-reassign: 0, @typescript-eslint/explicit-function-return-type: 0 */

// #region Imports NPM
const { join } = require('path');
const DotenvWebpackPlugin = require('dotenv-webpack');

// const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');

// const withImages = require('next-images');
const optimizedImages = require('next-optimized-images');

const withCSS = require('@zeit/next-css');
const withSass = require('@zeit/next-sass');

const withFonts = require('next-fonts');

const withPlugins = require('next-compose-plugins');
const Webpack = require('webpack');
// #endregion
// #region Imports Local
// #endregion

function withCustomWebpack(conf = {}) {
  const { webpack } = conf;

  conf.webpack = (config, { /* buildId, */ dev, isServer /* , defaultLoaders */, ...rest }) => {
    config.plugins = [
      ...(config.plugins || []),
      new Webpack.DefinePlugin({
        __DEV__: JSON.stringify(dev),
        __SERVER__: JSON.stringify(isServer),
      }),
      new DotenvWebpackPlugin({ path: join(__dirname, '.env') }),
    ];

    config.module.rules = [...(config.module.rules || []), ...[]];

    config.module.rules.forEach((rule) => {
      if (Array.isArray(rule.use)) {
        rule.use.forEach((m) => {
          if (m.loader === 'css-loader' && m.options && Object.keys(m.options).includes('minimize')) {
            // console.warn('HACK: Removing `minimize` option from `css-loader` entries in Webpack config');
            delete m.options.minimize;
          }
        });
      }
    });

    // eslint-disable-next-line no-debugger
    // debugger;
    // console.log(isServer ? 'Server' : 'Client', config);

    return webpack(config, { isServer, ...rest });
  };

  return conf;
}

const plugins = [
  [
    optimizedImages,
    {
      // these are the default values so you don't have to provide them if they are good enough for your use-case.
      // but you can overwrite them here with any valid value you want.
      inlineImageLimit: 8000,
      imagesFolder: 'images',
      imagesName: '[name]-[hash].[ext]',
      handleImages: ['jpeg', 'png', /* 'svg', */ 'webp', 'gif'],
      optimizeImages: true,
      optimizeImagesInDev: true,
      mozjpeg: {
        quality: 80,
      },
      optipng: {
        optimizationLevel: 3,
      },
      pngquant: false,
      gifsicle: {
        interlaced: true,
        optimizationLevel: 3,
      },
      svgo: {
        // enable/disable svgo plugins here
      },
      webp: {
        preset: 'default',
        quality: 75,
      },
    },
  ],
  [
    withCSS,
    {
      // cssModules: true,
      // cssLoaderOptions: {
      //   importLoaders: true,
      // },
      postcssLoaderOptions: {},
    },
  ],
  [withSass /* , { cssModules: true } */],
  [withFonts, { enableSvg: false }],
  // [withBundleAnalyzer],
  [withCustomWebpack],
];

const config = {
  devIndicators: {
    autoPrerender: false,
  },
  poweredByHeader: false,
  analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
  analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
  // bundleAnalyzerConfig: {
  //   server: {
  //     analyzerMode: 'static',
  //     reportFilename: '../bundles/server.html'
  //   },
  //   browser: {
  //     analyzerMode: 'static',
  //     reportFilename: '../bundles/client.html'
  //   }
  // },
};

module.exports = withPlugins(plugins, config);

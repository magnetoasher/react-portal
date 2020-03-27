/** @format */
/* eslint global-require:0 */

// const resolveTsconfigPaths = require('./tsconfig-paths-to-webpack-alias');

const { NODE_ENV = 'development' } = process.env;

console.log(`-- Webpack <${NODE_ENV}> build --`);

module.exports = (options) => {
  const config =
    NODE_ENV === 'production'
      ? require('./webpack.production.js')(options)
      : require('./webpack.development.js')(options);
  const entry = NODE_ENV !== 'production' ? ['webpack/hot/poll?100', options.entry] : [options.entry];

  const c = {
    ...options,
    ...config,
    entry: [...entry],
    plugins: [...config.plugins],
    stats: { ...config.stats },
  };

  // c.resolve.alias = {
  //   ...c.resolve.alias,
  //   ...resolveTsconfigPaths({ tsconfigPaths: './tsconfig.json' }),
  // };

  // Babel
  c.module.rules.unshift({
    test: /.tsx?$/,
    use: [{ loader: 'babel-loader' }],
  });

  // console.log('Config.module.rules:', c.module.rules);
  // c.module.rules.forEach((rule) => {
  //   console.log(`Config.module.rules.use "${rule.test}":`, rule.use);
  // });

  // console.log('Options:', options);
  // console.log('Config:', c);

  return c;
};

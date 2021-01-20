const BundleTracker = require("webpack-bundle-tracker");

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.plugins.push(
    new BundleTracker({
      path: __dirname,
      filename: "./build/webpack-stats.prod.json",
    })
  );
  config.optimization.splitChunks.name = 'vendors';
  return config;
};

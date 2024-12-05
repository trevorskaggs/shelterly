const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function override(config, env) {
  config.optimization.runtimeChunk = false;
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false
    }
  }

  // Force single output file for JavaScript
  config.output = {
    ...config.output,
    filename: 'static/js/main.js', // All JS goes into this file
    chunkFilename: 'static/js/[name].js', // Ensure no extra chunk files
  };

  // Remove splitChunks from loaders to prevent JS chunk creation
  config.module.rules = config.module.rules.map((rule) => {
    if (rule.oneOf) {
      rule.oneOf = rule.oneOf.map((loader) => {
        if (loader.options && loader.options.cacheGroups) {
          delete loader.options.cacheGroups;
        }
        return loader;
      });
    }
    return rule;
  });

  // Find and update MiniCssExtractPlugin options
  config.plugins = config.plugins.map((plugin) => {
    if (plugin instanceof MiniCssExtractPlugin) {
      return new MiniCssExtractPlugin({
        filename: 'static/css/[name].css',
        chunkFilename: 'static/css/[name].chunk.css',
      });
    }
    return plugin;
  });

  return config;
};
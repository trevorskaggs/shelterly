module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.optimization.splitChunks.name = 'vendors';
  config.output = {
    ...config.output,
    chunkFilename: 'static/js/[name].chunk.js'
  }
  return config;
};
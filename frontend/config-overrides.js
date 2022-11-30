module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.output = {
    ...config.output,
    chunkFilename: 'static/js/[name].chunk.js'
  }
  return config;
};
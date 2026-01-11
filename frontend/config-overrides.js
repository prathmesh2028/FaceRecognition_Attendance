 const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "fs": false,
        "crypto": false,
        "path": false,
        "os": false,
        "stream": false,
        "buffer": false,
        "util": false
    });
    config.resolve.fallback = fallback;
    return config;
};

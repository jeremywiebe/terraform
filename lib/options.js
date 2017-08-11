var path = require('path')
var _ = require('lodash')

var root = process.cwd()
var config = require(path.resolve(root, 'package.json'))

module.exports = _.merge({
    processors: {
        ejs: {},
        jade: {},
        md: {}
    }
}, config.harp)
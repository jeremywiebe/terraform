var pug = require('pug')
var TerraformError = require("../../error").TerraformError
const path = require('path')
const resolve = require('resolve')

var resolver = function(){

  return {
    /**
     * This allows us to resolve files in node_modules
     * @url https://github.com/pugjs/pug/issues/2164
     * @url https://github.com/markbrouch/pug-plugin-modules
     *
     * @param {string} filename - the name of the file being imported, could be
     * of the form "../path/to/file" or "package_name/path/to/file" or "./file"
     * @param {string} source - the name of the file that is doing the import
     * @param {object} options - options object provided by Pug
     */
    resolve(filename, source, options){

      const file = path.parse(filename)

      // Remove file extension
      file.ext = ""
      file.base = file.name

      let resolvePath
      let basedir = path.dirname(source)

      if (!file.dir && file.dir[0] !== path.sep && file.dir[0] !== ".") {
        resolvePath = file.name
      } else {
        if (file.dir[0] === path.sep) {
          file.dir = `.${file.dir}`
          file.root = `.${file.root}`
          basedir = options.basedir
        }
        resolvePath = path.format(file)
      }

      return resolve.sync(resolvePath, {
          basedir,
          extensions: [".pug", ".jade"],
          packageFilter(pkg) {
            return Object.assign({}, pkg, {
              main: pkg.pug || pkg.main
            })
          }
      })
    }
  }
}

module.exports = function(fileContents, options){

  return {
    compile: function(){

      return pug.compile(fileContents, {
        filename: options.filename,
        basedir: options.basedir,
        plugins: [resolver()]
      })
    },

    parseError: function(error){
      console.log(error.message)

      var arr = error.message.split("\n")
      var path_arr = arr[0].split(":")

      error.lineno    = parseInt(error.lineno || path_arr[path_arr.length -1] || -1)
      error.message   = arr[arr.length - 1]
      error.name      = error.name
      error.source    = "Jade"
      error.dest      = "HTML"
      error.filename  = error.path || options.filename
      error.stack     = fileContents.toString()

      return new TerraformError(error)
    }
  }

}

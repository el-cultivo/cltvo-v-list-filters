/**
 * Sets Karma Test Context
 * @type {[type]}
 */
var context = require.context('./specs', true, /-spec\.js$/);
context.keys().forEach(context)

// var vue = require.context('./vue', true, /\.js$/)//descomentar para ver la cobertura de esta carpeta, también
// require.context('./vue', true, /\.js$/).keys().forEach(vue)

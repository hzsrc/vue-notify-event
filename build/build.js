var path = require('path')
var fs = require('fs')
var UglifyJS = require('uglify-js');

var fn = 'index.js'
var js = fs.readFileSync(__dirname + '/../src/index.js', 'utf8')

var start = new Date()
var jsOut = UglifyJS.minify({ [fn]: js }, {
    sourceMap: {
        filename: fn,
        //url: url,
        includeSources: false
    },
    output: {
        comments: /licen[s]e|copyright/i
    }
});
if (jsOut.error) throw new Error(jsOut.error)

var usedMs = new Date() - start
if (usedMs > 500) console.log(fn + '... ' + usedMs + 'ms');

var dist = __dirname + '/../dist/'
if (!fs.existsSync(dist)) fs.mkdirSync(dist)
fs.writeFileSync(dist + fn, jsOut.code, 'utf8')


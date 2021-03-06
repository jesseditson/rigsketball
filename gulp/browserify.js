var browserify = require('browserify')
var browserSync = require('browser-sync')
var watchify = require('watchify')
var gulp = require('gulp')
var source = require('vinyl-source-stream')
var reactify = require('reactify')
var gutil = require('gulp-util')

var config = {}

var browserifyTask = function(devMode, admin) {

  var file = (admin ? 'admin' : 'main') + '.js'

  var b = browserify({
    entries: ['app/' + file],
    debug: devMode,
    transform: [[reactify, {es6: true}]]
  })

  var bundle = function() {

    return b
      .bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source(file))
      // Specify the output destination
      .pipe(gulp.dest('public/js/'))
      .pipe(browserSync.reload({
        stream: true
      }))
  }

  if (devMode) {
    // Wrap with watchify and rebundle on changes
    b = watchify(b)
      // Rebundle on update
    b.on('update', bundle)
  }

  return bundle()

}

module.exports = browserifyTask

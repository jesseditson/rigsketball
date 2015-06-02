var gulp = require('gulp')
var browserify = require('./gulp/browserify')
var gls = require('gulp-live-server')

gulp.task('serve', function () {
  var server = gls.new(['--harmony', 'server.js'])
  server.start();
  // currently causes a crash...
  // //use gulp.watch to trigger server actions(notify, start or stop)
  // gulp.watch(['public/**/*.css', 'views/**/*.ejs', 'app/**/*.js', 'app/**/*.jsx'], server.notify)
  // gulp.watch('server.js', server.start)
})

gulp.task('browserify', function() {
  return browserify(true)
})

gulp.task('default', ['browserify', 'serve'])

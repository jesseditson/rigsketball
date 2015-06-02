var gulp = require('gulp')
var browserify = require('./gulp/browserify')
var gls = require('gulp-live-server')

gulp.task('serve', function () {
  var server = gls.new(['--harmony', 'server.js'])
  server.start();
  //use gulp.watch to trigger server actions(notify, start or stop)
  gulp.watch(['public/**/*.css', 'views/**/*.ejs', 'app/**/*.js', 'api/**/*.js'], function() {
    console.log(arguments)
    server.notify.apply(server, arguments)
  })
  gulp.watch('server.js', server.start)
})

gulp.task('browserify', function() {
  return browserify(true)
})

gulp.task('default', ['browserify', 'serve'])

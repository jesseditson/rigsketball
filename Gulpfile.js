var gulp = require('gulp'),
  browserify = require('gulp-browserify')

gulp.task('scripts', function() {

  gulp.src(['app/main.js'])
    .pipe(browserify({
      debug: true,
      transform: ['reactify', {
        "es6": true
      }]
    }))
    .pipe(gulp.dest('./public/'))

})

gulp.task('default', ['scripts'])

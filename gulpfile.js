var gulp = require('gulp'),
  rename = require('gulp-rename');

// run script through jshint
gulp.task('lint', function () {
  var jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish');

  return gulp.src('imagecrop.js')
    .pipe(jshint({ indent: 2 }))
    .pipe(jshint.reporter(stylish));
});

// minify javascript
gulp.task('js', function () {
  var uglify = require('gulp-uglify');

  return gulp.src('imagecrop.js')
    .pipe(uglify())
    .pipe(rename('imagecrop.min.js'))
    .pipe(gulp.dest('./dist/'));
});

// start a static web server
gulp.task('server', ['lint', 'js'], function () {
  var open = require('open'),
      static = require('node-static'),
      file = new static.Server('./');

  require('http').createServer(function (req, res) {
    req.addListener('end', function () {
      file.serve(req, res);
    }).resume();
  }).listen(3000);

  open('http://localhost:3000/demo.html');
});

gulp.task('default', ['lint', 'js']);
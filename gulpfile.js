var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
// var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
// var rename = require('gulp-rename');
// var concat = require('gulp-concat');
var notify = require('gulp-notify');
var cache = require('gulp-cache');
var livereload = require('gulp-livereload');
var browserify = require('gulp-browserify');
var react = require('gulp-react');
var del = require('del');
var plumber = require('gulp-plumber');

// http://markgoodyear.com/2014/01/getting-started-with-gulp/

var IN_BASE = 'src';
var OUT_BASE = 'dist';

var BOWER = 'bower_components';

var IN = {
  STYLES: IN_BASE + '/sass',
  SCRIPTS: IN_BASE + '/js',
  IMAGES: IN_BASE + '/img',
  FONTS: IN_BASE + '/fonts',
  JSX: IN_BASE + '/jsx',
};

var OUT = {
  STYLES: OUT_BASE + '/stylesheets',
  SCRIPTS: OUT_BASE + '/javascripts',
  IMAGES: OUT_BASE + '/images',
  FONTS: OUT_BASE + '/fonts',
  JSX: OUT_BASE + '/jsx',
};

gulp.task('browserify_scripts', function() {
  return gulp.src('lib/main.js')
    .pipe(plumber())
    .pipe(browserify({
      // insertGlobals: true
    }))
    .pipe(livereload())
    .pipe(plumber.stop())
    .pipe(gulp.dest(OUT.SCRIPTS));
});

gulp.task('styles', function() {

  return gulp.src(IN.STYLES + '/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
      compass: true,
      style: 'expanded',
      // sourcemap: null,
      trace: true,
    }))
    .pipe(autoprefixer({
      browsers: ['last 10 Chrome versions'],
      cascade: true,
      remove: true
    }))
    .on('error', function (err) { console.log(err.message); })
    .pipe(plumber.stop())
    .pipe(gulp.dest(OUT.STYLES))
    .pipe(notify({
      message: 'Styles task complete'
    }));
});

gulp.task('scripts', function() {
  return gulp.src(IN.SCRIPTS + '/**/*.js')
    // .pipe(jshint('.jshintrc'))
    // .pipe(jshint.reporter('default'))
     // .pipe(concat('main.js'))
    // .pipe(gulp.dest('dist/assets/js'))
    // .pipe(rename({suffix: '.min'}))
    // .pipe(uglify())
    .pipe(gulp.dest(OUT.SCRIPTS))
    .pipe(notify({
      message: 'Scripts task complete'
    }));
});

gulp.task('react', function() {
  return gulp.src(IN.JSX + '/**/*.jsx')
    .pipe(plumber())
    .pipe(react())
    .pipe(plumber.stop())
    .pipe(gulp.dest(OUT.JSX))
    .pipe(notify({ message: 'React task complete' }));
});

gulp.task('images', function() {
  return gulp.src(IN.IMAGES + '/**/*')
    // .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(OUT.IMAGES))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('fonts', function() {
  return gulp.src(IN.FONTS + '/**/*')
    .pipe(gulp.dest(OUT.FONTS))
    .pipe(notify({ message: 'Fonts task complete' }));
});

gulp.task('clean', function(cb) {
  del([OUT_BASE], cb);
});

gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch(IN.STYLES + '/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch(IN.SCRIPTS + '/**/*.js', ['scripts']);
  gulp.watch('lib/**/*.js', ['browserify_scripts']);
  gulp.watch(IN.JSX + '/**/*.jsx', ['react']);

  // Watch image files
  gulp.watch(IN.IMAGES + '/**/*', ['images']);

  // Watch font files
  gulp.watch(IN.FONTS + '/**/*', ['fonts']);

  // Create LiveReload server
  livereload.listen();

  gulp.watch([IN_BASE + '/**']).on('change', livereload.changed);
});


gulp.task('default', ['clean'], function() {
  gulp.start('styles', 'scripts', 'images', 'fonts', 'browserify_scripts', 'react', 'watch');
  // gulp.start();
});

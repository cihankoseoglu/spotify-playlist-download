// Guide
// http://markgoodyear.com/2014/01/getting-started-with-gulp/

// ########################################
// Modules
// ########################################
var gulp     = require('gulp'),
    sass         = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss    = require('gulp-minify-css'),
    jshint       = require('gulp-jshint'),
    uglify       = require('gulp-uglify'),
    imagemin     = require('gulp-imagemin'),
    // rename    = require('gulp-rename'),
    // concat    = require('gulp-concat'),
    notify       = require('gulp-notify'),
    cache        = require('gulp-cache'),
    livereload   = require('gulp-livereload'),
    browserify   = require('gulp-browserify'),
    react        = require('gulp-react'),
    del          = require('del'),
    plumber      = require('gulp-plumber'),
    gulpif       = require('gulp-if'),
    gStreamify   = require('gulp-streamify');



// ########################################
// Enviroment variable
// ########################################
var env = process.env.NODE_ENV || 'development';

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



// ########################################
// Helpers
// ########################################
var isProduction = function() {
  return env == 'production';
};



// ########################################
// Tasks
// ########################################

gulp.task('browserify_scripts', function() {
  return gulp.src('lib/main.js')
    .pipe(plumber())
    .pipe(gStreamify(browserify()))
    .pipe(plumber.stop())
    .pipe(gulpif(isProduction(), uglify()))
    .pipe(gulp.dest(OUT.SCRIPTS));
});

gulp.task('styles', function() {

  return gulp.src(IN.STYLES + '/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
      compass: true,
      style: isProduction ? 'compressed' : 'expanded',
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

    .pipe(gulpif(isProduction(), uglify()))
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
    .pipe(gulpif(isProduction(), uglify()))
    .pipe(gulp.dest(OUT.JSX))
    .pipe(notify({ message: 'React task complete' }));
});

gulp.task('images', function() {
  return gulp.src(IN.IMAGES + '/**/*')
    .pipe(gulpif(isProduction(), cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))))
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
  // livereload
  livereload.listen();

  gulp.watch([IN_BASE + '/**']).on('change', livereload.changed);
});


// ########################################
// Default
// ########################################
gulp.task('default', ['clean'], function() {
  gulp.start('styles', 'scripts', 'images', 'fonts', 'browserify_scripts', 'react');

  if(!isProduction())
    gulp.start('watch');
});

// ########################################
// Build
// ########################################
gulp.task('build', function() {
  env = 'production';
  gulp.start('default');
});
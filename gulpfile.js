/*global -$ */
'use strict';

// TODO
// [ ] browserify + react + es6ify
// [ ] jshint
// [ ] bundle scrips from views
// [ ] add watch
// [ ] check production build
// [ ] add nodewebkit compile custom
// [ ] add testing support
// [ ] Live reload

// ########################################
// Modules
// ########################################
var del               = require('del'),
    through2          = require('through2'),
    // transform      = require('vinyl-transform'),
    browserify        = require('browserify'),
    reactify          = require('reactify'),
    es6ify            = require('es6ify'),
    jshintStylish     = require('jshint-stylish'),
    nodeWebkitBuilder = require('node-webkit-builder'),
    mqpacker          = require('css-mqpacker'),
    autoprefixer      = require('autoprefixer-core'),
    mainBowerFiles    = require('main-bower-files'),
    wiredep           = require('wiredep').stream;

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  scope: ['devDependencies'],
  camelize: true,
  lazy: false,
});

// ########################################
// Variables
// ########################################

var ENV = {
  DEV : 1,
  PROD: 2
};

// current enviroment
var env = process.env.NODE_ENV === 'PROD' ? ENV.PROD : ENV.DEV;

var IN_BASE = 'src/';
var OUT_BASE = 'dist/';
var BOWER = 'bower_components/';

var IN  = {
  CSS   : IN_BASE + 'scss/',
  JS    : IN_BASE + 'js/',
  IMG   : IN_BASE + 'img/',
  FONTS : IN_BASE + 'fonts/',
  HTML  : IN_BASE + 'html/',
};

var OUT = {
  CSS   : OUT_BASE + 'css/',
  JS    : OUT_BASE + 'js/',
  IMG   : OUT_BASE + 'img/',
  FONTS : OUT_BASE + 'fonts/',
  HTML  : OUT_BASE
};


// ########################################
// Helpers
// ########################################
var isProduction = function() {
  return env === ENV.PROD;
};

var isDevelopment = function() {
  return env === ENV.DEV;
};


// ########################################
// Tasks
// ########################################

gulp.task('clean', function(cb) {
  del([OUT_BASE], cb);
});


// ####################
// CSS
// ####################
gulp.task('styles', function() {
  var processors = [
    // autoprefix css
    autoprefixer({
      browsers: ['last 4 Chrome versions'],
      cascade: true,
      remove: true,
    }),
    // combine identical media queries
    mqpacker({})
  ];

  return gulp.src(IN.CSS + '**/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10,
      includePaths: ['.'],
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.postcss(processors))
    .pipe($.
      if (isProduction(), $.minifyCss({
      keepSpecialComments: 0,
      processImport: true,
    })))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(OUT.CSS));
});


// ####################
// IMAGES
// ####################
gulp.task('images', function() {
  return gulp.src(IN.IMG + '**/*')
    .pipe($.if (isProduction(), $.cache(
        $.imagemin({
          optimizationLevel: 3,
          progressive: true,
          interlaced: true,
          svgoPlugins: [{
            cleanupIDs: false
          }] // don't remove IDs from SVGs
        })
      )))
    .pipe(gulp.dest(OUT.IMG));
});


// ####################
// FONTS
// ####################
gulp.task('fonts', function() {
  var fileTypes = '**/*.{eot,svg,ttf,woff,woff2}';

  return gulp.src(
    mainBowerFiles({
      includeDev: false,
      filter: fileTypes
    })
    .concat(IN.FONTS + fileTypes)
  )
    .pipe(gulp.dest(OUT.FONTS));
});


// ####################
// Javacript
// ####################
gulp.task('scripts', function() {

});

// https://medium.com/@sogko/gulp-browserify-the-gulp-y-way-bb359b3f9623
// https://github.com/hughsk/vinyl-transform/issues/1#issuecomment-74286901
// http://problematic.io/2015/02/26/using-babel-and-browserify-with-gulp/
// https://github.com/andreypopp/reactify
// https://github.com/thlorenz/es6ify
gulp.task('browserify', function() {

  // var browserified = transform(function(filename) {
  //   // var b = browserify(es6ify.runtime, {
  //   var b = browserify({
  //     extensions: ['.jsx'],
  //     debug: true,
  //     insertGlobalVars: true
  //   });

  //   // b.require(filename, { expose: 'app' });
  //   // b.transform(reactify({
  //   //   stripTypes: true,
  //   //   es6: true
  //   // }));

  //   b.transform(reactify);

  //   // b.transform(es6ify.configure(/.(jsx|js)$/));
  //   b.add(filename);
  //   return b.bundle();
  // });

  // return gulp.src(IN.JS + 'app.jsx')
  //   .pipe(browserified)
  //   // .pipe($.uglify())
  //   .pipe(gulp.dest(OUT.JS));

  return gulp.src(IN.JS + 'app.jsx')
    .pipe(through2.obj(function (file, enc, next) {
      browserify(file.path, {
          debug: isProduction(),
          insertGlobalVars: true
        })
        // .transform(require('babelify'))
        .transform(reactify)
        .bundle(function (err, res) {
          if (err) { return next(err); }

            file.contents = res;
              next(null, file);
          });
    })).on('error', function (error) {
      console.log(error.stack);
      this.emit('end');
    })
    .pipe($.rename('app.js'))
    .pipe(gulp.dest(OUT.JS));
});

gulp.task('jshint', function() {
  return gulp.src(IN.JS + '*.{js|jsx}')
    .pipe($.react()) // gulp-react :(
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});



// ####################
// HTML
// ####################
gulp.task('html', function() {

  var assets = $.useref.assets({
    searchPath: [
     'dist',
     '.'
    ]
  });

  return gulp.src(IN.HTML + '*.html')
    // inject bower depencies
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./,
    }))
    // .pipe(assets)
    // .pipe($.if('*.js', $.uglify()))
    // .pipe($.if('*.css', $.minifyCss({
    //   keepSpecialComments: 0,
    //   processImport: true,
    // })))
    // .pipe(assets.restore())
    // .pipe($.useref())
    // minify html
    .pipe($.if (isProduction(),
      $.minifyHtml({
        conditionals: false, // no need for IE specific tags
        loose: true
      })
    ))
    .pipe(gulp.dest(OUT.HTML));
});


gulp.task('watch', function() {
  // bower.json
  // package.json
  // scripts
  // fonts
  // images
  // html
  gulp.watch(IN.CSS + '**/*.scss', ['styles']);
});

gulp.task('build', function() {
  env = ENV.PROD;
  // gulp.start('default');
});

// gulp.task('browserify_scripts', function() {
//   return gulp.src('lib/main.js')
//     .pipe(plumber())
//     .pipe(gStreamify(browserify()))
//     .pipe(plumber.stop())
//     .pipe(gulpif(isProduction(), uglify()))
//     .pipe(gulp.dest(OUT.SCRIPTS));
// });

// gulp.task('scripts', function() {
//   return gulp.src(IN.SCRIPTS + '/**/*.js')
//     // .pipe(jshint('.jshintrc'))
//     // .pipe(jshint.reporter('default'))
//      // .pipe(concat('main.js'))
//     // .pipe(gulp.dest('dist/assets/js'))
//     // .pipe(rename({suffix: '.min'}))

//     .pipe(gulpif(isProduction(), uglify()))
//     .pipe(gulp.dest(OUT.SCRIPTS))
//     .pipe(notify({
//       message: 'Scripts task complete'
//     }));
// });


// gulp.task('react', function() {
//   return gulp.src(IN.JSX + '/**/*.jsx')
//     .pipe(plumber())
//     .pipe(react())
//     .pipe(plumber.stop())
//     .pipe(gulpif(isProduction(), uglify()))
//     .pipe(gulp.dest(OUT.JSX))
//     .pipe(notify({ message: 'React task complete' }));
// });


// ########################################
// https://www.npmjs.com/package/gulp-useref

// var gulp = require('gulp');
// var $ = require('gulp-load-plugins')();
// var browserSync = require('browser-sync');
// var reload = browserSync.reload;

// gulp.task('styles', function () {
//   return gulp.src('app/styles/main.scss')
//     .pipe($.sourcemaps.init())
//     .pipe($.sass({
//       outputStyle: 'nested', // libsass doesn't support expanded yet
//       precision: 10,
//       includePaths: ['.'],
//       onError: console.error.bind(console, 'Sass error:')
//     }))
//     .pipe($.postcss([
//       require('autoprefixer-core')({browsers: ['last 1 version']})
//     ]))
//     .pipe($.sourcemaps.write())
//     .pipe(gulp.dest('.tmp/styles'))
//     .pipe(reload({stream: true}));
// });

// gulp.task('jshint', function () {
//   return gulp.src('app/scripts/**/*.js')
//     .pipe(reload({stream: true, once: true}))
//     .pipe($.jshint())
//     .pipe($.jshint.reporter('jshint-stylish'))
//     .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
// });

// gulp.task('html', ['styles'], function () {
//   var assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

//   return gulp.src('app/*.html')
//     .pipe(assets)
//     .pipe($.if('*.js', $.uglify()))
//     .pipe($.if('*.css', $.csso()))
//     .pipe(assets.restore())
//     .pipe($.useref())
//     .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
//     .pipe(gulp.dest('dist'));
// });

// gulp.task('images', function () {
//   return gulp.src('app/images/**/*')
//     .pipe($.cache($.imagemin({
//       progressive: true,
//       interlaced: true,
//       // don't remove IDs from SVGs, they are often used
//       // as hooks for embedding and styling
//       svgoPlugins: [{cleanupIDs: false}]
//     })))
//     .pipe(gulp.dest('dist/images'));
// });

// gulp.task('fonts', function () {
//   return gulp.src(
//       require('main-bower-files')({
//         includeDev: false,
//         filter: '**/*.{eot,svg,ttf,woff,woff2}'
//       }).concat('app/fonts/**/*')
//     )
//     .pipe(gulp.dest('.tmp/fonts'))
//     .pipe(gulp.dest('dist/fonts'));
// });

// gulp.task('extras', function () {
//   return gulp.src([
//     'app/*.*',
//     '!app/*.html'
//   ], {
//     dot: true
//   }).pipe(gulp.dest('dist'));
// });

// gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

// gulp.task('serve', ['styles', 'fonts'], function () {
//   browserSync({
//     notify: false,
//     port: 9000,
//     server: {
//       baseDir: ['.tmp', 'app'],
//       routes: {
//         '/bower_components': 'bower_components'
//       }
//     }
//   });

//   // watch for changes
//   gulp.watch([
//     'app/*.html',
//     'app/scripts/**/*.js',
//     'app/images/**/*',
//     '.tmp/fonts/**/*'
//   ]).on('change', reload);

//   gulp.watch('app/styles/**/*.scss', ['styles']);
//   gulp.watch('app/fonts/**/*', ['fonts']);
//   gulp.watch('bower.json', ['wiredep', 'fonts']);
// });

// // inject bower components
// gulp.task('wiredep', function () {
//   var wiredep = require('wiredep').stream;

//   gulp.src('app/styles/*.scss')
//     .pipe(wiredep({
//       ignorePath: /^(\.\.\/)+/
//     }))
//     .pipe(gulp.dest('app/styles'));

//   gulp.src('app/*.html')
//     .pipe(wiredep({
//       ignorePath: /^(\.\.\/)*\.\./
//     }))
//     .pipe(gulp.dest('app'));
// });

// gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras'], function () {
//   return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
// });

// gulp.task('default', ['clean'], function () {
//   gulp.start('build');
// });

/*********************************************************************************************************************
 *
 * SASS tasks.
 *
 *********************************************************************************************************************/

const gulp    = require( 'gulp' );
const plumber = require( 'gulp-plumber' );
const sass    = require( 'gulp-dart-sass' );
const glob    = require( 'gulp-sass-glob' );
const postcss = require( 'gulp-postcss' );
const revUrl  = require( 'gulp-rev-urls' );

// core stuff
const PATHS         = global.PATHS.sass;
const OUTPUT        = global.PATHS.build;
const errorHandler  = global.errorHandler;

/**
 * Compiles SASS for dev build.
 */
gulp.task( 'sass', () =>
{
  return  gulp.src( PATHS.source )
              .pipe( plumber({ errorHandler }))
              .pipe( glob() )
              .pipe( sass({ outputStyle: 'expanded' }))
              .pipe( postcss([
                require( 'autoprefixer' ),
                require( 'postcss-critical-css' )({
                  outputPath: OUTPUT,
                  minify:     false
                }),
                require( 'css-mqpacker' )({ sort: true })
              ]))
              .pipe( gulp.dest( OUTPUT ));
});

/**
 * Compiles SASS for production build.
 */
gulp.task( 'sass-build', gulp.series( 'sass', (function realSassBuild()
{
  return  gulp.src( `${OUTPUT}/*.css` )
              .pipe( postcss([
                require( 'postcss-sorting' ),
                require( 'cssnano' )({
                  safe: true,
                  autoprefixer: false
                })
              ]))
              .pipe( gulp.dest( OUTPUT ));
})));

/**
 * Post-revision hook.
 */
gulp.task( 'sass-postRev', () =>
{
  return  gulp.src( `${OUTPUT}/*.css` )
              .pipe( revUrl({
                manifest:   `${OUTPUT}/assets.json`,
                transform:  ( obj, key, val ) => obj[`/${key}`] = val
              }))
              .pipe( gulp.dest( OUTPUT ));
});

/* Expose ourselves */
module.exports = {
  init: [ 'sass' ],
  watch: {
    files: PATHS.watch,
    tasks: [ 'sass' ]
  },
  build: [ 'sass-build' ],
  noRev: [ 'critical*.css' ],
  afterRevision: [ 'sass-postRev' ]
}
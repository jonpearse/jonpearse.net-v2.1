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
const linter  = require( 'gulp-sass-lint' );

// core stuff
const PATHS  = global.PATHS.sass;
const OUTPUT = global.PATHS.build;
const { errorHandler } = require( '../utils/utils' );


/**
 * Does the basic SASS compilation stuff.
 */
function compileSass()
{
  return  gulp.src( PATHS.source )
              .pipe( plumber({ errorHandler: errorHandler }))
              .pipe( glob() )
              .pipe( sass({ outputStyle: 'expanded' }))
              .pipe( postcss([
                require( 'autoprefixer' ),
                require( 'postcss-short-border-radius' ),
                require( 'postcss-svg' )({ dirs: OUTPUT }),
                require( 'postcss-critical-css' )({
                  outputPath: OUTPUT,
                  minify:     false,
                  preserve:   false
                }),
                require( 'css-mqpacker' )({ sort: true })
              ]))
}

/**
 * Compiles SASS for dev build.
 */
gulp.task( 'sass', () => compileSass().pipe( gulp.dest( OUTPUT )));

/**
 * Compiles SASS for production build.
 */
gulp.task( 'sass-build', () =>
{
  return  gulp.src( `${OUTPUT}/*.css`)
              .pipe( plumber({ errorHandler }))
              .pipe( postcss([
                require( 'cssnano' )({ autoprefixer: false }),
                require( 'postcss-sorting' ),
                require( 'css-mqpacker' )({ sort: true })   // because postcss-critical-css avoids this the sass task
              ]))
              .pipe( gulp.dest( OUTPUT ));
});

/**
 * Linting task.
 */
gulp.task( 'sass-lint', () =>
{
  return  gulp.src( PATHS.source )
              .pipe( plumber({ errorHandler }))
              .pipe( linter() )
              .pipe( linter.format() )
              .pipe( linter.failOnError() );
})

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
    tasks: [ 'sass', 'sass-lint' ]
  },
  build: [ '!sass', 'sass-build' ],
  noRev: [ 'critical*.css' ],
  afterRevision: [ 'sass-postRev' ]
}

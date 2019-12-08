/*********************************************************************************************************************
 *
 * SASS tasks.
 *
 *********************************************************************************************************************/

const { src, dest, series } = require( 'gulp' );
const sass          = require( 'gulp-dart-sass' );
const postcss       = require( 'gulp-postcss' );
const revUrl        = require( 'gulp-rev-urls' );
const linter        = require( 'gulp-sass-lint' );

// core stuff
const { sass: PATHS, build: OUTPUT, manifest: MANIFEST } = require( '../paths' );
const { errorHandler } = require( '../utils/utils' );

/**
 * Compiles SASS to dev.
 *
 * @return {Stream} a gulp stream
 */
const sassDev = () =>
  src( PATHS.source )
    .pipe( errorHandler() )
    .pipe( require( 'gulp-sass-glob' )() )
    .pipe( sass({ outputStyle: 'expanded' }))
    .pipe( postcss([
      require( 'autoprefixer' ),
      require( 'postcss-short-border-radius' ),
      require( 'postcss-svg' )({ dirs: OUTPUT }),
      require( 'postcss-custom-properties' ),
      require( 'postcss-critical-css' )({
        outputPath: OUTPUT,
        minify:     false,
        preserve:   false
      }),
      require( '@lipemat/css-mqpacker' )({ sort: true })
    ]))
    .pipe( dest( OUTPUT ));

/**
 * Compiles SASS to build target.
 *
 * @return {Stream} a gulp stream
 */
const sassBuild = () =>
  src( `${OUTPUT}/*.css` )
    .pipe( errorHandler() )
    .pipe( postcss([
      require( 'cssnano' )({ autoprefixer: false }),
      require( 'postcss-sorting' ),
      require( '@lipemat/css-mqpacker' )({ sort: true })
    ]))
    .pipe( require( 'gulp-size' )({
      title: 'SASS:',
      showFiles: true,
      pretty: true,
      showTotal: false
    }))
    .pipe( dest( OUTPUT ));

/**
 * Linting task.
 *
 * @return {Stream} a gulp stream
 */
const sassLint = () =>
  src( PATHS.source )
    .pipe( errorHandler() )
    .pipe( linter() )
    .pipe( linter.format() )
    .pipe( linter.failOnError() );

/**
 * Post-revision hook.
 *
 * @return {Stream} a gulp stream
 */
const sassPostRev = () =>
  src( `${OUTPUT}/**/*.css` )
    .pipe( revUrl({
      manifest: `${OUTPUT}/${MANIFEST}`,
      transform: ( obj, key, val ) => obj[`/${key}`] = val
    }))
    .pipe( dest( OUTPUT ));

/* Export things. */
module.exports = {
  init: [ sassDev ],
  watch: {
    files: PATHS.watch,
    tasks: [ sassDev, sassLint ]
  },
  build: series( sassDev, sassBuild ),
  noRev: [ 'critical*.css' ],
  afterRevision: [ sassPostRev ],
  lint: [ sassLint ]
};

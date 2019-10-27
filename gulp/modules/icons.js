/*********************************************************************************************************************
 *
 * Icon tasks.
 *
 *********************************************************************************************************************/

const { src, dest }  = require( 'gulp' );
const rename         = require( 'gulp-rename' );
const svgstore       = require( 'gulp-svgstore' );
const svgmin         = require( 'gulp-svgmin' );

const { readdirSync, statSync } = require( 'fs' )

// core stuff
const { icons: PATHS, build: OUTPUT } = require( '../paths' );
const { errorHandler, streamToPromise } = require( '../utils/utils' );

const processDirectory = sDir =>
  src( `${PATHS.base}/${sDir}/**/*.svg` )
    .pipe( errorHandler() )
    .pipe( rename({ prefix: 'icon-' }))
    .pipe( svgstore() )
    .pipe( svgmin({
      plugins: [
        { removeDoctype: true },
        { cleanupIDs: false },
        { removeStyleElement: true },
        { removeTitle: true },
        { removeAttrs: { attrs: [ 'style', 'stroke.*', 'class' ]}}
      ]
    }))
    .pipe( rename( `icons-${sDir}.svg` ))
    .pipe( dest( OUTPUT ));

/**
 * Actual build task.
 *
 * @return {Stream} a gulp stream
 */
const icons = () =>
  Promise.all(
    readdirSync( PATHS.base )
      .filter( sF => statSync( `${PATHS.base}/${sF}`).isDirectory() )
      .map( processDirectory )
      .map( streamToPromise )
  );

/** Expose things */
module.exports = {
  init: [{ priority: 5, fn: icons }],
  watch: {
    files: PATHS.watch,
    tasks: [ icons ]
  },
  build: [{ priority: 5, fn: icons }]
}

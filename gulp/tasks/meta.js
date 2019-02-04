/*********************************************************************************************************************
 *
 * Metadata-related stuffs: mostly copying things around
 *
 *********************************************************************************************************************/

const gulp    = require( 'gulp' );
const plumber = require( 'gulp-plumber' );

const babel    = require( 'gulp-babel' );
const uglify   = require( 'gulp-uglify' );
const replace  = require( 'gulp-replace' );
const imagemin = require( 'gulp-imagemin' );
const del      = require( 'del' );

// core stuff
const PATHS  = global.PATHS.metadata;
const { errorHandler } = require( '../utils/utils' );

/**
 * Inner utility function to munge the service worker.
 */
function serviceWorkerBase( sTok )
{
  return gulp.src( PATHS.sw )
            .pipe( babel({ presets: [ '@babel/env' ]}))
            .pipe( replace( '{{BUILD}}', sTok ));
}

/**
 * Copy task: copies metadata stuffs to the asset directory.
 */
gulp.task( 'metadata-copy', () =>
{
  // exclude stuff
  const aPaths = Object.keys( PATHS ).filter( k => k !== 'straightCopy' ).map( k => `!${PATHS[k]}` );

  return  gulp.src( PATHS.straightCopy.concat( aPaths ))
              .pipe( plumber({ errorHandler }))
              .pipe( gulp.dest( PATHS.output ));
});

/**
 * Crunch metadata images.
 */
gulp.task( 'metadata-images', () =>
{
  return gulp.src( PATHS.images )
            .pipe( plumber({ errorHandler }))
            .pipe( imagemin() )
            .pipe( gulp.dest( PATHS.output ));
})

/**
 * Builds service worker to dev target.
 */
gulp.task( 'metadata-sw-compile', () => serviceWorkerBase( '_dev' ).pipe( gulp.dest( PATHS.output )));

/**
 * Builds the service worker to a release version/
 */
gulp.task( 'metadata-sw-build', () =>
{
  const sDateStamp = ( new Date().toISOString()).replace( /[^0-9T]/g, '' ).replace( /T(\d{4}).*$/, 'T$1' );
  console.log( sDateStamp );
  return serviceWorkerBase( sDateStamp )
          .pipe( uglify() )
          .pipe( gulp.dest( PATHS.output ));
});

/* Expose ourselves */
module.exports = {
  init:  [ 'metadata-copy', 'metadata-sw-compile' ],
  build: [ 'metadata-sw-build', 'metadata-copy', 'metadata-images' ]
}

/*********************************************************************************************************************
 *
 * Build tasks: defining these separately to keep things nicely clean.
 *
 *********************************************************************************************************************/
 
const gulp   = require( 'gulp' );
const del    = require( 'del' );
const rev    = require( 'gulp-rev' );
const revDel = require( 'gulp-rev-delete-original' );

const utils = require( './utils' );

const ASSETS = global.PATHS.build;

/**
 * Cleanup task.
 */
gulp.task( 'clean', () => del([ `${ASSETS}/*`, `!${ASSETS}/.keep` ]));

/**
 * Revisions built assets + spits out a manifest file.
 */
gulp.task( 'revision', () =>
{
    // 1. get a list of things to revise, and exclude anything from modules
    const aRevPaths = [ `${ASSETS}/*` ];
    utils.forModules( 'noRev', aExclude => aExclude.forEach( sX => aRevPaths.push( `!${ASSETS}/${sX}` )));
    
    // 2. start revisioning
    return  gulp.src( aRevPaths )
                .pipe( rev() )
                .pipe( revDel() )
                .pipe( gulp.dest( ASSETS ))
                .pipe( rev.manifest({
                  path:  'assets.json',
                  merge: true
                }))
                .pipe( gulp.dest( ASSETS ));
});

/**
 * Root build task.
 */
gulp.task( 'build', gulp.series(
  'clean',
  function realBuild() { return utils.forModules( 'build', utils.runTasks )},
  'revision',
  function postBuild() { return utils.forModules( 'afterRevision', utils.runTasks )}
));
/*********************************************************************************************************************
 *
 * Main gulpfile
 *
 *********************************************************************************************************************/

// initial load
const { series }  = require( 'gulp' );
const { forModules, watchModules } = require( './utils/modules' );
const { revision, clean } = require( './utils/files' );

/** -RUNNABLE TASKS- */
clean.description = 'Cleans built files';

const devBuild = series( clean, forModules( 'init' ), forModules( 'devInit' ));
devBuild.description = 'Creates a development-ready build of the assets, but without watching for changes.';

const dev = series( devBuild, watchModules );
dev.description = 'Spins up a development environment that watches + rebuilds assets (default task)';

const qs = series( forModules( 'devInit' ), watchModules );
qs.description = 'Quickstart version of dev: just starts watch tasks without cleaning + rebuilding.';

const lint = forModules( 'lint' );
lint.description = 'Lints all modules';

const build = series( clean, forModules( 'build' ), revision, forModules( 'afterRevision' ));
build.description = 'Builds assets to a production target';


module.exports = {
  clean,
  dev,
  qs,
  lint,
  devBuild,
  build,
  default: series( dev )
};

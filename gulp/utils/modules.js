/*********************************************************************************************************************
 *
 * Utility functions for use elsewhere
 *
 *********************************************************************************************************************/

const { series, parallel, watch } = require( 'gulp' );
const { yellow } = require( 'chalk' );

// get + filter args
const ARGS = require( './utils' ).getGlobalArgs({ only: [], except: [] });

// get + filter modules
const modules = (() =>
{
  // a. load from the filesystem
  const loaded = require( 'require-dir' )( '../modules' );

  // b. filter, either via inclusion or exclusion
  const oReturn = [];
  (( ARGS.only.length === 0 ) ? Object.keys( loaded ) : ARGS.only )
    .filter( sM => !ARGS.except.includes( sM ))
    .forEach( sM => oReturn[sM] = loaded[sM] )

  return oReturn;
})();

/**
 * Returns the specified property from each module.
 *
 * @param {String} sProperty - the property to load.
 * @return {Array} an array of hooks.
 */
const getProperty = sProperty =>
  Object.values( modules ).reduce(( aAll, oModule ) =>
  {
    if ( oModule[sProperty] !== undefined )
    {
      aAll.push( oModule[sProperty] );
    }
    return aAll;
  }, []);

/**
 * Helper function for forModules that takes aggregated tasks and runs them in order of state priority as a series-parallel
 * set.
 *
 * @param {Array} aTasks - an array of tasks to be performed.
 * @return {Promise} a promise
 */
const coalesceTasks = aTasks =>
{
  // collapse things into a single array + turn them into a common format for sorting
  const oTasksByPriority = Array.prototype.concat.apply( [], aTasks ).reduce(( oA, task ) =>
  {
    // a. coerce into an object, if it’s not already
    if ( typeof task === 'function' )
    {
      task = { fn: task, priority: 0 };
    }

    // b. make sure we have somewhere to stick it
    const sKey = `p${task.priority}`;
    if ( oA[sKey] === undefined )
    {
      oA[sKey] = {
        p: task.priority,
        t: []
      };
    }

    // c. shove it in
    oA[sKey].t.push( task.fn );
    return oA;
  }, {});

  // turn into a series-parallel array
  const aSeriesParallel =
    Object.values( oTasksByPriority )
      .sort(( oA, oB ) => oB.p - oA.p )
      .map( oT => parallel( ...oT.t ));

  // sort everything into a series-parallel array
  return series( ...aSeriesParallel );
};

/**
 * Utility function that performs hook tasks on all modules.
 *
 * @param   {String} sHook - the hook/property to return
 * @return  {Promise} a promise
 */
const forModules = sHook =>
{
  // get tasks
  const aTasks = getProperty( sHook );

  // return something that can be resolved
  return ( aTasks.length === 0 ) ? () => Promise.resolve() : coalesceTasks( aTasks );
};

/**
 * Runs watch tasks for each module.
 *
 * @return {Promise} a promise that is resolved once all watch tasks have completed.
 */
const watchModules = () =>
{
  const aoTasks = getProperty( 'watch' ).map( oDef => watch( oDef.files, parallel( oDef.tasks )));
  console.log( yellow( 'Watching for changes…' ));

  return Promise.all( aoTasks );
};

module.exports = { forModules, watchModules, getProperty };

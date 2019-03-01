/*********************************************************************************************************************
 *
 * Utility functions for use elsewhere
 *
 *********************************************************************************************************************/

const { series, parallel } = require( 'gulp' );
const modules = require( 'require-dir' )( '../tasks' );

/**
 * Default callback from forModules unless we specify something different: takes the aggregated list of tasks that should
 * be run for the particular hook, prioritises them, and runs them in series-parallel configuration
 *
 * @param {Array} aTasks - an array of tasks to be run (in parallel)
 * @return {Promise} a promise
 */
function coalesceTasks( aTasks )
{
  // flatten the array to a map, based on how many exclamation points are in the task name
  const oTasks = Array.prototype.concat.apply( [], aTasks ).reduce(( oA, sF ) =>
  {
    const sIndex = `m${sF.split( '!' ).length - 1}`;
    oA[sIndex] = oA[sIndex] || [];
    oA[sIndex].push( sF.replace( /^!+/, '' ));
    return oA;
  }, {});

  // now block this out into an array of S-P tasks
  const aSeriesParallel = Object.keys( oTasks ).sort().reverse().map( sIdx => parallel( oTasks[sIdx] ));

  // run everything
  return new Promise( fnResolve =>
  {
    series( ...aSeriesParallel, function taskResolver(done)
    {
      fnResolve();
      done();
    })();
  });
}

/**
 * Utility function that iterates through included modules and returns the specified property for each.
 *
 * @param   {String} sHook - the hook/property to return
 * @param   {callable} fnCallback - a callback function, into which the property’s value is passed
 * @return  {Promise} a promise
 */
function forModules(sHook, fnCallback = null )
{
  // if there’re no modules
  if (Object.values( modules ).length === 0)
  {
    return Promise.resolve();
  }

  // start running things
  const aCollection = [];
  Object.values( modules ).forEach( oModule =>
  {
    if ( oModule[sHook] !== undefined )
    {
      aCollection.push(( fnCallback === null ? oModule[sHook] : fnCallback( oModule[sHook] )));
    }
  })

  // if we had a callback, just return a resolvable Promise
  return ( fnCallback === null ? coalesceTasks( aCollection ) : Promise.all( aCollection ));
}

module.exports = { forModules };

/*********************************************************************************************************************
 *
 * Utility functions for use elsewhere
 *
 *********************************************************************************************************************/

const gulp = require( 'gulp' );
const modules = require( 'require-dir' )( './tasks' );

/**
 * Utility function that iterates through included modules and returns the specified property for each.
 *
 * @param   {String} sHook - the hook/property to return
 * @param   {callable} fnCallback - a callback function, into which the property’s value is passed
 * @return  {Promise} a promise
 */
function forModules(sHook, fnCallback)
{
    // if there’re no modules
    if (Object.values( modules ).length === 0)
    {
        return Promise.resolve();
    }


    // start watching things
    let iToRun   = 0;
    return new Promise( fnResolve =>
    {
        function fnCheck()
        {
            if (--iToRun === 0)
            {
                fnResolve();
            }
        }

        Object.values( modules ).forEach( oModule =>
        {
            if (oModule[sHook] !== undefined)
            {
                iToRun++;
                Promise.resolve( fnCallback( oModule[sHook] )).then( fnCheck );
            }
        });
    });
}

/**
 * Runs an array of gulp tasks
 *
 * @param {Array} aTasks - an array of tasks to be run (in parallel)
 * @return {Promise} a promise
 */
function runTasks( aTasks )
{
    return new Promise( fnResolve =>
    {
        gulp.series( gulp.parallel( aTasks ), ( function taskResolver( done )
        {
            fnResolve();
            done();
        }))();
    });
}

module.exports = { runTasks, forModules };
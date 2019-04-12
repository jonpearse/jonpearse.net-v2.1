/*********************************************************************************************************************
*
* Simple-ish implementation of deadlocking, with named locks + queuing.
*
*********************************************************************************************************************/

const DEFAULT_LOCK_NAME = 'lock';

module.exports = (function()
{
  const oLockStore = {};

  /**
  * Sets up a particular lock.
  *
  * @param {string}  sLockName - the name of the lock
  * @param {boolean} bCreate   - whether or not we should create non-existent locks.
  * @return {boolean} whether or not the lock already existed.
  */
  function setup( sLockName, bCreate = false )
  {
    if ( oLockStore[sLockName] !== undefined )
    {
      return true;
    }

    if (bCreate)
    {
      oLockStore[sLockName] = false;
    }
    return false;
  }

  /**
  * Tries to get a lock with the given name.
  *
  * @param {string}  sLockName - the name of the lock to get (optional)
  * @return {boolean} true on success, false otherwise.
  */
  function lock( sLockName = DEFAULT_LOCK_NAME )
  {
    setup( sLockName, true );

    // if it’s already locked, fail
    if ( oLockStore[sLockName] === true )
    {
      return false;
    }

    // lock
    console.debug( `[LOCK] locking ‘${sLockName}’` );
    oLockStore[sLockName] = true;
    return true;
  }

  /**
  * Releases a lock with the given name. This will return silently if you try and release a non-existent lock.
  *
  * @param {string} sLockName - the name of the lock to release (optional)
  */
  function unlock( sLockName = DEFAULT_LOCK_NAME )
  {
    // if we don’t know about the lock, fail nicely
    if (!setup( sLockName ))
    {
      console.warn( `[LOCK] Trying to release unknown lock ‘${sLockName}’` );
      return;
    }

    // release the lock
    console.debug( `[LOCK] releasing ‘${sLockName}’` );
    oLockStore[sLockName] = false;
    return;
  }

  /** Public API */
  return {
    /**
    * Tries to get a lock with a given name.
    *
    * @param {string}  sLockName - the name of the lock to get (optional)
    * @return {boolean} true on success, false otherwise.
    */
    lock: lock,

    /**
    * Tries to release a loc with the given name.
    *
    * @param {string} sLockName - the name of the lock to release.
    */
    unlock: unlock,
    release: unlock,

    /**
    * Tries to perform a task, unlocking once the task has been completed.
    *
    * @param   {mixed} task - either a function or a promise to run if possible.
    * @param   {string} sLockName - the name of the lock to wait/restrict.
    * @return  {boolean} true if the task could be run, false otherwise.
    */
    perform: ( task, sLockName = DEFAULT_LOCK_NAME ) =>
    {
      // if we can lock things
      if (!lock(sLockName))
      {
        return false;
      }

      // convert the task to a promise
      if (!(task instanceof Promise))
      {
        task = new Promise( resolve =>
        {
          task();
          resolve();
        });
      }

      // do things
      task.then(() =>
      {
        unlock( sLockName );
      });

      return true;
    }
  };
}());

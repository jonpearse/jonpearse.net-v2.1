/*********************************************************************************************************************
 *
 * Service Worker magic
 *
 *********************************************************************************************************************/

const VERSION = '{{BUILD}}';
const CONTENT = '_content';

// configure stuff that should be cache first, request later
const CACHEFIRST_ROOTS = [ '/a/', '/favicon' ];

/**
 * Requests a URL, caches the result, and passes back.
 *
 * @param {Request} req - the request
 * @param {String} cache - which cache to use
 * @return {Promise} blah
 */
function requestAndCache( req, cache = VERSION )
{
    return fetch( req ).then( res => caches.open( cache ).then( cache =>
    {
        cache.put( req, res.clone() );
        return res;
    })).catch( console.warn );
}

/**
 * Bootstrap code.
 */
function bootstrap()
{
    // cache the homepage on installation
    self.addEventListener( 'install', ev => ev.waitUntil( caches.open( CONTENT ).then( cache => cache.add( '/' ))));

    // nuke all old caches on activation
    self.addEventListener( 'activate', ev => ev.waitUntil( caches.keys().then( names => Promise.all(
        names.filter( n => ( n !== VERSION ) && ( n !== CONTENT )).map( n => caches.delete( n ))
    ))));

    // handle inbopund requests with an appropriate strategy
    self.addEventListener( 'fetch', ev =>
    {
        // 1. convert the URL to a pathname
        const sPath = ev.request.url.replace( /^https?:\/\/(.*?)\//, '/' );
        const req = ev.request.clone();

        // 2. use an appopriate strategy
        if ( req.method === 'POST' )
        {
            ev.respondWith( fetch( req ));
        }
        else if ( CACHEFIRST_ROOTS.filter( sRoot => sPath.startsWith( sRoot )).length > 0 )
        {
            ev.respondWith( caches.match( req ).then( cached => cached || requestAndCache( req )));
        }
        else
        {
            ev.respondWith( requestAndCache( req, CONTENT ).catch( () => caches.match( req )));
        }
    })
}

/**
 * Fire bootstrap on caching availability
 */
(( Cache.prototype !== undefined ) && bootstrap());

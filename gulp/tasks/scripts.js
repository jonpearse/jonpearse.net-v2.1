/*********************************************************************************************************************
 *
 * Javascript functions.
 *
 *********************************************************************************************************************/

const gulp     = require( 'gulp' );
const plumber  = require( 'gulp-plumber' );
const webpack  = require( 'webpack' );
const stream   = require( 'webpack-stream' );
const uglify   = require( 'gulp-uglify' );
const eslint   = require( 'gulp-eslint' );

const glob     = require( 'glob' ).sync;
const basename = require( 'path' ).basename;

// core stuff
const PATHS         = global.PATHS.js;
const OUTPUT        = global.PATHS.build;
const errorHandler  = global.errorHandler;

/**
 * Define our webpack config for later.
 */
const WEBPACK_CONF = {
  mode: 'production',
  resolve: {
    modules: [
        'node_modules',
        PATHS.context
    ]
  },
  module: {
      rules: [
          { 
            test: /\.js$/, 
            use: {
              loader: 'babel-loader',
              options: {
                presets: [ '@babel/preset-env' ],
                plugins: [ '@babel/plugin-transform-runtime' ]
              }
            }
          },
          { test: /\.json$/, loader: 'json' },
      ],
  },
  output: {
      filename: '[name].js',
      chunkFilename: 'chunk-[chunkhash].js',
      publicPath: '/a/'
  },
  stats: {
      builtAt: false,
      entrypoints: false,
      chunks: true,
      chunkModules: true,
      maxModules: 100
  }
};

/**
 * Returns a list of entry points.
 *
 * @return {Object} an object containing entry points for webpack.
 */
function getEntries()
{
  const oEntries = {};
  
  glob( PATHS.compile ).forEach( sF => 
  {
    const sBase = basename( sF, '.js' );
    
    oEntries[sBase] = sF;
  });
  
  return oEntries;
}

/**
 * Compiles JS for development.
 */
gulp.task( 'js', () => 
{
  // 1. acquire configuration
  const conf   = WEBPACK_CONF;
  conf.devtool = 'inline-source-map';
  conf.mode    = 'development';
  conf.entry   = getEntries();
  
  // 2. build!
  return  gulp.src( PATHS.context )
              .pipe( plumber({ errorHandler }))
              .pipe( stream( conf, webpack ))
              .pipe( gulp.dest( OUTPUT ));
});

/**
 * Compiles JS for release.
 */
gulp.task( 'js-build', () =>
{
  // 1. acquire configuration
  const conf = WEBPACK_CONF;
  conf.entry = getEntries();
  
  // 2. build
  return  gulp.src( PATHS.context )
              .pipe( plumber({ errorHandler }))
              .pipe( stream( conf, webpack ))
              .pipe( uglify({
                output: {
                  max_line_len: 1024
                },
                compress: {
                  drop_console: true
                }
              }))
              .pipe( gulp.dest( OUTPUT ));
});

/**
 * Lint task!
 */
gulp.task( 'js-lint', () =>
{
  return  gulp.src( PATHS.watch )
              .pipe( eslint() )
              .pipe( eslint.format() );
})

/* Expose ourselves */
module.exports = {
  init: [ 'js' ],
  watch: {
    files: PATHS.watch,
    tasks: [ 'js', 'js-lint' ]
  },
  lint: [ 'js-lint' ],
  build: [ 'js-build' ],
  noRev: [ 'chunk-*.js' ]
};
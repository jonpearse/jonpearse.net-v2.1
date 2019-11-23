/*********************************************************************************************************************
 *
 * Javascript functions.
 *
 *********************************************************************************************************************/

const { src, dest }  = require( 'gulp' );
const webpack        = require( 'webpack' );
const stream         = require( 'webpack-stream' );
const uglify         = require( 'gulp-uglify' );
const eslint         = require( 'gulp-eslint' );

const { sync: glob } = require( 'glob' );
const { basename }   = require( 'path' );

// core stuff
const { js: PATHS, build: OUTPUT } = require( '../paths' );
const { errorHandler, getModuleArgs } = require( '../utils/utils' );

// get some arguments
const ARGS = getModuleArgs( 'scripts', { exclude: [] });

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
            presets: [ '@babel/preset-env' ]
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
const getEntries = () =>
{
  const oEntries = {};

  glob( PATHS.compile ).forEach( sF =>
  {
    const sBase = basename( sF, '.js' );

    oEntries[sBase] = sF;
  });

  // exclude things
  ARGS.exclude.forEach( sX => delete oEntries[sX] );

  return oEntries;
}

/**
 * Compiles JS for development.
 *
 * @return {Stream} a gulp stream
 */
const jsDev = () =>
{
  // 1. acquire configuration
  const conf   = WEBPACK_CONF;
  conf.devtool = 'inline-source-map';
  conf.mode    = 'development';
  conf.entry   = getEntries();

  // 2. compile
  return src( PATHS.context )
    .pipe( errorHandler() )
    .pipe( stream( conf, webpack ))
    .pipe( dest( OUTPUT ));
}

/**
 * Compiles JS for release.
 *
 * @return {Stream} a gulp stream
 */
const jsBuild = () =>
{
  // 1. acquire configuration
  const conf = WEBPACK_CONF;
  conf.entry = getEntries();

  return src( PATHS.context )
    .pipe( errorHandler() )
    .pipe( stream( conf, webpack ))
    .pipe( uglify({
      output: {
        max_line_len: 1024
      },
      compress: {
        drop_console: true
      }
    }))
    .pipe( dest( OUTPUT ));
}

/**
 * Lint task!
 *
 * @return {Stream} a gulp stream
 */
const jsLint = () =>
  src( PATHS.watch )
    .pipe( eslint() )
    .pipe( eslint.format() );

/* Expose ourselves */
module.exports = {
  init: [ jsDev ],
  watch: {
    files: PATHS.watch,
    tasks: [ jsDev, jsLint  ]
  },
  lint: [ jsLint ],
  build: [ jsBuild ],
  noRev: [ 'chunk-*.js' ]
};

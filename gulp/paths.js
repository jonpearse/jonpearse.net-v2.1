/*********************************************************************************************************************
 *
 * Path configuration
 *
 *********************************************************************************************************************/

// Load deps
const path = require( 'path' );

// Define some roots
const PROJECT_ROOT = path.resolve( `${__dirname}/..` );
const ASSET_ROOT   = `${PROJECT_ROOT}/app/assets`;
const ASSET_DEST   = `${PROJECT_ROOT}/public/a`;

// output
module.exports = {
  root:   PROJECT_ROOT,
  assets: ASSET_ROOT,
  build:  ASSET_DEST,
  manifest: 'assets.json',

  // JS
  js: {
    watch:    `${ASSET_ROOT}/javascripts/**/*.js`,
    context:  `${ASSET_ROOT}/javascripts`,
    compile:  `${ASSET_ROOT}/javascripts/*.js`
  },

  // SASS
  sass: {
    watch:  `${ASSET_ROOT}/stylesheets/**/*.scss`,
    source: [
      `${ASSET_ROOT}/stylesheets/*.scss`,
      `!${ASSET_ROOT}/stylesheets/_*.scss`
    ]
  },

  // Images
  images: {
    watch:  `${ASSET_ROOT}/images/**/*`,
    source: `${ASSET_ROOT}/images/**/*.*`
  },

  // fonts
  fonts: {
    watch:  `${ASSET_ROOT}/fonts/**/*`,
    source: [
      `${ASSET_ROOT}/fonts/**/*.woff`,
      `${ASSET_ROOT}/fonts/**/*.woff2`
    ]
  },

  // icons
  icons: {
    watch:  `${ASSET_ROOT}/icons/**/*.svg`,
    base:   `${ASSET_ROOT}/icons`
  },

  // metadata
  metadata: {
    straightCopy: [
      `${ASSET_ROOT}/meta/**/*.*`,
      `!${ASSET_ROOT}/meta/**/*.{jpg,png,gif,ico}`,
      `!${ASSET_ROOT}/meta/**/*.js`
    ],
    images: [ `${ASSET_ROOT}/meta/**/*.{jpg,png,gif,ico}` ],
    sw:     [ `${ASSET_ROOT}/meta/**/*.js` ],
    watch:  `${ASSET_ROOT}/meta/**/*.*`,
    output: `${PROJECT_ROOT}/public`
  }
};

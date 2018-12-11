# Library of functions used for handling assets: this is largely to make up for the lack of Sprockets.
module AssetHelper

  # Generates a stylesheet tag.
  #
  # === Parameters
  #
  # [stylesheet] _(string)_ the name of the stylesheet to embed
  # [options] _(hash, optional)_ any additional attributes to be passed to the generated LINK tag
  def stylesheet_tag( stylesheet, options = {} )

    # add an extension if we don’t already have one
    stylesheet += '.css' unless stylesheet.end_with?( '.css' )

    # default some options
    options[:href] = asset_url_for( stylesheet )
    options[:rel] ||= :stylesheet
    options[:media] ||= :screen

    # return
    tag( 'link', options )

  end

  # Generates a stylesheet preload tag: this is a shortcut onto AssetHelper#stylesheet_tag
  #
  # === Parameters
  #
  # [stylesheet] _(string)_ the name of the stylesheet to embed
  # [options] _(hash, optional)_ any additional attributes to be passed to the generated LINK tag
  def stylesheet_preload_tag( stylesheet, options = {} )

    stylesheet_tag( stylesheet, options.merge({
        rel: :preload,
        as: :style,
        onload: "this.onload=null;this.rel='stylesheet';sIA();"
    }))

  end

  # Dumps the contents of a CSS file into the DOM. This is useful for critical CSS + the like.
  #
  # === Parameters
  #
  # [filename] _(string)_ the name of the file to insert
  # [options] _(options)_ any additional options to put on the STYLE tag
  def inline_stylesheet( stylesheet, options = {} )

    # add the extension, if not already present
    stylesheet += ".css" unless stylesheet.match(/\.css$/)

    # look for the file, and bail if it doesn’t exist
    filename = asset_path_for( stylesheet )
    return unless File.exists?( filename )

    # read the file in, bail if it’s empty
    content = File.read( filename ).strip
    return if content.empty?

    # rewrite our content
    content.gsub!( /url\("(.*?)"\)/ ){ |match| "url(\"#{asset_url_for( $1 )}\")" }

    # return a <STYLE> tag
    options[:media] ||= :screen
    tag(:style, options, true) + content.html_safe + '</style>'.html_safe
  end

  # Generates a SCRIPT tag for the given JS file. By default, this will set both ASYNC and DEFER attributes.
  #
  # === Parameters
  #
  # [filename] _(string)_ the name of the file to link to
  # [options] _(hash, optional)_ any additional attributes to be set on the tag
  def script_tag( filename, options = {} )

    # blah
    filename = filename.to_s

    # add the extension, if not already present
    filename += '.js' unless filename.end_with?( '.js' )

    # set defer + async
    options[:src]   = asset_url_for( filename )
    options[:defer] = :defer unless options.key?( :defer )
    options[:async] = :async unless options.key?( :async )

    # return
    ( tag( :script, options, true ).gsub( /(?<attr>[a-z]+)=\"\k<attr>\"/, '\k<attr>' ) + '</script>' ).html_safe

  end

  # Generates an IMG element for the given image.
  #
  # === Parameters
  #
  # [filename_or_url] _(mixed)_ the filename or URL for the image.
  # [options] _(hash, optional)_ any HTML attributes to pass through to the image tag
  def image_tag( file_or_url, options = {} )

    # if the file is from ActiveStorage, convert it, then convert it into a URL
    file_or_url = polymorphic_url( file_or_url ) unless file_or_url.is_a?( String )
    file_or_url = asset_url_for( file_or_url ) unless file_or_url.match?( /^(http(s)?\:|data\:|system\/|\/)/ )

    # set/default some attrs
    options[:src] = file_or_url
    options[:alt] ||= ''

    # return the IMG tag
    tag( :img, options )

  end

  # Returns the URL for a given asset, respecting versioning and hosting setup
  #
  # === Parameters
  #
  # [filename] _(string)_ the name of the file
  def asset_url_for( filename )

    # get a host
    hostname = config.asset_host || root_url.gsub( /^\//, '' )

    # return
    "#{hostname}/#{Rails.application.config.assets[:url]}/#{versioned_filename_for( filename )}".gsub( /(?<!:)\/\/+/, '/' )

  end

  # Returns the filesystem path for a given asset, respecting versioning.
  #
  # === Parameters
  #
  # [filename] _(string)_ the name of the file
  def asset_path_for( filename )

    "#{Rails.application.config.assets[:path]}/#{versioned_filename_for( filename )}"

  end

  # Returns the contents of the requested asset, or nil if the file doesn’t exist/cannot be read.
  #
  # === Parameters
  #
  # [filename] _(string)_ the name of the file to load
  def asset_contents( filename )

    # Check the file exists
    fn = asset_path_for( filename )
    return nil unless File.exists?(fn)

    # Return the contents of the asset
    IO.read(fn)

  end

  private

    # Private helper function that returns the versioned filename for a given filename.
    def versioned_filename_for( filename )

      manifest = Rails.application.config.assets[:manifest]
      manifest.key?(filename) ? manifest[filename] : filename

    end

end

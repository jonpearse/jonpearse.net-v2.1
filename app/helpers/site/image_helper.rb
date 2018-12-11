module Site::ImageHelper

  # Give some basic dimensions
  BASE_DEFAULT    = 585
  BASE_DIMENSIONS = [ 320, 585 ]

  # Generates a responsive IMG tag with lazyloading from a Media object.
  #
  # === Parameters
  #
  # [media] the media item
  # [options] a hash of options
  def lazyloaded_image_tag( media, options = {} )

    # fail
    return unless media.is_a?( Media )

    # default some options
    options = {
      default: BASE_DEFAULT,
      dimensions: BASE_DIMENSIONS,
      html: {},
      blur: false
    }.deep_merge( options )

    # default some HTML attrs
    html_attrs = {
      alt:    media.alt_text,
      class:  ''
    }.merge( options[:html] )

    # Handle some lazyloading
    html_attrs[:class] = "#{html_attrs[:class]} lazyload".strip
    html_attrs[:src] = options[:blur] ? media.base64_preview : 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
    html_attrs[:'data-srcset'] = options[:dimensions].map{ |size| variation_path( media, size ) + " #{size}w" }.join(',')
    html_attrs[:sizes] = 'auto'
    # html_attrs[:style] = "width: #{options[:dimensions].max}px"

    retval = tag( :img, html_attrs )

    # now some noscript stuff
    html_attrs[:srcset] = html_attrs[:'data-srcset']
    html_attrs[:class]  = html_attrs[:class].gsub(/lazyload/, 'lazyload-fallback')
    html_attrs[:src]    = variation_path( media, options[:default] )
    html_attrs.delete( :'data-srcset' )

    retval + '<noscript>'.html_safe + tag( :img, html_attrs ) + '</noscript>'.html_safe

  end

  # Goes through some markup looking for images, which it turns into responsive images.
  #
  # === Parameters
  #
  # [html] the markup to parse
  def render_responsive_images( html )

    html.gsub(/<img(?:\s+(?:data-media-id="(\d+)")|(?:data-align="([a-z]+)")|(?:.*?))+>/) do |mat|

      # if we have neither a media ID or anything, bail
      return "" if $1.nil?

      # endeavour to load a media
      begin

        media = Media.find( $1 )
        render( partial: 'rendered-image', locals: { image: media, alignment: $2.downcase.to_sym })

      rescue

        ""

      end

    end

  end

end

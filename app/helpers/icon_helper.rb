module IconHelper

  # Generates a fontawesome icon
  #
  # === Expected parameters
  #
  # [icon]  the name of the icon to insert
  # [html_options]  any options that should be passed to the tag() function
  def icon( icon, html_options = {} )

    # get a class
    html_options[:class] ||= ''
    html_options[:class] = "#{html_options[:class]} svg-icon svg-icon--#{icon}".strip
    html_options[:role] = 'img'

    # if we have a title
    if html_options.key?( :title )

      id = "svg-icon__title--#{SecureRandom.hex(4)}"
      html_options[:'aria-labelledby'] = id
      title = content_tag("title", html_options[:title], id: id)

      html_options.delete :title

    else

      title = '';
      html_options[:'aria-hidden'] = 'true'

    end

    # return
    tag( 'svg', html_options, true ) + title + tag( 'use', 'xlink:href': "#icon-#{icon}" ) + '</svg>'.html_safe

  end

  # Provides a link with a fontawesome icon prepended
  #
  # === Parameters
  #
  # [body]          the text that should be linked
  # [url]           the URL of the link
  # [icon]          the icon that should be appended/prepended
  # [html_options]  any options that should be passed to link_to
  def link_to_with_icon( body, url, icon, html_options = {})

    html_options[:class] ||= ""
    html_options[:class].prepend " " unless html_options[:class].empty?
    html_options[:'aria-hidden'] = "true"

    link_text = html_options.key?( :icon_after ) ? "#{body} #{icon( icon )}" : "#{icon( icon )} #{body}"
    html_options.delete( :icon_after )

    link_to( link_text.html_safe, url, html_options )

  end


end

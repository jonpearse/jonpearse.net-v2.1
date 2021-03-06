module Site::RenderingHelper

  def format_date( date )

    date.strftime("%B #{date.day.ordinalize}, %Y")

  end

  # Get an appropriate base class.
  def get_body_class

    classes = []
    classes << 'wf-assumed' if cookies.key?( :assume_wf )
    classes << 'dark-mode'  if @dark_mode

    classes.join( ' ' )

  end

  # Renders a block template.
  #
  # === Available options
  #
  # [:element] _(string, optional)_ the type of element to use, defaults to ‘div’
  # [:container] _(string, optional)_ the type of container element to use, defaults to ‘div’
  # [:classes] _(mixed, optional)_ an array of classes to add to the outer wrapper
  # [:container_classes]] _(mixed, optional)_ an array of classes to add to the container
  # [:text] _(boolean, optional)_ whether the content should be rendered as text
  def render_block( options = {} )

    # default things
    options[:element]   ||= :div
    options[:container] ||= :div
    options[:classes]   ||= []
    options[:container_classes] ||= []
    options[:text]      ||= false

    # cast strings
    options[:classes] = "block #{classnames( options[:classes] )}".strip
    options[:container_classes] = "container #{classnames( options[:container_classes], '' )}".strip
    options[:container_classes] << ' t' if options[:text]

    # call down
    content = capture{ yield }

    # call out to partial
    render( layout: 'block', locals: options ){ content }

  end

  # Renders a snippet to the page.
  #
  # === Parameters
  #
  # [ident] _(string, required)_ the identifier to load
  def render_snippet( ident )

    # load the snippet + render it
    snippet = Snippet::acquire( ident )
    render( partial: 'snippet', locals: { snippet: snippet })

  end

  # Renders an inline editor.
  #
  # === Parameters
  #
  # [object] _(Model, required)_ the object to render
  # [property] _(Symbol, required)_ the property to render/edit
  def render_inline_editor( object, property )

    content = block_given? ? capture{ yield } : object.send( property ).html_safe

    render( layout: 'inline-editor', locals: { content: object, property: property }){ content }

  end

  # Maps an array or string of classes to a common prefixed, space-separated form.
  #
  # === Parameters
  #
  # [classes]
  # [prefix]
  def classnames( classes, prefix = '-' )

    # if there’s nothing to do, then who cares
    return '' if classes.nil? or classes.empty?

    # map things
    classes = [ classes ] unless classes.is_a?( Array )

    # and return
    classes.map{ |c| "#{prefix}#{c}" }.join( ' ' ).gsub( "#{prefix}#", '' )

  end

  # Discovers and highlights any code blocks using the Rouge gem
  #
  # === Parameters
  #
  # [html] _(String, required)_ the HTML to process
  def highlight_code_blocks( html )

    # load into nokogiri
    doc = Nokogiri::HTML.fragment( html )

    # process all blocks
    doc.css( 'pre code' ).each do |block|

      next unless block.attributes.key?( 'data-language' )

      # get information
      content = block.inner_text
      language = block.attributes['data-language'].value

      # render it out
      rendered = render( partial: 'site/base/code-block', locals: {
        language: language,
        content: Rouge.highlight( content, language, 'html' ).lines
      }).strip

      # update the DOM + remove the old PRE tag
      Nokogiri::HTML.fragment( rendered ).children.each{ |c| block.parent.previous = c }
      block.parent.remove

    end

    # return
    # Note: gsub is here otherwise Nokogiri seems want to add newlines where it shouldn’t 🙄
    doc.to_html.gsub( /(<div class=\"code-block__line\">)\n/, '\1' ).html_safe

  end

end

module Admin::Cms::TableHelper

  def sortable_header( column, args )

  end

  def render_column( spec, locals = {}, el = :td, attrs = {} )

    # render our content
    content = Haml::Engine.new( spec[:template] ).render( self, locals )

    # return things
    tag( el, attrs, true ) + content + "</#{el}>".html_safe

  end

  def sparkline_for( content )

    tag( 'figure', { class: 'sparkline', data: { behaviour: :sparkline, ct: content.class.to_s, ci: content.id }}) + '</figure>'.html_safe

  end

end

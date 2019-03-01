module Admin::CMS::TableHelper

  def sortable_header( column, args )

  end

  def render_column( spec, locals = {}, el = :td, attrs = {} )

    # render our content
    content = Haml::Engine.new( spec[:template] ).render( self, locals )

    # return things
    tag( el, attrs, true ) + content + "</#{el}>".html_safe

  end

end

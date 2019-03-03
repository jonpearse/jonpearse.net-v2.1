module Admin::CMS::MarkupHelper

  def unescape_entities( sUrl )

    sUrl.gsub( '%7B', '{' ).gsub( '%7D', '}' )

  end

end

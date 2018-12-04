module Site::RoutesHelper

  %w{article project}.each do |type|

    define_method :"#{type}_url" do | obj, params = {} |

      params[:id]   = obj.id   unless obj.respond_to?( :url )
      params[:slug] = obj.slug unless obj.respond_to?( :url )
      params[:url]  = obj.url  if obj.respond_to?( :url )

      send(:"_#{type}_url", params)

    end

    define_method :"#{type}_path" do | obj, params = {} |

      params[:id]   = obj.id   unless obj.respond_to?( :url )
      params[:slug] = obj.slug unless obj.respond_to?( :url )
      params[:url]  = obj.url  if obj.respond_to?( :url )

      begin

        send( :"_#{type}_path", params )

      rescue

        send( :"_#{type}_url", params )

      end

    end
  end

  def variation_path( media, size = nil )

    _variation_path(
      blob_id: media.file.key,
      size:    ( size.nil? ? nil : size.to_s( 36 ))
    )

  end

  def variation_url( media, size = nil )

    _variation_url(
      blob_id: media.file.key,
      size:    ( size.nil? ? nil : size.to_s( 36 ))
    )

  end

end

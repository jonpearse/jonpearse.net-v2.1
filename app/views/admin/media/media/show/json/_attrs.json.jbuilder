return unless content.respond_to?( :cms_serialisable_attrs )
json.merge!( content.cms_serialisable_attrs )

json.cms_image_url polymorphic_url( content.cms_image )

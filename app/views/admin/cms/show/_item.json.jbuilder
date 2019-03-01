depth ||= 0

# output all attrs
json.partial! partial_for( :attrs, action: :'show/json', format: '.json' ), content: content

# relations
json.partial! partial_for( :relationships, action: :'show/json', format: '.json' ), content: content, depth: depth if ( depth == 0 )

# meta
json.partial! partial_for( :meta, action: :'show/json', format: '.json' ), content: content

# also, some data
unless depth > 0
  json._urls do

    # Note: not all content types will have a show action, so handle that
    begin
      json.show   cms_path_for( content, :show )
    rescue
    end

    json.edit     cms_path_for( content, :edit )
    json.destroy  cms_path_for( content, :destroy )

  end
end

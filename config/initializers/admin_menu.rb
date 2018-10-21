# @TODO: make this reload in dev when the YAML file changes

# Create a namespace with a menu
Rails.application.config.admin = {
  menu: [],
  map: {}
}

def map_items( items, parents = [] )

  items.map do |item|

    # cast to hash
    item.symbolize_keys!

    # if we have a route, ensure it’s good and add it to the map
    if item.key? :route

      Rails.application.config.admin[:map][item[:route]] = parents + [ item.except(:children) ]

      item[:route] << "#index" unless item[:route].match(/([a-z\/]+)#([a-z]+)/)

    # otherwise, if we don’t have anything, route to # for now
    elsif !item.key? :route and !item.key? :url

      item[:url] = '#'

    end

    # recurse!
    item[:children] = map_items( item[:children], parents + [ item.except(:children) ]) if item.key? :children

    item

  end

  items

end

if File.exists?( Rails.root.join( 'config', 'admin_menu.yaml' ))

  Rails.application.config.admin[:menu] = map_items( YAML.load_file( Rails.root.join( 'config', 'admin_menu.yaml' )))

end

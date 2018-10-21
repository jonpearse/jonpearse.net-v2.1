module Admin::NavigationHelper

  def normalise_navigation

    # get a handle on the navigation
    navigation = Rails.application.config.admin[:menu].deep_dup

    # now, recurse our way through everything
    navigation.map( &method( :normalise_navigation_item ))

  end

  def normalise_navigation_item( item, recurse = true )

    # if we have no URL
    unless item.key? :url

      split = item[:route].split('#')
      item[:url] = url_for( controller: "/admin/#{split[0]}", action: split[1] )
      item[:base_path] = "admin/#{split[0]}"

    end

    # handle current
    if recurse
      item[:key] ||= item[:title].downcase
      if @breadcrumb.nil? || !@breadcrumb.last.is_a?(Hash)

        item[:current] =  (request.path == item[:url]) ||
                          (item[:url] != admin_root_path && request.path.starts_with?(item[:url])) ||
                          (@current_section && item[:key] == @current_section)

      else

        item[:current] = (@breadcrumb.last[:route] == item[:route])

      end

      # if we have children…
      if item.key?(:children)

        # recursively process them
        item[:children].map(&method(:normalise_navigation_item))

        # check for current state
        item[:current] ||= item[:children].reduce(false) { |ret,val| ret |= val[:current] }
      end
    end

    # and return
    item

  end

end

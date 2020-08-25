# Provides URL functions for use within the CMS controller.
module Admin::Cms::UrlHelper

  attr_accessor :routes

  # Returns the appropriate URL for a given action on a given model. This allows us to decouple namespaces, paths, and
  # the like more easily.
  #
  # === Parameters
  #
  # [object_or_model] _(mixed)_   either an object or model class for which to return the path
  # [action] _(Symbol, optional)_ the action to perform on the model
  # [params] _(Hash, optional)_   any additional parameters to pass through to the path
  def cms_path_for( object_or_model, action = :index, params = {} )

    # first, cast whatever we get to a class + check it’s useful to us
    klass = object_or_model.is_a?( Class ) ? object_or_model : object_or_model.class
    raise TypeError.new( 'object_or_model must be either an instance of-, or a class extending ActiveRecord::Base' ) unless klass < ActiveRecord::Base

    # now get a class name for pathing purposes
    klass_name = klass.to_s.underscore.pluralize.downcase

    # load some routes if we’ve not already done so
    load_routes if routes.nil?

    # work out the context we’re currently in + append what we think we’re after
    context_stack = Rails.application.routes.recognize_path( request.path, method: request.env['REQUEST_METHOD'] )[:controller].split( '/' )
    context_stack = context_stack.map.with_index{ |seg, idx| context_stack.slice( 0, idx + 1 ).join( '/' ) + "/#{klass_name}" }

    # search for matching routes
    matched = routes.select{ |r| context_stack.include?( r[:controller] ) and r[:action] == action }

    # if that didn’t work, look for anything that matches the wider pattern
    if matched.empty?

      # remove our class name from the stack
      context_stack.map!{ |c| c.gsub( "/#{klass_name}", '' )}

      # perform a wider search, grab the longest match
      matched = routes.select{ |r|
        r[:action] == action and
        r[:controller].ends_with?( klass_name ) and
        context_stack.select{ |c| r[:controller].starts_with?( c ) }.any?
      }.sort{ |b, a| a[:name].length <=> b[:name].length }

    end

    # if we’re still a failure
    raise "Cannot find action #{action} for model #{klass.to_s}" if matched.empty?

    # construct our parameters (we’ll use the form context for this, as it should contain everything we have)
    context = ( @form_context[1..-1] << object_or_model ).slice( 0, matched.first[:params].length )

    # call the appropriate route
    send( "#{matched.first[:name]}_path", *context, params )

  end

  private

    # Loads routes and dumps them into an iVar
    def load_routes

      # get our routes
      routes = Rails.application.routes.routes.to_a

      # filter out internal routes, those outside our base context, and those with no name
      routes.reject!{ |r| r.internal or !r.defaults.key?( :controller ) or r.name.nil? }

      # finally, map everything to a simpler version
      self.routes = routes.map do |r|
        {
          controller: r.defaults[:controller],
          action:     r.defaults[:action].to_sym,
          name:       r.name,
          params:     r.parts.reject{ |p| p == :format }
        }
      end

    end

end

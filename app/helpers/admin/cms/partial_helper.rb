module Admin::Cms::PartialHelper

  # Finds the CMS partial for the appropriate content type. This allows template inheritence between individual CMS-based
  # controller and CMSController itself.
  #
  # === Expected parameters
  #
  # [partial]   _(string)_ the name of the partial
  def partial_for( partial, action_or_options = {} )

    # sort out our options
    options = action_or_options.is_a?( Hash ) ? action_or_options : { action: action_or_options }

    # default some options
    options[:action] ||= params[:action]
    options[:format] ||= '.html'
    options[:ignore_missing] ||= false

    # work out a list of candidate paths (stop at admin/cms)
    candidates = lookup_context.prefixes.slice(0, lookup_context.prefixes.index('admin/cms') + 1).map{ |p| "#{p}/#{options[:action]}" }

    # iterate through
    candidates.each do |path|

      return "#{path}/#{partial}" if partial_exists?( "#{partial}#{options[:format]}", path )

    end

    # bail, if we’re ignoring stuff
    return if options[:ignore_missing]

    # otherwise, make ActionViewer barf instead
    lookup_context.find( "#{partial}", candidates, true )

  end

  # Returns whether or not a partial exists within a given context
  #
  # === Parameters
  #
  # [partial] _(string)_ the partial to look for
  # [context] _(string)_ the context to look within
  def partial_exists?( partial, context = '' )

    lookup_context.exists?( partial, context, true )

  end

end

# Root CMS controller. This provides much of the CRUD-y functionality for the administration interface.
class Admin::CMSController < Admin::BaseController
  include Admin::CMS::Definitions

  # define some callbacks for content extraction
  define_callbacks :content_extract

  # include some namespaced helpers
  helper Admin::CMS::PartialHelper, Admin::CMS::FormHelper, Admin::CMS::UrlHelper, Admin::CMS::TableHelper, Admin::CMS::MarkupHelper

  # expose some of ourselves to the view layer
  helper_method :action_allowed?

  # Constructor
  def initialize
    super

    # set the name of the model to be managed
    @model_class = nil

    # Ability flags
    @allow = {
      create:   true,
      update:   true,
      destroy:  true,
      search:   false
    }

    # After-x redirects
    @redirects = {
      create:   nil,
      update:   nil,
      destroy:  nil
    }

    # default sort params
    @default_sort = {
      column: 'created_at',
      order:  'd'
    }

    # Context for our forms
    @form_context = [ :admin ]

    # Auto-search fields
    @searchable_fields = []

  end

  # Provides an item listing and search functionality. This should not be extended.
  #
  # === Expected Parameters
  #
  # [search]  an optional search parameter (ignored if search is disabled on this controller)
  # [page]    a pagination parameter
  def index

    # if we’re searching
    if params.key?( :search ) and action_allowed?( :search )

      # we’re searching: attempt to do a custom search
      @content = add_pagination_and_sorting( custom_search )

    else

      # otherwise, grab all the things
      @content = add_pagination_and_sorting( custom_index )

    end

    generate_titles

  end

  # Shows stats for a given item of content.
  #
  # === Expected Parameters
  #
  # [id]  the ID of the content to display.
  def stats

    # extract the content
    extract_content
    generate_titles

  rescue ActiveRecord::RecordNotFound

    not_found and return

  end

  # Returns a single item of content.
  #
  # === Expected Parameters
  #
  # [id]  the ID of the content to display.
  def show

    # extract the content
    extract_content
    generate_titles

  rescue ActiveRecord::RecordNotFound

    not_found and return

  end

  # Shows the creation form for the content.
  def new

    # check whether we can do this
    not_found and return unless action_allowed?( :create )

    # extract content
    extract_content
    generate_titles

  end

  # Callback from the #new method: attempts to save a new item to the database.
  def create

    # Can we do this?
    not_found and return unless action_allowed?( :create )

    # load the content
    extract_content( true )
    generate_titles( :new )

    # try to save it
    if @content.save

      respond_after_action( :create, :created )

    else

      # it failed: so show a flash + redisplay the form
      flash.now[:error] = status_t( @content, :create_failed )
      render( action: :new )

    end

  end

  # Shows the edit form for a single item of content.
  #
  # === Expected Parameters
  #
  # [id]  the ID of the item of content we’re editing
  def edit

    # if we can’t do this
    not_found and return unless action_allowed?( :update )

    # load the content
    extract_content
    generate_titles( :edit )

  rescue ActiveRecord::RecordNotFound

    not_found and return

  end

  # Callback from edit: attempts to save the changes to the given content.
  #
  # === Expected Parameters
  #
  # [id]  the ID of the item we’re saving
  def update

    # if we can’t do this
    not_found and return unless action_allowed?( :update )

    # load the content + populate it
    extract_content( true )
    generate_titles( :edit )

    # try to save it
    if @content.save

      respond_after_action( :update, :updated )

    else

      # it failed: so show a flash + redisplay the form
      flash.now[:error] = status_t( @content, :updated_failed )
      render( action: :edit )

    end

  rescue ActiveRecord::RecordNotFound

    not_found and return

  end

  # Destroys the given item of content, usually with confirmation.
  #
  # === Expected Parameters
  #
  # [id]  the ID of the content to delete
  # [confirm] any value to confirm deletion of the item (just needs to be present)
  def destroy

    # check whether this is right
    not_found and return unless action_allowed?( :destroy )

    # load the content + dump the context
    extract_content
    generate_titles

    # if we are either not HTML, or it’s been confirmed
    if !request.format.html? or params.key?( :confirm )

      # if it worked
      if @content.destroy

        respond_after_action( :destroy, :destroyed )

      else

        flash.now[:error] = status_t( @content, :destroy_failed )

      end

    end

  rescue ActiveRecord::RecordNotFound

    not_found and return

  end

  ## -- END PUBLIC API --

  protected

    # Internal function to allow overriding of the default ‘index’ query, used when the #index method is called without
    # a search query, or when searching is disabled. This allows subclasses to do clever things far more easily.
    def custom_index

      # By default, just use Model.all
      @model_class.all

    end

    # Internal function to allow overriding of the search.
    def custom_search

      # if we’ve no searchable fields, then just fail out
      return [] if @searchable_fields.empty?

      # otherwise, construct our query
      fields = []
      values = []
      @searchable_fields.each do |f|

        fields << "#{f} LIKE ?"
        values << "%#{params[:search]}%"

      end

      # run the query
      @model_class.where( fields.join( ' OR '), *values )


    end

    # Generates the page title + breadcrumb for the current page + action.
    def generate_titles( action = nil, content = nil )

      action  = ( action.nil? ? action_name : action.to_s )
      content ||= @content unless @content.nil? || ( action === 'index' )

      # if we’re in something that has an additional segment, show that
      unless content.nil? or action == 'new'

        @breadcrumb << {
          title: breadcrumb_t( @model_class, :show, { title: content.to_s } ),
          url:   ( path_for( content, :show ) rescue nil )
        }

      end

      # put the current location on the breadcrumb, + generate the title
      @breadcrumb << breadcrumb_t( @model_class, action, { title: content.to_s }) unless ( action == 'index' )
      @page_title  = title_t( @model_class, action, { title: content.to_s })

    end

  ## -- END EXTENDABLE API --

  private

    # Utility function that adds pagination and ordering parameters to the index/search queries.
    def add_pagination_and_sorting( query )

      query.paginate( page: params[:page] ).order( "#{sort_column} #{( sort_order == 'a' ) ? 'ASC' : 'DESC' }" )

    end

    # Utility function that acquires a single item of content for use with the various CRUD functions in this controller.
    #
    # If an @id@ parameter is specified, it will attempt to load content with that particular ID from the database.
    #
    # === Parameters
    #
    # [update_from_params] _(bool)_ whether to try updating the content from inbound request parameters
    def extract_content( update_from_params = false )

      # wrap in a callback so we can do things further down
      run_callbacks :content_extract do

        # load the object
        @content = params.key?( :id ) ? @model_class.find( params[:id] ) : @model_class.new

        # if we’re trying to update things
        @content.assign_attributes( get_assignable_params ) if update_from_params

        # call down, if we’ve been provided with a block
        yield if block_given?

      end

      # Add the content to our context
      @form_context << @content

    end

    # Utility function that acquires the contents of a submitted form, using ApplicationRecord#cms_assignable_attributes
    # to permit it appropriately.
    def get_assignable_params

      params.require( :content ).permit( @model_class.cms_assignable_attributes )

    end

    # Utility function that returns whether or not the specified action is allowed. This is entirely so we can
    # enable/disable various actions, rather than anything to do with user permissions… although that might be nice
    # sometime too!
    #
    # === Parameters
    #
    # [action] the action to check
    def action_allowed?( action )

      @allow.key?( action ) and @allow[action]

    end

    # Utility function that bounces the user to a different page after successfully creating/updating/destroying an
    # item of content.
    #
    # === Parameters
    #
    # [action]  the action that has just happened
    # [verb]    the verb to use for localisation
    def respond_after_action( action, verb )

      # work out where we’re going
      new_url = params.key?( :back_to ) || url_for( action: :index, only_path: true )

      # if there’s an override…
      if @redirects.key?( action ) and !@redirects[action].nil?

        new_url = @redirects[action].respond_to?( :call ) ? @redirects[action].call( @content || @model_class ) : @redirects[action]

      end

      # we now have a URL, so switch on format
      respond_to do |format|

        # HTML gets a flash and a bounce
        format.html do

          flash[:success] = status_t( @content, verb, title: @content.to_s )
          redirect_to( new_url )

        end

        # JSON just gets JSON
        format.json { render action: :show }

      end

    end

    # Helper function that returns the current sort column, derived from the @s@ query parameter, and reverting to
    # @default_sort[:column]@.
    #
    # @TODO: allow sorting on foreign keys
    def sort_column

      (params.key?( :s ) and @model_class.column_names.include?( params[:s] )) ? params[:s] : @default_sort[:column]

    end

    # Helper function that returns the current sort order, derived from the @d@ parameter and reverting to @default_sort[:order]@.
    def sort_order

      ( params.key?(:d) and %{ a d }.include?( params[:d] )) ? params[:d] : @default_sort[:order]

    end

end

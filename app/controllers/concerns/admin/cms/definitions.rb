module Admin::CMS::Definitions
  extend ActiveSupport::Concern

  # Define some basic field properties
  BASE_FIELD_DEFINITIONS = {
    type:     :text,
    required: false,
    _wrapped: true
  }

  # Define field types that shouldn’t be wrapped
  UNWRAPPED_FIELDS = %w{ group }

  # Bind our before action
  included do

    # Hook an action to load the definition file
    before_action :load_definition_file

    # Also, expose our helper methods
    helper_method :list_definition, :form_definition

    attr_accessor :definition

  end

  protected

    # Returns the list definition for this controller, if specified
    def list_definition

      # if we have no definition
      return nil if @definition.nil? or !@definition.key?( :list )

      # normalise things if we’ve not done it already
      unless @definition[:list].key?( :_normalised )

        @definition[:list][:columns]     = normalise_list_columns
        @definition[:list][:_normalised] = true

      end

      # return the columns
      @definition[:list]

    end

    # Returns the form definition for this controller, if specified
    def form_definition

      # if we have no definition
      return nil if @definition.nil? or !@definition.key?( :form )

      # normalise things if we’ve not done it already
      unless @definition[:form].key?( :_normalised )

        @definition[:form][:fields]      = normalise_form_fields
        @definition[:form][:_normalised] = true

      end

      # return the fields
      @definition[:form]

    end

  private

    # Loads the definition file for the current controller.
    def load_definition_file

      # get a base path
      path = Rails.root.join( 'app/views', controller_path )
      candidates = Dir.glob( path.join( '*.{yml,yaml}' ))

      # if it didn’t work
      return if candidates.empty?

      # otherwise, load the file
      @definition = YAML.load_file( candidates.first ).deep_symbolize_keys

    end

    # Normalises the list definition
    def normalise_list_columns

      @definition[:list][:columns].map do |col|

        # if the column is just a property name, sort that out
        col = { property: col } unless col.is_a?( Hash )
        col[:property] = col[:property].to_sym

        # default some other stuff
        col[:sortable] ||= false
        col[:label]    ||= col[:property]
        col[:template] ||= "= content.send( :#{col[:property]} )"

        # return the column
        col

      end

    end

    # Normalises the form fields.
    def normalise_form_fields( fields = nil )

      # blah
      fields ||= @definition[:form][:fields]

      # iterate through everything
      fields = fields.map do |name, spec|

        # if the fieldspec is just a type string
        spec = { type: spec } unless spec.is_a?( Hash )

        # merge in our base spec
        spec = BASE_FIELD_DEFINITIONS.merge( spec ).merge(
          field:    name,
          required: @model_class.property_required?( name ),
          _wrapped: !UNWRAPPED_FIELDS.include?( spec[:type] )
        )

        # if there are subfields, recurse thereward
        spec[:fields] = normalise_form_fields( spec[:fields] ) if spec.key?( :fields )

        # return the spec to the map function
        spec

      end

      # return our newly-crunched fields
      fields

    end


end

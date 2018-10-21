class FormManager
  
  # Define some basic field properties
  BASE_FIELD_DEFINITIONS = {
    type:     :text,
    required: false
  }
  
  
  def initialize( definition_path, klass = nil )
    
    # set an empty fields array
    @fields = []
    @loaded = false
    
    # work out a path and load it
    file_path = get_path( definition_path )
    load_definition( file_path, klass ) unless file_path.nil?
    
  end
  
  def fields
    
    @fields
    
  end
  
  def loaded?
    
    @loaded
    
  end
  
  private
  
    # Gets the file path for a definition file.
    #
    # === Parameters
    #
    # [definition_path] the base path to load from
    def get_path( definition_path )
      
      yaml_path = Rails.root.join( 'app', 'views', definition_path )
      
      # check for .yaml
      if File.exists?( yaml_path.join( 'form-definition.yaml' ))
        
        return yaml_path.join( 'form-definition.yaml' )
        
      # check for .yml
      elsif File.exists?( yaml_path.join( 'form-definition.yml' ))
        
        return yaml_path.join( 'form-definition.yml' )
        
      end
      
      nil
    end
    
    
    # Loads the form definition from a given YML file.
    def load_definition( file_path, klass )
      
      # load base definition
      defn = YAML.load_file( path ).symbolize_keys
      
      # start normalising things
      @fields = normalise_fields( defn[:fields], klass )
      @loaded = true
      
    end
    
    def normalise_fields( fields, klass )
      
      # symbolise everything
      fields.symbolize_keys!
      
      # iterate through everything
      fields = fields.map do |fieldname, fieldspec|
        
        # if the fieldspec is just a string, turn it into a hash
        fieldspec = { type: fieldspec } unless fieldspec.is_a?( Hash )
        
        # symbolise some more
        fieldspec.symbolize_keys!
        
        # merge in a base spec
        fieldspec = BASE_FIELD_DEFINITIONS.merge( fieldspec ).merge( 
          field: fieldname,
          required: klass.property_required?( fieldname )
        )
        
        # is this field required
        fieldspec[:required] = klass.property_required?( fieldname )
        
        # if there are sub-fields, recurse
        if fieldspec.key?( :fields )
          
          fieldspec[:fields] = normalise_fields( fieldspec[:fields], klass )
          
        end
        
        fieldspec
        
      end
      
      fields
      
    end
  
end
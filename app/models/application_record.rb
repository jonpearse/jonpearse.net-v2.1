class ApplicationRecord < ActiveRecord::Base
  include Errorable, AssignableProperties
  
  self.abstract_class = true
  
  # Returns a prinable name for this model instance
  def to_s
    
    if respond_to?( :name )
      
      name
      
    elsif respond_to?( :title )
      
      title
      
    else
      
      "#{self.model_name.human} ##{id}"
            
    end
    
  end
  
  # Returns an array containing the names of relations that should be serialised to JSON. By default, these are only
  # `has_one` and `belongs_to` relations (ie, only those that will have a single entity, if any)
  def serialisable_relations

    ( 
      self.class.reflect_on_all_associations( :has_one ) 
      +
      self.class.reflect_on_all_associations( :belongs_to )
    ).map{ |r| r.name }

  end
end

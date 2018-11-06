module AssignableProperties
  extend ActiveSupport::Concern

  class_methods do

    def add_assignable_attributes( additional )

      additional = [ additional ] unless additional.is_a?( Array )

      @extra_cms_attrs ||= []
      @extra_cms_attrs += additional

    end

    # Returns an array of attributes that are assignable in the CMS. This is a bit of an experiment as previously I put
    # it in the CMS controllers, but that made for some interesting issues with concerns + deep-assignment.
    # This might possibly be nicer, who knows?
    def cms_assignable_attributes

      # get the available columns on this model but without the PK (as this shouldn’t be assigned)
      assignable = self.column_names.reject{ |f| f == self.primary_key }.map( &:to_sym )

      # also, get the other half HABTM relationships
      self.reflect_on_all_associations( :has_and_belongs_to_many ).each{|a| assignable << { "#{a.association_foreign_key.pluralize}": [] }}

      # dump in anything else + return
      assignable = assignable.concat( @extra_cms_attrs ) unless defined?( @extra_cms_attrs ).nil?

      assignable

    end

  end

end

module SerialisableProperties
  extend ActiveSupport::Concern

  class_methods do

    def add_unserialisable_attrs( additional )

      @unserialisable_attrs ||= [ :created_at, :updated_at ]

      additional = [ additional ] unless additional.is_a?( Array )
      @unserialisable_attrs += additional

    end

    def add_serialisable_attrs( additional )

      @serialisable_attrs ||= []

      additional = [ additional ] unless additional.is_a?( Array )
      @serialisable_attrs += additional

    end

    def cms_serialisable_attrs

      # get keys
      keys = self.column_names.reject{ |k| k.ends_with?( '_id' )}.map( &:to_sym )

      # exclude ones we don’t want
      unless defined?( @unserialisable_attrs ).nil?

        keys.reject!{ |k| @unserialisable_attrs.include?( k.to_sym )}

      end

      # add things we do
      keys = keys.concat( @serialisable_attrs ) unless defined?( @serialisable_attrs ).nil?

      keys

    end

  end

  def cms_serialisable_attrs

    Hash[ self.class.cms_serialisable_attrs.map{ |k| [ k, send( k )]}]

  end

end

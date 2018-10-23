module SplitDate
  extend ActiveSupport::Concern

  class_methods do
    def has_split_date( *fields )
      include InstanceMethods

      # bind everything
      fields.each do |f|

        # define setter
        self.send( :define_method, "#{f}=" ) do |value|

          set_date( f, value ) if value.is_a?( Hash )

        end

        # also, register as an additional fields
        add_assignable_attributes( "#{f}": %i{ day month year } )

      end

    end
  end

  module InstanceMethods

    private

    def set_date( field, value )

      # sanitise things
      value = value.symbolize_keys.select{ |k,v| [ :day, :month, :year ].include? k }

      # clean things up a little
      value = value.transform_values{ |v| (v.nil? or v.blank?) ? nil : v.to_i }.reject{ |k,v| v.nil? or (v <= 0) or (k == :month and v > 12) }

      # cascade delete
      value.delete( :day ) if value.key?( :year ) && value.key?( :month ) && value.key?( :day ) && value[:day] > Time.days_in_month( value[:month], value[:year] )

      # if everything went wrong, fail out
      if value.empty?

        write_attribute( field, nil )
        return

      end

      # default everything and create our date from it
      pop_values = { year: 1752, month: 1, day: 1 }.merge(value)
      write_attribute( field, Date.new( pop_values[:year], pop_values[:month], pop_values[:day], Date::ENGLAND ))

    end
  end
end

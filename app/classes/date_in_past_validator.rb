class DateInPastValidator < ActiveModel::EachValidator

  def validate_each( record, attr_name, value )

    record.errors.add( attr_name, :date_not_in_past, options ) unless value.nil? or (value <= Date::today)

  end

end

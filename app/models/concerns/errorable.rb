# This hooks into ActiveRecord::Base and provides a slightly simpler way of accessing Rails’ default error
# messages/handling.
#
# I may get around to turning into a gem at some point, but this works well enough for now.
module Errorable
  extend ActiveSupport::Concern

  # Returns whether or not there is an error associated with the provided property
  def has_error?( property )
    
    self.errors[property].present?
    
  end

  # Utility function that concatenates all available validation error messages for the provided property.
  def error_messages( property )
    
    unless self.has_error?( property )
      return nil
    end

    # shortcut—if the user has entered nothing in a required field, just tell them that: it's pointless to tell them
    # it's required, and in the wrong format...
    if self.property_required?( property ) && self.send( property ).blank? && ( property != :password )
       return self.errors.generate_message( property, :blank )
    end

    ret = ''
    idx = 0
    self.errors[property].each do |msg|
      ret << ((idx == 0) ? msg : ", " + msg[0].downcase + msg[1..-1])
      idx += 1
    end

    ret
  end

  # Helper to find out if a field is required.
  def property_required?( property )

    self.class.validators_on( property ).map( &:class ).include?( ActiveRecord::Validations::PresenceValidator )

  end

  # Returns all requested messages for the given property.
  #
  # === Parameters
  #
  # [property] the property for which to return messages
  # [required] the errors you wish to get messages for
  def get_messages_for( property, required = [] )

    retval = {}

    # iterate through array of messages
    required.each do |r|

      message = errors.generate_message( property, r, { raise: true }) rescue nil

      retval[r] = message unless message.blank?

    end

    retval

  end
end

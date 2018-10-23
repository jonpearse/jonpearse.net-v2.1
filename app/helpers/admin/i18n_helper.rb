# Provides some helper methods for Rails I18n functions.
module Admin::I18nHelper

  # Returns the human name for a field within a model. This is a wrapper for human_attribute_name.
  #
  # === Parameters
  #
  # [content] _(mixed)_ either a class extending ActiveRecord::Base or an instance thereof
  # [field] _(string)_ the name of the field
  def label_text_for( content, field )

    ( content.is_a?( Class ) ? content : content.class ).human_attribute_name( field ).humanize

  end

  # Returns a localised prompt for the given model.
  #
  # === Parameters
  #
  # [object] the model instance or class you want the localisation for
  # [prompt] the prompt you want the localisation for
  # [defaults] any defaults you wished passed to I18n.translate
  #
  # === I18n Keys
  #
  # This function will try the following I18n keys, in order
  #
  # * admin.prompts.models.[model_key].[prompt]
  # * admin.prompts.[prompt]
  def prompt_t( object, prompt, defaults = {} )

    fallthru_t( object, prompt, [ 'prompts' ], defaults )

  end

  # Provides a localised status for the given model.
  #
  # === Parameters
  #
  # [object] the model instance or class you want the localisation for
  # [prompt] the status you want the localisation for
  # [defaults] any defaults you wished passed to I18n.translate
  #
  # === I18n Keys
  #
  # This function will try the following I18n keys, in order
  #
  # * admin.status.models.[model_key].[prompt]
  # * admin.status.[prompt]
  def status_t( object, status, defaults = {} )

    fallthru_t( object, status, [ 'status' ], defaults )

  end

  private

    # Tries to find the most applicable translation for a particular key, based on model name. This is similar to the
    # way Rails handles fallbacks for validation messages and the like, just for our own specific ends =)
    #
    # === Parameters
    #
    # [object] the model instance or class the localisation is for
    # [key] the I18n key to get
    # [scope] an array of one or more I18n key stems to use
    # [defaults] any defaults to be passed to I18n#translate
    def fallthru_t( object, key, scope, defaults )

      # normalise our inbound object
      i18n_object = i18n_object_for( object )

      # translate our scope into model-specific keys
      scope = scope.map{ |k| [ :"admin.#{k}.models.#{i18n_object.i18n_key}.#{key}", :"admin.#{k}.#{key}" ]}.flatten

      # set some general defaults for substitution
      options = defaults.merge( create_defaults_for( i18n_object, object ))

      # add our fallbacks
      options = { default: scope }.merge( options.except( :default ))

      # translate
      t( scope.shift, options )

    end

    # Returns the i18n-friendly object for a given class/instance/etc.
    def i18n_object_for( object )

      # if it’s a string…
      if object.is_a?( String )

        klass = object.constantize

      elsif !object.is_a?( Class )

        klass = object.class

      else

        klass = object

      end

      # if we can get a model name
      if klass.respond_to?( :model_name )

        return klass.model_name

      end

      raise "Cannot find internationalization key for #{object.inspect}"

    end

    # Creates some defaults for a given internationalisable object
    def create_defaults_for( i18n_object, base_object )

      {
        id: (base_object.present? and base_object.respond_to?(:id)) ? base_object.id : nil,
        'model_singular': i18n_object.human( count: 1,  capitalize: false ),
        'model_plural':   i18n_object.human( count: 99, capitalize: false ),
        'model_zero':     i18n_object.human( count: 0,  capitalize: false ),
      }

    end

end

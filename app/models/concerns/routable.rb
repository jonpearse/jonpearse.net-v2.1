# Common helper mixin that handles generation of a URL-friendly ‘slug’ before a model is saved.
module Routable
  extend ActiveSupport::Concern

  # Bind a before_save handler
  included do

    # define a save handler
    before_save :generate_routing_slug

    # Also, define some callbacks
    define_model_callbacks :slug_generated

  end

  def update_slug!

    generate_routing_slug
    save

  end

  private

    def generate_routing_slug

      run_callbacks :slug_generated do

        write_attribute( :slug, to_s.slugify( 64 ).downcase ) unless to_s.blank?

      end

    end

end

Haml::Template.options[:attr_wrapper] = '"'
Haml::Template.options[:remove_whitespace] = true if Rails.env.production?

# Remove godawful form error markup
ActionView::Base.field_error_proc = ->(html_tag, instance){ html_tag.html_safe }

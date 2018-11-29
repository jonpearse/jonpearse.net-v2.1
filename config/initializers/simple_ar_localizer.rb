# Add custom rules to the SimpleARLocalizer functionality
Rails.application.config.ar_localization_rules = {

  # override default naming strategy when only specifing a single name.
  # This is more complex than it needs be because the I18n pluralisation module doesn’t pluralise by itself…
  name: [
    'activerecord.models.%{model}.one',
    { key: 'activerecord.models.%{model}.other', proc: ->(s){ s.pluralize }}
  ],

  # Pass statuses + promps to the administration system
  'prompts/:prompt': 'admin.prompts.models.%{model}.%{prompt}',
  'statuses/:status': 'admin.status.models.%{model}.%{status}',
  'titles/:title': 'admin.titles.models.%{model}.%{title}',
  'breadcrumbs/:crumb': 'admin.breadcrumbs.models.%{model}.%{crumb}'
}

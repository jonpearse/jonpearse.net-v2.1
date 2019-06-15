# Define Sidekiq-cron tasks. See https://github.com/ondrejbartas/sidekiq-cron for configuration options.
# Note that all times are UTC unless specified.

# Run stats at 4am daily
Sidekiq::Cron::Job.create(
  name:   'Daily stats aggregation',
  cron:   '0 4 * * *',
  class:  'Stats::AggregationWorker'
)

# Reimport GeoIP database (every Weds)
Sidekiq::Cron::Job.create(
  name:   'Updating GeoIP database',
  cron:   '0 0 * * 3',
  class:  'Stats::ReloadWorker'
)

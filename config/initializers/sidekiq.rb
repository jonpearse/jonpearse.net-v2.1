# Define Sidekiq-cron tasks. See https://github.com/ondrejbartas/sidekiq-cron for configuration options.
# Note that all times are UTC unless specified.

# Run stats at 4am daily
Sidekiq::Cron::Job.create(
  name:   'Daily stats aggregation',
  cron:   '0 4 * * *',
  class:  'Stats::AggregationWorker'
)

# Reimport GeoIP database (first wednesday of every month)
Sidekiq::Cron::Job.create(
  name:   'Updating GeoIP database',
  cron:   '0 0 1-7 * 3',
  class:  'Stats::ReloadWorker'
)

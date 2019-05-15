class Stats::ReloadWorker
  include Sidekiq::Worker, Cronloggable

  def perform

    # This is scheduled to run every wednesday, but we only want it to run on the first of the month, so…
    return unless (1..7).cover?( Date.today.day )

    # otherwise…
    open_log

    if defined?( Rake ).nil?

      Jjp21::Application.load_tasks

    else

      Rake::Task[ 'jjp2:stats:reload_ip_blocks' ].reenable

    end

    Rake::Task[ 'jjp2:stats:reload_ip_blocks' ].invoke

    write_log

  end

end

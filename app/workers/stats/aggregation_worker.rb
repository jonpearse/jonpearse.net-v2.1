class Stats::AggregationWorker
  include Sidekiq::Worker, Cronloggable

  def perform

    open_log

    if defined?( Rake ).nil?

      Jjp21::Application.load_tasks

    else

      Rake::Task[ 'jjp2:stats:aggregate' ].reenable

    end

    Rake::Task[ 'jjp2:stats:aggregate' ].invoke

    write_log

  end

end

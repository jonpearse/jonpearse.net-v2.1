class Stats::AggregationWorker
  include Sidekiq::Worker

  def perform

    if defined?( Rake ).nil?

      Jjp21::Application.load_tasks

    else

      Rake::Task[ 'jjp2:stats:aggregate' ].reenable

    end

    Rake::Task[ 'jjp2:stats:aggregate' ].invoke

  end

end

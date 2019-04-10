class Stats::ReloadWorker
  include Sidekiq::Worker

  def perform

    if defined?( Rake ).nil?

      Jjp21::Application.load_tasks

    else

      Rake::Task[ 'jjp2:stats:reload_ip_blocks' ].reenable

    end

    Rake::Task[ 'jjp2:stats:reload_ip_blocks' ].invoke

  end

end

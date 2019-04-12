module Cronloggable

  def start

    @start_time = DateTime.now

  end

  def finish

    Cronlog.record( self, @start_time )

  end

end

module Cronloggable

  def open_log

    @start_time = DateTime.now

  end

  def write_log

    Cronlog.record( self, @start_time )

  end

end

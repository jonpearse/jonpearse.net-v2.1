module Admin::AdminHelper

  def get_cronlog_badge

    Cronlog.unread.count

  end

end

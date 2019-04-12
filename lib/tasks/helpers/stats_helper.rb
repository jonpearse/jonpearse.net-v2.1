module StatsHelper

  def aggregate

    cutoff = Date.today.strftime( '%Y-%m-%d 00:00:00' )

    # load named sessions
    Stats::Raw.trackable.map( &:session_id ).each do |sess_id|

      # load all views for this session
      views = Stats::Raw.by_session( sess_id )

      # create a new session
      sess = create_new_session( views.first )

      # log pageviews against the session
      views.each{ |v| create_pageview( v, sess )}

    end

    # load anonymous sessions
    Stats::Raw.anonymous.each do |raw|

      sess = create_new_session( raw )
      create_pageview( raw, sess )

    end

    # nuke everything
    Stats::Raw.delete_all

  end
  module_function :aggregate

  private

    def self.create_new_session( raw_stat )

      # endeavour to recall
      exist = ( raw_stat.recorded_at.hour < 1 ) ? Stats::Session.recall_from( raw_stat.session_id ).first : nil

      # return
      exist || Stats::Session.create(
        key:          raw_stat.session_id,
        country:      raw_stat.country,
        ua_name:      raw_stat.browser_name,
        ua_version:   raw_stat.browser_version,
        dark_mode:    raw_stat.dark_mode,
        recorded_on:  raw_stat.recorded_at
      )

    end

    def self.create_pageview( raw_stat, session )

      v = Stats::Pageview.create(
        session_id:   session.id,
        url:          raw_stat.url_path[0..127],
        content_type: raw_stat.content_type,
        content_id:   raw_stat.content_id,
        recorded_at:  raw_stat.recorded_at
      )

    end

end

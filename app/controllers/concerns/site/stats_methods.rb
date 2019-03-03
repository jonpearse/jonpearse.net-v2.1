module Site::StatsMethods
  extend ActiveSupport::Concern

  CONFIG = Rails.application.config.webstats.freeze

  included do

    after_action :record_visit

    @requested_path = nil

  end

  private

    def record_visit

      # bounce out if someone’s logged in, have incurred an error, or should otherwise be ignored
      return if user_signed_in? or error_sent? or ignored_ip? or ignored_ua?

      # get a request and remove any format information
      req_url = ( @requested_path || request.fullpath ).gsub( ".#{params[:format]}", '' )

      # get a database connection + start sanitising data
      conn = ActiveRecord::Base.connection

      ua_name = conn.quote( browser.name )
      ua_vers = conn.quote( browser.version )
      sess_id = request.headers.include?( 'DNT' ) ? 'NULL' : conn.quote( request.session_options[:id] )
      req_url = conn.quote( req_url )
      curr_ip = conn.quote( request.ip )
      dark_mode = @dark_mode ? 1 : 0

      # insert
      sql = "INSERT INTO `stats_raw` (`session_id`, `country`, `browser_name`, `browser_version`, `url_path`, `dark_mode`, `recorded_at`) " +
            "(SELECT #{sess_id}, country, #{ua_name}, #{ua_vers}, #{req_url}, #{dark_mode}, NOW() FROM `stats_ip_blocks` " +
            "WHERE MBRCONTAINS( `ip_range`, POINTFROMWKB(POINT(INET_ATON( #{curr_ip} ), 0))))"
      conn.execute( sql )

    end

    # Returns true if the user is accessing from a blocked IP.
    def ignored_ip?

      CONFIG[ :ignored_ips ].include?( request.ip )

    end

    # Returns true if the visitor’s UA is marked as something we should ignore (ie, a bot or similar)
    def ignored_ua?

      ua_str = request.headers['User-Agent'] || ''

      browser.bot? or CONFIG[ :ignored_uas ].select{ |ua| ua_str.match( ua )}.any?

    end

    # Returns true if an error has been sent at all (this is mostly triggered by the ErrorMethods helper.
    def error_sent?

      !@error_sent.nil?

    end

end

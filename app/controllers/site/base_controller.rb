class Site::BaseController < ApplicationController
  include ErrorMethods

  # set the default layout
  layout :set_layout

  # Load some helpers
  helper Site::ImageHelper, Site::RoutesHelper, Site::RenderingHelper

  # have it set some cookie
  before_action :check_format_sanity, :load_settings
  after_action :set_wf_assumption, :record_visit

  def initialize
    super

    @page_title = nil

    @social_content = {
      title: nil,
      description: nil,
      image: nil
    }

    @requested_path = nil

  end

  private

    def load_settings

      @dark_mode = ( cookies.key?( :dark_mode ) and ( cookies[:dark_mode] == 'true' ))

    end

    def set_wf_assumption

      cookies[:assume_wf] = true

    end

    def set_layout

      ( !!request.xhr? ? 'site_ajax' : 'site' )

    end

    def check_format_sanity

      redirect_to( request.url.gsub( '.jhtml', '' )) if ( !request.xhr? && request[:format] == 'jhtml' )

    end

    def record_visit

      # bounce out if we’re not interested (either the IP is blacklisted, or a bot, or I’m logged in)
      return if Rails.application.config.webstats[:ignored_ips].include?( request.ip ) or browser.bot? or user_signed_in?

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

end

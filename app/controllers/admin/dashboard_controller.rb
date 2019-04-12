# Main landing controller for CMS.
class Admin::DashboardController < Admin::BaseController
  include Admin::StatsMethods

  helper Admin::CMS::UrlHelper

  def home

    @page_title = 'Dashboard'
    @breadcrumb = [ 'Dashboard' ]

  end

  # Performs stat query.
  def get_stats

    # grab stuff
    query = get_extended_stats

    # expose
    @stats = extract_stats_by_axis( query[:query], params[:axis] )
    @query = query[:params]

    # also set a form_context for CMS folk
    @form_context = [ :admin ]

    respond_to do |format|
      format.json { render action: :stats, locals: { axis: params[:axis] }}
    end

  end

  # Return stats by date.
  def stats_by_date

    if params[:pa] == :ua

      @page_title = "#{params[:ua]} #{params[:v]}"
      @breadcrumb = [
        { title: 'Stats',       url: admin_root_path },
        { title: 'User Agents', url: admin_ua_stats_path },
        { title: params[:ua],   url: admin_ua_stats_path( params[:ua] )},
        @page_title
      ]

    elsif params[:pa] == :country

      @page_title = helpers.localised_name_for( params[:c] )
      @breadcrumb = [
        { title: 'Countries', url: admin_country_stats_path },
        @page_title
      ]

    end

  end

  # Return stats by user agent
  def stats_by_ua

    @page_title = params.key?( :ua ) ? params[:ua] : "User agents"
    @breadcrumb = [
      { title: 'Stats',       url: admin_root_path },
      { title: 'User Agents', url: admin_ua_stats_path }
    ]
    @breadcrumb << params[:ua] if params.key?( :ua )

  end

  # Return stats by country
  def stats_by_country

    @page_title = "Countries"
    @breadcrumb = [
      { title: 'Stats', url: admin_root_path },
      @page_title
    ]

  end

  # Return stats by article
  def stats_by_article

    # otherwise
    @page_title = "Articles"
    @breadcrumb = [
      { title: 'Stats', url: admin_root_path },
      @page_title
    ]

  end

  private

    def global_respond

      respond_to do |format|

        format.html
        format.json { render action: :stats }

      end

    end

end

class Site::ProjectsController < Site::BaseController

  def index

    # create some filters
    @tech_ids = []
    techs = []

    # if we have a slug for a particular tech
    if params.key?( :tech )

      # find the tech
      @tech = Tech.find_by_slug( params[:tech] )
      return not_found if @tech.nil?

      # add it to the list
      @tech_ids << @tech.id

    end

    # if we have explicit filters
    if params.key?( :tech_id ) and params[:tech_id].is_a?( Array )

      @tech_ids += params[:tech_id].map( &:to_i ).select{ |i| i > 0 }

    end

    # Load the projects
    query = Project.published.latest
    query = query.with_tech_ids( @tech_ids ) unless @tech_ids.empty?
    @projects = query.paginate( page: params[:page], per_page: 10 )

    # extract techs
    @techs = Tech.with_projects.sort{ |a, b| a.to_s <=> b.to_s }

  end

end

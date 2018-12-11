class Site::PagesController < Site::BaseController

  def home

    @projects = Project.latest( 6 ).live

  end

  def about

  end

end

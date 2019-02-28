class Site::PagesController < Site::BaseController

  def home

    @projects = Project.latest( 6 ).live
    @requested_path = '/' # override to deal with the ‘home’ AJAX route

  end

  def about

  end

end

class Admin::TasksController < Admin::CmsController

  def initialize
    super

    @model_class = Cronlog

    @allow = {
      create:  false,
      update:  false,
      destroy: false,
      search:  false
    }

    @default_sort[:column] = :started

  end

  def sidekiq

    @body_class = '-bleed'
    @page_title = title_t( @model_class, :sidekiq )

    @breadcrumb << breadcrumb_t( @model_class, :sidekiq )

  end

end

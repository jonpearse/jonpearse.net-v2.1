class Admin::TasksController < Admin::CMSController

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

end

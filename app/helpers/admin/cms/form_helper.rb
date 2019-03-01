module Admin::CMS::FormHelper

  #
  def field_wrapper( assigns, &block )

    render( partial: 'admin/cms/form/common/wrapper', locals: assigns.merge( block: block ))

  end

  #
  def label_element( assigns )

    render partial: 'admin/cms/form/common/label', locals: assigns

  end

end

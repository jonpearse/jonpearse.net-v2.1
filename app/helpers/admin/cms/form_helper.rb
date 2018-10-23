module Admin::CMS::FormHelper

  #
  def label_element( assigns )

    field = assigns[:field]

    assigns[:form].label( field[:field], label_text_for( assigns[:form].object, field[:field] ), class: 'form__label' )

  end

end

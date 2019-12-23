class PaginationLink < WillPaginate::ActionView::LinkRenderer

  def to_html

    # get items
    items = pagination

    # push and pop
    items.unshift( :first_page )
    items << :last_page

    # generate a bunch of LIs
    lis = items.map do |item|

      if item.is_a?( Integer )

        page_link( item, ( item == current_page ? ' -current' : '' ))

      else

        send( item )

      end

    end

    # output stuff
    tag( :ul, lis.join, class: "pagination__list #{@options[:list_class]}".strip )

  end

protected

  def page_link( page, klass, text = nil )

    # default text
    text ||= page

    # if we need a link…
    if (page && (page != current_page))

      text = link( text, page, class: 'pagination__link -link' )

    else

      text = tag( :span, text, class: 'pagination__link -placeholder' )

    end

    # output a span
    tag :li, text, class: "pagination__page#{klass}"
  end

  def previous_or_next_page( page, text, classname )

    return nil if (page == false) || (page == ( total_pages + 1 ))

    page_link( page, ' -meta', text )

  end

  def first_page

    return nil if @options[:first_label].nil?

    page_link( 1, ' -meta -really-meta', @options[:first_label] )

  end

  def last_page

    return nil if @options[:last_label].nil?

    page_link( total_pages, ' -meta -really-meta', @options[:last_label] )

  end

  def gap

    text = @template.will_paginate_translate(:page_gap) { '&hellip;' }
    %(<li class="pagination__gap -gap">#{text}</li>)

  end

  def url( page )
    super( page ).gsub( '%5B', '[' ).gsub( '%5D', ']' )
  end

end

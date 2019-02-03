json.path request.fullpath
json.title "#{@page_title} :: #{t( 'meta.title' )}"
json.content render( partial: 'layouts/site/main.html.haml' ).strip

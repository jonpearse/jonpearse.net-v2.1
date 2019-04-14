content = @snippet.send( params[:field] )

json.content ( params.key?( :rendered ) ? render_responsive_images( content ) : content )

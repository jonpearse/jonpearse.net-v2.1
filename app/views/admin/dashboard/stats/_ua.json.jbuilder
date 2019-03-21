if params.key?( :ua )

  json.label "#{params[:ua]} #{stat[:axis]}"
  json.link  admin_ua_version_stats_path( link_params.merge( v: stat[:axis] ))

else

  json.link admin_ua_stats_path( ua: stat[:axis] )

end

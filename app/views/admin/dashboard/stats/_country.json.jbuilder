json.label  "#{localised_name_for( stat.axis )} #{emoji_flag_for( stat.axis )}"
json.link   admin_single_country_stats_path( link_params.merge( c: stat[:axis] ))

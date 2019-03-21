json.label  stat.axis.strftime( '%b %-d, %Y' )
json.date   stat.axis

json.offset ( stat.axis - @query[:start].to_date ).to_i

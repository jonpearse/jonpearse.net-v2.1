# calculations
link_params = params.permit( :ua, :c, :v, :ct, :ci ).to_h.symbolize_keys
total = @stats.reduce( 0 ){ |total,stat| total + stat.visitors } * 1.0

json.query do
  json.start  @query[:start].strftime( '%Y-%m-%d' )
  json.finish @query[:finish].strftime( '%Y-%m-%d' )
  json.days   @query[:days].to_i
end

# results
json.results do
  json.array! @stats do |stat|

    json.label    stat.axis
    json.visitors stat.visitors
    json.percent  (( stat.visitors / total ) * 100 ).round( 2 )

    json.partial! "admin/dashboard/stats/#{axis}", stat: stat, link_params: link_params unless axis.nil?

  end
end

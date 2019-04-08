module Admin::StatsMethods
  extend ActiveSupport::Concern

  FILTERS = {
    period:   /^\d+[DWMY]$/,
    date:     /^\d{4}\-\d{2}\-\d{2}$/,
    any:      /.*?/,
    float:    /^[\d.]+$/,
    iso6392:  /^[A-Z]{2}$/,
    klass:    /^[A-Z][a-z]+$/,
    id:       /^[\d]+$/,
  }

  PERIODS = {
    D: :days,
    W: :weeks,
    M: :months,
    Y: :years
  }

  BASE_PARAMS = {
    # Date
    period: :period,
    start:  :date,
    finish: :date,

    # UA
    ua: :any,
    v:  :float,

    # Country
    c: :iso6392,

    # content
    ct: :klass,
    ci: :id
  }

  # hard-code this, because it won’t change =)
  STATS_BEGIN = Date.new( 2018, 9, 1 ).at_midnight

  # Returns a basic stats query with date
  def get_base_stats

    # get the appropriate params for this part of the query
    filtered = filter_params( :period, :start, :finish )

    # basics
    query = Stats::Report
    if filtered.key?( :start ) and filtered.key?( :finish )

      query = query.between( filtered[:start], filtered[:finish] )

    elsif filtered.key?( :start )

      query = query.since( filtered[:start] )
      filtered[:finish] = Date.today.at_midnight

    elsif filtered.key?( :finish )

      query = query.before( Date.parse( filtered[:start] ))
      filtered[:finish] = STATS_BEGIN

    elsif filtered.key?( :period )

      # convert period string to a date
      m = filtered[:period].match( /(\d+)(\w)/ )
      d = m[1].to_i.send( PERIODS[ m[2].to_sym ]).ago.at_midnight

      # query
      query = query.since( d )

      # also add to the filtered stuff
      filtered[:start] = d
      filtered[:finish] = Date.today.at_midnight

    end

    # work out the number of days
    filtered[:days] = ( filtered[:finish] - filtered[:start] ) / 1.day

    # return
    {
      query:  query,
      params: filtered
    }

  end

  # Performs additional filtering, based on whatever we’re doing
  def get_extended_stats

    # get a set of basic statistics stuff
    retval = get_base_stats
    query = retval[:query]

    # filter out the params we need for this
    filtered = filter_params( :ua, :v, :c, :ct, :ci )
    retval[:params].merge!( filtered )

    # if we’re filtering by UA
    if filtered.key?( :ua )

      query = filtered.key?( :v ) ?
              query.for_version( filtered[:ua], filtered[:v] ) :
              query.for_ua( filtered[:ua] )

    end

    # filter by country
    query = query.for_country( filtered[:c] ) if filtered.key?( :c )

    # filter by content type + ID
    if filtered.key?( :ct )

      query = query.for_ct( filtered[:ct] )
      query = query.for_ci( filtered[:ci] ) if filtered.key?( :ci )

    end

    # feed back
    retval[:query] = query

    # return
    retval

  end

  # Extracts stats by a given axis, depending on parameters passed in.
  #
  # === Parameters
  #
  # [axis] the axis to extract
  def extract_stats_by_axis( query, axis = nil )

    case axis.to_sym

    # extract by date
    when :views
      query = query.by_date

    # extract by UA
    when :ua
      query = ( params.key?( :ua ) ? query.by_version : query.by_ua )

    when :country
      query = query.by_country

    when :content
      query = query.by_content

    end

    query

  end


  private

    # Returns an array of filtered parameters that match our intended format.
    #
    # === Parameters
    #
    # [allowed] an array of parameter names to return, if set
    def filter_params( *allowed )

      # grab params
      filtered = params.permit( allowed ).to_h.symbolize_keys.select{ |k,v| v.match( FILTERS[ BASE_PARAMS[ k ]]) }

      # do any necessary parsing
      filtered.update( filtered ) do |k,v|

        v = Date.parse( v ).at_midnight if BASE_PARAMS[ k ] == :date

        v

      end

    end

end

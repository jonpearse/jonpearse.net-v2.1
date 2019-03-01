namespace :jjp2 do

  namespace :stats do

    desc "Reload GeoIP data from MaxMind"
    task reload_ip_blocks: [ 'jjp2:geoip:load' ]

  end

end

Rails.application.config.webstats = {

  # any IPs we should ignore on principle
  ignored_ips: [ '31.132.32.40' ],

  # any additional UA fragments to ignore (because Browser gem doesn’t seem to be updated often + isn’t pluggable)
  ignored_uas: [
    'ZoominfoBot',
    'zgrab/0.x'
  ]
}

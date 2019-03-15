Rails.application.config.webstats = {

  # any IPs we should ignore on principle
  ignored_ips: [ '31.132.32.40' ],

  # any additional UA fragments to ignore (because Browser gem doesn’t seem to be updated often + isn’t pluggable)
  ignored_uas: [
    'ZoominfoBot',
    'zgrab/0.x',

    # new bots + bot-like UAs, March 15th 2019
    'Uptimebot/1.0',
    'Tiny Tiny RSS/19.2',
    'Nimbostratus-Bot/v1.3.2',
    'BazQux/2.4',
    'Go-http-client/2.0',
    'aiohttp/3.4.4',
    'Datanyze',
    'BoardReader Favicon Fetcher /1.0',
    'Blackboard Safeassign',
    'Daum/4.1',
    'FunWebProducts',
    'Wappalyzer',
    'MetaFeedly/1.0',
    'Feedbin'
  ]
}

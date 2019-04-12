Rails.application.config.webstats = {

  # any IPs we should ignore on principle
  ignored_ips: [ '31.132.32.40' ],

  # any additional UA fragments to ignore (because Browser gem doesn’t seem to be updated often + isn’t pluggable)
  ignored_uas: [
    'ZoominfoBot',
    'zgrab/0.x',

    # new bots + bot-like UAs, March 15th 2019
    'Uptimebot/',
    'Tiny Tiny RSS/',
    'Nimbostratus-Bot/',
    'BazQux/',
    'Go-http-client/',
    'aiohttp/',
    'Datanyze',
    'BoardReader Favicon Fetcher /',
    'Blackboard Safeassign',
    'Daum/',
    'FunWebProducts',
    'Wappalyzer',
    'MetaFeedly/',
    'Feedbin',

    # More new bots, March 20th 2019
    'Seekport Crawler',
    'PageFreezer',
    'reqwest/',
    'RSSOwl/',
    'Dataprovider.com'
  ]
}

# Initialiser for assets: this is to handle versioning + our lack of Sprockets
Rails.application.config.assets = {
    path: Rails.root.join( 'public', 'a' ),
    url: '/a',
    manifest: {}
}

# attempt to load the manifest
if File.exists?( Rails.root.join( 'public', 'a', 'assets.json' ))

  Rails.application.config.assets[:manifest] = JSON.parse( File.read( Rails.root.join( 'public', 'a', 'assets.json' )))

end
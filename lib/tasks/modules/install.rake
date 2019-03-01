namespace :jjp2 do

  namespace :install do

    PASSWORD_CHARS = ("A".."Z").to_a | ("a".."z").to_a | ("0".."9").to_a | "-_.,;+!*()[]{}|~^<>\"'$=".split(//)

    desc "Install administration user"
    task admin: :environment do

      puts "\n\n*** Creating new admin account ***".bold.cyan

      # get an email address
      print "Please enter your email address: "
      input = STDIN.gets.strip

      # generate a password
      password = ( 0...12 ).map{ PASSWORD_CHARS[ rand(PASSWORD_CHARS.length )] }.join

      # create the user
      User.create( email: input, password: password )
      puts "Admin user created with email address #{input.bold} and password #{password.bold}"

    end

    desc "Install base snippets"
    task snippets: :environment do

      Snippet.create(
        ident: 'ecfb1bf134a329f745aaf948c3fa1e1c',
        content: '<span>👋</span> Hi!<br>I really need to write something here…'
      )

    end

  end

  desc "Runs all installation tasks"
  task install: [
    'db:migrate',
    'install:admin',
    'install:snippets'
  ]

end

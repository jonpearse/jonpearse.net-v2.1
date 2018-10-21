Rails.application.routes.draw do

  # General devise stuff
  devise_for :users, path: 'user'

  # Admin namespace
  namespace :admin, path: :m do

    root to: 'dashboard#show'

  end

  # Site namespace
  scope module: :site do

    root to: 'pages#home'

  end

end

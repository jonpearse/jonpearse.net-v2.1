Rails.application.routes.draw do

  # General devise stuff
  devise_for :users, path: 'user'

  # Admin namespace
  namespace :admin, path: :m do

    root to: 'dashboard#show'

    # Blog stuff
    scope module: :blog do

      resources :articles, :categories, except: [ :show ] do
        member do
          get 'destroy', as: :destroy
        end
      end

    end

  end

  # Site namespace
  scope module: :site do

    root to: 'pages#home'

  end

end

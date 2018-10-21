Rails.application.routes.draw do

  # Site namespace
  scope module: :site do

    root to: 'pages#home'

  end

end

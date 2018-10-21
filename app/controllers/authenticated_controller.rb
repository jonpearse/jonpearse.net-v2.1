# Specialised controller that requires the user to be logged in for any action.
class AuthenticatedController < ApplicationController
  
  before_action :authenticate_user!
  
end
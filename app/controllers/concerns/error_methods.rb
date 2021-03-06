module ErrorMethods
  extend ActiveSupport::Concern

  included do

    # Return a 404 for any routing issues
    rescue_from ActionController::RoutingError, with: :not_found

  end

  # Utility function to return a 403 header
  def forbidden

    render_error( :forbidden )

  end

  # Utility function to return a 404 header.
  def not_found

    render_error( :not_found )

  end

  # Utility function to return a 401 header
  def unauthorized

    render_error( :unauthorized )

  end

  protected

    # Returns an appropriate response for an HTTP status code. This should be used with any of the utility functions
    # above.
    def render_error( status_code )

      respond_to do |format|

        format.html { render( action: status_code, status: status_code )}
        format.all  { head( status_code )}

      end

      @error_sent = true

      true # return something so we can chain things

    end

end

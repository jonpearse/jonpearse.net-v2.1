class Site::StorageController < Site::BaseController

  skip_after_action :record_visit

  before_action do
    ActiveStorage::Current.host = request.base_url
  end

  def show

    # find the blob
    @blob = ActiveStorage::Blob::find_by_key( params[:blob_id] )

    # boing!
    expires_in  ActiveStorage::Blob.service.url_expires_in

    # if we have a size
    if params.key?( :size )

      redirect_to @blob.representation( combine_options: { resize: "#{params[:size].to_i( 36 )}>", quality: 60, interlace: :Plane }).processed.service_url( disposition: params[:disposition] )

    else

      redirect_to @blob.service_url

    end

  rescue

    not_found and return

  end

end

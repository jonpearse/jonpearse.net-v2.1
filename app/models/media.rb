class Media < ApplicationRecord

  # relations
  has_one_attached :file
  add_assignable_attributes( :file )
  add_unserialisable_attrs( :preview )
  add_serialisable_attrs( :base64_preview )

  # validate things
  validates :title, presence: true

  # update the preview
  before_save :schedule_preview_generation

  def cms_image

    file.variant( combine_options: { resize: '150x150^', gravity: :center, crop: '150x150+0+0' })

  end

  def base64_preview

    "data:image/png;base64,#{Base64.encode64( preview ).gsub( /\n/, '' )}"

  end

  def generate_preview

    # create a temporary file + dump stuff into it
    tmp = Tempfile.new( "media#{id}-", Rails.root.join('tmp') )
    tmp.binmode
    tmp.write( file.download )

    # now, compress + stuff
    out = ImageProcessing::MiniMagick.resize_to_limit( 20, 20 ).convert( 'png' ).call( tmp )
    `optipng -o7 --strip all -quiet #{out.path} && pngquant -o #{out.path} -f --strip 16 #{out.path}`

    # update stuff
    write_back = File.open( out.path, 'rb' )
    write_attribute( :preview, write_back.read.force_encoding( 'UTF-8' ))
    write_back.close

    # if we can get a colour
    `convert #{tmp.path} -resize 1x1 txt:-`.match( /#([0-9a-f]{6})/i ){ |m| write_attribute( :colour, m[1] )}

    # tidy up
    tmp.close
    tmp.delete
    out.close
    out.delete

  end

  def generate_preview!

    generate_preview and save

  end

  private

    def schedule_preview_generation

      generate_preview

    end

end

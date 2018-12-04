class Snippet < ApplicationRecord

  before_save :blank_content_if_nil

  def self.acquire( ident )

    # get an ident
    ident = Digest::MD5.hexdigest( ident )

    # lookup
    ret = self.find_by_ident( ident )

    # if that failed…
    if ret.nil?

      ret = create( ident: ident )

    end

    ret

  end

  private

    # Sets the content to an empty string if it’s nil for whatever reason
    def blank_content_if_nil

      write_attribute( :content, '' ) if content.nil?

    end

end

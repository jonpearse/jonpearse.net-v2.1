module Admin::QrHelper

  def generate_svg( rqr_code )

    path = ""

    rqr_code.modules.each_with_index do |row, y|

      row.each_with_index do |col, x|

        path += "M#{x} #{y}h1v1h-1z" if col

      end

    end

    dim = rqr_code.modules.length
    "<svg version=\"1.0\" viewBox=\"0 0 #{dim} #{dim}\"><path d=\"#{path}\"/></svg>"

  end

end

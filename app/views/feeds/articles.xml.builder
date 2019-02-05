# encoding: UTF-8
xml.instruct! :xml, version: '1.0'
xml.rss version: '2.0' do

  xml.channel do

    # meta
    xml.title         t( 'meta.title' )
    xml.description   t( 'meta.description' )
    xml.link          root_url
    xml.language      'en-GB'
    xml.lastBuildDate DateTime.now.rfc822

    # fields
    @articles.each do |article|

      xml.item do

        xml.title       article.title
        xml.link        article_url( article )
        xml.guid        shortcode_url( article.shortcode.code )
        xml.pubDate     article.published_on.strftime( "%a, %-d %b %Y #{article.created_at.strftime('%T %z')}" )
        xml.description ( @full ? article.body : article.summary )

        article.categories.each do |c|

          xml.category  c.to_s, domain: article_category_url( c.slug )

        end

      end

    end

  end

end

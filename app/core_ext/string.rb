# Nice utility class that extends Ruby’s core {String}[http://www.ruby-doc.org/core-1.9.3/String.html] class with some
# useful-ish extras.
#
# Or something
class String

  # Returns a normalised version of the string, where all UTF-8/accented/weird characters are converted to their nearest
  # ASCII equivalents. This requires the {Babosa}[https://github.com/norman/babosa] gem to be installed and available.
  def normalize
    to_slug.transliterate.to_s
  end

  # Produces a slugified version of this string safe for use in URLs.
  def slugify( limit = nil )

    slug = normalize.gsub(/[^\sa-z0-9\-\_]/i,'').gsub(/\s+/,'-').gsub(/--+/, '-')

    # if there’s no limit, or we’re lower than it
    return slug if limit.nil? or (slug.length < limit)

    # otherwise, chop things down
    slug = slug[0..(limit - 1)]

    # and chop the last word off it’s a fragment
    slug.gsub( /\-([^\-]*)$/, '' ) unless slug.gsub( /\-([^\-]*)$/, '' ).empty?

  end

  # Returns whether or not the string appears to be numeric (ie, is a sequence of numbers possibly starting ‘-’)
  def numeric?
    (self =~ (/\A[+-]?\d+\Z/)) != nil
  end

  # Returns whether this string is uncountable or not—ie, whether the plural and singular forms are identical. This is
  # borrowed from Rails core and provided here to be useful.
  def uncountable?

    (pluralize == singularize)

  end

  # Returns a normalised Levenshtein distance between this string and that provided in the argument. This is expressed
  # as a float between 0.0 (no change) and 1.0 (everything changed).
  def normalized_distance( str_other )

    Levenshtein.normalized_distance(self, str_other)

  end

  # Returns a single-quoted version of the string in the appropriate locale.
  def single_quote

    I18n.t 'support.string.single_quoted', string: self, default: self

  end

  # Returns a double-quoted version of the string in the apprpriate locale.
  def double_quote

    I18n.t 'support.string.double_quoted', string: self, default: self

  end

  # Turns string into the English posessive form. This is not internationalisation safe.
  def posessify

    ( self.ends_with?('s') ? "#{self}’" : "#{self}’s" )

  end

end

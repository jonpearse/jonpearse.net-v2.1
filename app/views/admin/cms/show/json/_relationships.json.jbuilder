return unless content.respond_to?( :serialisable_relations )

# Output all belongs_to or has_one relationships
content.serialisable_relations.each do |r|
  json.set! r do
    if content.send( r ).nil?
      nil
    else
      json.partial! partial_for( :item, action: :show, format: '.json' ), content: content.send( r ), depth: depth + 1
    end
  end
end

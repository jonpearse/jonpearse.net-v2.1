json.array! @content do |item|

  # common stuffs
  json.partial! partial_for( :item, action: :index, format: '.json' ), item: item

  # output magic type and ID fields so we know they’re always there
  json._meta do

    json.id         item.id
    json.label      item.to_s
    json.type       item.class.to_s
    json.human_type item.class.model_name.human.titleize

  end

  # Finally, output all belongs_to or has_one relationships
  item.serialisable_relations.each do |r|
    json.set! r do
      if item.send(r).nil?
        nil
      else
        json.partial! partial_for( :item, action: :index, format: '.json' ), item: item.send(r)
      end
    end
  end
end

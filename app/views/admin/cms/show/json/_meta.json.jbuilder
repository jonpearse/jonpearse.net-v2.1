# output magic type and ID fields so we know they’re always there
json._meta do

  json.id         content.id
  json.label      content.to_s
  json.type       content.class.to_s
  json.human_type content.class.model_name.human.titleize

end

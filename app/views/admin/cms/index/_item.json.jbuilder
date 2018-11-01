# output all attrs
json.merge! item.attributes.reject{|m| (m == 'created_at' or m == 'updated_at' or m =~ /_id$/) }

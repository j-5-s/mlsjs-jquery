# MLSjs jQuery Plugin


## Methods

### fetchProperty( options )
Fetch all the attributes on a property by the property id
####Options
* id (String) - the property id
* success (Function) a call back function that fires on success

```javascript
$('body').MLSjs({
	account_id:1001,
},'fetchProperty',{
	id: '12345678abcdefg',
	success: function(property) {
		//do something with the property
		$(this) //bound to the initial jQuery object ('body' in this case)
		.html(property.address);
	}
});
```


### fetchAndRenderProperty( options )
Calls the fetchProperty method then renders the property to the 
jQuery object its called on.  You may include a [template](#template)
option to bind the data to your own html. 
####Options
* id (String) - the property id
* template (jQuery) jQuery html object. 
* success (Function) a call back function that fires on success

```javascript

$('body').MLSjs({
	account_id:1001,
},'fetchAndRenderProperty',{
	id: '12345678abcdefg',
	template $('#property_template')
	success: function(property) {
		//do something with the property

	}
});
```

####Optional Template

```HTML
<script type="text/template" id="property_template">
	<p><%= property.address %></p>
</script>
```

If you do not provide a template, the default template for the method will be used. 
A stylesheet has been provided to go with the default templates.


### fetchProperties( options )
A method to fetch multiple properties by property id

####Options
* ids (Array) An array of property ids
* success (Function) A callback function on success

```javascript
$('body').MLSjs({
	account_id:1001,
},'fetchProperties',{
	ids: ['12345678abcdefg', '987654321asdfa'],
	success: function(properties) {
		//do something with the property
		for (var i = 0; i < properties.length; i++) {
			$(this) //bound to the initial jQuery object ('body' in this case)
			.append(property[i].address);
		}

	}
});
```

### fetchAndRenderProperties( options )
Calls the fetchProperties method then renders the properties to the 
jQuery object it's called on.  You may include a [template](#template)
option to bind the data to your own html.

####Options
* id (String) - the property id
* template (jQuery) jQuery html object. 
* success (Function) a callback function that fires on success

```javascript
$('body').MLSjs({
	account_id:1001,
},'fetchAndRenderProperties',{
	id: ['12345678abcdefg', '987654321asdefg'],
	template $('#properties_template'),
	success: function(property) {
		//do something with the property

	}
});
```

####Optional Template

```HTML
<script type="text/template" id="properties_template">
	<% for (var i = 0; i < properties.length; i++) { %>
	<li><%= property[i].address %></li>
	<% } %>
</script>
```

If you do not provide a template, the default template for the method will be used. 
A stylesheet has been provided to go with the default templates.


### getSearchFields( options )
It's likely you will need a property search form.  This methods will provide all the 
data necessary for the dropdowns such as cities, states, schools, etc.

####Options
* success (Function) A callback function that fires on success

```javascript
$('body').MLSjs({
	account_id:1001,
},'getSearchFields',{
	success: function(fields) {
		//manually create your search form from the fields


	}
});
```

### renderSearchForm( options )
Gets all the search fields and renders a search form

####Options
* parameters (Object) localized parameters:
** latitude
** longitude
** radius (miles)
* success (Function) A callback function that fires on success

```javascript
$('body').MLSjs({
	account_id:1001,
},'renderSearchForm',{
	location: {
		latitude: 33.73974000503961,
		longitude: -84.35771976249998,
		radius: 30
	}
	success: function(fields) {
		//manually create your search form from the fields


	}
});
```

### queryProperties( options )
Gets a list of properties and their data from query parameters.
#### Options
* query
** limit (Number)
** image_type: ('horizontal','vertical','square') - return just properties with those image types
** private (true,false) - true will only search from your properties, false is the entire set
** more to come...
* success (Function) A callback function that fires on success

```javascript
	$("body").MLSjs({
		account_id: '1001',
	},'queryProperties', {
		query: {
				limit:5,
				image_type: 'horizontal'
		},
		success: function(properties) {
			console.log(this,properties)
		}
	});
```


### queryAndRenderProperties( options )
Calls the queryProperties function but also renders the properties to the page. There are
several options for a default template, or you may use your own template

####Options
* query
** limit (Number)
** image_type: ('horizontal','vertical','square') - return just properties with those image types
** private (true,false) - true will only search from your properties, false is the entire set
** more to come...
* template: 'thumbnails' or 'properties' or 'search_results'. You may also use your own 
  [template](#template)  with a jQuery object 
* property_page: (String) '/property', for example. It's the url that will load the property on your site
* hash: (String) defaults to show. For example, your url would be /property#show/123456789abcdefg
* success (Function) A callback function that fires on success

```javascript
//5 Thumbnails
$("body").MLSjs({
	account_id: '1001',
},'queryAndRenderProperties', {
	query: {
			limit:5,
			image_type: 'horizontal'
	},
	template: 'thumbnails',
	locals: {
		property_page: '/frontend_dev.php/property'	
	},
	success: function(properties) {
		console.log(this)
	}
});

//or show 10 results
$("body").MLSjs({
	account_id: '1001',
},'queryAndRenderProperties', {
	query: {
		limit:10,
	},
	template: 'properties',
	locals: {
		property_page: '/property'
	},
	success: function(properties) {
		console.log(this)
	}
});
```


#TODO
* create url helper function
   properties_page + hash + id
* gracefull fallback without hash   




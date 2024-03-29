# MLSjs jQuery Plugin


## Methods

### fetchProperty( parameters )
Fetch all the attributes on a property by the property id
####Parameters
* property_id (String) - the property id
* success (Function) a call back function that fires on success

```javascript

$('body').MLSjs({
	account_id:1001,
	method: 'fetchProperty'
	parameters: {
		property_id: '12345678abcdefg',
		success: function(property) {
			//do something with the property
			$(this) //bound to the initial jQuery object ('body' in this case)
			.html(property.address);
		}
	}	
});

```


### fetchAndRenderProperty( parameters )
Calls the fetchProperty method then renders the property to the 
jQuery object its called on.  You may include a [template](#template)
option to bind the data to your own html. 
####Parameters
* property_id (String) - the property id
* template (jQuery) jQuery html object. 
* success (Function) a call back function that fires on success

```javascript

$('body').MLSjs({
	account_id:1001,
	method: 'fetchAndRenderProperty',
	parameters: {
		id: '12345678abcdefg',
		template $('#property_template')
		success: function(property) {
			//do something with the property

		}
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


### fetchProperties( parameters )
A method to fetch multiple properties by property id

####Parameters
* property_ids (Array) An array of property ids
* success (Function) A callback function on success

```javascript

$('body').MLSjs({
	account_id:1001,
	method: 'fetchProperties',
	parameters: {
		property_ids: ['12345678abcdefg', '987654321asdfa'],
		success: function(properties) {
			//do something with the property
			for (var i = 0; i < properties.length; i++) {
				$(this) //bound to the initial jQuery object ('body' in this case)
				.append(property[i].address);
			}
		}
	}
});

```

### fetchAndRenderProperties( parameters )
Calls the fetchProperties method then renders the properties to the 
jQuery object it's called on.  You may include a [template](#template)
option to bind the data to your own html.

####Parameters
* property_id (String) - the property id
* template (jQuery) jQuery html object. 
* success (Function) a callback function that fires on success

```javascript

$('body').MLSjs({
	account_id:1001,
	method: 'fetchAndRenderProperties',
	parameters: {
		id: ['12345678abcdefg', '987654321asdefg'],
		template $('#properties_template'),
		success: function(property) {
			//do something with the property

		}	
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


###fetchChatHistory( parameters )
Fetch an items chat history from the server.  The history
is cached and will not call the server twice for the same property
id

####Parameters
* property_id 
* success 

```javascript
$('#chatbox').MLSjs({
	account_id: '1001',
	method: 'fetchChatHistory',
	parameters: {
		property_id: p._id,
		success: function(resp) {
			//update your chat box with resp.chat_history
			console.log(resp.chat_history)
		}
	}
});
```

### getSearchFields( parameters )
It's likely you will need a property search form.  This methods will provide all the 
data necessary for the dropdowns such as cities, states, schools, etc.

####Parameters
* success (Function) A callback function that fires on success

```javascript

$('body').MLSjs({
	account_id:1001,
	method: 'getSearchFields',
	parameters: {
		success: function(fields) {
			//manually create your search form from the fields


		}
	}
});

```

### renderSearchForm( parameters )
Gets all the search fields and renders a search form

####Parameters
* location (Object) localized parameters: 
    * latitude
    * longitude
    * radius (miles)

* search_results_page (String) A url (relative) for the search form to send requests
  Important to note that the search will be sent to the search results page as a get
  request with the parameters store in the url hash - #mls-search:key=value&key2=value
  your search_results_page should call [queryAndRenderProperties](#queryAndRenderProperties) 
  on document ready and pass in the hash.
* success (Function) A callback function that fires on success

```javascript

$('body').MLSjs({
	account_id:1001,
	method: 'renderSearchForm',
	parameters: {
		location: {
			latitude: 33.73974000503961,
			longitude: -84.35771976249998,
			radius: 30
		},
		search_results_page: '',
		success: function(fields) {
			//manually create your search form from the fields

		}
	}

});
```

### queryProperties( parameters )
Gets a list of properties and their data from query parameters.
#### Parameters
* query (parameters below or hash from search query)
    * limit (Number)
    * image_type: ('horizontal','vertical','square') - return just properties with those image types
    * private (true,false) - true will only search from your properties, false is the entire set
    * more to come...
* success (Function) A callback function that fires on success

```javascript
$("body").MLSjs({
	account_id: '1001',
	method: 'queryProperties'
	parameters: {
		query: {
				limit:5,
				image_type: 'horizontal'
		},
		success: function(properties) {
			console.log(this,properties)
		}
	}
});
```


### queryAndRenderProperties( parameters )
Calls the queryProperties function but also renders the properties to the page. There are
several options for a default template, or you may use your own template

####Parameters
* query (paramters below or url hash (see [renderSearchForm](#renderSearchForm))
    * limit (Number)
    * image_type: ('horizontal','vertical','square') - return just properties with those image types
    * private (true,false) - true will only search from your properties, false is the entire set
    * more to come...
* template: 'thumbnails' or 'properties' or 'search_results'. You may also use your own 
  [template](#template)  with a jQuery object 
* property_page: (String) '/property', for example. It's the url that will load the property on your site
* hash: (String) defaults to show. For example, your url would be /property#show/123456789abcdefg
* success (Function) A callback function that fires on success

```javascript
//5 Thumbnails
$("body").MLSjs({
	account_id: '1001',
	method: 'queryAndRenderProperties',
	parameters: {
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
	}
});

//or show 10 results
$("body").MLSjs({
	account_id: '1001',
	method: 'queryAndRenderProperties',
	parameters: {
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
	}
});

//or use the hash
$("body").MLSjs({
	account_id: '1001',
	method: 'queryAndRenderProperties',
	parameters: {
		query: window.location.hash,
		template: 'properties',
		locals: {
			property_page: '/property'
		},
		success: function(properties) {
			console.log(this)
		}
	}
});

```


## TODO
* create url helper function
* properties_page + hash + id
* gracefull fallback without hash   




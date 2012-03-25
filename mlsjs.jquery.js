// MLSjs Plugin
// @param {Object} options (required if not initialized on the jQuery el)
// @param {String} method_name see @available_methods
// @param {Mixed} method_option see @available_methods
// @returns {jQuery}
// @example
//	$(document).ready(function(){
//		$('body').MLSjs({
//			account_id: '1001',
//			template: $('#property_template')
//		},'fetchAndRenderProperty','4e9ac8e1a454386c01000283');
//	});
//	Remove the property and data
//	$('body').MLSjs('destroy');

/*globals jQuery */
(function( $ ){
	'use strict';

	$.fn.MLSjs = function( options, method, args ) {
		// Options object is being supplied

		if (typeof options === 'object') {
			options = $.extend( {
				'el' : this,
				'account_id': '1001',
				'city': 'atlanta, ga'
			}, options);
			this.data('mlsjs',options);
		} else {
			args = method;
			method = options;
			options = this.data('mlsjs');
			if (!options) {
				$.error('MLSjs has not been initiated, please supply options');
			}
		}

		var mlsjs =  new MLSjs( options );
	
		if (typeof method !== 'undefined')
			mlsjs[method](args);
		return this;
	};


	/**
	* The public methods available on MLSjs
	* @class
	*/

	var MLSjs = function( options ) {
		this.mlsjs = new MLSjsUtility( options );
		this.options = options;
	};

	/** @lends MLSjs */
	(function(){

		/**
		* Destroys the MLSjs object from the DOM
		* @function
		*/
		this.destroy = function() {
			this.options.el
			.empty()
			.removeData();
		};

		/**
		* Gets the property data from the server
		* or cached stored in $.data
		* @function
		* @param {Object} options
		*     - id: {String} required
		*     - success: {Function} required 
		* @returns {Object} property
		*/
		this.fetchProperty = function( options ) {
			var self = this,
				id   = options.id,
				fn   = options.success;

			//check that id is a hash
			if (/\/(\w+)$/.test(id)) {
				id = /\/(\w+)$/.exec(id)[1];
			}

			// Check if the property data is stored on the el
			// if so, use it	
			if (this.options.el.data('mls-property-'+id)) {
				fn(this.options.el.data('mls-property-'+id));
			} else {	
				this.mlsjs.fetchProperty( id, function( property ){
					
					self.options.el.data('mls-property-'+id,property);				
					fn.call(self.options.el, property);
				});
			}
		};		
		

		/**
		* Fetches the property from an id and 
		* renders the template
		* @function
		* @param {String} id
		* @param {Function} callback 
		* @returns {this} MLSjs
		*/

		this.fetchAndRenderProperty = function( options ) {
			var self = this,
				fn = options.success,
				id;

			if (typeof options === 'string') {
				id = options;
			} else {
				id = options.id;
			}

			//check that id is a hash
			//Assume that if the last part of the hash
			//is /\w+, then its the id
			//@example
			// #show/4e9795ebed5c8baf0200001e or
			// #property/4e9795ebed5c8baf0200001e
			if (/\/(\w+)$/.test(id)) {
				id = /\/(\w+)$/.exec(id)[1];
			}


			this.fetchProperty( {
				id: id,
				success: function( property ) {
					var template = options.template || 'property';
					self.mlsjs.options.el.html( self.mlsjs.getTemplate( template, property ) );		
					fn.call(self.options.el, property);
				}	
			});
			return this;
		};

		/**
		* Gets a list of properties by id's
		* @param {Object} options
		*      - ids: {Array} property_ids
		*      - success: {Function} callback
		*
		* @function
		* @returns {jQuery} this
		*/

		this.fetchProperties = function( options ) {
			var self = this,
				ids  = options.ids,
				fn   = options.success;

			this.mlsjs.fetchProperties( ids, function( properties ){
				if (typeof fn !== 'undefined')
					fn.call( self.options.el, properties );
			});

			return this;
		};

		/**
		* Fetches the properties from an array of ids and 
		* renders the template
		* @function
		* @param {Array} ids
		* @returns {jQuery} this
		*/

		this.fetchAndRenderProperties = function( options ) {
			var self = this,
				ids  = options.ids,
				fn   = options.success;

			this.fetchProperties( {
				ids: ids,
				success: function( properties ) {

					var template = options.template || 'properties';
					self.mlsjs.options.el.html( self.mlsjs.getTemplate( template, {properties:properties} ) );
				
					if (typeof fn !== 'undefined')
						fn.call( self.options.el, properties );
				}	
			});
			return this;
		};



		/**
		* Gets all the individual search fields available
		* @function
		* @param Options
		*     - location {Object}
		*       - latitude
		*       - longitude
		*       - radius
		* @returns {Array} search_fields
		*/

		this.getSearchFields = function( options ) {
			var fn   = options.success,
				self = this;

			this.mlsjs.getSearchFields( options, function( fields ){
			
				fn.call( self.options.el, fields );
			});

			return this;
		};

		/**
		* Gets all the search fields and renders them in a form
		* @function
		* @param {Object} options
		*      - parameters
		*      - success
		* @returns {String} html
		*/

		this.renderSearchForm = function( options ) {
	
			var fn   = options.success,
				self = this;



			this.mlsjs.getSearchFields( options, function( fields ){
				options.fields = fields;
				var template = options.template || 'search_form';		
				self.mlsjs.options.el.html( self.mlsjs.getTemplate( template, options ) );
			
				if (fn)
					fn.call( self.options.el, fields );
			});
		};


		/**
		* Gets a list of properties based on a query
		* @param {Object} options
		*      - query: {Object} basic mongodb query parameter format
		*      - success: {Function} callback(properties)
		*
		* @function
		* @returns {jQuery} this
		*/

		this.queryProperties = function( options ) {
			var self        = this,
				parameters  = options.query,
				fn          = options.success;


			this.mlsjs.queryProperties( parameters, function( properties, parameters ){
			
				fn.call( self.options.el, properties );
			});
		};	

		/**
		* Query the properties and render them to the jQuery el
		* @function
		* @param {Object} options
		*      - query {Object}
		*      - template {Mixed} 
		*      - property_page {String}
		*      - success: callback(properties)
		* @returns {jQuery} 
		*/

		this.queryAndRenderProperties = function( options ) {
			var self            = this,
				parameters      = options.query,
				fn              = options.success,
				template        = options.template || 'properties',
				locals          = {};

			locals.hash = locals.hash || 'show';
			locals.property_page = locals.property_page || '/property';

			this.queryProperties({
				parameters: parameters,
				success: function( properties ) {
					self.mlsjs.options.el.html( self.mlsjs.getTemplate( template, {properties:properties, locals:locals} ) );
					fn.call( self.options.el, properties );
				}
			});	
			return this;
		};
	

		return this;
	}).call( MLSjs.prototype );	

	/* Private Methods */

	/**
	* @class
	* @api Private
	*/

	var MLSjsUtility = function( options ) {
		this.options = options;
		this.url = 'http://api.localhost.james:3000';
	};

	/** @lends PrivateMLSjs */
	(function(){

		/**
		* Fetch the property from the server
		* @api private
		* @function
		* @param {String} id
		* @param {Function} callback
		*/
		this.fetchProperty = function( id, fn ) {

			$.getJSON( this.url+'/property/' + id + '?callback=?', function( data ){
	
				fn.call( null, data );
			});
		};

		/**
		* Fetch properties from the server
		* @api private
		* @function
		* @param {Array} ids
		* @param {Function} callback
		*/
		this.fetchProperties = function( ids, fn ) {
			ids = $.map( ids, function( value, index ){
				return ('id[]=' + value);
			}).join('&');

			$.getJSON( this.url+'/properties', ids ,function( data ){
				fn.call( null, data );
			});
		};

		/**
		* Gets all the drop down data necessary for search
		* @function
		* 
		*/
		this.getSearchFields = function( options, fn ) {
			var parameters  = options.location;

			$.getJSON( this.url + '/fields/all' + '?callback=?', parameters, function( data ){
				fn.call( null, data );
			});
		};

		/**
		* Queries properties
		* @param {Object} params (mongodb like query params)
		* @param {Function} callback(properties) - Array
		* @function
		*/
		this.queryProperties = function ( params, fn ) {
			var account_id = this.options.account_id;
			$.getJSON( this.url+'/query/'+account_id + '?callback=?', params ,function( data ){
			
				fn.call( null, data.properties );
			});
		};



		/**
		* Storage for templates
		* @TODO place in separate file
		*/
		this.default_templates = {
			'property'   : '<div><%= address %></div>',
			'properties' : '<div><ul><% for ( var i = 0; i < properties.length; i++) { %><li><%= properties[i].address %></li><% } %></ul></div>',
			'thumbnails' : '<ul class="MLSjs-list">'+
					'<% for ( var i = 0; i < properties.length; i++) { %>' +
					'<% if (properties[i].images.length > 0) { %>'+
						'<li><a href="<%= locals.property_page %>#<%= locals.hash %>/<%= properties[i]._id %>"><img src="https://s3.amazonaws.com/mlsjs/uploads/<%= properties[i].images[0].filename %>" /></a></li>'+
					'<% } %>'+
					'<% } %></ul>',
			'search_form': '<b>Search</b>',
			'search_results' : 'hi'
		};

		/**
		* Gets the html from a default template or
		* a template provided via this.options.template
		* @function
		* @param {Object}
		* @returns {String} html
		*/

		this.getTemplate = function( template_name, p ) {
			var html = '';
		

			if (typeof template_name === 'object') {
				html = template_name.html();
			} else {
				html = this.default_templates[template_name];
				//@TODO create html template
			}

			return this.template(html, p);
		};
		
		/**
		* Templating function.
		* Based off of http://ejohn.org/blog/javascript-micro-templating/
		* @param {String} html
		* @param {Object} data	
		* @returns {String} template
		*/

		this.template = function( str, data ) {
			/*jshint evil:true */
			// Generate a reusable function that will serve as a template
			// generator (and which will be cached).
			var fn = new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};" +

			// Introduce the data as local variables using with(){}
			"with(obj){p.push('" +

			// Convert the template into pure JavaScript
			str
				.replace(/[\r\t\n]/g, " ")
				.split("<%").join("\t")
				.replace(/((^|%>)[^\t]*)'/g, "$1\r")
				.replace(/\t=(.*?)%>/g, "',$1,'")
				.split("\t").join("');")
				.split("%>").join("p.push('")
				.split("\r").join("\\'")+ "');}return p.join('');");

			// Provide some basic currying to the user
			return fn( data );
		
		};
	}).call( MLSjsUtility.prototype );


})( jQuery );


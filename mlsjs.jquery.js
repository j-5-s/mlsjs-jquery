// MLSjs Plugin
// @param {Object} options (required if not initialized on the jQuery el)
// @param {String} method_name see @available_methods
// @param {Mixed} method_option see @available_methods
// @returns {jQuery}
// @example
//	$(document).ready(function(){
//		$('body').MLSjs({
//			account_id: '1001',
//			method: 'fetchAndRenderProperty',
//			paramters: {
//				property_id; '4e9ac8e1a454386c01000283'	
//				template: $('#property_template')
//			}
//		});
//	});
//	Remove the property and data
//	$('body').MLSjs('destroy');

/*globals jQuery, io, document */
(function( $ ){
	'use strict';

	$.fn.MLSjs = function( options ) {
		// Options object is being supplied

		
		options = $.extend( {
			'el' : this,
			'account_id': '1001'
		}, options);


		this.data('mlsjs',options);
	

		var mlsjs =  new MLSjs( options );
		mlsjs[options.method]( options.parameters );

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
		* @param {Object} parameters
		*     - property_id: {String} required
		*     - fn:          {Function} success
		* @returns {Object} property
		*/
		this.fetchProperty = function( parameters ) {
			var self        = this,
				property_id = parameters.property_id,
				fn          = parameters.success;

			//check that id is a hash
			if (/\/(\w+)$/.test(property_id)) {
				property_id = /\/(\w+)$/.exec(property_id)[1];
			}

			// Check if the property data is stored on the el
			// if so, use it	
			if (this.options.el.data('mls-property-'+property_id)) {
				fn(this.options.el.data('mls-property-'+property_id));
			} else {	
				this.mlsjs.fetchProperty( property_id, function( property ){
					
					self.options.el.data('mls-property-'+property_id,property);				
					fn.call(self.options.el, property);
				});
			}
		};		
		

		/**
		* Fetches the property from an id and 
		* renders the template
		* @function
		* @param {Object} parameters
		*      - property_id: {String}
		*      - fn:          {Function} callback 
		* @returns {this} MLSjs
		*/

		this.fetchAndRenderProperty = function( parameters ) {
			var self         = this,
				fn           = parameters.success,
				property_id;

			if (typeof parameters === 'string') {
				property_id = parameters;
			} else {
				property_id = parameters.property_id;
			}

			//check that id is a hash
			//Assume that if the last part of the hash
			//is /\w+, then its the id
			//@example
			// #show/4e9795ebed5c8baf0200001e or
			// #property/4e9795ebed5c8baf0200001e
			if (/\/(\w+)$/.test( property_id )) {
				property_id = /\/(\w+)$/.exec( property_id )[1];
			}


			this.fetchProperty( {
				property_id: property_id,
				success: function( property ) {
					var template = parameters.template || 'property',
						dfd = $.Deferred();
					//Generate the template
					self.mlsjs.options.el.html( self.mlsjs.getTemplate( template, {property:property} ) );	
				
					fn.call(self.options.el, property, dfd );
					self.mlsjs.loadSocket(function(socket){
						socket.emit("load_property",{property_id:[property_id],action:'open'});	
						dfd.resolve(socket);				
					});
				}	
			});
			return this;
		};

		/**
		* Gets a list of properties by id's
		* @param {Object} parameters
		*      - property_ids: {Array} property_ids
		*      - success:      {Function} callback
		*
		* @function
		* @returns {jQuery} this
		*/

		this.fetchProperties = function( parameters ) {
			var self          = this,
				property_ids  = parameters.property_ids,
				fn            = parameters.success;

			this.mlsjs.fetchProperties( property_ids, function( properties ){
				if (typeof fn !== 'undefined')
					fn.call( self.options.el, properties );
			});

			return this;
		};

		/**
		* Fetches the properties from an array of ids and 
		* renders the template
		* @function
		* @param {object} parameters
		*      - property_ids {Array}
		*      - template     {jQuery}
		*      - success      {Function}
		* @returns {jQuery} this
		*/

		this.fetchAndRenderProperties = function( parameters ) {
			var self          = this,
				property_ids  = parameters.property_ids,
				template      = parameters.tempalate || 'properties',
				fn            = parameters.success;

			this.fetchProperties( {
				property_ids: property_ids,
				template: template,
				success: function( properties ) {

					self.mlsjs.options.el.html( self.mlsjs.getTemplate( template, {properties:properties} ) );
				
					if (typeof fn !== 'undefined')
						fn.call( self.options.el, properties );
				}	
			});
			return this;
		};

		/**
		* Gets the chat history on a property for an id
		* @function
		* @param {Object} paramters
		*     - property_id
		*     - success
		**/
		this.getChatHistory = function( parameters ) {
			var fn          = parameters.success,
				self        = this,
				chat_params = {
					property_id: parameters.property_id
				};

			var cache = $.data(self.options.el[0],'chat_cache');
		
				
			if (cache) {
				fn.call( self.options.el, cache );
			} else {
				self.mlsjs.getChatHistory( chat_params, function( history ){
					$.data(self.options.el[0], 'chat_cache', history);
					fn.call( self.options.el, history );
				});				
			}
		};


		/**
		* Gets all the individual search fields available
		* @function
		* @param parameters
		*     - location {Object}
		*       - latitude
		*       - longitude
		*       - radius
		* @returns {Array} search_fields
		*/

		this.getSearchFields = function( parameters ) {
			var fn   = parameters.success,
				self = this,
				search_parameters = {
					location: parameters.location
				};

			this.mlsjs.getSearchFields( search_parameters, function( fields ){
				fn.call( self.options.el, fields );
			});

			return this;
		};

		/**
		* Gets all the search fields and renders them in a form
		* @function
		* @param {Object} parameters
		*      - parameters
		*      - success
		* @returns {String} html
		*/

		this.renderSearchForm = function( parameters ) {
	
			var fn         			= parameters.success,
				self 				= this,
				template 			= parameters.template || 'search_form',
				template_parameters = {};

			this.mlsjs.getSearchFields( parameters, function( fields ){
				template_parameters.fields = fields;
		
				self.mlsjs.options.el.html( self.mlsjs.getTemplate( template, template_parameters ) );
			
				if (fn)
					fn.call( self.options.el, fields );
			});
		};


		/**
		* Gets a list of properties based on a query
		* @param {Object} parameters
		*      - query: {Object} basic mongodb query parameter format
		*      - success: {Function} callback(properties)
		*
		* @function
		* @returns {jQuery} this
		*/

		this.queryProperties = function( parameters ) {
			var self        = this,
				fn          = parameters.success;


			this.mlsjs.queryProperties( parameters.query, function( properties, parameters ){
				
				fn.call( self.options.el, properties );
			});
		};	

		/**
		* Query the properties and render them to the jQuery el
		* @function
		* @param {Object} parameters
		*      - query {Object}
		*      - template {Mixed} 
		*      - property_page {String}
		*      - success: callback(properties)
		* @returns {jQuery} 
		*/

		this.queryAndRenderProperties = function( parameters ) {
			var self            = this,
				fn              = parameters.success,
				template        = parameters.template || 'properties',
				locals          = parameters.locals || {};


			locals.hash = locals.hash || 'show';
			locals.property_page = locals.property_page || '/property';
			
			this.mlsjs.queryProperties( parameters.query, function( properties ) {
					
				self.mlsjs.options.el.html( self.mlsjs.getTemplate( template, {properties:properties, locals:locals} ) );
				
				if (typeof fn !== 'undefined')	
					fn.call( self.options.el, properties );
				
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
		this.socket_url = 'http://socket.localhost.james:3000';
		this.socket_js = 'http://socket.localhost.james:3000/socket.io/socket.io.js';
		this.socket = {};
		this.socketLoaded = false;
	};

	/** @lends MLSjsUtility */
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
		* Gets all the chat history for a property
		* @function
		* @api private
		*/
		this.getChatHistory = function( options, fn ) {
			var parameters = {
				account_id: this.options.account_id
			};
			
			$.getJSON( this.url + '/chat-history/' + options.property_id +  '?callback=?', parameters, function( data ){
				fn.call( null, data );
			});			
		};

		/**
		* Singleton function for loading socksets
		* Loads the socket or returns the existing socket
		* @function
		* @param {Function} Callback function on load of socketio
		*/
		this.loadSocket = function ( fn ) {
			var self = this;

			if (this.socketLoaded) {
				fn(self.socket);
				return;
			}

			var sc = document.createElement('script'); 
			sc.type = 'text/javascript'; sc.async = true;
			sc.src = this.socket_js;

			//load socket.io on complete
			var complete = function() {
				self.socket = io.connect(self.socket_url);
				fn(self.socket);
			};

			sc.onreadystatechange= function () {
				if (this.readyState == 'complete') complete();
			};
			sc.onload = complete;


			//Insert before the first script element
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(sc, s);
			this.socketLoaded = true;


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
			'property'   : '<div><%= property.address %></div>',
			'properties' : '<div><ul><% for ( var i = 0; i < properties.length; i++) { %><li><%= properties[i].address %></li><% } %></ul></div>',
			'thumbnails' : '<ul class="MLSjs-list">'+
					'<% for ( var i = 0; i < properties.length; i++) { %>' +
					'<% if (properties[i].images.length > 0) { %>'+
						'<li><a href="<%= locals.property_page %>#<%= locals.hash %>/<%= properties[i]._id %>"><img style="" src="https://s3.amazonaws.com/mlsjs/uploads/<%= properties[i].images[0].filename %>" /></a></li>'+
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


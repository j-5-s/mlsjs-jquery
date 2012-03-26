/*globals test,$,stop,start,equal,ok,deepEqual,expect,module*/

module("Default");
test("fetchProperty( options )", function() {
	stop();
	expect(2);
	$("#hidden_div").MLSjs({
		account_id: '1001'
	},'fetchProperty', {
		id: '4f6bc3c0da13d7e40100014e',
		success: function(property) {
			start();
			equal(property._id, '4f6bc3c0da13d7e40100014e', 'Property id fetched is 4f6bc3c0da13d7e40100014e');
			ok(property.images.length,'Property has images');			
		}
	});



});

test('fetchAndRenderProperty( options )',function(){
	stop();
	expect(2);
	$("#hidden_div").MLSjs({
		account_id: '1001'
	},'fetchAndRenderProperty', {
		id: '4f6bc3c0da13d7e40100014e',
		success: function(property) {

			start();
			equal(property._id, '4f6bc3c0da13d7e40100014e', 'Property id fetched is 4f6bc3c0da13d7e40100014e');
			equal($($(this).children().get(0)).html(),'221 Robin Hood Rd NE','$(this) was rendered property data');
		}
	});
});

test('fetchProperties( options )',function(){
	stop();
	expect(2);
	$("#hidden_div").MLSjs({
		account_id: '1001'
	},'fetchProperties', {
		ids: ['4f6bc3c0da13d7e40100014e','4f63de66c20a383b02000350','4f1c281f1afb84fb01000211'],
		success: function(properties) {
			start();
			ok($(this).length,'$(this) is set');

			equal(properties.length, 3, 'Three properties fetched');
		}
	});
});

test('fetchAndRenderProperties( options )',function(){
	stop();
	expect(2);
	$("#hidden_div").MLSjs({
		account_id: '1001'
	},'fetchAndRenderProperties', {
		ids: ['4f6bc3c0da13d7e40100014e','4f63de66c20a383b02000350','4f1c281f1afb84fb01000211'],
		success: function(properties) {
			start();
			ok($(this).length,'$(this) is set');
			equal(properties.length, 3, 'Three properties fetched');
		}
	});
});

test('getSearchFields( options )',function(){
	stop();
	expect(2);
	$("#hidden_div").MLSjs({
		account_id: '1001'
	},'getSearchFields', {
		location: {
			latitude: 33.73974000503961,
			longitude: -84.35771976249998,
			radius: 80
		},
		success: function(fields) {
			start();
			ok($(this).length,'$(this) is set');
			equal(fields.type[0],'Residential', 'Type set and value of type[0] is \'Residential\'');
		}
	});
});

test('renderSearchForm( options )',function(){
	stop();
	expect(2);
	$("#hidden_div").MLSjs({
		account_id: '1001'
	},'renderSearchForm', {
		location: {
			latitude: 33.73974000503961,
			longitude: -84.35771976249998,
			radius: 80
		},
		success: function(fields) {
			start();
			equal($($(this).children().get(0)).html(),'Search','Search form rendered');
			equal(fields.type[0],'Residential', 'Type set and value of type[0] is \'Residential\'');
		}
	});
});

module("Queries");
test('queryProperties( options ) / Default',function(){
	stop();
	expect(2);
	$("#hidden_div").empty();

	$("#hidden_div").MLSjs({
		account_id: '1001'
	},'queryProperties', {
		query: {
			limit: 5,
			image_type: 'horizontal'
		},
		success: function(properties) {
			start();
			ok($(this).length,'$(this) is set');
			equal(properties.length, 5, '5 properties returned');
		}
	});

});

test('queryProperties( options ) / Cities Query',function(){
	stop();
	expect(2);
	$("#hidden_div").MLSjs({
		account_id: '1001'
	},'queryProperties', {
		query: {
			limit: 5,
			city: 'marietta'
		},
		success: function(properties) {
			start();
			var cities = $(properties).map(function(i,property){
				return property._city.name;
			});
			var city = $.unique(cities).get(0);
			ok($.unique(cities).length,'Only 1 city returned');
			equal(city,"marietta",'returned only properties in marietta');
		}
	});	
});

test('queryAndRenderProperties( options )',function(){
	stop();
	expect(2);
	$("#hidden_div").empty();

	$("#hidden_div").MLSjs({
		account_id: '1001'
	},'queryAndRenderProperties', {
		query: {
			limit: 5,
			image_type: 'horizontal'
		},
		success: function(properties) {
			start();
			equal($(this).find('li').length,5, '5 list elements');
			equal(properties.length, 5, '5 properties returned');
		}
	});
});
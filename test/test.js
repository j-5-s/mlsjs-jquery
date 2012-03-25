/*globals test,$,stop,start,equal,ok,deepEqual*/
test("fetchProperty( options )", function() {
	stop();
	$("#hidden_div").MLSjs({
		account_id: '1001'
	},'fetchProperty', {
		id: '4f6bc3c0da13d7e40100014e',
		success: function(property) {
			start();
			equal(property._id, '4f6bc3c0da13d7e40100014e', 'Property id fetched is 4f6bc3c0da13d7e40100014e');
		}
	});
});
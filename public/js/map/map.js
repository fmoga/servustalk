/*=========================================================== 

  Loads the vizualisation on the map page; adds the markers

===========================================================*/

$(document).ready(function () {
	$('#map').vectorMap({
		map: 'world_mill_en',
		backgroundColor: 'transparent',
		series: {
			regions: [{
				values: gdpData,
				scale: ['#C8EEFF', '#0071A4'],
				normalizeFunction: 'polynomial',
			}]
		},
		hoverOpacity: 0.7,
		hoverColor: false,
		markerStyle: {
			initial: {
				fill: '#FC0',
				stroke: '#383f47',
			}
		},
	});
	var mapObject = $('#map').vectorMap('get', 'mapObject');
	$.ajax({
		url: '/distinctCheckins'
	}).done(function(stats) {
		markers = []
		for (var loc in stats) {
			console.log(loc + ", " + stats[loc]['lat'] + ", " + stats[loc]['lng'])
			marker = {
				'latLng': [stats[loc]['lat'], stats[loc]['lng']],
				'name': loc,
			}
			markers.push(marker);
		}
		mapObject.addMarkers(markers);
	});
});

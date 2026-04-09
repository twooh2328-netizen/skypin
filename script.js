var map = L.map('map').setView([36.5,127.8],7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

spots.forEach(function(spot){

var marker = L.marker([spot.lat,spot.lng]).addTo(map);

marker.bindPopup(
"<b>"+spot.name+"</b><br>"+spot.desc
);

});

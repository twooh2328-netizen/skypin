var map = L.map('map').setView([36.5,127.8],7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

var droneIcon = L.icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/744/744465.png",
iconSize:[32,32]
});

spots.forEach(function(spot){

var marker = L.marker([spot.lat,spot.lng],{icon:droneIcon}).addTo(map);

marker.bindPopup(
"<h3>"+spot.name+"</h3>"+
"<img src='"+spot.image+"' width='220'><br>"+
spot.description
);

});

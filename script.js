var map=L.map('map').setView([36.5,127.8],7);

var normal=L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{maxZoom:19}
).addTo(map);

var satellite=L.tileLayer(
'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
);

var droneIcon=L.icon({

iconUrl:"https://cdn-icons-png.flaticon.com/512/854/854878.png",

iconSize:[32,32]

});

var markers=[];

function drawSpots(list){

markers.forEach(function(m){

map.removeLayer(m);

});

markers=[];

list.forEach(function(s){

var marker=L.marker(
[s.lat,s.lng],
{icon:droneIcon}
).addTo(map);

marker.bindPopup(

"<b>"+s.name+"</b><br>"+
s.description+
"<br><img src='"+s.image+"' width='200'>"

);

markers.push(marker);

});

}

drawSpots(spots);


/* 검색 */

document.getElementById("searchBox")

.addEventListener("keyup",function(e){

if(e.key!=="Enter")return;

var keyword=this.value.toLowerCase();

var found=spots.find(function(s){

return s.name.toLowerCase().includes(keyword);

});

if(found){

map.setView([found.lat,found.lng],13);

}

});


/* 필터 */

document.getElementById("categoryFilter")

.onchange=function(){

var value=this.value;

if(value==="all"){

drawSpots(spots);

return;

}

var filtered=spots.filter(function(s){

return s.category===value;

});

drawSpots(filtered);

};


/* 위성지도 */

var sat=false;

document.getElementById("satBtn")

.onclick=function(){

if(!sat){

map.removeLayer(normal);

satellite.addTo(map);

sat=true;

}else{

map.removeLayer(satellite);

normal.addTo(map);

sat=false;

}

};


/* 내 위치 */

var myLocation;

document.getElementById("locBtn")

.onclick=function(){

map.locate({setView:true,maxZoom:13});

};

map.on("locationfound",function(e){

if(myLocation){

map.removeLayer(myLocation);

}

myLocation=L.marker(
e.latlng,
{icon:droneIcon}
)

.addTo(map)

.bindPopup("현재 위치")

.openPopup();

});

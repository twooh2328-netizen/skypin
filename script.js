var map=L.map('map').setView([36.5,127.8],7);

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{maxZoom:19}
).addTo(map);

var droneIcon=L.icon({
iconUrl:"https://cdn-icons-png.flaticon.com/512/744/744465.png",
iconSize:[32,32]
});

var markers=[];

function addSpot(spot){

var marker=L.marker(
[spot.lat,spot.lng],
{icon:droneIcon}
).addTo(map);

marker.bindPopup(

"<h3>"+spot.name+"</h3>"+
"<img src='"+spot.image+"' width='220'><br>"+
spot.description

);

markers.push({
name:spot.name,
marker:marker
});

}

spots.forEach(addSpot);

/* 검색 기능 */

document.getElementById("searchBox")
.addEventListener("keyup",function(){

var keyword=this.value.toLowerCase();

markers.forEach(function(item){

if(item.name.toLowerCase().includes(keyword)){

map.setView(item.marker.getLatLng(),10);
item.marker.openPopup();

}

});

});

/* 지도 클릭 촬영지 추가 */

map.on("click",function(e){

var name=prompt("촬영지 이름");
if(!name) return;

var desc=prompt("촬영 설명");

var spot={
name:name,
lat:e.latlng.lat,
lng:e.latlng.lng,
description:desc,
image:"https://cdn-icons-png.flaticon.com/512/854/854878.png"
};

addSpot(spot);

});

/* 내 위치 */

document.getElementById("locBtn")
.onclick=function(){

map.locate({setView:true,maxZoom:12});

};

map.on("locationfound",function(e){

L.marker(e.latlng)
.addTo(map)
.bindPopup("현재 위치")
.openPopup();

});

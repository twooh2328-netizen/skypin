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
data:spot,
marker:marker
});

}

spots.forEach(addSpot);

/* 검색 */

document.getElementById("searchBox")
.addEventListener("keyup",function(){

var keyword=this.value.toLowerCase();

markers.forEach(function(item){

if(item.data.name.toLowerCase().includes(keyword)){

map.setView(item.marker.getLatLng(),10);
item.marker.openPopup();

}

});

});

/* 필터 */

document.getElementById("filter")
.onchange=function(){

var type=this.value;

markers.forEach(function(item){

if(type==="all" || item.data.type===type){

map.addLayer(item.marker);

}else{

map.removeLayer(item.marker);

}

});

};

/* 지도 클릭 촬영지 추가 */

map.on("click",function(e){

var name=prompt("촬영지 이름");
if(!name) return;

var desc=prompt("촬영 설명");

var spot={
name:name,
lat:e.latlng.lat,
lng:e.latlng.lng,
type:"beach",
description:desc,
image:"https://cdn-icons-png.flaticon.com/512/854/854878.png"
};

addSpot(spot);

});

/* 내 위치 */

var myLocationMarker;

document.getElementById("locBtn").onclick=function(){

map.locate({setView:true,maxZoom:12});

};

map.on("locationfound",function(e){

if(myLocationMarker){
map.removeLayer(myLocationMarker);
}

myLocationMarker=L.marker(
e.latlng,
{icon:droneIcon}
).addTo(map);

myLocationMarker
.bindPopup("📍 현재 위치")
.openPopup();

});
/* 검색 기능 */

document.getElementById("searchBox")
.addEventListener("keyup", function(e){

if(e.key !== "Enter") return;

var keyword = this.value.toLowerCase();

var found = spots.find(function(s){
return s.name.toLowerCase().includes(keyword);
});

if(found){

map.setView([found.lat,found.lng],13);

L.popup()
.setLatLng([found.lat,found.lng])
.setContent("📍 "+found.name+"<br>"+found.description)
.openOn(map);

}else{

alert("촬영지를 찾을 수 없습니다.");

}

});

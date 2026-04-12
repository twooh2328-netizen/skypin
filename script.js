/* 지도 생성 */

var map = L.map('map').setView([36.5,127.8],7);

/* 기본 지도 */

var normal = L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{maxZoom:19}
).addTo(map);

/* 위성 지도 */

var satellite = L.tileLayer(
'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
{maxZoom:17}
);

/* 드론 아이콘 */

var droneIcon = L.icon({

iconUrl:"https://cdn-icons-png.flaticon.com/512/854/854878.png",

iconSize:[32,32]

});

/* 촬영지 데이터 */

var spots=[

{
name:"서울숲",
lat:37.5444,
lng:127.0374,
description:"서울 드론 촬영 명소",
category:"city",
image:"https://upload.wikimedia.org/wikipedia/commons/5/57/Seoul_forest.jpg"
},

{
name:"양양 서피비치",
lat:38.0703,
lng:128.6319,
description:"바다 드론 촬영 명소",
category:"sea",
image:"https://upload.wikimedia.org/wikipedia/commons/6/6d/Yangyang_beach.jpg"
},

{
name:"제부도",
lat:37.1690,
lng:126.6290,
description:"바닷길 촬영",
category:"sea",
image:"https://upload.wikimedia.org/wikipedia/commons/e/e0/Jebudo_Island.jpg"
}

];

/* 마커 저장 */

var markers=[];

/* 촬영지 표시 */

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

/* 초기 표시 */

drawSpots(spots);


/* 촬영지 검색 */

document.getElementById("searchBox")

.addEventListener("keyup",function(e){

if(e.key!=="Enter") return;

var keyword=this.value.toLowerCase();

var found=spots.find(function(s){

return s.name.toLowerCase().includes(keyword);

});

if(found){

map.flyTo([found.lat,found.lng],13);

}

});


/* 카테고리 필터 */

var categoryFilter=document.getElementById("categoryFilter");

if(categoryFilter){

categoryFilter.onchange=function(){

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

}


/* 위성 지도 */

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


/* 비행금지구역 */

var nf=false;

var nfLayers=[];

var noflyZones=[

{lat:37.5665,lng:126.9780,radius:5000},
{lat:37.4602,lng:126.4407,radius:5000},
{lat:35.1796,lng:129.0756,radius:5000}

];

document.getElementById("nfBtn")

.onclick=function(){

if(!nf){

noflyZones.forEach(function(z){

var circle=L.circle(

[z.lat,z.lng],

{radius:z.radius,color:"red",fillOpacity:0.3}

).addTo(map);

nfLayers.push(circle);

});

nf=true;

}else{

nfLayers.forEach(function(l){

map.removeLayer(l);

});

nfLayers=[];

nf=false;

}

};


/* 현재 위치 */

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

.bindPopup("📍 현재 위치")

.openPopup();

});


/* 촬영지 추가 */

map.on("click",function(e){

var name=prompt("촬영지 이름");

if(!name) return;

var desc=prompt("촬영 설명");

var category=prompt("카테고리 (city / sea / mountain)");

var spot={

name:name,
lat:e.latlng.lat,
lng:e.latlng.lng,
description:desc,
category:category,
image:"https://cdn-icons-png.flaticon.com/512/854/854878.png"

};

spots.push(spot);

drawSpots(spots);

});

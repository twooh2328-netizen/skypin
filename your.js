window.addEventListener("DOMContentLoaded", () => {

console.log("SkyPin START");

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});   
/* =========================
   추천명소
========================= */
const defaultPlaces = [

{
  name:"남산타워",
  memo:"서울 야경 촬영 명소",
  lat:37.5512,
  lng:126.9882,
  photo:""
},

{
  name:"하늘공원",
  memo:"억새와 노을 촬영",
  lat:37.5686,
  lng:126.8850,
  photo:""
},

{
  name:"북한산 백운대",
  memo:"일출 촬영 추천",
  lat:37.6587,
  lng:126.9770,
  photo:""
},

{
  name:"광안리 해수욕장",
  memo:"드론 야경 촬영",
  lat:35.1532,
  lng:129.1186,
  photo:""
},

{
  name:"해운대",
  memo:"바다 일출 명소",
  lat:35.1587,
  lng:129.1604,
  photo:""
},

{
  name:"안반데기",
  memo:"은하수 촬영 명소",
  lat:37.6208,
  lng:128.7457,
  photo:""
},

{
  name:"정동진",
  memo:"동해 일출 촬영",
  lat:37.6893,
  lng:129.0336,
  photo:""
},

{
  name:"울릉도",
  memo:"드론 절경 촬영",
  lat:37.4844,
  lng:130.9057,
  photo:""
},

{
  name:"제주 성산일출봉",
  memo:"제주 대표 일출 명소",
  lat:33.4589,
  lng:126.9425,
  photo:""
},

{
  name:"섭지코지",
  memo:"제주 해안 촬영",
  lat:33.4240,
  lng:126.9275,
  photo:""
},

{
  name:"대관령 양떼목장",
  memo:"풍경 촬영 추천",
  lat:37.7011,
  lng:128.7588,
  photo:""
},

{
  name:"순천만 습지",
  memo:"노을 촬영 명소",
  lat:34.8852,
  lng:127.5095,
  photo:""
},

{
  name:"보성 녹차밭",
  memo:"초록 풍경 촬영",
  lat:34.7604,
  lng:127.0802,
  photo:""
},

{
  name:"담양 메타세쿼이아길",
  memo:"감성 도로 촬영",
  lat:35.3217,
  lng:126.9870,
  photo:""
},

{
  name:"마이산",
  memo:"안개 풍경 촬영",
  lat:35.7442,
  lng:127.4257,
  photo:""
},

{
  name:"태백산",
  memo:"설산 촬영 명소",
  lat:37.0963,
  lng:128.9167,
  photo:""
},

{
  name:"오이도",
  memo:"서해 노을 촬영",
  lat:37.3450,
  lng:126.6873,
  photo:""
},

{
  name:"굴업도",
  memo:"별사진 촬영 추천",
  lat:37.1917,
  lng:126.0383,
  photo:""
},

{
  name:"독도",
  memo:"대한민국 동쪽 끝",
  lat:37.2419,
  lng:131.8644,
  photo:""
},

{
  name:"한라산 백록담",
  memo:"제주 산악 촬영",
  lat:33.3617,
  lng:126.5292,
  photo:""
}

];

/* =========================
   지도
========================= */

const map = L.map("map", {
  doubleClickZoom:false
}).setView([37.56,126.97],11);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom:19
  }
).addTo(map);

setTimeout(() => {
  map.invalidateSize();
}, 500);

/* =========================
   상태
========================= */

let current = "poi";

let marker = null;
let gpsMarker = null;
let sunLine = null;

let selectedLat = null;
let selectedLng = null;

let selectMarker = null;
let selectCircle = null;
/* =========================
   추천명소
========================= */
const poiMarkers = [];
/* =========================
   저장 데이터
========================= */

let myPlaces = JSON.parse(
  localStorage.getItem("myPlaces") || "[]"
);

/* =========================
   DOM
========================= */

const panel = document.getElementById("panel");

const list = document.getElementById("list");

const menuBtn = document.getElementById("menu-btn");
const gpsBtn = document.getElementById("gps-btn");
const sunBtn = document.getElementById("sun-btn");
const addBtn = document.getElementById("add-btn");

const closeBtn = document.getElementById("closeBtn");

const tabPoi = document.getElementById("tab-poi");
const tabMy = document.getElementById("tab-my");

const form = document.getElementById("form");

const search = document.getElementById("search");

/* =========================
   지도 클릭
========================= */

map.on("click", (e) => {

selectedLat = e.latlng.lat;
selectedLng = e.latlng.lng;

if(selectMarker){
  map.removeLayer(selectMarker);
}

if(selectCircle){
  map.removeLayer(selectCircle);
}

selectMarker = L.marker([
  selectedLat,
  selectedLng
]).addTo(map);

selectCircle = L.circle([
  selectedLat,
  selectedLng
],{
  radius:80,
  color:"#2196f3",
  fillOpacity:0.15
}).addTo(map);

});

/* =========================
   패널
========================= */

menuBtn.onclick = () => {

panel.classList.toggle("show");

render();

};

closeBtn.onclick = () => {

panel.classList.remove("show");

};

/* =========================
   탭
========================= */

tabPoi.onclick = () => {

current = "poi";

tabPoi.classList.add("active");
tabMy.classList.remove("active");

render();

};

tabMy.onclick = () => {

current = "my";

tabMy.classList.add("active");
tabPoi.classList.remove("active");

render();

};

/* =========================
   GPS
========================= */

gpsBtn.onclick = () => {

navigator.geolocation.getCurrentPosition(

(pos) => {

const lat = pos.coords.latitude;
const lng = pos.coords.longitude;

map.setView([lat,lng],15);

if(gpsMarker){
  map.removeLayer(gpsMarker);
}

gpsMarker = L.marker([lat,lng])
.addTo(map)
.bindPopup("내 위치")
.openPopup();

},

() => {
  alert("GPS 실패");
}

);

};

/* =========================
   Sun
========================= */

sunBtn.onclick = () => {

if(sunLine){

map.removeLayer(sunLine);

sunLine = null;

return;

}

const center = map.getCenter();

sunLine = L.polyline([
  [center.lat, center.lng],
  [center.lat, center.lng + 0.2]
],{
  color:"orange"
}).addTo(map);

};

/* =========================
   Add
========================= */

addBtn.onclick = () => {

current = "my";

tabMy.classList.add("active");
tabPoi.classList.remove("active");

panel.classList.add("show");

render();

};

/* =========================
   검색
========================= */

search.oninput = render;

/* =========================
   렌더
========================= */
function render(){
data
.filter(p =>
  p.name.toLowerCase().includes(keyword)
)
.forEach((p, i) => {

const div = document.createElement("div");

div.className = "card";

div.innerHTML = `
  <b>${p.name}</b>
  <div>${p.memo || ""}</div>

  ${
    p.photo
    ? `<img src="${p.photo}">`
    : ""
  }
`;

div.onclick = () => {

map.setView([p.lat,p.lng],15);

if(marker){
  map.removeLayer(marker);
}

marker = L.marker([p.lat,p.lng])
.addTo(map)
.bindPopup(p.name)
.openPopup();

};

if(current === "my"){

const del = document.createElement("button");

del.className = "delete-btn";

del.textContent = "삭제";

del.onclick = (e) => {

e.stopPropagation();

myPlaces.splice(i,1);

localStorage.setItem(
  "myPlaces",
  JSON.stringify(myPlaces)
);

render();

};

div.appendChild(del);

}

list.appendChild(div);

});

}

/* =========================
   저장
========================= */

form.addEventListener("submit", async (e) => {

e.preventDefault();

const name =
document.getElementById("name").value;

const memo =
document.getElementById("memo").value;

const galleryInput =
document.getElementById("photo-gallery");

const cameraInput =
document.getElementById("photo-camera");

if(!name){

alert("장소 이름 입력");

return;

}

let photo = "";

const selectedFile =
galleryInput.files[0] ||
cameraInput.files[0];

if(selectedFile){

photo = await compressImage(selectedFile);

}

const center = map.getCenter();

const newPlace = {

name:name,
memo:memo,

lat:selectedLat ?? center.lat,
lng:selectedLng ?? center.lng,

photo:photo

};

const updatedPlaces = [
  ...myPlaces,
  newPlace
];

try{

localStorage.setItem(
  "myPlaces",
  JSON.stringify(updatedPlaces)
);

myPlaces = updatedPlaces;

}catch(err){

alert("저장 용량 초과");

console.error(err);

return;

}

form.reset();

selectedLat = null;
selectedLng = null;

if(selectMarker){
  map.removeLayer(selectMarker);
  selectMarker = null;
}

if(selectCircle){
  map.removeLayer(selectCircle);
  selectCircle = null;
}

current = "my";

render();

alert("저장 완료");

});

/* =========================
   시작 렌더
========================= */

render();

});
  이미지 압축
========================= */

function compressImage(file){

return new Promise((resolve)=>{

const reader = new FileReader();

reader.readAsDataURL(file);

reader.onload = (event)=>{

const img = new Image();

img.src = event.target.result;

img.onload = ()=>{

const canvas =
document.createElement("canvas");

const maxWidth = 1200;

let width = img.width;
let height = img.height;

if(width > maxWidth){

height *= maxWidth / width;
width = maxWidth;

}

canvas.width = width;
canvas.height = height;

const ctx =
canvas.getContext("2d");

ctx.drawImage(
  img,
  0,
  0,
  width,
  height
);

resolve(
  canvas.toDataURL(
    "image/jpeg",
    0.7
  )
);

};

};

});

}

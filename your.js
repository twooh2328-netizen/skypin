window.addEventListener("DOMContentLoaded", () => {

console.log("SkyPin START");

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
   기본 추천명소
========================= */

const defaultPlaces = [

{
  name:"남산타워",
  memo:"서울 야경 촬영 명소",
  lat:37.5512,
  lng:126.9882
},

{
  name:"하늘공원",
  memo:"노을 촬영 추천",
  lat:37.5686,
  lng:126.8850
},

{
  name:"부산 광안리",
  memo:"드론 야경 촬영",
  lat:35.1532,
  lng:129.1186
}

];

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
   메뉴
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
   일출 방향
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
   추가 버튼
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

list.innerHTML = "";

const keyword =
search.value.toLowerCase();

const data =
current === "poi"
? defaultPlaces
: myPlaces;

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

const photoInput =
document.getElementById("photo");

if(!name){

alert("장소 이름 입력");

return;

}

let photo = "";

if(photoInput.files[0]){

photo = await new Promise((resolve)=>{

const reader = new FileReader();

reader.onload = (e)=>{

resolve(e.target.result);

};

reader.readAsDataURL(
  photoInput.files[0]
);

});

}

const center = map.getCenter();

const newPlace = {

name:name,
memo:memo,

lat:selectedLat ?? center.lat,
lng:selectedLng ?? center.lng,

photo:photo

};

myPlaces.push(newPlace);

localStorage.setItem(
  "myPlaces",
  JSON.stringify(myPlaces)
);

form.reset();

current = "my";

render();

alert("저장 완료");

});

/* =========================
   시작 렌더
========================= */

render();

});

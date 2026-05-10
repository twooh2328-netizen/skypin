window.addEventListener("DOMContentLoaded", () => {

console.log("SkyPin START");

// ===== 지도 =====
const map = L.map("map", {
  doubleClickZoom: false
}).setView([37.56, 126.97], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
.addTo(map);

// ===== 상태 =====
let current = "poi";
let marker = null;
let gpsMarker = null;
let sunLine = null;

let selectedLat = null;
let selectedLng = null;

window.selectMarker = null;
window.selectCircle = null;

// ===== 추천명소 =====
const defaultPlaces = [
  {name:"굴업도",lat:37.186,lng:125.95,memo:"무인도 감성"},
  {name:"제부도",lat:37.166,lng:126.62,memo:"바닷길"},
  {name:"탄도항",lat:37.21,lng:126.62,memo:"풍차"},
  {name:"남한산성",lat:37.47,lng:127.18,memo:"운해"}
];

// ===== 저장 =====
let myPlaces = JSON.parse(localStorage.getItem("myPlaces") || "[]");

// ===== DOM =====
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

// ===== 지도 클릭 =====
map.on("click", (e) => {

  selectedLat = e.latlng.lat;
  selectedLng = e.latlng.lng;

  if (window.selectMarker) {
    map.removeLayer(window.selectMarker);
  }

  if (window.selectCircle) {
    map.removeLayer(window.selectCircle);
  }

  window.selectMarker = L.marker([selectedLat, selectedLng])
    .addTo(map)
    .bindPopup("📍 선택 위치")
    .openPopup();

  window.selectCircle = L.circle([selectedLat, selectedLng], {
    radius: 80,
    color: "#2196f3",
    weight: 2,
    fillColor: "#2196f3",
    fillOpacity: 0.15
  }).addTo(map);

});

// ===== 패널 닫기 =====
map.on("dblclick", () => {
  panel.classList.remove("show");
  document.body.style.overflow = "";
});

// ===== 메뉴 =====
menuBtn.onclick = () => {

  panel.classList.add("show");

  if(window.innerWidth < 768){
    document.body.style.overflow = "hidden";
  }

  render();
};

closeBtn.onclick = () => {

  panel.classList.remove("show");
  document.body.style.overflow = "";
};

// ===== 탭 =====
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

// ===== GPS =====
gpsBtn.onclick = () => {

  navigator.geolocation.getCurrentPosition(

    pos => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      map.setView([lat, lng], 15);

      if(gpsMarker){
        map.removeLayer(gpsMarker);
      }

      gpsMarker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup("내 위치")
        .openPopup();

      selectedLat = lat;
      selectedLng = lng;
    },

    err => {
      alert("위치 오류");
    }

  );
};

// ===== 일출 =====
sunBtn.onclick = () => {

  if(sunLine){
    map.removeLayer(sunLine);
    sunLine = null;
    return;
  }

  const center = map.getCenter();

  const lat = center.lat;
  const lng = center.lng;

  sunLine = L.polyline([
    [lat, lng],
    [lat, lng + 0.2]
  ], {
    color:"orange"
  }).addTo(map);
};

// ===== 추가 버튼 =====
addBtn.onclick = () => {

  panel.classList.add("show");

  current = "my";

  tabMy.classList.add("active");
  tabPoi.classList.remove("active");

  render();
};

// ===== 검색 =====
search.oninput = render;

// ===== 렌더 =====
function render(){

  list.innerHTML = "";

  const keyword = search.value.toLowerCase();

  const data = current === "poi"
    ? defaultPlaces
    : myPlaces;

  data
    .filter(p => p.name.toLowerCase().includes(keyword))
    .forEach((p, i) => {

      const div = document.createElement("div");

      div.className = "card";

      div.innerHTML = `
        <b>${p.name}</b>
        <div>${p.memo || ""}</div>
      `;

      div.onclick = () => {

        map.setView([p.lat, p.lng], 15);

        if(marker){
          map.removeLayer(marker);
        }

        marker = L.marker([p.lat, p.lng])
          .addTo(map)
          .bindPopup(p.name)
          .openPopup();
      };

      if(current === "my"){

        const del = document.createElement("button");

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

// ===== 저장 =====
form.onsubmit = (e) => {

  e.preventDefault();

  const name = document.getElementById("name").value;

  const memo = document.getElementById("memo").value;

  if(!name){
    alert("이름 입력");
    return;
  }

  const center = map.getCenter();

  const newPlace = {
    name:name,
    memo:memo,
    lat:center.lat,
    lng:center.lng
  };

  myPlaces.push(newPlace);

  localStorage.setItem(
    "myPlaces",
    JSON.stringify(myPlaces)
  );

  form.reset();

  current = "my";

  render();
};

// ===== 최초 =====
render();

// ===== 지도 보정 =====
setTimeout(() => {
  map.invalidateSize();
}, 100);

});

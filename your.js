window.addEventListener("DOMContentLoaded", () => {

console.log("SkyPin FULL START");

// ===== Leaflet 체크 =====
if (!window.L) {
  alert("Leaflet 로드 실패");
  return;
}

// ===== 지도 =====
const map = L.map("map", {
  doubleClickZoom: false
}).setView([37.56, 126.97], 11);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19
  }
).addTo(map);

// ===== 지도 보정 =====
setTimeout(() => {
  map.invalidateSize();
}, 300);

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

  {
    name:"굴업도",
    lat:37.186,
    lng:125.95,
    memo:"무인도 감성"
  },

  {
    name:"제부도",
    lat:37.166,
    lng:126.62,
    memo:"바닷길"
  },

  {
    name:"탄도항",
    lat:37.21,
    lng:126.62,
    memo:"풍차"
  },

  {
    name:"남한산성",
    lat:37.47,
    lng:127.18,
    memo:"운해"
  }

];

// ===== 저장 데이터 =====
let myPlaces = JSON.parse(
  localStorage.getItem("myPlaces") || "[]"
);

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

  if(window.selectMarker){
    map.removeLayer(window.selectMarker);
  }

  if(window.selectCircle){
    map.removeLayer(window.selectCircle);
  }

  window.selectMarker = L.marker([
    selectedLat,
    selectedLng
  ])
  .addTo(map)
  .bindPopup("📍 선택 위치")
  .openPopup();

  window.selectCircle = L.circle([
    selectedLat,
    selectedLng
  ], {
    radius:80,
    color:"#2196f3",
    weight:2,
    fillColor:"#2196f3",
    fillOpacity:0.15
  }).addTo(map);

});

// ===== 더블클릭 =====
map.on("dblclick", () => {

  if(panel){
    panel.classList.remove("show");
  }

  document.body.style.overflow = "";
});

// ===== 메뉴 =====
if(menuBtn){

  menuBtn.onclick = () => {

    if(panel){
      panel.classList.add("show");
    }

    render();
  };
}

// ===== 닫기 =====
if(closeBtn){

  closeBtn.onclick = () => {

    if(panel){
      panel.classList.remove("show");
    }

    document.body.style.overflow = "";
  };
}

// ===== 탭 =====
if(tabPoi){

  tabPoi.onclick = () => {

    current = "poi";

    tabPoi.classList.add("active");

    if(tabMy){
      tabMy.classList.remove("active");
    }

    render();
  };
}

if(tabMy){

  tabMy.onclick = () => {

    current = "my";

    tabMy.classList.add("active");

    if(tabPoi){
      tabPoi.classList.remove("active");
    }

    render();
  };
}

// ===== GPS =====
if(gpsBtn){

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

      },

      err => {
        alert("GPS 실패");
      }

    );
  };
}

// ===== 일출 =====
if(sunBtn){

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
      color:"orange",
      weight:3
    }).addTo(map);
  };
}

// ===== 추가 =====
if(addBtn){

  addBtn.onclick = () => {

    current = "my";

    if(panel){
      panel.classList.add("show");
    }

    if(tabMy){
      tabMy.classList.add("active");
    }

    if(tabPoi){
      tabPoi.classList.remove("active");
    }

    render();
  };
}

// ===== 검색 =====
if(search){
  search.oninput = render;
}

// ===== 렌더 =====
function render(){

  if(!list) return;

  list.innerHTML = "";

  const keyword = search
    ? search.value.toLowerCase()
    : "";

  const data =
    current === "poi"
    ? defaultPlaces
    : myPlaces;

  data
    .filter(p =>
      p.name &&
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
          ? `<img src="${p.photo}" style="width:100%;margin-top:5px;border-radius:6px;">`
          : ""
        }
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

      // ===== 삭제 =====
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
if(form){

  form.onsubmit = async (e) => {

    e.preventDefault();

    const name =
      document.getElementById("name")?.value || "";

    const memo =
      document.getElementById("memo")?.value || "";

    const photoInput =
      document.getElementById("photo");

    if(!name){
      alert("이름 입력");
      return;
    }

    let photo = "";

    if(photoInput && photoInput.files[0]){

      const file = photoInput.files[0];

      photo = await new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = (e) => {
          resolve(e.target.result);
        };

        reader.readAsDataURL(file);

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

    // ===== 선택핀 제거 =====
    if(window.selectMarker){
      map.removeLayer(window.selectMarker);
      window.selectMarker = null;
    }

    if(window.selectCircle){
      map.removeLayer(window.selectCircle);
      window.selectCircle = null;
    }

    myPlaces.push(newPlace);

    localStorage.setItem(
      "myPlaces",
      JSON.stringify(myPlaces)
    );

    form.reset();

    current = "my";

    render();

    map.setView([
      newPlace.lat,
      newPlace.lng
    ], 15);

  };
}

// ===== 최초 =====
render();

});

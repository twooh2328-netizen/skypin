window.addEventListener("DOMContentLoaded", () => {

console.log("SkyPin FULL START");

// ===== Leaflet 체크 =====
if (!window.L) {
  alert("Leaflet 로드 실패");
  return;
}

// ===== 지도 =====
const map = L.map("map", {
  doubleClickZoom: false,
  zoomSnap: 0
}).setView([37.56,126.97],11);

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
// 추천 명소 20개 정의
const defaultPlaces = [
  { name: "굴업도", lat: 37.229, lng: 126.123, memo: "무인도 감성" },
  { name: "제부도", lat: 37.209, lng: 126.681, memo: "바다길" },
  { name: "대부도 구봉도", lat: 37.331, lng: 126.582, memo: "일몰" },
  { name: "탄도항", lat: 37.123, lng: 126.789, memo: "풍차" },
  { name: "지리산 천왕봉", lat: 35.321, lng: 127.730, memo: "일출" },
  { name: "오대산 비로봉", lat: 37.749, lng: 128.592, memo: "운해" },
  { name: "추암 촛대바위", lat: 37.505, lng: 129.124, memo: "일몰/일출" },
  { name: "두물머리", lat: 37.545, lng: 127.327, memo: "운무/일몰" },
  { name: "부산 해운대", lat: 35.158, lng: 129.160, memo: "일출/파도" },
  { name: "부산 오륙도 해맞이공원", lat: 35.103, lng: 129.118, memo: "일출/섬" },
  { name: "부산 광안리", lat: 35.153, lng: 129.118, memo: "광안대교" },
  { name: "강원도 양양", lat: 38.075, lng: 128.618, memo: "서핑/파도" },
  { name: "속초 영금정", lat: 38.207, lng: 128.591, memo: "일출" },
  { name: "제주 성산일출봉", lat: 33.458, lng: 126.942, memo: "일출" },
  { name: "안동 하회마을", lat: 36.538, lng: 128.518, memo: "전통 한옥과 낙동강" },
  { name: "경주 불국사", lat: 35.790, lng: 129.331, memo: "사찰과 석굴암" },
  { name: "순천만 습지", lat: 34.907, lng: 127.500, memo: "갈대밭과 일몰" },
  { name: "보성 녹차밭", lat: 34.751, lng: 127.085, memo: "푸른 차밭" },
  { name: "울릉도 성인봉", lat: 37.489, lng: 130.905, memo: "섬과 바다 조망" },
  { name: "DMZ 임진강", lat: 37.890, lng: 126.700, memo: "역사적 풍경" }
];
console.log(defaultPlaces.length);
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

// 여기 추가
const poiList = document.getElementById("poi-list");

poiList.innerHTML = "";
defaultPlaces.forEach(place => {
  const li = document.createElement("li");
  li.textContent = `${place.name} - ${place.memo}`;
  poiList.appendChild(li);
});




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

map.on("dblclick", (e) => {

  L.DomEvent.stopPropagation(e);

  panel.classList.remove("show");

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

  if(!panel) return;

  panel.classList.toggle("show");

  if(panel.classList.contains("show")){
    render();
  }

};

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
  addBtn.addEventListener("click", () => {
  panel.classList.remove("show");
  setTimeout(() => {
  panel.classList.add("show");
  current = "my";
  tabMy.classList.add("active");
  tabPoi.classList.remove("active");
  render();
  setTimeout(() => {
  document.getElementById("name")
      ?.focus();

    }, 300);

  }, 50);

});

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

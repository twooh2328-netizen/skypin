window.addEventListener("DOMContentLoaded", () => {

console.log("A START");

// ===== Leaflet 체크 =====
if (!window.L) {
  console.error("Leaflet(L) 로드 실패");
  return;
}

// ===== 지도 =====
const map = L.map("map", {
  doubleClickZoom: false
}).setView([37.56, 126.97], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
.addTo(map);

// ===== 버튼 =====
const menuBtn = document.getElementById("menu-btn");
const gpsBtn = document.getElementById("gps-btn");
const sunBtn = document.getElementById("sun-btn");
const addBtn = document.getElementById("add-btn");

// 안전 체크
if (!menuBtn || !gpsBtn || !sunBtn || !addBtn) {
  console.error("버튼 DOM 없음");
  return;
}

// ===== 패널 =====
menuBtn.onclick = () => {
  document.getElementById("panel")?.classList.add("show");
};

gpsBtn.onclick = () => console.log("GPS");
sunBtn.onclick = () => console.log("SUN");
addBtn.onclick = () => console.log("ADD");

// ===== 상태 =====
let selectedLat = null;
let selectedLng = null;

window.selectMarker = null;
window.selectCircle = null;

// ===== 지도 클릭 =====
map.on("click", (e) => {

  selectedLat = e.latlng.lat;
  selectedLng = e.latlng.lng;

  if (window.selectMarker) map.removeLayer(window.selectMarker);
  if (window.selectCircle) map.removeLayer(window.selectCircle);

  window.selectMarker = L.marker([selectedLat, selectedLng])
    .addTo(map)
    .bindPopup("📍 선택 위치")
    .openPopup();

  window.selectCircle = L.circle([selectedLat, selectedLng], {
    radius: 80,
    color: "#2196f3",
    fillOpacity: 0.15
  }).addTo(map);
});

// ===== dblclick =====
map.on("dblclick", () => {
  document.getElementById("panel")?.classList.remove("show");
  document.body.style.overflow = "";
});

// ===== 렌더 보정 =====
setTimeout(() => {
  map.invalidateSize();
}, 100);

});

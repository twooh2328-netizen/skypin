console.log("✔ your.js LOADED");
// ===== 지도 생성 =====
const map = L.map("map", {
  doubleClickZoom: false
}).setView([37.56, 126.97], 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
.addTo(map);

setTimeout(() => {
  map.invalidateSize();
}, 100);

// ===== 상태 =====
let selectedLat = null;
let selectedLng = null;

window.selectMarker = null;
window.selectCircle = null;

// ===== 클릭 이벤트 =====
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
    fillOpacity: 0.15
  }).addTo(map);
});

// ===== dblclick =====
map.on("dblclick", () => {
  document.getElementById("panel")?.classList.remove("show");
  document.body.style.overflow = "";
});

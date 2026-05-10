window.addEventListener("DOMContentLoaded", () => {

  console.log("MAP TEST");

  const map = L.map("map").setView([37.56, 126.97], 11);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  ).addTo(map);

});

window.addEventListener("DOMContentLoaded", () => {
  console.log("SkyPin START");

  /* ===== 지도 ===== */
  const map = L.map("map", {
    doubleClickZoom: false
  }).setView([37.56, 126.97], 11);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19 }
  ).addTo(map);

  setTimeout(() => map.invalidateSize(), 300);

  /* ===== 상태 ===== */
  let current = "poi";
  let marker = null;
  let gpsMarker = null;
  let sunLine = null;
  let selectedLat = null;
  let selectedLng = null;

  window.selectMarker = null;
  window.selectCircle = null;

  /* ===== 추천명소 (20개 확장) ===== */
  const defaultPlaces = [
    { name: "굴업도", lat: 37.229, lng: 126.123, memo: "무인도 감성" },
    { name: "제부도", lat: 37.209, lng: 126.681, memo: "바다길" },
    { name: "지리산 천왕봉", lat: 35.321, lng: 127.730, memo: "일출" },
    { name: "제주 성산일출봉", lat: 33.458, lng: 126.942, memo: "일출" },
    { name: "설악산 대청봉", lat: 38.119, lng: 128.465, memo: "일출 명소" },
    { name: "남해 금산", lat: 34.817, lng: 127.892, memo: "해돋이" },
    { name: "속초 영금정", lat: 38.207, lng: 128.591, memo: "바다 전망" },
    { name: "울산 대왕암", lat: 35.499, lng: 129.436, memo: "해돋이" },
    { name: "강릉 경포대", lat: 37.795, lng: 128.896, memo: "호수와 바다" },
    { name: "부산 해운대", lat: 35.158, lng: 129.160, memo: "해변" },
    { name: "여수 향일암", lat: 34.691, lng: 127.749, memo: "일출" },
    { name: "안면도 꽃지해수욕장", lat: 36.493, lng: 126.331, memo: "석양" },
    { name: "무등산 정상", lat: 35.146, lng: 126.999, memo: "광주 전망" },
    { name: "팔공산 갓바위", lat: 35.985, lng: 128.693, memo: "불교 성지" },
    { name: "청평호반", lat: 37.735, lng: 127.423, memo: "호수 풍경" },
    { name: "대청호", lat: 36.402, lng: 127.489, memo: "호수" },
    { name: "태안 안면도", lat: 36.493, lng: 126.331, memo: "바다" },
    { name: "포항 호미곶", lat: 36.075, lng: 129.569, memo: "손 모양 조형물" },
    { name: "거제 바람의 언덕", lat: 34.769, lng: 128.621, memo: "풍차" },
    { name: "인천 월미도", lat: 37.471, lng: 126.604, memo: "바다와 놀이공원" }
  ];

  let myPlaces = JSON.parse(localStorage.getItem("myPlaces") || "[]");

  /* ===== DOM ===== */
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
  const saveBtn = document.getElementById("save-btn");

  /* ===== 버튼 이벤트 ===== */
  menuBtn.onclick = () => {
    panel.classList.toggle("show");
    if (panel.classList.contains("show")) render();
  };

  closeBtn.onclick = () => panel.classList.remove("show");

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

  gpsBtn.onclick = () => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        map.setView([lat, lng], 15);
        if (gpsMarker) map.removeLayer(gpsMarker);
        gpsMarker = L.marker([lat, lng]).addTo(map).bindPopup("내 위치").openPopup();
      },
      () => alert("GPS 실패")
    );
  };

  sunBtn.onclick = () => {
    if (sunLine) {
      map.removeLayer(sunLine);
      sunLine = null;
      return;
    }
    const center = map.getCenter();
    sunLine = L.polyline([[center.lat, center.lng], [center.lat, center.lng + 0.2]], {
      color: "orange"
    }).addTo(map);
  };

  addBtn.onclick = () => {
    current = "my";
    tabMy.classList.add("active");
    tabPoi.classList.remove("active");
    panel.classList.add("show");
    render();
    setTimeout(() => document.getElementById("name")?.focus(), 300);
  };

  search.oninput = render;

  /* ===== 지도 클릭으로 위치 선택 ===== */
  map.on("click", (e) => {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;

    if (marker) map.removeLayer(marker);
    marker = L.marker([selectedLat, selectedLng])
      .addTo(map)
      .bindPopup("선택한 위치")
      .openPopup();
  });

  /* ===== 렌더 ===== */
  function render() {
    list.innerHTML = "";
    const keyword = search.value.toLowerCase();
    const data = current === "poi" ? defaultPlaces : myPlaces;

    data.filter(p => p.name.toLowerCase().includes(keyword)).forEach((p, i) => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <b>${p.name}</b>
        <div>${p.memo || ""}</div>
        ${p.photo ? `<img src="${p.photo}">` : ""}
      `;

      div.onclick = () => {
        map.setView([p.lat, p.lng], 15);
        if (marker) map.removeLayer(marker);
        marker = L.marker([p.lat, p.lng]).addTo(map).bindPopup(p.name).openPopup();
      };

      if (current === "my") {
        const del = document.createElement("button");
        del.textContent = "삭제";
        del.onclick = e => {
          e.stopPropagation();
          myPlaces.splice(i, 1);
          localStorage.setItem("myPlaces", JSON.stringify(myPlaces));
          render();
        };
        div.appendChild(del);
      }

      list.appendChild(div);
    });
  }

  /* ===== 저장 ===== */
  async function savePlace() {
    const name = document.getElementById("name").value;
    const memo = document.getElementById("memo").value;
    const photoInput = document.getElementById("photo");

    if (!name) {
      alert("이름 입력");
      return;
    }

    let photo = "";
    if (photoInput.files[0]) {
      photo = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(photoInput.files[0]);
      });
    }

    const center = map.getCenter();
    const newPlace = {
      name,
      memo,
      lat: selectedLat ?? center.lat,
      lng: selectedLng ?? center.lng,
      photo
    };

    myPlaces.push(newPlace);
    localStorage.setItem("myPlaces", JSON.stringify(myPlaces));

    form.reset();
    current = "my";
    render();

    // 저장 후 지도 이동
    map.setView([newPlace.lat, newPlace.lng], 15);
  }

  saveBtn.addEventListener("click", async e => {
    e.preventDefault();
    await savePlace();
  });

  // ===== 최초 실행 =====
  render();
});

const form = document.getElementById("dateForm");
const dateInput = document.getElementById("date");
const apodContainer = document.getElementById("apodContainer");
const favouritesContainer = document.getElementById("favourites");
const errorText = document.getElementById("error");

const homeSection = document.getElementById("homeSection");
const gallerySection = document.getElementById("gallerySection");

const API_KEY = "DEMO_KEY"; // replace

// NAVIGATION
document.getElementById("homeBtn").addEventListener("click", () => {
  homeSection.classList.remove("hidden");
  gallerySection.classList.add("hidden");
});

document.getElementById("galleryBtn").addEventListener("click", () => {
  homeSection.classList.add("hidden");
  gallerySection.classList.remove("hidden");
});

// FORM
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const date = dateInput.value;
  const today = new Date().toISOString().split("T")[0];

  if (!date || date > today) {
    errorText.textContent = "Select a valid past date.";
    return;
  }

  errorText.textContent = "";
  fetchAPOD(date);
  saveSearch(date);

  // auto switch to gallery
  homeSection.classList.add("hidden");
  gallerySection.classList.remove("hidden");
});

// FETCH 8 IMAGES
async function fetchAPOD(date) {
  apodContainer.innerHTML = `<div class="spinner"></div>`;

  try {
    const endDate = date;
    const start = new Date(date);
    start.setDate(start.getDate() - 7); // 8 days total
    const startDate = start.toISOString().split("T")[0];

    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`
    );

    const data = await res.json();
    renderGallery(data.reverse());

  } catch {
    apodContainer.innerHTML = "<p>Error loading images.</p>";
  }
}

// RENDER
function renderGallery(images) {
  apodContainer.innerHTML = "";

  images.forEach(item => {
    if (item.media_type !== "image") return;

    const div = document.createElement("div");
    div.classList.add("gallery-item");

    div.innerHTML = `
      <h3>${item.title}</h3>
      <img src="${item.url}" alt="${item.title}">
      <p>${item.date}</p>
      <button>Save</button>
    `;

    div.querySelector("img").addEventListener("click", () => {
      window.open(item.hdurl, "_blank");
    });

    div.querySelector("button").addEventListener("click", () => {
      saveFavourite(item);
    });

    apodContainer.appendChild(div);
  });
}

// FAVOURITES
function saveFavourite(data) {
  let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

  if (favourites.some(item => item.date === data.date)) {
    alert("Already saved.");
    return;
  }

  favourites.push(data);
  localStorage.setItem("favourites", JSON.stringify(favourites));
  renderFavourites();
}

function renderFavourites() {
  let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

  if (favourites.length === 0) {
    favouritesContainer.innerHTML = "<p>No favourites yet.</p>";
    return;
  }

  favouritesContainer.innerHTML = "";

  favourites.forEach((item, index) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <h4>${item.title}</h4>
      <img src="${item.url}">
      <button>Delete</button>
    `;

    div.querySelector("img").addEventListener("click", () => {
      window.open(item.hdurl, "_blank");
    });

    div.querySelector("button").addEventListener("click", () => {
      deleteFavourite(index);
    });

    favouritesContainer.appendChild(div);
  });
}

function deleteFavourite(index) {
  let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
  favourites.splice(index, 1);
  localStorage.setItem("favourites", JSON.stringify(favourites));
  renderFavourites();
}

// FILTER
document.getElementById("filterFav").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

  const filtered = favourites.filter(item =>
    item.title.toLowerCase().includes(keyword)
  );

  favouritesContainer.innerHTML = "";

  filtered.forEach(item => {
    const div = document.createElement("div");

    div.innerHTML = `
      <h4>${item.title}</h4>
      <img src="${item.url}">
    `;

    favouritesContainer.appendChild(div);
  });
});

// HISTORY
function saveSearch(date) {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  if (!history.includes(date)) {
    history.push(date);
    localStorage.setItem("history", JSON.stringify(history));
  }
  renderHistory();
}
function renderHistory() {
  const historyList = document.getElementById("history");
  let history = JSON.parse(localStorage.getItem("history")) || [];
  historyList.innerHTML = "";
  history.forEach(date => {
    const li = document.createElement("li");
    li.textContent = date;
    li.addEventListener("click", () => {
      fetchAPOD(date);
      homeSection.classList.add("hidden");
      gallerySection.classList.remove("hidden");
    });
    historyList.appendChild(li);
  });
}
renderFavourites();
renderHistory();
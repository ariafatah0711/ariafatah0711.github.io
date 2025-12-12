// projects.js - project modal handling
document.addEventListener("DOMContentLoaded", function () {
  var projectModal = document.getElementById("projectModal");
  var modalImg = document.getElementById("projectModalImg");
  var modalTitle = document.getElementById("projectModalTitle");
  var modalDescription = document.getElementById("projectModalDescription");
  var modalCounter = document.getElementById("projectModalCounter");
  var prevBtn = document.getElementById("projectPrev");
  var nextBtn = document.getElementById("projectNext");
  var closeBtn = document.getElementById("projectClose");
  var sourceBtn = document.getElementById("projectModalSource");
  var demoBtn = document.getElementById("projectModalDemo");
  var starsEl = document.getElementById("projectModalStars");

  var currentIndex = 0;
  var images = [];
  var scrollPosition = 0;

  function openProjectModal(imgArray, title, description, sourceUrl, demoUrl, repo) {
    // force-close global image modal if open
    try {
      var globalImageModal = document.getElementById("imageModal");
      if (globalImageModal && globalImageModal.style.display === "flex") {
        globalImageModal.style.display = "none";
        var gVideo = document.getElementById("modalVideo");
        if (gVideo) {
          try {
            gVideo.pause();
          } catch (e) {}
          try {
            gVideo.removeAttribute("src");
            gVideo.load();
          } catch (e) {}
          gVideo.style.display = "none";
        }
        document.body.classList.remove("modal-open");
        document.body.style.top = "";
      }
    } catch (e) {}

    images = imgArray || [];
    currentIndex = 0;
    modalTitle.textContent = title || "";
    modalDescription.textContent = description || "";
    sourceBtn.style.display = sourceUrl ? "inline-block" : "none";
    if (sourceUrl) sourceBtn.href = sourceUrl;
    demoBtn.style.display = demoUrl ? "inline-block" : "none";
    if (demoUrl) demoBtn.href = demoUrl;

    if (repo) {
      starsEl.setAttribute("data-repo", repo);
      fetchStarCount(repo, starsEl);
    } else {
      starsEl.querySelector(".star-count").textContent = "-";
    }

    updateProjectModalImage();

    prevBtn.style.display = images.length > 1 ? "block" : "none";
    nextBtn.style.display = images.length > 1 ? "block" : "none";

    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    document.body.classList.add("modal-open");
    document.body.style.top = -scrollPosition + "px";
    projectModal.style.display = "flex";
  }

  function closeProjectModal() {
    projectModal.style.display = "none";
    document.body.classList.remove("modal-open");
    document.body.style.top = "";
    try {
      window.scrollTo(0, scrollPosition);
    } catch (e) {}
  }

  function updateProjectModalImage() {
    if (!images || images.length === 0) {
      modalImg.src = "";
      modalCounter.textContent = "";
      return;
    }
    // Reset fallback display when loading new image
    var fallback = modalImg.nextElementSibling;
    if (fallback) {
      fallback.style.display = "none";
    }
    modalImg.style.display = "block";
    modalImg.src = images[currentIndex];
    modalCounter.textContent = currentIndex + 1 + " / " + images.length;
  }

  function showPrev() {
    if (images.length > 1) {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateProjectModalImage();
    }
  }
  function showNext() {
    if (images.length > 1) {
      currentIndex = (currentIndex + 1) % images.length;
      updateProjectModalImage();
    }
  }

  // isi semua stars overlay di grid
  document.querySelectorAll(".github-stars").forEach(function (el) {
    var repo = el.getAttribute("data-repo");
    if (repo) fetchStarCount(repo, el);
  });

  // click handler
  document.addEventListener("click", function (e) {
    // kalau klik tombol Source/Demo -> biarin
    if (e.target.closest("a.btn")) return;

    // klik thumbnail dalam card
    if (e.target.classList.contains("project-thumb-img")) {
      var parentCard = e.target.closest(".project-item");
      if (!parentCard) return;
      e.preventDefault();
      e.stopImmediatePropagation();

      var dataImages = parentCard.getAttribute("data-images");
      var imgArr = [];
      try {
        imgArr = dataImages ? JSON.parse(dataImages) : [];
      } catch (err) {}
      imgArr = normalizeImages(imgArr);
      if (imgArr.length === 0) {
        var clickImg = parentCard.querySelector(".clickable-image");
        if (clickImg) imgArr.push(clickImg.src);
      }

      var clickedSrc = e.target.getAttribute("data-thumb-src") || e.target.src;
      var idx = imgArr.indexOf(clickedSrc);
      if (idx === -1) idx = 0;

      var title = parentCard.querySelector(".gallery-title")?.textContent || "";
      var desc = parentCard.querySelector(".gallery-description")?.textContent || "";
      var sourceLink = parentCard.getAttribute("data-source") || "";
      var demoLink = parentCard.getAttribute("data-demo") || "";
      var repo = parentCard.getAttribute("data-repo");

      openProjectModal(imgArr, title, desc, sourceLink, demoLink, repo);
      currentIndex = idx;
      updateProjectModalImage();
      return;
    }

    // klik gambar utama card
    if (e.target.classList.contains("clickable-image")) {
      var item = e.target.closest(".project-item");
      if (!item) return;
      e.preventDefault();
      e.stopImmediatePropagation();

      var dataImages = item.getAttribute("data-images");
      var imgArr = [];
      try {
        imgArr = dataImages ? JSON.parse(dataImages) : [];
      } catch (err) {}
      imgArr = normalizeImages(imgArr);
      if (imgArr.length === 0) {
        var clickImg = item.querySelector(".clickable-image");
        if (clickImg) imgArr.push(clickImg.src);
      }

      var title = item.querySelector(".gallery-title")?.textContent || "";
      var desc = item.querySelector(".gallery-description")?.textContent || "";
      var sourceLink = item.getAttribute("data-source") || "";
      var demoLink = item.getAttribute("data-demo") || "";
      var repo = item.getAttribute("data-repo");

      openProjectModal(imgArr, title, desc, sourceLink, demoLink, repo);
      return;
    }

    // klik area kosong card -> no action
  });

  // modal controls
  closeBtn.onclick = closeProjectModal;
  prevBtn.onclick = showPrev;
  nextBtn.onclick = showNext;
  projectModal.onclick = function (e) {
    if (e.target === projectModal) closeProjectModal();
  };
  document.addEventListener("keydown", function (e) {
    if (projectModal.style.display === "flex") {
      if (e.key === "Escape") closeProjectModal();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
  });

  function normalizeImages(arr) {
    return arr
      .map(function (i) {
        if (!i) return "";
        i = i.trim();
        if (i.indexOf("http") === 0) return i;
        if (i.indexOf("/") === 0) return i;
        if (i.indexOf(".") !== -1) return "/" + i;
        return "";
      })
      .filter(Boolean);
  }

  // GitHub stars fetch
  function fetchStarCount(repo, el) {
    if (!repo) return;
    var api = "https://api.github.com/repos/" + repo;
    fetch(api)
      .then(function (res) {
        if (!res.ok) throw new Error("no");
        return res.json();
      })
      .then(function (data) {
        var count = data.stargazers_count || 0;
        var sc = el.querySelector(".star-count");
        if (sc) sc.textContent = count;
      })
      .catch(function () {});
  }
});

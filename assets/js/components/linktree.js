function toggleLinktree(event, forceShow = null) {
  if (event) event.preventDefault();
  const box = document.getElementById("linktreeBox");
  const show = forceShow !== null ? forceShow : box.style.display !== "flex";
  box.style.display = show ? "flex" : "none";
  if (show) {
    document.body.classList.add("linktree-lock-scroll");
  } else {
    document.body.classList.remove("linktree-lock-scroll");
    history.replaceState(null, null, location.pathname + location.search);
  }
}
function openLinktree() {
  location.hash = "linktree";
}
function handleHashChange() {
  if (window.location.hash === "#linktree") {
    toggleLinktree(null, true);
  }
}

// CV Download Function
function downloadCV() {
  const box = document.getElementById("linktreeBox");
  const cvUrl = box ? box.getAttribute("data-cv-url") : null;

  if (!cvUrl) {
    if (typeof showAlert === "function") showAlert("CV URL not configured");
    return;
  }

  fetch(cvUrl, { method: "HEAD" })
    .then((response) => {
      if (response.ok) {
        window.location.href = cvUrl;
      } else {
        showAlert("CV file not found");
      }
    })
    .catch(() => {
      showAlert("Could not download CV");
    });
}

function initLinktree() {
  handleHashChange();
  const box = document.getElementById("linktreeBox");
  const inner = document.querySelector(".linktree-inner");
  if (!box || !inner) return;

  // prevent double-binding
  if (box.__linktreeBound) return;
  box.__linktreeBound = true;

  box.addEventListener("click", (e) => {
    if (!inner.contains(e.target)) {
      toggleLinktree(null, false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && box.style.display === "flex") {
      toggleLinktree(null, false);
    }
  });
}

window.addEventListener("DOMContentLoaded", initLinktree);
document.addEventListener("afterPjax", initLinktree, { passive: true });
window.addEventListener("hashchange", handleHashChange);

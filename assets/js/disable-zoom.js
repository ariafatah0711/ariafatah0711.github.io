document.addEventListener(
  "wheel",
  function (event) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  },
  { passive: false }
);

document.addEventListener("gesturestart", function (event) {
  event.preventDefault();
});

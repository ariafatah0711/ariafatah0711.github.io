document.addEventListener("DOMContentLoaded", () => {
  // Don't override background color to respect dark mode
  document.documentElement.style.overflow = "hidden";
  document.documentElement.style.position = "relative";
  document.documentElement.style.height = "100%";

  const style = document.createElement("style");
  style.innerHTML = `
        .snowflake {
            position: fixed;
            top: -10px;
            background: rgba(173, 216, 230, 0.8);
            border-radius: 50%;
            opacity: 0.8;
            pointer-events: none;
            animation: fall linear infinite;
        }
        @keyframes fall {
            to {
                transform: translateY(100vh);
            }
        }
    `;
  document.head.appendChild(style);

  function createSnowflakes() {
    for (let i = 0; i < 100; i++) {
      let snowflake = document.createElement("div");
      snowflake.classList.add("snowflake");
      let size = Math.random() * 5 + 2 + "px";
      snowflake.style.width = size;
      snowflake.style.height = size;
      snowflake.style.left = Math.random() * window.innerWidth + "px";
      snowflake.style.animationDuration = Math.random() * 3 + 2 + "s";
      document.documentElement.appendChild(snowflake);
      setTimeout(() => snowflake.remove(), 5000);
    }
  }
  setInterval(createSnowflakes, 500);
});

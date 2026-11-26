const video = document.querySelector("#uvodni-video");
const toggle = document.querySelector(".hero-video-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let manuallyControlled = false;

function updateToggle() {
  toggle.textContent = video.paused ? "Přehrát video" : "Pozastavit video";
}

async function playVideo(userInitiated = false) {
  if (toggle.disabled) return;

  try {
    if (!video.hasAttribute("src")) {
      toggle.disabled = true;
      toggle.textContent = "Načítám video…";

      // Static hosting serves the whole MP4. A blob URL lets Safari seek locally.
      const response = await fetch(video.dataset.src);
      if (!response.ok) throw new Error("Video unavailable");
      video.src = URL.createObjectURL(await response.blob());
    }

    if (userInitiated || !reducedMotion.matches) {
      video.muted = true;
      await video.play();
    }
  } catch {
    // Keep the still image and let the visitor retry with the play button.
  } finally {
    toggle.disabled = false;
    updateToggle();
  }
}

video.addEventListener("play", updateToggle);
video.addEventListener("pause", updateToggle);
video.addEventListener("error", () => { toggle.hidden = true; });

toggle.addEventListener("click", () => {
  manuallyControlled = true;
  if (video.paused) {
    playVideo(true);
  } else {
    video.pause();
  }
});

reducedMotion.addEventListener("change", (event) => {
  if (event.matches) video.pause();
});

toggle.hidden = false;
function scheduleAutoplay() {
  const connection = navigator.connection;
  if (connection?.saveData || ["slow-2g", "2g", "3g"].includes(connection?.effectiveType)) return;

  const start = () => {
    if (!manuallyControlled && !reducedMotion.matches) playVideo();
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 400);
}

if (document.readyState === "complete") scheduleAutoplay();
else window.addEventListener("load", scheduleAutoplay, { once: true });

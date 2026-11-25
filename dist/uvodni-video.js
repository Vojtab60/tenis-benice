const video = document.querySelector("#uvodni-video");
const toggle = document.querySelector(".hero-video-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateToggle() {
  toggle.textContent = video.paused ? "Přehrát video" : "Pozastavit video";
}

function playVideo() {
  if (!video.hasAttribute("src")) video.src = video.dataset.src;

  video.muted = true;
  video.play().catch(updateToggle);
}

video.addEventListener("play", updateToggle);
video.addEventListener("pause", updateToggle);
video.addEventListener("error", () => { toggle.hidden = true; });

toggle.addEventListener("click", () => {
  if (video.paused) {
    playVideo();
  } else {
    video.pause();
  }
});

reducedMotion.addEventListener("change", (event) => {
  if (event.matches) video.pause();
});

toggle.hidden = false;
if (!reducedMotion.matches) playVideo();

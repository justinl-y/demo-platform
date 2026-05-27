(() => {
  const phrases = [
    "Database connected …",
    "Spinning up containers …",
    "API online …",
    "UI Coming soon …",
  ];

  const typed = document.getElementById("typed");
  const clock = document.getElementById("clock");
  const build = document.getElementById("build");
  const year = document.getElementById("year");

  year.textContent = new Date().getFullYear();

  build.textContent = Array.from({ length: 7 }, () =>
    "abcdef0123456789"[Math.floor(Math.random() * 16)]
  ).join("");

  const tick = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };
  tick();
  setInterval(tick, 1000);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    typed.textContent = phrases[0];
    return;
  }

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  const TYPE_MS = 70;
  const DELETE_MS = 35;
  const HOLD_MS = 1800;

  const loop = () => {
    const current = phrases[phraseIdx];
    typed.textContent = current.slice(0, charIdx);

    if (!deleting && charIdx < current.length) {
      charIdx++;
      setTimeout(loop, TYPE_MS);
    } else if (!deleting && charIdx === current.length) {
      deleting = true;
      setTimeout(loop, HOLD_MS);
    } else if (deleting && charIdx > 0) {
      charIdx--;
      setTimeout(loop, DELETE_MS);
    } else {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(loop, 250);
    }
  };

  loop();
})();

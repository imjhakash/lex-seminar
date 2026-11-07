(function () {
  // ---- Add / remove pages here ----
  var pages = [
    "pages/page-1.jpg",
    "pages/page-2.jpg",
    "pages/page-3.jpg",
    "pages/page-4.jpg"
  ];

  var loader = document.getElementById("loader");
  var barFill = document.getElementById("barFill");
  var status = document.getElementById("loaderStatus");
  var enterBtn = document.getElementById("enterBtn");
  var img = document.getElementById("pageImg");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var curEl = document.getElementById("cur");
  var totalEl = document.getElementById("total");
  var dotsEl = document.getElementById("dots");
  var music = document.getElementById("music");
  var musicBtn = document.getElementById("musicBtn");

  var current = 0;
  var busy = false;
  totalEl.textContent = pages.length;

  // ---------- Preload pages (loading screen) ----------
  var loaded = 0;
  var MIN_LOAD_MS = 1800; // loading screen shows at least this long
  var startTime = Date.now();
  function tick() {
    loaded++;
    var pct = Math.round((loaded / pages.length) * 100);
    barFill.style.width = pct + "%";
    status.textContent = "Loading " + pct + "%";
    if (loaded >= pages.length) {
      var wait = Math.max(400, MIN_LOAD_MS - (Date.now() - startTime));
      setTimeout(function () {
        status.textContent = "Ready";
        enterBtn.disabled = false;
        enterBtn.classList.add("ready");
      }, wait);
    }
  }
  pages.forEach(function (src) {
    var p = new Image();
    p.onload = tick;
    p.onerror = tick;
    p.src = src;
  });

  // Enter = open reader and start music (browsers need a click to play audio)
  enterBtn.addEventListener("click", function () {
    loader.classList.add("hide");
    playMusic();
  });

  // ---------- Dots ----------
  pages.forEach(function (_, i) {
    var d = document.createElement("button");
    d.className = "dot";
    d.type = "button";
    d.setAttribute("aria-label", "Go to page " + (i + 1));
    d.addEventListener("click", function () { go(i); });
    dotsEl.appendChild(d);
  });

  function render() {
    curEl.textContent = current + 1;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === pages.length - 1;
    Array.prototype.forEach.call(dotsEl.children, function (d, i) {
      d.classList.toggle("active", i === current);
    });
  }

  function go(index) {
    if (busy || index < 0 || index >= pages.length || index === current) return;
    busy = true;
    var forward = index > current;
    img.classList.add(forward ? "out-left" : "out-right");
    setTimeout(function () {
      current = index;
      img.src = pages[current];
      img.alt = "Brochure page " + (current + 1);
      img.classList.remove("out-left", "out-right");
      img.classList.add(forward ? "out-right" : "out-left");
      // force reflow then slide in
      void img.offsetWidth;
      img.classList.remove("out-left", "out-right");
      render();
      setTimeout(function () { busy = false; }, 280);
    }, 260);
  }

  prevBtn.addEventListener("click", function () { go(current - 1); });
  nextBtn.addEventListener("click", function () { go(current + 1); });

  // Keyboard arrows
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") go(current + 1);
    if (e.key === "ArrowLeft") go(current - 1);
  });

  // Swipe on phones
  var startX = null, startY = null;
  var stage = document.getElementById("stage");
  stage.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? current + 1 : current - 1);
    }
    startX = null;
  });

  // ---------- Music ----------
  music.volume = 0.5;
  function playMusic() {
    var p = music.play();
    if (p && p.catch) p.catch(function () { setMusicUI(false); });
    setMusicUI(true);
  }
  function setMusicUI(on) {
    musicBtn.classList.toggle("muted", !on);
    musicBtn.classList.toggle("playing", on);
    musicBtn.title = on ? "Music off" : "Music on";
  }
  musicBtn.addEventListener("click", function () {
    if (music.paused) playMusic();
    else { music.pause(); setMusicUI(false); }
  });

  render();
})();

(function () {
  /**
   * Google Apps Script Web App URL (Deploy → Web app → Anyone).
   * Қойылмағанда форма жіберілмейді. Нұсқа: scripts/google-apps-script-rsvp-webapp.gs
   */
  const RSVP_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxpVoTe8kVghr_wnRI1_8o3Q0ukI4OaXXCg2xzpC-jnEO0bS40NA6Kl10xnjc0bRddL/exec";

  const ob = new IntersectionObserver(
    (entries) => {
      entries.forEach((v) => {
        if (v.isIntersecting) v.target.classList.add("vis");
      });
    },
    { threshold: 0.07 }
  );

  document.querySelectorAll("[data-r]").forEach((el) => ob.observe(el));

  /** 21.08.2026 19:00 — Шымкент (UTC+5) = 14:00 UTC */
  const TARGET_MS = Date.UTC(2026, 7, 21, 14, 0, 0);

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function tickCountdown() {
    const elD = document.getElementById("cd-days");
    const elH = document.getElementById("cd-hours");
    const elMin = document.getElementById("cd-mins");
    const elS = document.getElementById("cd-secs");
    if (!elD || !elH || !elMin || !elS) return;

    const now = Date.now();
    let sec = Math.floor((TARGET_MS - now) / 1000);

    if (sec <= 0) {
      elD.textContent = "0";
      elH.textContent = "0";
      elMin.textContent = "0";
      elS.textContent = "0";
      return;
    }

    const d = Math.floor(sec / 86400);
    sec %= 86400;
    const h = Math.floor(sec / 3600);
    sec %= 3600;
    const mi = Math.floor(sec / 60);
    const s = sec % 60;

    elD.textContent = String(d);
    elH.textContent = pad2(h);
    elMin.textContent = pad2(mi);
    elS.textContent = pad2(s);
  }

  tickCountdown();
  setInterval(tickCountdown, 1000);

  function initHeroMusic() {
    const musicBtn = document.getElementById("musicToggle");
    const iconOff = document.getElementById("musicIconOff");
    const iconOn = document.getElementById("musicIconOn");
    const backgroundMusic = document.getElementById("backgroundMusic");
    const label = musicBtn && musicBtn.querySelector(".music-hero-btn__text");

    if (!musicBtn || !backgroundMusic || !iconOff || !iconOn || !label) return;

    backgroundMusic.volume = 0.3;
    let isPlaying = false;

    const removeStarters = () => {
      document.removeEventListener("click", startMusic);
      document.removeEventListener("touchstart", startMusic);
      document.removeEventListener("keydown", startMusic);
      document.removeEventListener("scroll", startMusic);
      document.removeEventListener("mousemove", startMusic);
    };

    const setPausedUI = () => {
      iconOff.style.display = "";
      iconOn.style.display = "none";
      label.textContent = "Әуенді қосу";
      musicBtn.classList.remove("music-hero-btn--playing");
      musicBtn.setAttribute("aria-pressed", "false");
    };

    const setPlayingUI = () => {
      iconOff.style.display = "none";
      iconOn.style.display = "";
      label.textContent = "Әуенді өшіру";
      musicBtn.classList.add("music-hero-btn--playing");
      musicBtn.setAttribute("aria-pressed", "true");
    };

    const playMusic = () => {
      backgroundMusic.play().then(
        () => {
          setPlayingUI();
          isPlaying = true;
        },
        () => {
          label.textContent = "Музыка қосылмады";
          setPausedUI();
          isPlaying = false;
        }
      );
    };

    function startMusic() {
      removeStarters();
      playMusic();
    }

    document.addEventListener("click", startMusic, { once: true });
    document.addEventListener("touchstart", startMusic, { once: true, passive: true });
    document.addEventListener("keydown", startMusic, { once: true });
    document.addEventListener("scroll", startMusic, { once: true, passive: true });
    document.addEventListener("mousemove", startMusic, { once: true, passive: true });

    setTimeout(() => {
      if (isPlaying) return;
      backgroundMusic.play().then(
        () => {
          setPlayingUI();
          isPlaying = true;
          removeStarters();
        },
        () => {}
      );
    }, 1000);

    musicBtn.addEventListener("click", () => {
      if (isPlaying) {
        backgroundMusic.pause();
        setPausedUI();
        isPlaying = false;
        return;
      }
      backgroundMusic.play().then(
        () => {
          setPlayingUI();
          isPlaying = true;
        },
        () => {
          label.textContent = "Музыка қосылмады";
          isPlaying = false;
        }
      );
    });
  }

  function initRsvpForm() {
    const form = document.getElementById("rsvpForm");
    if (!form) return;

    const statusEl = document.getElementById("rsvpFormStatus");
    const minusBtn = document.getElementById("rsvpMinus");
    const plusBtn = document.getElementById("rsvpPlus");
    const guestDisplay = document.getElementById("rsvpGuestDisplay");
    const guestInput = document.getElementById("rsvpGuestInput");
    const submitBtn = document.getElementById("rsvpSubmit");
    const submitText = document.getElementById("rsvpSubmitText");
    const spinner = document.getElementById("rsvpSubmitSpinner");

    const CANT = "Өкінішке орай, қатыса алмаймын";
    const COUPLE = "Жұбыммен келемін";
    const COMING = "Келемін";

    let guestCount = 1;

    function getAttendance() {
      const c = form.querySelector('input[name="attendance"]:checked');
      return c ? c.value : "";
    }

    function minGuests() {
      const a = getAttendance();
      if (a === CANT) return 0;
      if (a === COUPLE) return 2;
      return 1;
    }

    function maxGuests() {
      return 40;
    }

    function renderGuests() {
      const a = getAttendance();
      if (a === CANT) {
        guestCount = 0;
        guestDisplay.textContent = "0";
        guestInput.value = "0";
        minusBtn.disabled = true;
        plusBtn.disabled = true;
        return;
      }
      const lo = minGuests();
      const hi = maxGuests();
      if (guestCount < lo) guestCount = lo;
      if (guestCount > hi) guestCount = hi;
      guestDisplay.textContent = String(guestCount);
      guestInput.value = String(guestCount);
      minusBtn.disabled = guestCount <= lo;
      plusBtn.disabled = guestCount >= hi;
    }

    form.querySelectorAll('input[name="attendance"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const v = radio.value;
        if (v === CANT) {
          guestCount = 0;
        } else if (v === COUPLE) {
          if (guestCount < 2) guestCount = 2;
        } else if (v === COMING) {
          if (guestCount < 1) guestCount = 1;
        }
        renderGuests();
      });
    });

    minusBtn.addEventListener("click", () => {
      if (getAttendance() === CANT) return;
      guestCount -= 1;
      renderGuests();
    });

    plusBtn.addEventListener("click", () => {
      if (getAttendance() === CANT) return;
      guestCount += 1;
      renderGuests();
    });

    renderGuests();

    function setLoading(on) {
      submitBtn.disabled = on;
      spinner.hidden = !on;
    }

    function showStatus(msg, kind) {
      statusEl.textContent = msg;
      statusEl.classList.remove("rsvp-form__status--err", "rsvp-form__status--ok");
      if (kind === "err") statusEl.classList.add("rsvp-form__status--err");
      if (kind === "ok") statusEl.classList.add("rsvp-form__status--ok");
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      showStatus("", null);

      if (!RSVP_WEBAPP_URL || !RSVP_WEBAPP_URL.startsWith("https://script.google.com/")) {
        showStatus(
          "Алдымен js/main.js ішінде RSVP_WEBAPP_URL-ға Google Apps Script Web App сілтемесін қойыңыз (нұсқау: scripts/google-apps-script-rsvp-webapp.gs).",
          "err"
        );
        return;
      }

      const nameInput = document.getElementById("rsvpName");
      const name = (nameInput && nameInput.value.trim()) || "";
      const attendance = getAttendance();
      const website = (document.getElementById("rsvpWebsite") && document.getElementById("rsvpWebsite").value) || "";

      if (!name) {
        showStatus("Аты-жөніңізді енгізіңіз.", "err");
        nameInput.focus();
        return;
      }
      if (!attendance) {
        showStatus("Қатысу түрін таңдаңыз.", "err");
        return;
      }

      renderGuests();
      const guestCountNum = parseInt(guestInput.value, 10) || 0;

      setLoading(true);
      submitText.textContent = "Жіберілуде…";

      const payload = {
        name,
        attendance,
        guestCount: guestCountNum,
        website,
      };

      try {
        const res = await fetch(RSVP_WEBAPP_URL, {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("parse");
        }

        if (data && data.ok) {
          showStatus("Рақмет! Жауабыңыз жазылды.", "ok");
          form.reset();
          guestCount = 1;
          renderGuests();
          submitText.textContent = "Жіберу";
          setLoading(false);
          return;
        }

        const errMap = {
          name_required: "Аты-жөніңізді енгізіңіз.",
          attendance_required: "Қатысу түрін таңдаңыз.",
          spam: "Жіберу сәтсіз аяқталды.",
        };
        showStatus(errMap[data.error] || "Қате: " + (data.error || "белгісіз"), "err");
      } catch {
        showStatus("Серверге қосылу мүмкін болмады. Интернетті тексеріп, қайта байқап көріңіз.", "err");
      }

      submitText.textContent = "Жіберу";
      setLoading(false);
    });
  }

  initHeroMusic();
  initRsvpForm();
})();

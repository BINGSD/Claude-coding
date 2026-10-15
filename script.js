/* ==========================================================
   Apex Maths — interactive features
   Progressive enhancement: every page still works without JS.
   ========================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // localStorage can throw (private mode, blocked storage), so guard it.
  var store = {
    get: function (key, fallback) {
      try {
        var v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- Mobile menu: close after choosing a link ---------- */
  function initMobileMenu() {
    var toggle = $("#nav-toggle");
    if (!toggle) return;
    $$(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { toggle.checked = false; });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") toggle.checked = false;
    });
  }

  /* ---------- Highlight the nav link for the section in view ---------- */
  function initScrollSpy() {
    if (!("IntersectionObserver" in window)) return;
    var links = $$('.nav-links a[href^="#"]').filter(function (a) {
      return a.getAttribute("href").length > 1 && !a.classList.contains("btn");
    });
    if (!links.length) return;

    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

    // Watch every section so the highlight clears over sections without a link.
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("is-active"); });
        var link = byId[entry.target.id];
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    $$("main section[id]").forEach(function (section) { observer.observe(section); });
  }

  /* ---------- Fade-in on scroll ---------- */
  function initReveal() {
    var targets = $$(".course-card, .feature, .steps li, .plan, .tutor, .quote, .unit, .worked");
    if (!targets.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    targets.forEach(function (el) { el.classList.add("reveal"); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Count-up animation for hero stats ---------- */
  function initCounters() {
    var stats = $$(".hero-stats strong");
    stats.forEach(function (el) {
      var text = el.textContent.trim();
      var match = text.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
      if (!match) return;
      var target = parseFloat(match[1].replace(/,/g, ""));
      var suffix = match[2];
      var decimals = (match[1].split(".")[1] || "").length;
      var useCommas = match[1].indexOf(",") !== -1;
      if (reduceMotion) return;

      var duration = 1400;
      var start = null;
      function format(n) {
        var s = n.toFixed(decimals);
        return useCommas ? Number(s).toLocaleString("en-GB") : s;
      }
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      el.textContent = format(0) + suffix;
      requestAnimationFrame(step);
    });
  }

  /* ---------- Practice quiz ---------- */
  var QUIZ = [
    {
      topic: "Pure · Differentiation",
      q: "Differentiate y = 3x⁴ − 2x with respect to x.",
      options: ["12x³ − 2", "12x³", "3x³ − 2", "12x⁴ − 2"],
      answer: 0,
      why: "Bring the power down and reduce it by one: d/dx(3x⁴) = 12x³ and d/dx(−2x) = −2."
    },
    {
      topic: "Pure · Integration",
      q: "Evaluate ∫₀² 3x² dx.",
      options: ["12", "6", "8", "4"],
      answer: 2,
      why: "∫ 3x² dx = x³, so the value is 2³ − 0³ = 8."
    },
    {
      topic: "Pure · Logarithms",
      q: "Solve log₂ x = 5.",
      options: ["10", "25", "7", "32"],
      answer: 3,
      why: "log₂ x = 5 means x = 2⁵ = 32."
    },
    {
      topic: "Pure · Series",
      q: "Find the sum to infinity of the geometric series 3 + 1.5 + 0.75 + …",
      options: ["4.5", "6", "9", "The series diverges"],
      answer: 1,
      why: "a = 3 and r = ½, so S∞ = a ⁄ (1 − r) = 3 ⁄ ½ = 6."
    },
    {
      topic: "Statistics · Binomial",
      q: "X ~ B(20, 0.3). What is E(X)?",
      options: ["0.3", "4.2", "6", "14"],
      answer: 2,
      why: "For a binomial distribution E(X) = np = 20 × 0.3 = 6. (4.2 is the variance, np(1 − p).)"
    },
    {
      topic: "Statistics · Probability",
      q: "A and B are independent with P(A) = 0.4 and P(B) = 0.5. Find P(A ∩ B).",
      options: ["0.9", "0.2", "0.1", "0.45"],
      answer: 1,
      why: "For independent events P(A ∩ B) = P(A) × P(B) = 0.4 × 0.5 = 0.2."
    },
    {
      topic: "Mechanics · SUVAT",
      q: "A particle starts from rest and accelerates at 3 m s⁻² for 4 s. What is its final speed?",
      options: ["7 m s⁻¹", "12 m s⁻¹", "24 m s⁻¹", "48 m s⁻¹"],
      answer: 1,
      why: "v = u + at = 0 + 3 × 4 = 12 m s⁻¹."
    }
  ];

  function initQuiz() {
    var root = $("#quiz");
    if (!root) return;

    var state = { index: 0, score: 0, answered: false };
    var letters = ["A", "B", "C", "D"];

    var el = {
      progress: $(".quiz-progress-bar span", root),
      count: $(".quiz-count", root),
      topic: $(".quiz-topic", root),
      question: $(".quiz-question", root),
      options: $(".quiz-options", root),
      feedback: $(".quiz-feedback", root),
      next: $(".quiz-next", root),
      body: $(".quiz-body", root),
      result: $(".quiz-result", root),
      score: $(".quiz-score", root),
      message: $(".quiz-message", root),
      restart: $(".quiz-restart", root)
    };

    function render() {
      var item = QUIZ[state.index];
      state.answered = false;
      el.count.textContent = "Question " + (state.index + 1) + " of " + QUIZ.length;
      el.progress.style.width = (state.index / QUIZ.length * 100) + "%";
      el.topic.textContent = item.topic;
      el.question.textContent = item.q;
      el.feedback.hidden = true;
      el.feedback.className = "quiz-feedback";
      el.next.hidden = true;
      el.options.innerHTML = "";

      item.options.forEach(function (text, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-option";
        btn.innerHTML = '<span class="quiz-letter">' + letters[i] + "</span>";
        btn.appendChild(document.createTextNode(text));
        btn.addEventListener("click", function () { choose(i); });
        el.options.appendChild(btn);
      });
    }

    function choose(i) {
      if (state.answered) return;
      state.answered = true;
      var item = QUIZ[state.index];
      var buttons = $$(".quiz-option", el.options);
      buttons.forEach(function (b, j) {
        b.disabled = true;
        if (j === item.answer) b.classList.add("is-correct");
        else if (j === i) b.classList.add("is-wrong");
      });

      var correct = i === item.answer;
      if (correct) state.score++;
      el.feedback.hidden = false;
      el.feedback.classList.add(correct ? "is-correct" : "is-wrong");
      el.feedback.innerHTML = "<strong>" + (correct ? "Correct!" : "Not quite.") + "</strong> ";
      el.feedback.appendChild(document.createTextNode(item.why));

      el.next.hidden = false;
      el.next.textContent = state.index === QUIZ.length - 1 ? "See my score" : "Next question →";
      el.next.focus();
    }

    function finish() {
      el.progress.style.width = "100%";
      el.body.hidden = true;
      el.result.hidden = false;
      el.score.textContent = state.score + " / " + QUIZ.length;
      var pct = state.score / QUIZ.length;
      el.message.textContent =
        pct === 1 ? "Perfect score! You're well on track for an A*." :
        pct >= 0.7 ? "Great work — a few topics to polish and you'll be flying." :
        pct >= 0.4 ? "A solid start. A free trial lesson will pinpoint where marks are slipping." :
        "Everyone starts somewhere. Book a free trial and we'll build your foundations step by step.";

      var best = store.get("apex-quiz-best", 0);
      if (state.score > best) store.set("apex-quiz-best", state.score);
      var bestEl = $(".quiz-best", root);
      if (bestEl) bestEl.textContent = "Your best: " + Math.max(best, state.score) + " / " + QUIZ.length;
    }

    el.next.addEventListener("click", function () {
      if (state.index < QUIZ.length - 1) {
        state.index++;
        render();
      } else {
        finish();
      }
    });

    el.restart.addEventListener("click", function () {
      state.index = 0;
      state.score = 0;
      el.result.hidden = true;
      el.body.hidden = false;
      render();
    });

    render();
  }

  /* ---------- Booking form: validation + confirmation ---------- */
  function initBookingForm() {
    var form = $("#booking-form");
    if (!form) return;
    var success = $(".form-success", form.parentNode);

    function setError(input, message) {
      var holder = input.parentNode;
      var msg = $(".field-error", holder);
      if (!msg) {
        msg = document.createElement("span");
        msg.className = "field-error";
        holder.appendChild(msg);
      }
      msg.textContent = message;
      input.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function validate(input) {
      var value = input.value.trim();
      if (input.required && !value) {
        setError(input, "Please fill in this field.");
        return false;
      }
      if (input.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError(input, "Please enter a valid email address.");
        return false;
      }
      setError(input, "");
      return true;
    }

    var fields = $$("input[required]", form);
    fields.forEach(function (input) {
      input.addEventListener("blur", function () { validate(input); });
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") validate(input);
      });
    });

    form.setAttribute("novalidate", "");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = fields.map(validate).every(Boolean);
      if (!ok) {
        var firstBad = $('[aria-invalid="true"]', form);
        if (firstBad) firstBad.focus();
        return;
      }
      var name = $("#name", form).value.trim().split(/\s+/)[0];
      var board = $("#board", form).value;
      var year = $("#year", form).value;
      $(".form-success-name", success).textContent = name;
      $(".form-success-detail", success).textContent = year + ", " + board;
      form.hidden = true;
      success.hidden = false;
      success.focus();
    });

    var again = $(".form-again", success);
    if (again) {
      again.addEventListener("click", function () {
        form.reset();
        success.hidden = true;
        form.hidden = false;
        $("#name", form).focus();
      });
    }
  }

  /* ---------- Courses page: search the syllabus ---------- */
  function initSyllabusSearch() {
    var input = $("#unit-search");
    if (!input) return;
    var modules = $$(".module");
    var status = $("#search-status");
    var units = $$(".unit");

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      units.forEach(function (u) {
        var match = !q || u.textContent.toLowerCase().indexOf(q) !== -1;
        u.hidden = !match;
        if (match) shown++;
      });
      modules.forEach(function (m) {
        var anyVisible = $$(".unit", m).some(function (u) { return !u.hidden; });
        m.hidden = !anyVisible;
        var worked = $(".worked", m);
        if (worked) worked.hidden = !!q;
      });
      status.textContent = q
        ? shown + (shown === 1 ? " unit matches" : " units match") + " “" + input.value.trim() + "”"
        : "";
    });
  }

  /* ---------- Courses page: progress tracker ---------- */
  function initProgress() {
    var modules = $$(".module[id]");
    if (!modules.length) return;
    var done = store.get("apex-progress", {});

    modules.forEach(function (module) {
      var units = $$(".unit", module);
      var aside = $(".module-aside", module);

      var tracker = document.createElement("div");
      tracker.className = "progress";
      tracker.innerHTML =
        '<div class="progress-label"><span>Your progress</span><span class="progress-value"></span></div>' +
        '<div class="progress-track"><span></span></div>';
      aside.appendChild(tracker);

      function update() {
        var count = units.filter(function (u) { return u.classList.contains("is-done"); }).length;
        $(".progress-value", tracker).textContent = count + " / " + units.length;
        $(".progress-track span", tracker).style.width = (count / units.length * 100) + "%";
      }

      units.forEach(function (unit, i) {
        var key = module.id + "-" + i;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "unit-done";

        function paint() {
          var isDone = !!done[key];
          unit.classList.toggle("is-done", isDone);
          btn.setAttribute("aria-pressed", isDone ? "true" : "false");
          btn.textContent = isDone ? "✓ Completed" : "Mark as done";
        }

        btn.addEventListener("click", function () {
          if (done[key]) delete done[key]; else done[key] = true;
          store.set("apex-progress", done);
          paint();
          update();
        });

        unit.appendChild(btn);
        paint();
      });
      update();
    });
  }

  /* ---------- Courses page: highlight today's classes ---------- */
  function initTimetable() {
    var rows = $$("#timetable tbody tr");
    if (!rows.length) return;
    var today = new Date().toLocaleDateString("en-GB", { weekday: "long" });
    rows.forEach(function (row) {
      var cell = row.cells[0];
      if (cell && cell.textContent.trim() === today) {
        row.classList.add("is-today");
        var badge = document.createElement("span");
        badge.className = "today-badge";
        badge.textContent = "Today";
        cell.appendChild(badge);
      }
    });
  }

  /* ---------- Back-to-top button ---------- */
  function initBackToTop() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.textContent = "↑";
    document.body.appendChild(btn);

    function onScroll() {
      btn.classList.toggle("is-visible", window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Keep the footer year current ---------- */
  function initYear() {
    $$(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initScrollSpy();
    initReveal();
    initCounters();
    initQuiz();
    initBookingForm();
    initSyllabusSearch();
    initProgress();
    initTimetable();
    initBackToTop();
    initYear();
  });
})();

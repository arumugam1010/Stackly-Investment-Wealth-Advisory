/* ============================================================
   Meridian Capital — shared JavaScript
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Loading screen ---------- */
  function hideLoader() {
    var loader = document.getElementById("loader");
    if (loader) {
      loader.classList.add("hidden");
      setTimeout(function () {
        if (loader && loader.parentNode) { loader.parentNode.removeChild(loader); }
      }, 500);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(hideLoader, 200);
  } else {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(hideLoader, 200); });
    window.addEventListener("load", function () { setTimeout(hideLoader, 200); });
  }
  // Safety fallback in case external fonts/images hang
  setTimeout(hideLoader, 600);

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("in");
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReveal);
  } else {
    initReveal();
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("mc-theme", t); } catch (e) { }
    var icons = document.querySelectorAll("[data-theme-icon]");
    icons.forEach(function (i) {
      var sun = i.querySelector(".ic-sun"), moon = i.querySelector(".ic-moon");
      if (!sun || !moon) return;
      if (t === "light") { sun.style.display = "none"; moon.style.display = ""; }
      else { sun.style.display = ""; moon.style.display = "none"; }
    });
  }
  applyTheme("light");
  window.toggleTheme = function () {
    applyTheme("light");
  };

  /* ---------- Navbar scroll state ---------- */
  var nav = document.querySelector(".navbar-glass");
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 30) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Ripple effect on .btn-grad / .btn-ghost ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn-grad, .btn-ghost, .social-btn, .ripple-btn");
    if (!btn) return;
    var circle = document.createElement("span");
    var d = btn.getBoundingClientRect();
    var size = Math.max(d.width, d.height);
    var x = (e.clientX || d.left + d.width / 2) - d.left - size / 2;
    var y = (e.clientY || d.top + d.height / 2) - d.top - size / 2;
    circle.className = "ripple";
    circle.style.width = circle.style.height = size + "px";
    circle.style.left = x + "px";
    circle.style.top = y + "px";
    btn.appendChild(circle);
    setTimeout(function () { circle.remove(); }, 650);
  });

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  var initReveal = function () {
    document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { io.observe(el); });
  };
  window.addEventListener("load", initReveal);
  if (document.readyState !== "loading") initReveal();

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-counter]");
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      var target = parseFloat(el.getAttribute("data-counter")) || 0;
      var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var pre = el.getAttribute("data-prefix") || "";
      var suf = el.getAttribute("data-suffix") || "";
      var dur = 1600, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = pre + val.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(function (c) { cio.observe(c); });

  /* ---------- Form validation (auth + contact) ---------- */
  function setInvalid(field, msg) {
    field.classList.add("is-invalid");
    var fb = field.parentNode.querySelector(".invalid-feedback");
    if (!fb) { fb = document.createElement("div"); fb.className = "invalid-feedback"; field.parentNode.appendChild(fb); }
    fb.textContent = msg;
  }
  function clearInvalid(field) { field.classList.remove("is-invalid"); }
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) { clearInvalid(f); });
      var email = form.querySelector('input[type="email"]');
      if (email && email.value) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { setInvalid(email, "Enter a valid email address."); ok = false; }
      }
      var pwd = form.querySelector('input[type="password"]');
      if (pwd && pwd.value && form.querySelector("[data-min-pwd]")) {
        if (pwd.value.length < 8) { setInvalid(pwd, "Password must be at least 8 characters."); ok = false; }
      }
      var pwd2 = form.querySelector("[data-match-pwd]");
      if (pwd2 && pwd && pwd.value) {
        if (pwd2.value !== pwd.value) { setInvalid(pwd2, "Passwords do not match."); ok = false; }
      }
      form.querySelectorAll("[required]").forEach(function (f) {
        if (!f.value.trim()) { setInvalid(f, "This field is required."); ok = false; }
      });
      if (!ok) return;
      if (form.hasAttribute("data-redirect")) {
        triggerTransition("404.html");
      } else if (form.hasAttribute("data-success")) {
        var alert = form.querySelector(".form-success");
        if (alert) { alert.classList.remove("d-none"); alert.textContent = "Request submitted successfully."; }
        form.reset();
      }
    });
  });

  /* ---------- Password visibility toggle ---------- */
  document.querySelectorAll("[data-toggle-pwd]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var sel = btn.getAttribute("data-toggle-pwd");
      var input = document.querySelector(sel);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      btn.querySelector(".ic-eye-open")?.classList.toggle("d-none");
      btn.querySelector(".ic-eye-closed")?.classList.toggle("d-none");
    });
  });

  /* ---------- Page transition + 404 interceptor ---------- */
  function triggerTransition(target) {
    var ov = document.getElementById("pageTransition");
    if (ov) { ov.classList.add("active"); }
    setTimeout(function () { window.location.href = target; }, 360);
  }
  window.triggerTransition = triggerTransition;

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href) return;
    if (href === "#" || href === "" || href.startsWith("javascript:")) { e.preventDefault(); triggerTransition("404.html"); return; }
    if (href.startsWith("#") && href.length > 1) { return; }
    if (a.hasAttribute("data-keep-link")) { return; }
    if (a.target === "_blank") return;
    if (/^(https?:|mailto:|tel:)/.test(href)) return;
    e.preventDefault();
    triggerTransition(href);
  });

  /* ---------- Dashboard sidebar (mobile) ---------- */
  window.toggleSidebar = function () {
    var sb = document.getElementById("sidebar");
    if (sb) {
      sb.classList.toggle("open");
      if (sb.classList.contains("open")) {
        document.body.classList.add("sidebar-open");
      } else {
        document.body.classList.remove("sidebar-open");
      }
    }
  };
  window.switchView = function (id, src) {
    document.querySelectorAll(".dview").forEach(function (v) { v.classList.remove("active"); });
    var el = document.getElementById(id);
    if (el) el.classList.add("active");
    document.querySelectorAll(".side-link").forEach(function (l) { l.classList.remove("active"); });
    if (src) src.classList.add("active");
    var sb = document.getElementById("sidebar");
    if (sb && window.innerWidth < 992) {
      sb.classList.remove("open");
      document.body.classList.remove("sidebar-open");
    }
    var title = document.getElementById("dashTitle");
    if (title && src) title.textContent = src.getAttribute("data-title") || title.textContent;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- Lightweight canvas charts ---------- */
  function drawLine(canvas, data, color) {
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    if (!data || data.length < 2) return;
    var max = Math.max.apply(null, data), min = Math.min.apply(null, data);
    var pad = 14;
    var stepX = (w - pad * 2) / (data.length - 1);
    var scaleY = h - pad * 2;
    var range = max - min || 1;
    function pt(i) { return { x: pad + i * stepX, y: pad + (scaleY - ((data[i] - min) / range) * scaleY) }; }
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "55");
    grad.addColorStop(1, color + "00");
    ctx.beginPath();
    for (var i = 0; i < data.length; i++) { var p = pt(i); if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
    ctx.lineTo(pad + (data.length - 1) * stepX, h - pad); ctx.lineTo(pad, h - pad); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath();
    for (var j = 0; j < data.length; j++) { var q = pt(j); if (j === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); }
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke();
  }
  function drawBars(canvas, data, colors) {
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    if (!data || !data.length) return;
    var max = Math.max.apply(null, data);
    var pad = 14, gap = 8;
    var bw = (w - pad * 2 - gap * (data.length - 1)) / data.length;
    for (var i = 0; i < data.length; i++) {
      var bh = (data[i] / max) * (h - pad * 2);
      var x = pad + i * (bw + gap);
      var y = h - pad - bh;
      var g = ctx.createLinearGradient(0, y, 0, h - pad);
      g.addColorStop(0, colors[0]); g.addColorStop(1, colors[1]);
      ctx.fillStyle = g;
      roundRect(ctx, x, y, bw, bh, 6); ctx.fill();
    }
  }
  function drawDonut(canvas, segments) {
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var size = canvas.clientWidth;
    canvas.width = size * dpr; canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    var cx = size / 2, cy = size / 2, r = size / 2 - 8, ir = r * 0.62;
    var total = segments.reduce(function (s, x) { return s + x.value; }, 0);
    var start = -Math.PI / 2;
    segments.forEach(function (seg) {
      var ang = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + ang);
      ctx.arc(cx, cy, ir, start + ang, start, true);
      ctx.closePath();
      ctx.fillStyle = seg.color; ctx.fill();
      start += ang;
    });
  }
  function roundRect(ctx, x, y, w, h, r) {
    if (h < r * 2) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  window.MCCharts = { drawLine: drawLine, drawBars: drawBars, drawDonut: drawDonut };

  function renderCharts() {
    document.querySelectorAll("[data-chart-line]").forEach(function (c) {
      var data = c.getAttribute("data-chart-line").split(",").map(Number);
      var color = c.getAttribute("data-color") || "#2563eb";
      drawLine(c, data, color);
    });
    document.querySelectorAll("[data-chart-bars]").forEach(function (c) {
      var data = c.getAttribute("data-chart-bars").split(",").map(Number);
      var c1 = c.getAttribute("data-c1") || "#2563eb", c2 = c.getAttribute("data-c2") || "#1d4ed8";
      drawBars(c, data, [c1, c2]);
    });
    document.querySelectorAll("[data-chart-donut]").forEach(function (c) {
      try {
        var segs = JSON.parse(c.getAttribute("data-chart-donut"));
        drawDonut(c, segs);
      } catch (err) { }
    });
  }
  window.addEventListener("load", renderCharts);
  window.addEventListener("resize", function () { clearTimeout(window._mcrt); window._mcrt = setTimeout(renderCharts, 200); });

  /* ---------- Animated hero line chart (random walk) ---------- */
  window.animateHeroChart = function (canvas, points, color) {
    var i = 2;
    function frame() {
      drawLine(canvas, points.slice(0, i), color);
      i++;
      if (i <= points.length) requestAnimationFrame(frame);
    }
    frame();
  };

  /* ---------- FAQ accordion (Bootstrap handles, but ensure open state) ---------- */
  /* Bootstrap 5 accordion works out of the box; nothing extra needed. */

  /* ---------- Calculator logic ---------- */
  window.calcLumpsum = function () {
    var p = parseFloat(document.getElementById("lsP").value) || 0;
    var r = (parseFloat(document.getElementById("lsR").value) || 0) / 100;
    var n = parseInt(document.getElementById("lsN").value || "0", 10);
    var fv = p * Math.pow(1 + r, n);
    var out = document.getElementById("lsOut");
    if (out) out.textContent = fv.toLocaleString(undefined, { maximumFractionDigits: 0 });
    var cv = document.getElementById("lsChart");
    if (cv) {
      var arr = []; for (var i = 0; i <= n; i++) arr.push(p * Math.pow(1 + r, i));
      drawLine(cv, arr, "#2563eb");
    }
  };
  window.calcSIP = function () {
    var p = parseFloat(document.getElementById("sipP").value) || 0;
    var r = (parseFloat(document.getElementById("sipR").value) || 0) / 100 / 12;
    var n = parseInt(document.getElementById("sipN").value || "0", 10) * 12;
    var fv = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    var out = document.getElementById("sipOut");
    if (out) out.textContent = Math.round(fv).toLocaleString();
    var cv = document.getElementById("sipChart");
    if (cv) {
      var arr = []; var acc = 0;
      for (var i = 1; i <= n; i++) { acc = (acc + p) * (1 + r); if (i % 12 === 0) arr.push(acc); }
      drawLine(cv, arr, "#4aa8ff");
    }
  };

  /* ---------- Active nav link by filename ---------- */
  (function () {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === path) a.classList.add("active");
    });
  })();

  /* ---------- Public navbar slide-in menu backdrop and scroll lock ---------- */
  var navCollapse = document.getElementById("nav");
  if (navCollapse) {
    navCollapse.addEventListener("show.bs.collapse", function () {
      document.documentElement.classList.add("navbar-open");
      document.body.classList.add("navbar-open");
    });
    navCollapse.addEventListener("hide.bs.collapse", function () {
      document.documentElement.classList.remove("navbar-open");
      document.body.classList.remove("navbar-open");
    });
  }
})();

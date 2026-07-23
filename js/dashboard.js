/* Dashboard-specific helpers — view switching, charts, notifications */

(function () {
  "use strict";

  // Render charts inside the active dashboard view whenever it becomes active
  window.renderDashCharts = function (view) {
    if (!view) return;
    view.querySelectorAll("[data-chart-line]").forEach(function (c) {
      var data = c.getAttribute("data-chart-line").split(",").map(Number);
      window.MCCharts.drawLine(c, data, c.getAttribute("data-color") || "#2563eb");
    });
    view.querySelectorAll("[data-chart-bars]").forEach(function (c) {
      var data = c.getAttribute("data-chart-bars").split(",").map(Number);
      window.MCCharts.drawBars(c, data, [c.getAttribute("data-c1") || "#2563eb", c.getAttribute("data-c2") || "#1d4ed8"]);
    });
    view.querySelectorAll("[data-chart-donut]").forEach(function (c) {
      try { window.MCCharts.drawDonut(c, JSON.parse(c.getAttribute("data-chart-donut"))); } catch (e) {}
    });
  };

  // Patch switchView to render charts of the newly active view
  document.addEventListener("DOMContentLoaded", function () {
    var orig = window.switchView;
    window.switchView = function (id, src) {
      orig && orig(id, src);
      var v = document.getElementById(id);
      if (v) setTimeout(function () { window.renderDashCharts(v); }, 30);
    };
    // render charts of initially active view
    var active = document.querySelector(".dview.active");
    if (active) setTimeout(function () { window.renderDashCharts(active); }, 60);
  });

  // Notifications dropdown toggle (simple)
  window.toggleNotif = function (btn) {
    var pop = document.getElementById("notifPanel");
    if (!pop) return;
    pop.classList.toggle("d-none");
  };
  document.addEventListener("click", function (e) {
    var pop = document.getElementById("notifPanel");
    if (!pop || pop.classList.contains("d-none")) return;
    if (!pop.contains(e.target) && !e.target.closest("[data-notif-btn]")) pop.classList.add("d-none");
  });

  // Filterable tables (data-filter-input + data-filter-table)
  document.querySelectorAll("[data-filter-input]").forEach(function (input) {
    input.addEventListener("input", function () {
      var q = input.value.toLowerCase();
      var sel = input.getAttribute("data-filter-input");
      document.querySelectorAll(sel + " tbody tr").forEach(function (tr) {
        tr.style.display = tr.textContent.toLowerCase().indexOf(q) > -1 ? "" : "none";
      });
    });
  });

  // Generic toast
  window.mcToast = function (msg) {
    var t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;padding:12px 22px;border-radius:999px;background:linear-gradient(135deg,#dfb15b,#bc8f30);color:#04130c;font-weight:600;box-shadow:0 10px 30px rgba(223,177,91,.4);opacity:0;transition:opacity .3s ease, transform .3s ease;";
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = "1"; t.style.transform = "translate(-50%, -6px)"; });
    setTimeout(function () { t.style.opacity = "0"; setTimeout(function () { t.remove(); }, 300); }, 2200);
  };

  // Dynamic user display name update
  document.addEventListener("DOMContentLoaded", function () {
    var username = localStorage.getItem("username");
    if (!username) {
      username = "Guest User";
    }

    // Capitalize username correctly
    username = username.trim().split(/\s+/).map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(" ");

    // Generate initials (e.g. "Jane Doe" -> "JD", "Alex" -> "AL")
    var initials = "GU";
    var words = username.split(" ");
    if (words.length > 1) {
      initials = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words[0]) {
      initials = words[0].substring(0, 2).toUpperCase();
    }

    // 1. Update side-user avatar initials
    var sideUserAv = document.querySelector(".side-user .av");
    if (sideUserAv) {
      sideUserAv.textContent = initials;
    }

    // 2. Update side-user full name text
    var sideUserName = document.querySelector(".side-user .fw-semibold");
    if (sideUserName) {
      sideUserName.textContent = username;
    }

    // 3. Update top-bar avatar initials
    var topBarAv = document.querySelector("header.dash-top .av-circle");
    if (topBarAv) {
      topBarAv.textContent = initials;
    }

    // 4. Update any Settings form profile input boxes
    var nameInputs = document.querySelectorAll('input[value="Eleanor Hayes"], input[value="Sofia Romano"], input[value="Alex Doe"]');
    nameInputs.forEach(function(input) {
      input.value = username;
    });

    // 5. Update welcome headers on overview pages (if any exist)
    document.querySelectorAll("h1, h2, h3, h4, h5").forEach(function(el) {
      if (el.textContent.includes("Eleanor Hayes")) {
        el.textContent = el.textContent.replace("Eleanor Hayes", username);
      } else if (el.textContent.includes("Sofia Romano") && !el.closest(".col-lg-5")) {
        el.textContent = el.textContent.replace("Sofia Romano", username);
      } else if (el.textContent.includes("Alex Doe")) {
        el.textContent = el.textContent.replace("Alex Doe", username);
      }
    });
  });
})();

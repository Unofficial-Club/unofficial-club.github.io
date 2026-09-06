/* The Unofficial Club — shared front-end logic
   No build step, no framework: this runs as plain JS on GitHub Pages.
   This week's/next week's meeting info lives in assets/data/meetings.json,
   past talks in assets/data/records.json, and shared resources in
   assets/data/resources.json — edit those files, nothing else needs to
   change. */

(function () {
  "use strict";

  // ---- mobile nav ----
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // ---- domain colour logic ----
  // Blue = pure science, red = applied/engineering, purple = a talk tagged
  // with both — i.e. the interdisciplinary talks the club exists for.
  var SCIENCE_TAGS = ["physics", "math", "mathematics", "chemistry", "biology", "astronomy", "earth science"];
  var APPLIED_TAGS = ["engineering", "cs", "computer science", "ml", "ai", "robotics", "software"];

  function domainFor(tags) {
    var lower = (tags || []).map(function (t) { return t.toLowerCase(); });
    var hasScience = lower.some(function (t) { return SCIENCE_TAGS.indexOf(t) !== -1; });
    var hasApplied = lower.some(function (t) { return APPLIED_TAGS.indexOf(t) !== -1; });
    if (hasScience && hasApplied) return "cross";
    if (hasScience) return "science";
    if (hasApplied) return "applied";
    return "other";
  }

  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  // ---- fetch helper ----
  function loadData(path) {
    return fetch(path)
      .then(function (res) {
        if (!res.ok) throw new Error("Could not load " + path);
        return res.json();
      })
      .catch(function (err) {
        console.error(err);
        return [];
      });
  }

  // ---- card builders ----
  var PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7l9 5-9 5V7z" fill="#1a1b23"/></svg>';

  // "This week" / "Next week" meeting-info cards — shared by the homepage
  // and the Schedule page so both always show the same thing.
  function meetingCard(m) {
    return (
      '<div class="week-card" data-hue="' + escapeHtml(m.hue || "blue") + '">' +
        '<span class="week-label">' + escapeHtml(m.label || "") + '</span>' +
        '<div class="week-info">' +
          '<span class="week-when">' + escapeHtml(m.when || "") + '</span>' +
          '<span class="week-where">' + escapeHtml(m.location || "") + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function recordCard(rec) {
    var tags = rec.tags || [];
    return (
      '<article class="card">' +
        '<div class="media" data-domain="' + domainFor(tags) + '">' +
          '<span class="label">Recording</span>' +
          (rec.video_url ? '<a class="play" aria-hidden="true" href="' + escapeHtml(rec.video_url) + '" target="_blank" rel="noopener" aria-label="Watch ' + escapeHtml(rec.title) + '">' + PLAY_ICON + '</a>' : '<span class="play" aria-hidden="true">' + PLAY_ICON + '</span>') +
          (rec.duration ? '<span class="duration">' + escapeHtml(rec.duration) + '</span>' : '') +
        '</div>' +
        '<div class="body">' +
          '<p class="meta">' + escapeHtml(formatDate(rec.date)) + '</p>' +
          '<h3>' + escapeHtml(rec.title) + '</h3>' +
          '<p class="presenter">' + escapeHtml(rec.presenter) + '</p>' +
          '<div class="tags">' + tags.map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join("") + '</div>' +
          '<p class="abstract">' + escapeHtml(rec.abstract || "") + '</p>' +
          (rec.video_url ? '<a class="watch" href="' + escapeHtml(rec.video_url) + '" target="_blank" rel="noopener">Watch the recording</a>' : '') +
        '</div>' +
      '</article>'
    );
  }

  // icon per resource kind — falls back to a generic document icon
  var RESOURCE_ICONS = {
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6L3 12l5 6M16 6l5 6-5 6"/></svg>',
    notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h4"/></svg>',
    slides: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8"/></svg>',
    template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    other: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/></svg>'
  };

  function resourceCard(res) {
    var tags = res.tags || [];
    var iconKey = (res.kind || "other").toLowerCase();
    var icon = RESOURCE_ICONS[iconKey] || RESOURCE_ICONS.other;
    return (
      '<article class="resource-card" data-color="' + domainFor(tags) + '">' +
        '<div class="top-row">' +
          '<span class="icon-dot" aria-hidden="true">' + icon + '</span>' +
          '<h3>' + escapeHtml(res.title) + '</h3>' +
        '</div>' +
        (res.kind ? '<span class="kind">' + escapeHtml(res.kind) + '</span>' : '') +
        '<p class="description">' + escapeHtml(res.description || "") + '</p>' +
        (res.contributor ? '<p class="byline">By ' + escapeHtml(res.contributor) + '</p>' : '') +
        (res.url ? '<a class="visit" href="' + escapeHtml(res.url) + '" target="_blank" rel="noopener">View resource</a>' : '') +
      '</article>'
    );
  }

  // ---- tag filter wiring ----
  function collectTags(items) {
    var set = [];
    items.forEach(function (item) {
      (item.tags || []).forEach(function (t) {
        if (set.indexOf(t) === -1) set.push(t);
      });
    });
    set.sort(function (a, b) { return a.localeCompare(b); });
    return set;
  }

  function wireFilters(filterEl, items, render) {
    if (!filterEl) return;
    var tags = collectTags(items);
    var current = "All";

    function draw() {
      filterEl.innerHTML = "";
      ["All"].concat(tags).forEach(function (tag) {
        var btn = document.createElement("button");
        btn.className = "filter-btn";
        btn.type = "button";
        btn.textContent = tag;
        btn.setAttribute("aria-pressed", String(tag === current));
        btn.addEventListener("click", function () {
          current = tag;
          draw();
          var filtered = current === "All" ? items : items.filter(function (i) {
            return (i.tags || []).indexOf(current) !== -1;
          });
          render(filtered);
        });
        filterEl.appendChild(btn);
      });
    }
    draw();
  }

  // ---- page wiring ----
  document.addEventListener("DOMContentLoaded", function () {
    // "This week" / "Next week" cards — used on the homepage and the
    // Schedule page. One shared data file so both stay consistent.
    var weekCardEls = document.querySelectorAll("[data-week-cards]");
    if (weekCardEls.length) {
      loadData("assets/data/meetings.json").then(function (meetings) {
        var html = meetings.length
          ? meetings.map(meetingCard).join("")
          : '<p class="empty-state">Nothing scheduled yet &mdash; check back soon.</p>';
        weekCardEls.forEach(function (el) { el.innerHTML = html; });
      });
    }

    // Records page: full archive + filters
    var recordsGrid = document.querySelector("[data-records-grid]");
    if (recordsGrid) {
      loadData("assets/data/records.json").then(function (recs) {
        function render(list) {
          recordsGrid.innerHTML = list.length
            ? list.map(recordCard).join("")
            : '<p class="empty-state">No recordings match that tag yet.</p>';
        }
        if (recs.length === 0) {
          recordsGrid.innerHTML = '<p class="empty-state">The archive is empty so far — the first recorded talk will show up here.</p>';
        } else {
          render(recs);
          wireFilters(document.querySelector("[data-records-filters]"), recs, render);
        }
      });
    }

    // Home page: teaser of a couple of student-made resources
    var resourcesPreview = document.querySelector("[data-resources-preview]");
    if (resourcesPreview) {
      loadData("assets/data/resources.json").then(function (items) {
        var featured = items.slice(0, 3);
        resourcesPreview.innerHTML = featured.length
          ? featured.map(resourceCard).join("")
          : '<p class="empty-state">Nothing shared yet. <a href="resources.html">Be the first to add something.</a></p>';
      });
    }

    // Resources page: full list + filters
    var resourcesGrid = document.querySelector("[data-resources-grid]");
    if (resourcesGrid) {
      loadData("assets/data/resources.json").then(function (items) {
        function render(list) {
          resourcesGrid.innerHTML = list.length
            ? list.map(resourceCard).join("")
            : '<p class="empty-state">No resources match that tag yet.</p>';
        }
        if (items.length === 0) {
          resourcesGrid.innerHTML = '<p class="empty-state">Nothing shared yet. <a href="mailto:unofficialclub00@gmail.com">Send us something</a> you made and it\'ll show up here.</p>';
        } else {
          render(items);
          wireFilters(document.querySelector("[data-resources-filters]"), items, render);
        }
      });
    }
  });
})();

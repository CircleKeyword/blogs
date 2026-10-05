/* 本地静态博客 · site.js —— 主题切换 + 首页搜索/标签筛选（原生 JS，无依赖） */
(function () {
  "use strict";

  /* ---------------- 主题：auto -> light -> dark ---------------- */
  var KEY = "blog-theme";
  var MODES = ["auto", "light", "dark"];
  var LABEL = { auto: "跟随系统", light: "浅色", dark: "深色" };
  var btn = document.getElementById("theme-btn");

  function current() {
    try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; }
  }
  function apply(mode) {
    if (mode === "auto") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.dataset.theme = mode;
    }
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    if (btn) {
      btn.textContent = mode === "light" ? "☀" : mode === "dark" ? "☾" : "◐";
      btn.title = "主题：" + LABEL[mode] + "（点击切换）";
      btn.setAttribute("aria-label", btn.title);
    }
  }
  if (btn) {
    btn.addEventListener("click", function () {
      var next = MODES[(MODES.indexOf(current()) + 1) % MODES.length];
      apply(next);
    });
  }
  apply(current());

  /* ---------------- 首页筛选 ---------------- */
  var list = document.getElementById("entries");
  if (!list) return;

  var entries = Array.prototype.slice.call(list.querySelectorAll(".entry"));
  var input = document.getElementById("search");
  var tagbar = document.getElementById("tagbar");
  var empty = document.createElement("p");
  empty.className = "muted";
  empty.style.padding = "2.5rem 0";
  empty.textContent = "没有匹配的文章～换个词试试？";
  empty.hidden = true;
  list.parentNode.insertBefore(empty, list.nextSibling);

  var activeTag = "";
  var cache = entries.map(function (el) {
    return {
      el: el,
      hay: (el.dataset.search || "").toLowerCase(),
      tags: (el.dataset.tags || "").split(",").filter(Boolean)
    };
  });

  /* 标签筛选按钮：从当前页文章的标签里生成 */
  if (tagbar) {
    var seen = [];
    cache.forEach(function (item) {
      item.tags.forEach(function (t) { if (seen.indexOf(t) < 0) seen.push(t); });
    });
    seen.sort();
    if (seen.length) {
      var all = document.createElement("button");
      all.type = "button";
      all.textContent = "全部";
      all.setAttribute("aria-pressed", "true");
      all.addEventListener("click", function () { setTag(""); });
      tagbar.appendChild(all);
      seen.forEach(function (t) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = t;
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () { setTag(activeTag === t ? "" : t); });
        tagbar.appendChild(b);
      });
    }
  }

  function setTag(tag) {
    activeTag = tag;
    if (tagbar) {
      Array.prototype.forEach.call(tagbar.querySelectorAll("button"), function (b) {
        var isAll = b.textContent === "全部";
        var on = tag ? b.textContent === tag : isAll;
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    render();
  }

  function render() {
    var q = (input && input.value || "").trim().toLowerCase();
    var terms = q ? q.split(/\s+/) : [];
    var shown = 0;
    cache.forEach(function (item) {
      var okTag = !activeTag || item.tags.indexOf(activeTag) >= 0;
      var okText = terms.every(function (t) { return item.hay.indexOf(t) >= 0; });
      var ok = okTag && okText;
      item.el.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown !== 0;
  }

  if (input) {
    var timer = null;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(render, 90);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; setTag(""); input.blur(); }
    });
  }
  render();
})();

(function () {
  "use strict";

  var STORAGE_KEY = "salaah-tasks-v1";

  var form = document.getElementById("addForm");
  var input = document.getElementById("taskInput");
  var errorEl = document.getElementById("error");
  var listEl = document.getElementById("list");
  var emptyEl = document.getElementById("empty");
  var countEl = document.getElementById("count");
  var clearBtn = document.getElementById("clearDone");
  var filterBtns = document.querySelectorAll(".filter");

  var tasks = load();
  var filter = "all";

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      showError("Could not save. Your browser may be blocking storage.");
    }
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  }

  function addTask(text) {
    tasks.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: text,
      done: false
    });
    save();
    render();
  }

  function toggleTask(id) {
    tasks.forEach(function (t) { if (t.id === id) t.done = !t.done; });
    save();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    save();
    render();
  }

  function visibleTasks() {
    if (filter === "pending") return tasks.filter(function (t) { return !t.done; });
    if (filter === "completed") return tasks.filter(function (t) { return t.done; });
    return tasks;
  }

  function emptyMessage() {
    if (tasks.length === 0) return "No tasks yet. Add your first task above.";
    if (filter === "pending") return "Nothing pending. You're all caught up.";
    if (filter === "completed") return "No completed tasks yet.";
    return "";
  }

  function render() {
    listEl.innerHTML = "";

    visibleTasks().forEach(function (t) {
      var li = document.createElement("li");
      li.className = "item" + (t.done ? " done" : "");

      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = t.done;
      box.id = "chk-" + t.id;
      box.setAttribute("aria-label", "Mark \"" + t.text + "\" as " + (t.done ? "pending" : "completed"));
      box.addEventListener("change", function () { toggleTask(t.id); });

      var label = document.createElement("label");
      label.className = "text";
      label.htmlFor = box.id;
      label.textContent = t.text;

      var del = document.createElement("button");
      del.type = "button";
      del.className = "del";
      del.textContent = "Delete";
      del.setAttribute("aria-label", "Delete \"" + t.text + "\"");
      del.addEventListener("click", function () { deleteTask(t.id); });

      li.appendChild(box);
      li.appendChild(label);
      li.appendChild(del);
      listEl.appendChild(li);
    });

    var msg = visibleTasks().length === 0 ? emptyMessage() : "";
    emptyEl.textContent = msg;
    emptyEl.hidden = !msg;

    var pending = tasks.filter(function (t) { return !t.done; }).length;
    countEl.textContent = pending + " pending";

    clearBtn.hidden = !tasks.some(function (t) { return t.done; });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) {
      showError("Enter a task before adding.");
      input.focus();
      return;
    }
    showError("");
    addTask(text);
    input.value = "";
    input.focus();
  });

  input.addEventListener("input", function () { showError(""); });

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filter = btn.dataset.filter;
      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      render();
    });
  });

  clearBtn.addEventListener("click", function () {
    tasks = tasks.filter(function (t) { return !t.done; });
    save();
    render();
  });

  render();
})();
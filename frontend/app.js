// frontend/app.js
// Uses the API exactly:
// GET  /api/books?q=&tag=
// GET  /api/users
// POST /api/loans
// GET  /api/stats/top-books

const API_BASE = "http://localhost:3000";
function setDebugJson(obj) {
  $("#debug-json").text(JSON.stringify(obj, null, 2));
}

function showMsg($el, type, text) {
  $el.removeClass("ok err");
  if (!text) {
    $el.text("");
    return;
  }
  $el.addClass(type).text(text);
}

function clearLoanMsg() {
  showMsg($("#loan-msg"), "", "");
}

function apiErrorMessage(xhr) {
  // backend returns: { error: { code, message } }
  try {
    const body = xhr.responseJSON || JSON.parse(xhr.responseText);
    if (body && body.error && body.error.code && body.error.message) {
      return `${body.error.code}: ${body.error.message}`;
    }
  } catch (_) {}
  return `HTTP ${xhr.status}: Request failed.`;
}

// ---------------- UTIL ----------------
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------------- BOOKS ----------------
function renderBooksTable(books) {
  const $tbody = $("#books-table tbody");
  $tbody.empty();

  for (const b of books) {
    const tags = Array.isArray(b.tags) ? b.tags.join(", ") : "";
    const row = `
      <tr>
        <td>${escapeHtml(b.title)}</td>
        <td>${escapeHtml(b.author)}</td>
        <td>${escapeHtml(tags)}</td>
        <td>${Number(b.availableCopies)}</td>
        <td><code>${escapeHtml(b._id)}</code></td>
      </tr>
    `;
    $tbody.append(row);
  }
}

function populateBooksDropdown(books) {
  const $sel = $("#loan-book");
  const prev = $sel.val(); // try to keep previous selection 
  $sel.empty();

  for (const b of books) {
    const copies = Number(b.availableCopies);
    const disabled = copies <= 0 ? "disabled" : "";
    const label = `${b.title} — ${b.author} (copies: ${copies})`;
    $sel.append(
      `<option value="${escapeHtml(b._id)}" ${disabled}>${escapeHtml(label)}</option>`
    );
  }

  // Restore selection if possible and still enabled
  if (prev && $sel.find(`option[value="${CSS.escape(prev)}"]`).length) {
    $sel.val(prev);
  }

  // If selected became disabled, choose first available
  const $selected = $sel.find("option:selected");
  if (!$selected.length || $selected.is(":disabled")) {
    const $firstAvailable = $sel.find("option:not(:disabled)").first();
    if ($firstAvailable.length) $sel.val($firstAvailable.val());
  }
}

function loadBooksToTable() {
  const q = $("#books-q").val().trim();
  const tag = $("#books-tag").val().trim();

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);

  const url = `${API_BASE}/api/books${params.toString() ? "?" + params.toString() : ""}`;

  showMsg($("#books-msg"), "", "");

  return $.ajax({
    url,
    method: "GET",
    dataType: "json"
  })
    .done((resp) => {
      setDebugJson(resp);

      const books = resp.data || [];
      renderBooksTable(books);
      populateBooksDropdown(books);

      showMsg($("#books-msg"), "ok", `Loaded ${Array.isArray(books) ? books.length : 0} books.`);
      clearLoanMsg();
    })
    .fail((xhr) => {
      const msg = apiErrorMessage(xhr);
      setDebugJson(xhr.responseJSON || { error: msg });
      showMsg($("#books-msg"), "err", msg);
    });
}

// ---------------- USERS ----------------
function populateUsersDropdown(users) {
  const $sel = $("#loan-user");
  const prev = $sel.val();
  $sel.empty();

  for (const u of users) {
    $sel.append(
      `<option value="${escapeHtml(u._id)}">${escapeHtml(u.name)} (${escapeHtml(u.email)})</option>`
    );
  }

  if (prev && $sel.find(`option[value="${CSS.escape(prev)}"]`).length) {
    $sel.val(prev);
  }
}

function loadUsersToDropdown() {
  return $.ajax({
    url: `${API_BASE}/api/users`,
    method: "GET",
    dataType: "json"
  })
    .done((resp) => {
      setDebugJson(resp);
      populateUsersDropdown(resp.data || []);
    })
    .fail((xhr) => {
      const msg = apiErrorMessage(xhr);
      setDebugJson(xhr.responseJSON || { error: msg });
      showMsg($("#loan-msg"), "err", msg);
    });
}

// ---------------- LOANS ----------------
function submitLoan() {
  const userId = $("#loan-user").val();
  const bookId = $("#loan-book").val();

  if (!userId || !bookId) {
    showMsg($("#loan-msg"), "err", "Select a user and a book.");
    return;
  }

  clearLoanMsg();

  const $btn = $("#loan-submit-btn");
  $btn.prop("disabled", true);

  $.ajax({
    url: `${API_BASE}/api/loans`,
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ userId, bookId })
  })
    .done((resp) => {
      setDebugJson(resp);
      showMsg(
        $("#loan-msg"),
        "ok",
        `Loan created: ${resp.data && resp.data._id ? resp.data._id : "(id unknown)"}`
      );

      // Refresh table + dropdown + stats to show updated copies and counts
      loadBooksToTable();
      loadStats();
    })
    .fail((xhr) => {
      const msg = apiErrorMessage(xhr);
      setDebugJson(xhr.responseJSON || { error: msg });
      showMsg($("#loan-msg"), "err", msg);

      // Refresh books so dropdown/table reflects the latest availableCopies
      loadBooksToTable();
    })
    .always(() => {
      $btn.prop("disabled", false);
    });
}

// ---------------- STATS ----------------
function renderStatsTable(items) {
  const $tbody = $("#stats-table tbody");
  $tbody.empty();

  for (const it of items) {
    const title = it.book ? it.book.title : "";
    const author = it.book ? it.book.author : "";
    const row = `
      <tr>
        <td>${escapeHtml(title)}</td>
        <td>${escapeHtml(author)}</td>
        <td>${Number(it.loanCount)}</td>
        <td><code>${escapeHtml(it.bookId)}</code></td>
      </tr>
    `;
    $tbody.append(row);
  }
}

function loadStats() {
  showMsg($("#stats-msg"), "", "");

  return $.ajax({
    url: `${API_BASE}/api/stats/top-books`,
    method: "GET",
    dataType: "json"
  })
    .done((resp) => {
      setDebugJson(resp);
      renderStatsTable(resp.data || []);
      showMsg($("#stats-msg"), "ok", "Statistics loaded.");
    })
    .fail((xhr) => {
      const msg = apiErrorMessage(xhr);
      setDebugJson(xhr.responseJSON || { error: msg });
      showMsg($("#stats-msg"), "err", msg);
    });
}

// ---------------- INIT ----------------
$(function () {
  // Buttons
  $("#books-search-btn").on("click", () => loadBooksToTable());
  $("#books-reset-btn").on("click", () => {
    $("#books-q").val("");
    $("#books-tag").val("");
    loadBooksToTable();
  });

  $("#loan-submit-btn").on("click", submitLoan);
  $("#stats-refresh-btn").on("click", loadStats);

  // Clear sticky loan error when user changes selection
  $("#loan-user, #loan-book").on("change", clearLoanMsg);

  // Initial loads
  loadUsersToDropdown();
  loadBooksToTable();
  loadStats();
});
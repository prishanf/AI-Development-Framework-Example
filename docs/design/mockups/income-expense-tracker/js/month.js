(function () {
  const { Store, money, parseMonthParam, monthLabel, shiftMonth, currentMonthKey } = window.IET;

  const params = new URLSearchParams(location.search);
  const fromQuery = params.get("ym");
  const initial = parseMonthParam(fromQuery) || parseMonthParam(currentMonthKey());
  let view = initial;

  let gridRows = [];
  let gridErrors = [];

  function blankRow() {
    return {
      month: view.key,
      type: "expense",
      categoryId: "",
      itemId: "",
      amount: "",
      note: "",
    };
  }

  function ensureGrid() {
    if (gridRows.length === 0) {
      gridRows = [blankRow(), blankRow(), blankRow()];
    }
  }

  function setNav() {
    const prev = shiftMonth(view.year, view.month, -1);
    const next = shiftMonth(view.year, view.month, 1);
    document.getElementById("month-title").textContent = monthLabel(view.year, view.month);
    document.getElementById("nav-prev").href = `./month.html?ym=${prev.key}`;
    document.getElementById("nav-next").href = `./month.html?ym=${next.key}`;
    document.getElementById("nav-year").href = `./year.html?year=${view.year}`;
    document.getElementById("nav-this-month").href = `./month.html?ym=${currentMonthKey()}`;
    document.getElementById("nav-this-year").href = `./year.html?year=${new Date().getFullYear()}`;
  }

  function renderTotals() {
    const t = Store.monthTotals(view.key);
    document.getElementById("total-income").textContent = money(t.income);
    document.getElementById("total-expense").textContent = money(t.expense);
    document.getElementById("total-net").textContent = money(t.net);
    document.getElementById("total-net").className =
      t.net >= 0 ? "money-income font-semibold" : "money-expense font-semibold";
  }

  function categoryOptions(type, selectedId) {
    return Store.categories(type, { includeArchived: false })
      .map(
        (c) =>
          `<option value="${c.id}" ${c.id === selectedId ? "selected" : ""}>${escapeHtml(c.name)}</option>`
      )
      .join("");
  }

  function itemOptions(categoryId, selectedId) {
    if (!categoryId) return `<option value="">Select category first</option>`;
    return [
      `<option value="">Select item</option>`,
      ...Store.itemsForCategory(categoryId, { includeArchived: false }).map(
        (i) =>
          `<option value="${i.id}" ${i.id === selectedId ? "selected" : ""}>${escapeHtml(i.name)}</option>`
      ),
    ].join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function iconTrash() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M4 7h16"/>
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      <path d="M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7"/>
      <path d="M10 11v6M14 11v6"/>
    </svg>`;
  }

  function renderGrid() {
    ensureGrid();
    const body = document.getElementById("grid-body");
    body.innerHTML = gridRows
      .map((row, index) => {
        const itemDisabled = !row.categoryId ? "disabled" : "";
        return `<tr data-index="${index}">
          <td><input type="month" data-field="month" value="${row.month}" aria-label="Month"></td>
          <td>
            <select data-field="type" aria-label="Type">
              <option value="expense" ${row.type === "expense" ? "selected" : ""}>Expense</option>
              <option value="income" ${row.type === "income" ? "selected" : ""}>Income</option>
            </select>
          </td>
          <td>
            <select data-field="categoryId" aria-label="Category">
              <option value="">Select category</option>
              ${categoryOptions(row.type, row.categoryId)}
            </select>
          </td>
          <td>
            <select data-field="itemId" aria-label="Item" ${itemDisabled}>
              ${itemOptions(row.categoryId, row.itemId)}
            </select>
          </td>
          <td><input type="number" min="0.01" step="0.01" data-field="amount" class="amount" value="${row.amount}" placeholder="0.00" aria-label="Amount"></td>
          <td><input type="text" data-field="note" value="${escapeHtml(row.note)}" placeholder="Note" aria-label="Note"></td>
          <td class="col-actions">
            <button type="button" class="icon-btn is-danger" data-action="remove-row" title="Remove row" aria-label="Remove row">
              ${iconTrash()}
            </button>
          </td>
        </tr>`;
      })
      .join("");

    const err = document.getElementById("grid-errors");
    if (gridErrors.length) {
      err.innerHTML = gridErrors.map((e) => `<div>${escapeHtml(e)}</div>`).join("");
      err.hidden = false;
    } else {
      err.innerHTML = "";
      err.hidden = true;
    }
  }

  function renderTransactions() {
    const list = Store.transactionsForMonth(view.key);
    const el = document.getElementById("txn-body");
    const empty = document.getElementById("txn-empty");
    if (!list.length) {
      el.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    el.innerHTML = list
      .map((t) => {
        const item = Store.itemById(t.itemId);
        const cat = item ? Store.categoryById(item.categoryId) : null;
        return `<tr>
          <td>${t.month}</td>
          <td>${escapeHtml(cat ? cat.name : "—")}</td>
          <td>${escapeHtml(item ? item.name : "—")}</td>
          <td>${t.type}</td>
          <td class="tabular-nums ${t.type === "income" ? "money-income" : "money-expense"}">${money(t.amountCents)}</td>
          <td>${escapeHtml(t.note || "")}</td>
          <td class="col-actions">
            <button type="button" class="icon-btn is-danger" data-action="delete-txn" data-id="${t.id}" title="Delete transaction" aria-label="Delete transaction">
              ${iconTrash()}
            </button>
          </td>
        </tr>`;
      })
      .join("");
  }

  function archiveIconButton({ archived, action, id, label }) {
    const title = archived ? `Unarchive ${label}` : `Archive ${label}`;
    const icon = archived
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"/>
          <path d="M3 5h18v3H3V5Z"/>
          <path d="M10 13h4"/>
        </svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"/>
          <path d="M3 5h18v3H3V5Z"/>
          <path d="M9 12.5 12 15.5 15 12.5"/>
          <path d="M12 10v5.5"/>
        </svg>`;
    return `<button
      type="button"
      class="icon-btn ${archived ? "is-archived" : ""}"
      data-action="${action}"
      data-id="${id}"
      title="${title}"
      aria-label="${title}"
    >${icon}</button>`;
  }

  function renderManage() {
    const root = document.getElementById("manage-root");
    root.innerHTML = ["income", "expense"]
      .map((type) => {
        const cats = Store.categories(type, { includeArchived: true });
        const blocks = cats
          .map((cat) => {
            const items = Store.itemsForCategory(cat.id, { includeArchived: true });
            const itemRows = items
              .map(
                (item) => `<div class="item-row ${item.archived ? "archived" : ""}">
                  <span class="item-name">${escapeHtml(item.name)}</span>
                  ${archiveIconButton({
                    archived: item.archived,
                    action: "toggle-item",
                    id: item.id,
                    label: item.name,
                  })}
                </div>`
              )
              .join("");

            return `<div class="cat-block ${cat.archived ? "archived" : ""}" data-category="${cat.id}">
              <div class="cat-head">
                <strong>${escapeHtml(cat.name)}</strong>
                ${archiveIconButton({
                  archived: cat.archived,
                  action: "toggle-category",
                  id: cat.id,
                  label: cat.name,
                })}
              </div>
              <div class="item-list">
                ${itemRows || `<p class="empty-note">No items yet.</p>`}
              </div>
              <div class="add-row">
                <input type="text" data-item-input="${cat.id}" placeholder="New item under ${escapeHtml(cat.name)}" ${cat.archived ? "disabled" : ""}>
                <button type="button" class="btn" data-action="add-item" data-category-id="${cat.id}" ${cat.archived ? "disabled" : ""}>
                  Add item
                </button>
              </div>
            </div>`;
          })
          .join("");

        return `<section class="manage-type manage-type-${type}">
          <div class="manage-type-head">
            <span class="type-pill type-pill-${type}" aria-hidden="true">${type}</span>
            <h3>${type === "income" ? "Income" : "Expense"}</h3>
          </div>
          ${blocks || `<p class="empty-note">No categories yet.</p>`}
          <div class="add-row">
            <input type="text" data-category-input="${type}" placeholder="New ${type} category">
            <button type="button" class="btn" data-action="add-category" data-type="${type}">Add category</button>
          </div>
        </section>`;
      })
      .join("");
  }

  function renderAll() {
    setNav();
    renderTotals();
    renderGrid();
    renderTransactions();
    renderManage();
  }

  function readGridFromDom() {
    const rows = [...document.querySelectorAll("#grid-body tr")];
    gridRows = rows.map((tr) => {
      const get = (field) => tr.querySelector(`[data-field="${field}"]`).value;
      return {
        month: get("month"),
        type: get("type"),
        categoryId: get("categoryId"),
        itemId: get("itemId"),
        amount: get("amount"),
        note: get("note"),
      };
    });
  }

  document.getElementById("grid-body").addEventListener("change", (e) => {
    const field = e.target.getAttribute("data-field");
    if (!field) return;
    const tr = e.target.closest("tr");
    const index = Number(tr.dataset.index);
    readGridFromDom();
    const row = gridRows[index];
    if (field === "type") {
      row.categoryId = "";
      row.itemId = "";
    }
    if (field === "categoryId") {
      row.itemId = "";
    }
    renderGrid();
  });

  document.getElementById("grid-body").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='remove-row']");
    if (!btn) return;
    const tr = btn.closest("tr");
    const index = Number(tr.dataset.index);
    readGridFromDom();
    gridRows.splice(index, 1);
    if (!gridRows.length) gridRows = [blankRow()];
    renderGrid();
  });

  document.getElementById("add-row").addEventListener("click", () => {
    readGridFromDom();
    gridRows.push(blankRow());
    renderGrid();
  });

  document.getElementById("save-rows").addEventListener("click", () => {
    readGridFromDom();
    const result = Store.bulkSave(gridRows);
    gridErrors = result.errors;
    if (result.kept.length) {
      gridRows = result.kept;
    } else {
      gridRows = [blankRow(), blankRow(), blankRow()];
    }
    // Keep at least one blank row after a clean save.
    if (!gridErrors.length && gridRows.every((r) => !r.itemId && !r.amount)) {
      gridRows = [blankRow(), blankRow(), blankRow()];
    }
    renderAll();
    if (result.saved.length) {
      const panel = document.getElementById("grid-panel");
      panel.classList.remove("flash-ok");
      void panel.offsetWidth;
      panel.classList.add("flash-ok");
    }
  });

  document.getElementById("txn-body").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='delete-txn']");
    if (!btn) return;
    Store.deleteTransaction(btn.dataset.id);
    renderAll();
  });

  document.getElementById("manage-root").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const notice = document.getElementById("manage-notice");
    notice.textContent = "";

    if (action === "add-category") {
      const type = btn.dataset.type;
      const input = document.querySelector(`[data-category-input="${type}"]`);
      const result = Store.addCategory(type, input.value);
      if (!result.ok) {
        notice.textContent = result.error;
        return;
      }
      input.value = "";
      renderAll();
      return;
    }

    if (action === "add-item") {
      const categoryId = btn.dataset.categoryId;
      const input = document.querySelector(`[data-item-input="${categoryId}"]`);
      const result = Store.addItem(categoryId, input.value);
      if (!result.ok) {
        notice.textContent = result.error;
        return;
      }
      input.value = "";
      renderAll();
      return;
    }

    if (action === "toggle-category") {
      Store.toggleCategoryArchive(btn.dataset.id);
      renderAll();
      return;
    }

    if (action === "toggle-item") {
      Store.toggleItemArchive(btn.dataset.id);
      renderAll();
    }
  });

  document.getElementById("reset-fixture").addEventListener("click", async () => {
    await Store.reset();
    gridRows = [];
    gridErrors = [];
    renderAll();
  });

  Store.init()
    .then(renderAll)
    .catch((err) => {
      document.body.innerHTML = `<p class="p-8 toast-error">Preview failed to load seed data. Serve the <code>preview/</code> folder over HTTP (Live Server), do not open the HTML file directly.<br>${escapeHtml(err.message)}</p>`;
    });
})();

(function () {
  const { Store, money } = window.IET;

  const params = new URLSearchParams(location.search);
  let year = Number(params.get("year")) || new Date().getFullYear();

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function setNav() {
    document.getElementById("year-title").textContent = `${year} — Yearly summary`;
    document.getElementById("nav-prev-year").href = `./year.html?year=${year - 1}`;
    document.getElementById("nav-next-year").href = `./year.html?year=${year + 1}`;
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    document.getElementById("nav-this-month").href = `./month.html?ym=${ym}`;
    document.getElementById("nav-this-year").href = `./year.html?year=${now.getFullYear()}`;
  }

  function moneyCell(cents, type) {
    if (!cents) return `<td class="text-right tabular-nums">${money(0)}</td>`;
    const cls = type === "income" ? "money-income" : type === "expense" ? "money-expense" : "";
    return `<td class="text-right tabular-nums ${cls}">${money(cents)}</td>`;
  }

  function renderSummary(pivot) {
    const body = document.getElementById("summary-body");
    body.innerHTML = pivot.summary
      .map(
        (row) => `<tr>
          <td><a class="underline underline-offset-2" href="./month.html?ym=${row.key}">${escapeHtml(row.label)}</a></td>
          ${moneyCell(row.income, "income")}
          ${moneyCell(row.expense, "expense")}
          ${moneyCell(row.net, row.net >= 0 ? "income" : "expense")}
        </tr>`
      )
      .join("");

    document.getElementById("summary-foot").innerHTML = `<tr>
      <td>Total</td>
      ${moneyCell(pivot.yearIncome, "income")}
      ${moneyCell(pivot.yearExpense, "expense")}
      ${moneyCell(pivot.yearNet, pivot.yearNet >= 0 ? "income" : "expense")}
    </tr>`;

    document.getElementById("year-income").textContent = money(pivot.yearIncome);
    document.getElementById("year-expense").textContent = money(pivot.yearExpense);
    document.getElementById("year-net").textContent = money(pivot.yearNet);
    document.getElementById("year-net").className =
      pivot.yearNet >= 0 ? "money-income font-semibold" : "money-expense font-semibold";
  }

  function renderDetail(block, type) {
    const el = document.getElementById(`${type}-detail`);
    const monthHeads = Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleString(undefined, { month: "short" })
    )
      .map((m) => `<th class="text-right">${m}</th>`)
      .join("");

    const rows = [];
    for (const group of block.groups) {
      rows.push(`<tr>
        <td colspan="14"><strong>${escapeHtml(group.category.name)}</strong></td>
      </tr>`);
      for (const itemRow of group.items) {
        rows.push(`<tr class="${itemRow.item.archived ? "archived" : ""}">
          <td class="pl-6">${escapeHtml(itemRow.item.name)}</td>
          ${itemRow.months.map((v) => moneyCell(v, type)).join("")}
          ${moneyCell(itemRow.total, type)}
        </tr>`);
      }
      rows.push(`<tr class="subtotal">
        <td class="pl-4">${escapeHtml(group.category.name)} subtotal</td>
        ${group.subtotalMonths.map((v) => moneyCell(v, type)).join("")}
        ${moneyCell(group.subtotal, type)}
      </tr>`);
    }
    rows.push(`<tr class="type-total">
      <td>${type === "income" ? "Income" : "Expense"} total</td>
      ${block.totals.map((v) => moneyCell(v, type)).join("")}
      ${moneyCell(block.total, type)}
    </tr>`);

    el.innerHTML = `<div class="table-wrap">
      <table class="data">
        <thead>
          <tr>
            <th></th>
            ${monthHeads}
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>`;
  }

  function renderAll() {
    setNav();
    const pivot = Store.yearPivot(year);
    renderSummary(pivot);
    renderDetail(pivot.income, "income");
    renderDetail(pivot.expense, "expense");
  }

  document.getElementById("reset-fixture").addEventListener("click", async () => {
    await Store.reset();
    renderAll();
  });

  Store.init()
    .then(renderAll)
    .catch((err) => {
      document.body.innerHTML = `<p class="p-8 toast-error">Preview failed to load seed data. Serve the <code>preview/</code> folder over HTTP (Live Server).<br>${escapeHtml(err.message)}</p>`;
    });
})();

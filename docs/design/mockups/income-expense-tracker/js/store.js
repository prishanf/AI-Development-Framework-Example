/**
 * Shared in-memory store for the design preview.
 * Loads reusable seed data from /data/seed.json and mirrors edits in sessionStorage
 * so navigation between month/year views keeps the same fixture state.
 */
(function (global) {
  const STORAGE_KEY = "iet-preview-store-v1";

  function uid(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function money(cents) {
    return (cents / 100).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
    });
  }

  function parseMonthParam(value) {
    if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
    const [y, m] = value.split("-").map(Number);
    if (m < 1 || m > 12) return null;
    return { year: y, month: m, key: value };
  }

  function monthLabel(year, month) {
    return new Date(year, month - 1, 1).toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
  }

  function shiftMonth(year, month, delta) {
    const d = new Date(year, month - 1 + delta, 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    };
  }

  function currentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  const Store = {
    data: null,
    ready: null,

    async init() {
      if (this.ready) return this.ready;
      this.ready = (async () => {
        const cached = sessionStorage.getItem(STORAGE_KEY);
        if (cached) {
          this.data = JSON.parse(cached);
          return this.data;
        }
        const res = await fetch("./data/seed.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load seed data (${res.status})`);
        this.data = await res.json();
        this.persist();
        return this.data;
      })();
      return this.ready;
    },

    persist() {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    },

    reset() {
      sessionStorage.removeItem(STORAGE_KEY);
      this.data = null;
      this.ready = null;
      return this.init();
    },

    categories(type, { includeArchived = true } = {}) {
      return this.data.categories.filter(
        (c) => c.type === type && (includeArchived || !c.archived)
      );
    },

    itemsForCategory(categoryId, { includeArchived = true } = {}) {
      return this.data.items.filter(
        (i) => i.categoryId === categoryId && (includeArchived || !i.archived)
      );
    },

    itemById(id) {
      return this.data.items.find((i) => i.id === id) || null;
    },

    categoryById(id) {
      return this.data.categories.find((c) => c.id === id) || null;
    },

    addCategory(type, name) {
      const trimmed = name.trim();
      if (!trimmed) return { ok: false, error: "Category name is required." };
      const exists = this.data.categories.some(
        (c) => c.type === type && c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return { ok: false, error: "Category already exists for this type." };
      this.data.categories.push({
        id: uid("cat"),
        type,
        name: trimmed,
        archived: false,
      });
      this.persist();
      return { ok: true };
    },

    toggleCategoryArchive(categoryId) {
      const cat = this.categoryById(categoryId);
      if (!cat) return { ok: false, error: "Category not found." };
      cat.archived = !cat.archived;
      this.persist();
      return { ok: true };
    },

    addItem(categoryId, name) {
      const cat = this.categoryById(categoryId);
      if (!cat) return { ok: false, error: "Category not found." };
      if (cat.archived) return { ok: false, error: "Cannot add items to an archived category." };
      const trimmed = name.trim();
      if (!trimmed) return { ok: false, error: "Item name is required." };
      const exists = this.data.items.some(
        (i) =>
          i.categoryId === categoryId &&
          i.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return { ok: false, error: "Item already exists under this category." };
      this.data.items.push({
        id: uid("item"),
        categoryId,
        name: trimmed,
        archived: false,
      });
      this.persist();
      return { ok: true };
    },

    toggleItemArchive(itemId) {
      const item = this.itemById(itemId);
      if (!item) return { ok: false, error: "Item not found." };
      item.archived = !item.archived;
      this.persist();
      return { ok: true };
    },

    transactionsForMonth(monthKey) {
      return this.data.transactions.filter((t) => t.month === monthKey);
    },

    monthTotals(monthKey) {
      let income = 0;
      let expense = 0;
      for (const t of this.transactionsForMonth(monthKey)) {
        if (t.type === "income") income += t.amountCents;
        else expense += t.amountCents;
      }
      return { income, expense, net: income - expense };
    },

    deleteTransaction(id) {
      const before = this.data.transactions.length;
      this.data.transactions = this.data.transactions.filter((t) => t.id !== id);
      this.persist();
      return { ok: this.data.transactions.length < before };
    },

    /**
     * Bulk save rows. Blank rows (no item or no amount) are skipped silently.
     * Invalid rows stay and return per-row errors.
     */
    bulkSave(rows) {
      const errors = [];
      const kept = [];
      const saved = [];

      rows.forEach((row, index) => {
        const hasItem = Boolean(row.itemId);
        const amount = Number(row.amount);
        const hasAmount = row.amount !== "" && !Number.isNaN(amount) && amount !== 0;

        if (!hasItem && !hasAmount) {
          kept.push(row);
          return;
        }

        if (!hasItem || !hasAmount) {
          errors.push(`Row ${index + 1}: Item and amount are both required.`);
          kept.push(row);
          return;
        }

        if (amount < 0) {
          errors.push(`Row ${index + 1}: Amount must be positive.`);
          kept.push(row);
          return;
        }

        const item = this.itemById(row.itemId);
        if (!item) {
          errors.push(`Row ${index + 1}: Item not found.`);
          kept.push(row);
          return;
        }
        if (item.archived) {
          errors.push(`Row ${index + 1}: Item is archived.`);
          kept.push(row);
          return;
        }

        const category = this.categoryById(item.categoryId);
        if (!category || category.archived) {
          errors.push(`Row ${index + 1}: Category is archived.`);
          kept.push(row);
          return;
        }
        if (category.type !== row.type) {
          errors.push(`Row ${index + 1}: Item/type mismatch.`);
          kept.push(row);
          return;
        }

        if (!parseMonthParam(row.month)) {
          errors.push(`Row ${index + 1}: Month must be YYYY-MM.`);
          kept.push(row);
          return;
        }

        const txn = {
          id: uid("txn"),
          itemId: item.id,
          type: row.type,
          month: row.month,
          amountCents: Math.round(amount * 100),
          note: (row.note || "").trim(),
        };
        this.data.transactions.push(txn);
        saved.push(txn);
      });

      this.persist();
      return { ok: errors.length === 0, errors, kept, saved };
    },

    yearPivot(year) {
      const months = Array.from({ length: 12 }, (_, i) =>
        `${year}-${String(i + 1).padStart(2, "0")}`
      );

      const byItem = new Map();
      for (const t of this.data.transactions) {
        if (!t.month.startsWith(`${year}-`)) continue;
        const monthIndex = Number(t.month.slice(5, 7)) - 1;
        if (!byItem.has(t.itemId)) {
          byItem.set(t.itemId, Array(12).fill(0));
        }
        byItem.get(t.itemId)[monthIndex] += t.amountCents;
      }

      function buildBlock(type) {
        const categories = Store.categories(type, { includeArchived: true });
        const groups = [];
        let typeMonthTotals = Array(12).fill(0);

        for (const cat of categories) {
          const items = Store.itemsForCategory(cat.id, { includeArchived: true });
          const itemRows = [];
          let catMonthTotals = Array(12).fill(0);

          for (const item of items) {
            const monthsVals = byItem.get(item.id) || Array(12).fill(0);
            const total = monthsVals.reduce((a, b) => a + b, 0);
            if (item.archived && total === 0) continue;
            itemRows.push({ item, months: monthsVals, total });
            catMonthTotals = catMonthTotals.map((v, i) => v + monthsVals[i]);
          }

          const catTotal = catMonthTotals.reduce((a, b) => a + b, 0);
          if (cat.archived && catTotal === 0 && itemRows.length === 0) continue;

          // Categories with no items still render a zero subtotal row (design acceptance).
          groups.push({
            category: cat,
            items: itemRows,
            subtotalMonths: catMonthTotals,
            subtotal: catTotal,
          });
          typeMonthTotals = typeMonthTotals.map((v, i) => v + catMonthTotals[i]);
        }

        return {
          groups,
          totals: typeMonthTotals,
          total: typeMonthTotals.reduce((a, b) => a + b, 0),
        };
      }

      const income = buildBlock("income");
      const expense = buildBlock("expense");
      const summary = months.map((key, i) => ({
        key,
        label: new Date(year, i, 1).toLocaleString(undefined, { month: "long" }),
        income: income.totals[i],
        expense: expense.totals[i],
        net: income.totals[i] - expense.totals[i],
      }));

      return {
        months,
        summary,
        income,
        expense,
        yearIncome: income.total,
        yearExpense: expense.total,
        yearNet: income.total - expense.total,
      };
    },
  };

  global.IET = {
    Store,
    money,
    parseMonthParam,
    monthLabel,
    shiftMonth,
    currentMonthKey,
    clone,
    uid,
  };
})(window);

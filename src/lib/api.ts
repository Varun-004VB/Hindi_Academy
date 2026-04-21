import {
  Engineer, Site, Worker, Duty, Advance, Expense, Transaction
} from "../types";

const LEGACY_API_BASE = "https://motor-vending-paramount.ngrok-free.dev";
const LOCAL_API_BASE = "https://motor-vending-paramount.ngrok-free.dev";
const API_BASE = (import.meta.env.VITE_API_BASE_URL || LOCAL_API_BASE).replace(/\/+$/, "");

const STORAGE_KEYS = {
  ENGINEERS: 'ha_engineers',
  SITES: 'ha_sites',
  WORKERS: 'ha_workers',
  DUTIES: 'ha_duties',
  ADVANCES: 'ha_advances',
  TRANSACTIONS: 'ha_transactions',
  GLOBAL_STATUS: 'ha_global_status',
  GENERAL_EXPENSES: 'ha_general_expenses',
  COMPANY_EXPENSES: 'ha_company_expenses',
  CATEGORIES: 'ha_categories'
};

const getStorage = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};


const normalizeApiUrl = (url: string | Request | URL): string | Request | URL => {
  if (typeof url !== "string") return url;
  if (url.startsWith(LEGACY_API_BASE)) {
    return url.replace(LEGACY_API_BASE, API_BASE);
  }
  if (url.startsWith("/")) {
    return `${API_BASE}${url}`;
  }
  return url;
};

const apiFetch = async (url: string | Request | URL, options?: RequestInit) => {
  return fetch(normalizeApiUrl(url), {
    ...options,
    headers: {
      ...options?.headers,
      'ngrok-skip-browser-warning': 'true'
    }
  });
};

const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const apiService = {
  // Engineers
  getEngineers: async (): Promise<Engineer[]> => {
    try {
      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/create/");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        type: item.role === 'contractor' ? 'Contractor' : 'Engineer'
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  createEngineer: async (data: Partial<Engineer>): Promise<Engineer> => {
    const payload = {
      name: data.name,
      role: data.type === 'Contractor' ? 'contractor' : 'engineer'
    };
    const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create");
    const d = await res.json();
    return { id: String(d.id), name: d.name, type: d.role === 'contractor' ? 'Contractor' : 'Engineer' };
  },
  updateEngineer: async (id: string, data: Partial<Engineer>): Promise<Engineer> => {
    const payload: any = {};
    if (data.name) payload.name = data.name;
    if (data.type) payload.role = data.type === 'Contractor' ? 'contractor' : 'engineer';

    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/create/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to update");
    const d = await res.json();
    return { id: String(d.id), name: d.name, type: d.role === 'contractor' ? 'Contractor' : 'Engineer' };
  },
  deleteEngineer: async (id: string): Promise<void> => {
    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/create/${id}/`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete");
  },

  // Sites
  getSites: async (): Promise<Site[]> => {
    try {
      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/site/");
      if (!res.ok) throw new Error("Failed to fetch sites");
      const data = await res.json();
      return data.map((item: any) => ({
        id: String(item.id),
        engineerId: String(item.person),
        name: item.site_name
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  createSite: async (data: Partial<Site>): Promise<Site> => {
    const payload = {
      person: Number(data.engineerId),
      site_name: data.name
    };
    const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/site/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create site");
    const d = await res.json();
    return { id: String(d.id), engineerId: String(d.person), name: d.site_name };
  },
  updateSite: async (id: string, data: Partial<Site>): Promise<Site> => {
    const payload: any = {};
    if (data.engineerId) payload.person = Number(data.engineerId);
    if (data.name) payload.site_name = data.name;

    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/site/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to update site");
    const d = await res.json();
    return { id: String(d.id), engineerId: String(d.person), name: d.site_name };
  },
  deleteSite: async (id: string): Promise<void> => {
    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/site/${id}/`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete site");
  },

  // Workers
  getWorkers: async (): Promise<Worker[]> => {
    try {
      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/worker/");
      if (!res.ok) throw new Error("Failed to fetch workers");
      const data = await res.json();
      return data.map((item: any) => ({
        id: String(item.id),
        siteId: String(item.site),
        name: item.workername,
        category: item.category,
        selectedWage: item.new_amount,
        isActive: true
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  createWorker: async (data: Partial<Worker>): Promise<Worker> => {
    const payload = {
      site: Number(data.siteId),
      workername: data.name,
      category: data.category || "",
      new_amount: data.selectedWage || 0
    };
    const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/worker/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create worker");
    const d = await res.json();
    return {
      id: String(d.id),
      siteId: String(d.site),
      name: d.workername,
      category: d.category,
      selectedWage: d.new_amount,
      isActive: true
    };
  },
  updateWorker: async (id: string, data: Partial<Worker>): Promise<Worker> => {
    const formData = new FormData();
    formData.append("worker_id", id);
    if (data.name) formData.append("workername", data.name);
    if (data.category) formData.append("category", data.category);
    if (data.siteId) formData.append("site", data.siteId);
    if (data.selectedWage !== undefined) {
      formData.append("amount", String(data.selectedWage));
      formData.append("new_amount", String(data.selectedWage));
    }

    const res = await apiFetch(`${API_BASE}/api/worker/`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error("Failed to update worker");
    const d = await res.json();
    return {
      id: String(d.id),
      siteId: String(d.site),
      name: d.workername,
      category: d.category,
      selectedWage: d.new_amount,
      isActive: true
    };
  },
  deleteWorker: async (id: string): Promise<void> => {
    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/worker/${id}/`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete worker");
  },

  // Duties
  // Duties
  getDuties: async (): Promise<Duty[]> => {
    try {
      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/table/");
      if (!res.ok) throw new Error("Failed to fetch duties");
      const tables = await res.json();
      const duties: Duty[] = [];
      tables.forEach((t: any) => {
        const start = new Date(t.start_date);
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          const dateStr = formatDateLocal(d);
          duties.push({
            id: `${t.id}_${i}`,
            workerId: String(t.worker),
            siteId: String(t.site),
            date: dateStr,
            dutyValue: t[`day${i + 1}`] || 0
          });
        }
      });
      return duties;
    } catch {
      return [];
    }
  },
  saveWeeklyDuties: async (siteId: string, workerId: string, startDate: string, daysList: number[]) => {
    try {
      const payload = {
        site: Number(siteId),
        worker: Number(workerId),
        start_date: startDate,
        day1: daysList[0] || 0,
        day2: daysList[1] || 0,
        day3: daysList[2] || 0,
        day4: daysList[3] || 0,
        day5: daysList[4] || 0,
        day6: daysList[5] || 0,
        day7: daysList[6] || 0,
      };

      const res1 = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/table/");
      const tables = await res1.json();
      const existing = tables.find((t: any) => String(t.site) === siteId && String(t.worker) === workerId && t.start_date === startDate);

      let saveRes;
      if (existing) {
        saveRes = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/table/${existing.id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        saveRes = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/table/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      if (!saveRes.ok) throw new Error("Failed to save weekly duties");
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  // Worker Categories
  getWorkerCategories: async () => [
    { id: 'mason', name: 'Mason' },
    { id: 'helper', name: 'Helper' }
  ],

  // Advances
  getAdvances: async (): Promise<Advance[]> => {
    try {
      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/advance/");
      if (!res.ok) throw new Error("Failed to fetch advances");
      const data = await res.json();
      return data.map((item: any) => ({
        id: String(item.id),
        siteId: String(item.site),
        workerId: String(item.worker),
        amount: item.advance,
        remarks: item.remarks,
        date: item.date || new Date().toISOString().split("T")[0]
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  createAdvance: async (data: Partial<Advance>): Promise<Advance> => {
    const payload = {
      site: Number(data.siteId),
      worker: Number(data.workerId),
      advance: data.amount || 0,
      remarks: data.remarks || "Advance given",
      date: data.date || new Date().toISOString().split("T")[0]
    };
    const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/advance/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create advance");
    const d = await res.json();
    return {
      id: String(d.id),
      siteId: String(d.site),
      workerId: String(d.worker),
      amount: d.advance,
      remarks: d.remarks,
      date: d.date || payload.date
    };
  },
  updateAdvance: async (id: string, data: Partial<Advance>): Promise<Advance> => {
    const payload: any = {};
    if (data.siteId !== undefined) payload.site = Number(data.siteId);
    if (data.workerId !== undefined) payload.worker = Number(data.workerId);
    if (data.amount !== undefined) payload.advance = data.amount;
    if (data.remarks !== undefined) payload.remarks = data.remarks;
    if (data.date !== undefined) payload.date = data.date;

    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/advance/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to update advance");
    const d = await res.json();
    return {
      id: String(d.id),
      siteId: String(d.site),
      workerId: String(d.worker),
      amount: d.advance,
      remarks: d.remarks,
      date: d.date || payload.date || new Date().toISOString().split("T")[0]
    };
  },
  deleteAdvance: async (id: string): Promise<void> => {
    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/advance/${id}/`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete advance");
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const [inflowRes, outflowRes] = await Promise.all([
        apiFetch("https://motor-vending-para-mount.ngrok-free.dev/transaction/inflow/"),
        apiFetch("https://motor-vending-para-mount.ngrok-free.dev/transaction/outflow/")
      ]);

      if (!inflowRes.ok || !outflowRes.ok) throw new Error("Failed to fetch transactions");

      const [inflowData, outflowData] = await Promise.all([
        inflowRes.json(),
        outflowRes.json()
      ]);

      const inflowTxs: Transaction[] = inflowData.map((item: any) => ({
        id: `in_${item.id}`, // Add prefix to distinguish between inflow/outflow IDs if they overlap
        remoteId: item.id,
        type: "Received",
        date: item.date || item.created_at,
        paidAmount: item.curr_emp_paid,
        fullAmount: item.total_wages,
        balanceAmount: item.pending_site_amt,
        remarks: item.remarks,
        siteId: String(item.site),
        personName: item.person_name, // Store personName directly to replace static lookup
      }));

      const outflowTxs: Transaction[] = outflowData.map((item: any) => ({
        id: `out_${item.id}`,
        remoteId: item.id,
        type: "Paid",
        date: item.date,
        paidAmount: item.curr_paying_amt,
        totalAmount: item.new_total_wages,
        balanceAmount: item.pending_amount,
        remarks: item.remarks,
        workerId: String(item.worker),
        siteId: String(item.site),
      }));

      return [...inflowTxs, ...outflowTxs];
    } catch (e) {
      console.error(e);
      return []; // Remote first, no fallback to local anymore as all APIs are provided
    }
  },
  createTransaction: async (data: Partial<Transaction>): Promise<Transaction> => {
    let personName = "General";
    let role = "engineer";

    if (data.engineerId) {
      const engineers = await apiService.getEngineers();
      const eng = engineers.find(e => e.id === data.engineerId);
      if (eng) {
        personName = eng.name;
        role = eng.type?.toLowerCase() || "engineer";
      }
    }

    if (data.type === 'Received') {
      const payload: any = {
        role: role,
        person_name: personName,
        site: data.siteId ? Number(data.siteId) : null,
        curr_emp_paid: data.paidAmount || 0,
        remarks: data.remarks || "",
        date: data.date || undefined
      };

      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/transaction/inflow/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const errMsg = Array.isArray(errData) ? errData[0] : (errData?.message || errData?.detail || "Failed to create inflow transaction");
        throw new Error(errMsg);
      }
      const d = await res.json();
      return {
        id: `in_${d.id}`,
        remoteId: d.id,
        type: "Received",
        date: d.date || d.created_at,
        paidAmount: d.curr_emp_paid,
        fullAmount: d.total_wages,
        balanceAmount: d.pending_site_amt,
        remarks: d.remarks,
        siteId: String(d.site),
        personName: d.person_name,
        engineerId: data.engineerId
      };
    } else {
      const payload: any = {
        role: role,
        person_name: personName,
        site: data.siteId ? Number(data.siteId) : null,
        worker: data.workerId ? Number(data.workerId) : null,
        curr_paying_amt: data.paidAmount || 0,
        remarks: data.remarks || "",
        date: data.date || undefined
      };

      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/transaction/outflow/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const errMsg = Array.isArray(errData) ? errData[0] : (errData?.message || errData?.detail || "Failed to create outflow transaction");
        throw new Error(errMsg);
      }
      const d = await res.json();
      return {
        id: `out_${d.id}`,
        remoteId: d.id,
        type: "Paid",
        date: d.date,
        paidAmount: d.curr_paying_amt,
        remarks: d.remarks,
        workerId: String(d.worker),
        siteId: String(d.site),
        totalAmount: d.new_total_wages,
        balanceAmount: d.pending_amount,
        engineerId: data.engineerId
      };
    }
  },
  updateTransaction: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
    const isInflow = id.startsWith('in_');
    const remoteId = id.replace('in_', '').replace('out_', '');
    const endpoint = isInflow ? "inflow" : "outflow";

    const payload: any = {};
    if (isInflow) {
      if (data.paidAmount !== undefined) payload.curr_emp_paid = data.paidAmount;
    } else {
      if (data.paidAmount !== undefined) payload.curr_paying_amt = data.paidAmount;
    }
    if (data.remarks !== undefined) payload.remarks = data.remarks;
    if (data.date !== undefined) payload.date = data.date;

    if (data.engineerId) {
      const engineers = await apiService.getEngineers();
      const eng = engineers.find(e => e.id === data.engineerId);
      if (eng) {
        payload.person_name = eng.name;
        payload.role = eng.type?.toLowerCase() || "engineer";
      }
    }
    if (data.siteId) payload.site = Number(data.siteId);
    if (!isInflow && data.workerId) payload.worker = Number(data.workerId);

    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/transaction/${endpoint}/${remoteId}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update ${endpoint} transaction`);
    const d = await res.json();

    if (isInflow) {
      return {
        id: `in_${d.id}`,
        remoteId: d.id,
        type: "Received",
        date: d.date || d.created_at,
        paidAmount: d.curr_emp_paid,
        fullAmount: d.total_wages,
        balanceAmount: d.pending_site_amt,
        remarks: d.remarks,
        personName: d.person_name,
        siteId: String(d.site),
        engineerId: data.engineerId
      };
    } else {
      return {
        id: `out_${d.id}`,
        remoteId: d.id,
        type: "Paid",
        date: d.date,
        paidAmount: d.curr_paying_amt,
        remarks: d.remarks,
        workerId: String(d.worker),
        siteId: String(d.site),
        totalAmount: d.new_total_wages,
        balanceAmount: d.pending_amount,
        engineerId: data.engineerId
      };
    }
  },
  deleteTransaction: async (id: string): Promise<void> => {
    const isInflow = id.startsWith('in_');
    const remoteId = id.replace('in_', '').replace('out_', '');
    const endpoint = isInflow ? "inflow" : "outflow";

    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/transaction/${endpoint}/${remoteId}/`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`Failed to delete ${endpoint} transaction`);
  },

  getTransactionSummary: async () => {
    const txs = await apiService.getTransactions();
    const received = txs.filter(t => t.type === 'Received').reduce((s, t) => s + t.paidAmount, 0);
    const paid = txs.filter(t => t.type === 'Paid').reduce((s, t) => s + t.paidAmount, 0);
    return {
      totalReceived: received,
      totalPaid: paid,
      netBalance: received - paid
    };
  },

  // Global Status
  getGlobalStatus: async () => getStorage(STORAGE_KEYS.GLOBAL_STATUS, { cashInHand: 0, cashInBank: 0 }),
  updateGlobalStatus: async (data: { cashInHand: number; cashInBank: number }) => {
    setStorage(STORAGE_KEYS.GLOBAL_STATUS, data);
    return data;
  },

  // General Expenses
  getGeneralExpenses: async (): Promise<Expense[]> => {
    try {
      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/expenses/general/");
      if (!res.ok) throw new Error("Failed to fetch general expenses");
      const data = await res.json();
      return data.map((item: any) => {
        const parsedAmount = parseFloat(item.amount);
        return {
          id: String(item.id),
          expenseType: item.role === "contractor" ? "Contractor" : "Engineer",
          siteId: item.site ? String(item.site) : undefined,
          category: (item.expenses_type && Array.isArray(item.expenses_type)) ? item.expenses_type.join(", ") : "misc",
          remarks: String(item.remarks || ""),
          amount: isNaN(parsedAmount) ? 0 : parsedAmount,
          date: item.date || new Date().toISOString().split("T")[0],
          personName: String(item.person_name || ""),
          role: String(item.role || "")
        };
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  createGeneralExpense: async (data: Partial<Expense>): Promise<Expense> => {
    let personName = "General";
    if (data.engineerId) {
      const engineers = await apiService.getEngineers();
      const eng = engineers.find(e => e.id === data.engineerId);
      if (eng) personName = eng.name;
    }

    const payload = {
      role: String(data.expenseType?.toLowerCase() || "engineer"),
      person_name: String(personName),
      site: data.siteId ? Number(data.siteId) : null,
      worker: null,
      expenses_type: data.category ? [data.category] : ["misc"],
      remarks: String(data.remarks || ""),
      amount: Number(data.amount || 0),
      date: data.date || new Date().toISOString().split("T")[0]
    };

    const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/expenses/general/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create general expense");
    const d = await res.json();
    const finalAmount = parseFloat(d.amount);
    return {
      id: String(d.id),
      expenseType: d.role === "contractor" ? "Contractor" : "Engineer",
      siteId: d.site ? String(d.site) : undefined,
      category: (d.expenses_type && d.expenses_type.length) ? d.expenses_type[0] : "misc",
      remarks: String(d.remarks || ""),
      amount: isNaN(finalAmount) ? 0 : finalAmount,
      date: d.date || payload.date
    };
  },
  updateGeneralExpense: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    const payload: any = {};
    if (data.expenseType) payload.role = data.expenseType.toLowerCase();
    if (data.category) payload.expenses_type = [data.category];
    if (data.remarks !== undefined) payload.remarks = data.remarks;
    if (data.siteId !== undefined) payload.site = data.siteId ? Number(data.siteId) : null;
    if (data.amount !== undefined) payload.amount = data.amount;
    if (data.date !== undefined) payload.date = data.date;

    if (data.engineerId) {
      const engineers = await apiService.getEngineers();
      const eng = engineers.find(e => e.id === data.engineerId);
      if (eng) payload.person_name = eng.name;
    }

    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/expenses/general/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to update general expense");
    const d = await res.json();
    return {
      id: String(d.id),
      expenseType: d.role === "contractor" ? "Contractor" : "Engineer",
      siteId: d.site ? String(d.site) : undefined,
      category: (d.expenses_type && d.expenses_type.length) ? d.expenses_type[0] : "misc",
      remarks: d.remarks,
      amount: d.amount || payload.amount || 0,
      date: d.date || payload.date || new Date().toISOString().split("T")[0]
    };
  },
  deleteGeneralExpense: async (id: string): Promise<void> => {
    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/expenses/general/${id}/`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete general expense");
  },

  // Company Expenses
  getCompanyExpenses: async (): Promise<Expense[]> => {
    try {
      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/expenses/personal/");
      if (!res.ok) throw new Error("Failed to fetch company expenses");
      const data = await res.json();
      return data.map((item: any) => ({
        id: String(item.id),
        date: item.date || new Date().toISOString().split("T")[0],
        description: item.workername || "Company Expense",
        amount: Number(item.amount || 0),
        remarks: item.remarks
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  createCompanyExpense: async (data: Partial<Expense>): Promise<Expense> => {
    const payload = {
      workername: data.description || "Company",
      date: data.date || new Date().toISOString().split("T")[0],
      amount: data.amount || 0,
      remarks: data.remarks || data.description || "Company expense"
    };
    const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/expenses/personal/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create company expense");
    const d = await res.json();
    return {
      id: String(d.id),
      date: d.date || payload.date,
      description: d.workername,
      amount: d.amount,
      remarks: d.remarks
    };
  },
  updateCompanyExpense: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    const payload: any = {};
    if (data.description !== undefined) payload.workername = data.description;
    if (data.date !== undefined) payload.date = data.date;
    if (data.amount !== undefined) payload.amount = data.amount;
    if (data.remarks !== undefined) payload.remarks = data.remarks;

    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/expenses/personal/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to update company expense");
    const d = await res.json();
    return {
      id: String(d.id),
      date: d.date || payload.date || new Date().toISOString().split("T")[0],
      description: d.workername,
      amount: d.amount,
      remarks: d.remarks
    };
  },
  deleteCompanyExpense: async (id: string): Promise<void> => {
    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/expenses/personal/${id}/`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete company expense");
  },

  // Fetch the ACTUAL pending amount the backend holds for a worker
  // This prevents 400 errors from client-side calculation mismatches
  getWorkerPendingAmount: async (workerId: string): Promise<number> => {
    try {
      const [outflowRes, payoutRes] = await Promise.all([
        apiFetch("https://motor-vending-para-mount.ngrok-free.dev/transaction/outflow/"),
        apiFetch("https://motor-vending-para-mount.ngrok-free.dev/payout/")
      ]);

      if (!outflowRes.ok || !payoutRes.ok) throw new Error("Failed to fetch balance records");

      const outflows = await outflowRes.json();
      const payouts = await payoutRes.json();

      const workerOutflows = outflows.filter((o: any) => String(o.worker) === workerId);
      const workerPayouts = payouts.filter((p: any) => String(p.worker) === workerId);

      // Find the absolute latest record across both tables
      let latestPending = 0;
      let lastId = -1;

      workerOutflows.forEach((o: any) => {
        if (o.id > lastId) {
          lastId = o.id;
          latestPending = o.pending_amount || 0;
        }
      });

      workerPayouts.forEach((p: any) => {
        // We use a combined heuristic or assume IDs are sequential across relevant activity
        // In practice, we should check which one was created last
        if (p.id > lastId) { // Assuming IDs are roughly comparable or checking timestamps if available
          lastId = p.id;
          latestPending = p.pending_amount || 0;
        }
      });

      if (lastId !== -1) return latestPending;

      // No records exist - calculate from backend tables & advances
      const [tablesRes, advancesRes] = await Promise.all([
        apiFetch("https://motor-vending-para-mount.ngrok-free.dev/table/"),
        apiFetch("https://motor-vending-para-mount.ngrok-free.dev/advance/")
      ]);

      if (!tablesRes.ok || !advancesRes.ok) throw new Error("Failed to fetch data");

      const tables = await tablesRes.json();
      const advancesList = await advancesRes.json();

      const totalWages = tables
        .filter((t: any) => String(t.worker) === workerId)
        .reduce((sum: number, t: any) => sum + (t.total_wages || 0), 0);

      const totalAdvance = advancesList
        .filter((a: any) => String(a.worker) === workerId)
        .reduce((sum: number, a: any) => sum + (a.advance || 0), 0);

      return totalWages - totalAdvance;
    } catch (e) {
      console.error("Error getting worker pending amount:", e);
      return 0;
    }
  },

  getSiteTotalValue: async (siteId: string): Promise<number> => {
    try {
      const tablesRes = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/table/");
      if (!tablesRes.ok) throw new Error("Failed to fetch tables");
      const tables = await tablesRes.json();
      return tables
        .filter((t: any) => String(t.site) === siteId)
        .reduce((sum: number, t: any) => sum + (t.total_wages || 0), 0);
    } catch (e) {
      console.error("Error getting site total value:", e);
      return 0;
    }
  },

  // Fetch the ACTUAL pending site amount the backend holds for a site
  // This prevents 400 errors when recording inflow payments
  getSitePendingAmount: async (siteId: string, date?: string): Promise<{ siteTotal: number; pendingSiteAmt: number; inflowTotal: number }> => {
    try {
      const [inflowRes, payoutRes] = await Promise.all([
        apiFetch("https://motor-vending-para-mount.ngrok-free.dev/transaction/inflow/"),
        apiFetch("https://motor-vending-para-mount.ngrok-free.dev/payout/")
      ]);

      if (!inflowRes.ok || !payoutRes.ok) throw new Error("Failed to fetch site records");

      const inflows = await inflowRes.json();
      const payouts = await payoutRes.json();

      const siteInflows = inflows.filter((i: any) => String(i.site) === siteId);
      const sitePayouts = payouts.filter((p: any) => String(p.site) === siteId);

      let latestSiteTotal = 0;
      let latestPendingSiteAmt = 0;
      let latestInflowTotal = 0;
      let lastInflowId = -1;
      let lastPayoutId = -1;

      siteInflows.forEach((i: any) => {
        if (i.id > lastInflowId) {
          lastInflowId = i.id;
          latestInflowTotal = i.inflow_total || 0;
          latestPendingSiteAmt = i.pending_site_amt || 0;
          latestSiteTotal = i.site_total || 0;
        }
      });

      sitePayouts.forEach((p: any) => {
        if (p.id > lastPayoutId) {
          lastPayoutId = p.id;
          // Payout records track the total accrual ('new_site_total')
          // If this is newer than the last inflow, the pending amount increases
          if (p.id > lastInflowId) {
            latestSiteTotal = p.new_site_total || 0;
            latestPendingSiteAmt = latestSiteTotal - latestInflowTotal;
          }
        }
      });

      // Always reconcile with the current Table Distribution (Source of truth for earnings)
      const tablesRes = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/table/");
      if (tablesRes.ok) {
        const tables = await tablesRes.json();
        const matchingTables = tables.filter((t: any) => String(t.site) === siteId && (!date || t.start_date === date));
        const tableTotal = matchingTables.length > 0 ? (matchingTables[0].total_wages || 0) : 0;

        // If the table total has increased but no payout record exists yet, 
        // increment the pending amount so the inflow can be accepted.
        if (tableTotal > latestSiteTotal) {
          const diff = tableTotal - latestSiteTotal;
          latestPendingSiteAmt += diff;
          latestSiteTotal = tableTotal;
        }
      }

      return {
        siteTotal: latestSiteTotal,
        pendingSiteAmt: latestPendingSiteAmt,
        inflowTotal: latestInflowTotal
      };
    } catch (e) {
      console.error("Error getting site pending amount:", e);
      return { siteTotal: 0, pendingSiteAmt: 0, inflowTotal: 0 };
    }
  },

  // Worker & Site Payouts/Balances (CLIENT-SIDE CALCULATION)
  getWorkerPayout: async (id: string) => {
    try {
      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/payout/");
      if (!res.ok) throw new Error("Failed to fetch payouts from server");
      const payouts = await res.json();

      // Filter the global payout list for this specific worker
      const workerPayouts = payouts.filter((p: any) => String(p.worker) === id);

      // Use the latest record's 'new_total_wages' or sum them if applicable.
      // Usually, 'new_total_wages' in the latest record represents the cumulative outstanding.
      // If there are multiple, the user wants the value directly from the payload key.
      const latestPayout = workerPayouts.length > 0 ? workerPayouts[workerPayouts.length - 1] : null;
      const totalWages = latestPayout ? (latestPayout.new_total_wages || latestPayout.amount || 0) : 0;

      // We still need to account for advances and transactions logged in the current system
      const [advances, transactions] = await Promise.all([
        apiService.getAdvances(),
        apiService.getTransactions()
      ]);

      const totalAdvance = advances.filter(a => a.workerId === id).reduce((s: number, a: any) => s + a.amount, 0);
      const totalDirectPaid = transactions.filter(t => t.type === 'Paid' && t.workerId === id).reduce((s: number, t: any) => s + t.paidAmount, 0);

      const totalPaid = totalAdvance + totalDirectPaid;
      return {
        totalDuties: workerPayouts.reduce((s: number, p: any) => s + (p.total_duty || 0), 0),
        totalWages: totalWages, // This is the 'new_total_wages' from backend
        totalAdvance,
        totalDirectPaid,
        totalPaid,
        balance: totalWages - totalPaid // The actual pending amount
      };
    } catch (e) {
      console.error("Error in getWorkerPayout:", e);
      return { totalDuties: 0, totalWages: 0, totalAdvance: 0, totalDirectPaid: 0, totalPaid: 0, balance: 0 };
    }
  },

  getSiteBalance: async (id: string) => {
    try {
      const [sites, workers, transactions, expenses] = await Promise.all([
        apiService.getSites(),
        apiService.getWorkers(),
        apiService.getTransactions(),
        apiService.getGeneralExpenses()
      ]);

      const site = sites.find(s => s.id === id);
      if (!site) return { totalReceived: 0, totalSpent: 0, balance: 0 };

      const siteWorkers = workers.filter(w => w.siteId === id);
      const workerIds = siteWorkers.map(w => w.id);

      const totalReceived = transactions
        .filter(t => t.type === 'Received' && t.siteId === id)
        .reduce((sum, t) => sum + t.paidAmount, 0);

      const workerPayments = transactions
        .filter(t => t.type === 'Paid' && workerIds.includes(t.workerId!))
        .reduce((sum, t) => sum + t.paidAmount, 0);

      const siteExpenses = expenses
        .filter(e => e.siteId === id)
        .reduce((sum, e) => sum + e.amount, 0);

      const totalSpent = workerPayments + siteExpenses;
      return {
        totalReceived,
        totalSpent,
        balance: totalReceived - totalSpent
      };
    } catch (e) {
      console.error("Error in getSiteBalance:", e);
      return { totalReceived: 0, totalSpent: 0, balance: 0 };
    }
  },

  // Balance Sheet
  getBalanceSheets: async () => {
    try {
      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/balancesheet/");
      if (!res.ok) throw new Error("Failed to fetch balance sheets");
      const data = await res.json();
      return data.map((item: any) => ({
        id: String(item.id),
        role: item.role,
        person_name: item.person_name,
        site: String(item.site),
        inflow_total: item.inflow_total || item.inflow || 0,
        outflow_total: item.outflow_total || item.outflow || 0,
        expense_total: item.expense_total || item.expenses || 0,
        advance_total: item.advance_total || item.advance || 0,
        site_paid_total: item.site_paid_total,
        siteprofit: item.siteprofit,
        contractor_pending_amount: item.contractor_pending_amount || 0,
        company_expense_total: item.company_expense_total || 0,
        inflow_data: item.inflow_data || item.inflows || item.inflow || [],
        outflow_data: item.outflow_data || item.outflows || item.outflow || [],
        expense_data: item.expense_data || item.expenses_data || item.expenses || [],
        advance_data: item.advance_data || item.advances_data || item.advances || [],
        company_expense_data: item.company_expense_data || item.company_expenses || []
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  createBalanceSheet: async (data: any) => {
    const payload = {
      role: data.role,
      person_name: data.person_name,
      site: Number(data.site)
    };
    const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/balancesheet/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create balance sheet");
    const d = await res.json();
    return {
      id: String(d.id),
      role: d.role,
      person_name: d.person_name,
      site: String(d.site),
      inflow_total: d.inflow_total || 0,
      outflow_total: d.outflow_total || 0,
      expense_total: d.expense_total || 0,
      advance_total: d.advance_total || 0,
      site_paid_total: d.site_paid_total || 0,
      siteprofit: d.siteprofit || 0,
      contractor_pending_amount: d.contractor_pending_amount || 0,
      company_expense_total: d.company_expense_total || 0,
      inflow_data: d.inflow_data || [],
      outflow_data: d.outflow_data || [],
      expense_data: d.expense_data || [],
      advance_data: d.advance_data || [],
      company_expense_data: d.company_expense_data || []
    };
  },
  updateBalanceSheet: async (id: string, data: any) => {
    const payload = {
      role: data.role,
      person_name: data.person_name,
      site: Number(data.site)
    };
    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/balancesheet/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to update balance sheet");
    const d = await res.json();
    return {
      id: String(d.id),
      role: d.role,
      person_name: d.person_name,
      site: String(d.site),
      inflow_total: d.inflow_total || 0,
      outflow_total: d.outflow_total || 0,
      expense_total: d.expense_total || 0,
      advance_total: d.advance_total || 0,
      site_paid_total: d.site_paid_total || 0,
      siteprofit: d.siteprofit || 0,
      contractor_pending_amount: d.contractor_pending_amount || 0,
      company_expense_total: d.company_expense_total || 0,
      inflow_data: d.inflow_data || [],
      outflow_data: d.outflow_data || [],
      expense_data: d.expense_data || [],
      advance_data: d.advance_data || [],
      company_expense_data: d.company_expense_data || []
    };
  },
  deleteBalanceSheet: async (id: string): Promise<void> => {
    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/balancesheet/${id}/`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete balance sheet");
  },

  // Payouts (Remote API)
  getPayouts: async () => {
    try {
      const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/payout/");
      if (!res.ok) throw new Error("Failed to fetch payouts");
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  createPayout: async (data: {
    role: string;
    person_name: string;
    site: number;
    worker: number;
    total_duty: number;
    new_amount: number;
  }) => {
    const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/payout/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create payout");
    return await res.json();
  },
  updatePayout: async (id: number, data: {
    role: string;
    person_name: string;
    site: number;
    worker: number;
    total_duty: number;
    new_amount: number;
  }) => {
    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/payout/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update payout");
    return await res.json();
  },
  deletePayout: async (id: number) => {
    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/payout/${id}/`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete payout");
  },

  // Worker Database (New)
  getWorkerDatabase: async (search?: string) => {
    try {
      let url = `${API_BASE}/workerdatabase/?_t=${Date.now()}`;
      if (search) {
        // Apply search to both generic search and specific worker_id field for maximum accuracy
        url += `&search=${encodeURIComponent(search)}&worker_id=${encodeURIComponent(search)}`;
      }

      const res = await apiFetch(url);
      if (!res.ok) throw new Error("Failed to fetch worker database");
      const data = await res.json();
      return data.map((item: any) => ({
        id: String(item.id),
        workerid: item.worker_id || item.workerid || String(item.id),
        fullname: item.fullname,
        category: item.category,
        mobile: item.mobile,
        aadhar: item.aadhar,
        pan_num: item.pan_num,
        village: item.village,
        district: item.district,
        state: item.state,
        date_of_joining: item.date_of_joining,
        date_of_relieving: item.date_of_relieving,
        active: Boolean(item.active),
        status: item.active ? 'Active' : 'Inactive',
        bloodgroup: item.bloodgroup,
        marital_sts: item.marital_sts === 'married' ? 'Married' : 'Unmarried',
        parent_name: item.parent_name,
        parentmob_num: item.parentmob_num,
        nominee_name: item.nominee_name || item.parent_name,
        nominee_phone: item.nominee_phone || item.parentmob_num,
        children_details: item.children_details,
        referred_by: item.referred_by,
        referral_phno: item.referral_phno,
        insurance_status: item.insurance_status === 'yes' ? 'Yes' : 'No',
        policy_num: item.policy_num,
        insurance_date: item.insurance_date,
        insurancecompany: item.insurancecompany,
        insurance_source: item.insurance_source === 'provided by company' ? 'Agent' : 'Self',
        profileImage: (() => {
          const img = item.image;
          if (!img || typeof img !== 'string' || img.startsWith('data:')) return null;
          if (img.startsWith('http')) return img;
          const path = img.startsWith('/') ? img : `/${img}`;
          return `${API_BASE}${path}`;
        })(),
        employmentHistory: []
      }));
    } catch (e) {
      console.error("Error in getWorkerDatabase:", e);
      return [];
    }
  },

  createWorkerDatabase: async (data: any, imageFile?: File | null) => {
    const formData = new FormData();
    formData.append('fullname', data.fullname || '');
    formData.append('category', data.category || '');
    formData.append('mobile', data.mobile || '');
    formData.append('aadhar', data.aadhar || '');
    formData.append('pan_num', data.pan_num || '');
    formData.append('date_of_joining', data.date_of_joining || '');
    formData.append('date_of_relieving', data.date_of_relieving || '');
    formData.append('active', (data.active !== undefined ? data.active : (data.status === 'Active')).toString());
    formData.append('bloodgroup', data.bloodgroup || '');
    formData.append('marital_sts', data.marital_sts?.toLowerCase() || 'unmarried');
    formData.append('parent_name', data.parent_name || '');
    formData.append('parentmob_num', data.parentmob_num || '');
    formData.append('nominee_name', data.nominee_name || '');
    formData.append('nominee_phone', data.nominee_phone || '');
    formData.append('children_details', data.children_details || '');
    formData.append('village', data.village || '');
    formData.append('district', data.district || '');
    formData.append('state', data.state || '');
    formData.append('referred_by', data.referred_by || '');
    formData.append('referral_phno', data.referral_phno || '');
    formData.append('insurance_status', data.insurance_status === 'Yes' ? 'yes' : 'no');
    formData.append('policy_num', data.policy_num || '');
    formData.append('insurance_date', data.insurance_date || '');
    formData.append('insurancecompany', data.insurancecompany || '');
    formData.append('insurance_source', data.insurance_source === 'Agent' ? 'provided by company' : 'Self');

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const res = await apiFetch("https://motor-vending-para-mount.ngrok-free.dev/workerdatabase/", {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Creation failed:", errorData);
      throw new Error(`Failed to create worker database entry: ${JSON.stringify(errorData)}`);
    }
    return await res.json();
  },

  updateWorkerDatabase: async (id: string, data: any, imageFile?: File | null) => {
    const formData = new FormData();

    if (data.fullname !== undefined) formData.append('fullname', data.fullname);
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.mobile !== undefined) formData.append('mobile', data.mobile);
    if (data.aadhar !== undefined) formData.append('aadhar', data.aadhar);
    if (data.pan_num !== undefined) formData.append('pan_num', data.pan_num);
    if (data.date_of_joining !== undefined) formData.append('date_of_joining', data.date_of_joining);
    if (data.date_of_relieving !== undefined) formData.append('date_of_relieving', data.date_of_relieving);
    if (data.active !== undefined) formData.append('active', data.active.toString());
    else if (data.status !== undefined) formData.append('active', (data.status === 'Active').toString());
    if (data.bloodgroup !== undefined) formData.append('bloodgroup', data.bloodgroup);
    if (data.marital_sts !== undefined) formData.append('marital_sts', data.marital_sts?.toLowerCase());
    if (data.parent_name !== undefined) formData.append('parent_name', data.parent_name);
    if (data.parentmob_num !== undefined) formData.append('parentmob_num', data.parentmob_num);
    if (data.nominee_name !== undefined) formData.append('nominee_name', data.nominee_name);
    if (data.nominee_phone !== undefined) formData.append('nominee_phone', data.nominee_phone);
    if (data.children_details !== undefined) formData.append('children_details', data.children_details);
    if (data.village !== undefined) formData.append('village', data.village);
    if (data.district !== undefined) formData.append('district', data.district);
    if (data.state !== undefined) formData.append('state', data.state);
    if (data.referred_by !== undefined) formData.append('referred_by', data.referred_by);
    if (data.referral_phno !== undefined) formData.append('referral_phno', data.referral_phno);
    if (data.insurance_status !== undefined) formData.append('insurance_status', data.insurance_status === 'Yes' ? 'yes' : 'no');
    if (data.policy_num !== undefined) formData.append('policy_num', data.policy_num);
    if (data.insurance_date !== undefined) formData.append('insurance_date', data.insurance_date);
    if (data.insurancecompany !== undefined) formData.append('insurancecompany', data.insurancecompany);
    if (data.insurance_source !== undefined) formData.append('insurance_source', data.insurance_source === 'Agent' ? 'provided by company' : 'Self');


    if (imageFile) {
      formData.append('image', imageFile);
    }

    const res = await apiFetch(`https://motor-vending-para-mount.ngrok-free.dev/workerdatabase/${id}/`, {
      method: "PATCH",
      body: formData
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Update failed:", errorData);
      throw new Error(`Failed to update worker database entry: ${JSON.stringify(errorData)}`);
    }
    return await res.json();
  },

  deleteWorkerDatabase: async (id: string) => {
    const res = await apiFetch(`/workerdatabase/${id}/`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete worker database entry");
  },

  toggleWorkerStatus: async (worker: any) => {
    try {
      // Use the existing robust update logic to ensure consistency and bypass CORS issues with PATCH
      const updatedData = { ...worker, active: !worker.active };
      return await apiService.updateWorkerDatabase(worker.id, updatedData);
    } catch (err: any) {
      console.error("Toggle worker status failed:", err);
      throw err;
    }
  },
};




import React, { useState } from "react";
import { useEngineerData } from "../../hooks/useEngineerData";
import { CreditCard, Landmark, Plus, Trash2, Calendar, Layout, Tag, FileText } from "lucide-react";

const EXPENSE_CATEGORIES = [
  { value: "petrol", label: "Petrol" },
  { value: "gas", label: "Gas" },
  { value: "rice", label: "Rice" },
  { value: "food", label: "Food" },
  { value: "tea", label: "Tea" },
  { value: "medical", label: "Medical" },
  { value: "travel", label: "Travel" },
  { value: "misc", label: "Misc" }
];

const ExpensesTab: React.FC = () => {
  const { expenses, addExpense, deleteExpense, companyExpenses, engineers, sites } = useEngineerData();

  const [activeTab, setActiveTab] = useState<"General" | "Company">("General");

  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [expenseCategory, setExpenseCategory] = useState<string>(EXPENSE_CATEGORIES[0].value);
  const [amount, setAmount] = useState<number | "">("");
  const [remarks, setRemarks] = useState<string>("");

  const [engType, setEngType] = useState<"Engineer" | "Contractor">("Engineer");
  const [selectedEngId, setSelectedEngId] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");

  const currentSites = sites.filter((s) => s.engineerId === selectedEngId);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;
    if (activeTab === "General" && !expenseCategory) return;

    try {
      const isCompany = activeTab === "Company";
      if (isCompany) {
        await addExpense({
          date,
          description: remarks,
          amount: Number(amount),
        }, true);
      } else {
        await addExpense({
          date,
          category: expenseCategory,
          expenseType: engType,
          amount: Number(amount),
          remarks,
          engineerId: selectedEngId || undefined,
          siteId: selectedSiteId || undefined
        }, false);
      }
      setAmount("");
      setRemarks("");
    } catch (err: any) {
      console.error("Expense error details:", err.response?.data);
      alert("Error adding expense: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCompanyExpense = companyExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="bg-transparent p-0">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm w-fit mb-6">
        <button
          onClick={() => setActiveTab("General")}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === "General" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
        >
          <CreditCard className="w-4 h-4" />
          General Expenses
        </button>
        <button
          onClick={() => setActiveTab("Company")}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === "Company" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
        >
          <Landmark className="w-4 h-4" />
          Company Expenses
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          {activeTab === "General" ? "Expense Tracking" : "Corporate Spending"}
        </h2>
        <p className="text-indigo-400 dark:text-indigo-400/60 text-xs font-semibold uppercase tracking-wider mt-0.5">
          {activeTab === "General" ? "Management of day-to-day project disbursements" : "Fixed and strategic company-wide investments"}
        </p>
      </div>

      {/* Form */}
      <div className="glass-card p-6 rounded-2xl mb-8 border border-indigo-50 dark:border-indigo-500/10 shadow-xl shadow-indigo-100/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />
        <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 relative z-10">
          {activeTab === "General" && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 ml-1">Entity Type</label>
                <div className="flex gap-2 p-1.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm h-[60px] items-center">
                  <button
                    type="button"
                    onClick={() => { setEngType("Engineer"); setSelectedEngId(""); setSelectedSiteId(""); }}
                    className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${engType === "Engineer" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-indigo-600"}`}
                  >
                    Engineer
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEngType("Contractor"); setSelectedEngId(""); setSelectedSiteId(""); }}
                    className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${engType === "Contractor" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-indigo-600"}`}
                  >
                    Contractor
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 ml-1">{engType}</label>
                <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black appearance-none focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all cursor-pointer shadow-sm" value={selectedEngId} onChange={(e) => { setSelectedEngId(e.target.value); setSelectedSiteId(""); }}>
                  <option value="" className="bg-white">-- General Expense --</option>
                  {engineers.filter(e => e.type === engType || (!e.type && engType === "Engineer")).map(e => <option key={e.id} value={e.id} className="bg-white dark:bg-slate-900">{e.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 ml-1">Regional Hub</label>
                <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black appearance-none focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all cursor-pointer shadow-sm disabled:opacity-30" value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)} disabled={!selectedEngId}>
                  <option value="" className="bg-white dark:bg-slate-900">-- No specific site --</option>
                  {currentSites.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900">{s.name}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-600/60 dark:text-indigo-400/60 ml-1">Calendar Date</label>
            <input type="date" required className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm cursor-pointer" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {activeTab === "General" ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 ml-1">Classification</label>
              <select required className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black appearance-none focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all cursor-pointer shadow-sm text-sm" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
                {EXPENSE_CATEGORIES.map(t => <option key={t.value} value={t.value} className="bg-white dark:bg-slate-900">{t.label}</option>)}
              </select>
            </div>
          ) : (
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 ml-1">Operational Directive</label>
              <input type="text" required className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm" placeholder="e.g. Rent, Utility, Logistics" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
          )}

          {activeTab === "General" && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 ml-1">Memo</label>
              <input type="text" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm" placeholder="Optional notes" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 ml-1">Funding (₹)</label>
            <div className="flex gap-2">
              <input type="number" min="1" required className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              <button type="submit" className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 text-2xl font-bold">
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List - General Expenses */}
      {activeTab === "General" ? (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700/40 shadow-xl shadow-indigo-100/10">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700/40 bg-white/70 dark:bg-slate-900/40">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">General Expenses Ledger</h3>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mt-1">
                Daily project and site expense entries
              </p>
            </div>
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 dark:text-rose-400">Total</p>
              <p className="text-lg font-black text-rose-600 dark:text-rose-400">₹{totalExpense.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[920px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50">No</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="inline-flex items-center gap-2"><Calendar className="w-3 h-3" /> Date</span>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50">Person Name</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50">Role</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="inline-flex items-center gap-2"><Layout className="w-3 h-3" /> Site</span>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="inline-flex items-center gap-2"><Tag className="w-3 h-3" /> Category</span>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50">Entry Details</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 border-b border-slate-100 dark:border-slate-700/50 text-right bg-rose-500/5 dark:bg-rose-500/10">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-red-500 dark:text-red-400 border-b border-slate-100 dark:border-slate-700/50 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {expenses.slice().reverse().map((e, index) => {
                  const site = sites.find(s => s.id === e.siteId);
                  return (
                    <tr key={e.id!} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-5 text-sm font-black text-slate-400 dark:text-slate-500">{String(index + 1).padStart(2, "0")}</td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{new Date(e.date).toLocaleDateString("en-GB")}</div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Archive Date</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{e.personName || "-"}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{e.role || "-"}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{site ? site.name : "General Expense"}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">{e.expenseType || "Common Entry"}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/10">
                          {e.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="max-w-[280px] text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed truncate">
                          {e.remarks || "No notes added"}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right bg-rose-500/5 dark:bg-rose-500/10">
                        <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                          {e.amount > 0 ? `₹${e.amount.toLocaleString("en-IN")}` : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button onClick={() => deleteExpense(e.id!)} className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all mx-auto">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {expenses.length === 0 && (
                  <tr><td colSpan={7} className="px-8 py-10 text-center text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs">No disbursements recorded in system registry.</td></tr>
                )}
              </tbody>
              <tfoot className="bg-slate-900 dark:bg-slate-950 border-t border-slate-700">
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-right text-xs font-black uppercase tracking-[0.3em] text-slate-400">General Expense Total</td>
                  <td className="px-6 py-6 text-right text-2xl font-black text-rose-400 border-l border-slate-700">₹{totalExpense.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-6 border-l border-slate-700"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* List - Company Expenses */
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700/40 shadow-xl shadow-indigo-100/10">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700/40 bg-white/70 dark:bg-slate-900/40">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Personal Expenses Ledger</h3>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mt-1">
                Internal and company-side spending entries
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-400">Total</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{totalCompanyExpense.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50">No</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="inline-flex items-center gap-2"><Calendar className="w-3 h-3" /> Date</span>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="inline-flex items-center gap-2"><FileText className="w-3 h-3" /> Description</span>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-700/50 text-right bg-emerald-500/5 dark:bg-emerald-500/10">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-red-500 dark:text-red-400 border-b border-slate-100 dark:border-slate-700/50 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {companyExpenses.slice().reverse().map((e, index) => (
                  <tr key={e.id!} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-5 text-sm font-black text-slate-400 dark:text-slate-500">{String(index + 1).padStart(2, "0")}</td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{new Date(e.date).toLocaleDateString("en-GB")}</div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Archive Date</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="max-w-[380px] font-black text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-relaxed">
                        {e.description || e.remarks || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right bg-emerald-500/5 dark:bg-emerald-500/10">
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{e.amount.toLocaleString("en-IN")}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button onClick={() => deleteExpense(e.id!)} className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all mx-auto">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {companyExpenses.length === 0 && (
                  <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs">No corporate investments recorded in system registry.</td></tr>
                )}
              </tbody>
              <tfoot className="bg-slate-900 dark:bg-slate-950 border-t border-slate-700">
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-right text-xs font-black uppercase tracking-[0.3em] text-slate-400">Personal Expense Total</td>
                  <td className="px-6 py-6 text-right text-2xl font-black text-emerald-400 border-l border-slate-700">₹{totalCompanyExpense.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-6 border-l border-slate-700"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;

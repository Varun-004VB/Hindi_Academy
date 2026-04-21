import React, { useState } from "react";
import { useEngineerData } from "../../hooks/useEngineerData";

const AdvanceTab: React.FC = () => {
  const { engineers, sites, workers, advances, addAdvance, updateAdvance, deleteAdvance } = useEngineerData();

  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [engType, setEngType] = useState<"Engineer" | "Contractor">("Engineer");
  const [selectedEngId, setSelectedEngId] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [remarks, setRemarks] = useState<string>("");

  const currentSites = sites.filter((s) => s.engineerId === selectedEngId);
  const currentWorkers = workers.filter((w) => w.siteId === selectedSiteId);

  const handleAddAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId || !amount || !date || !selectedSiteId) return;

    try {
      await addAdvance({
        date,
        workerId: selectedWorkerId,
        siteId: selectedSiteId,
        amount: Number(amount),
        remarks: remarks.trim()
      });
      setAmount("");
      setRemarks("");
    } catch (err) {
      alert("Error adding advance");
    }
  };

  const handleUpdateRemarks = async (id: string, text: string) => {
    try {
      await updateAdvance(id, { remarks: text });
    } catch (err) {
      console.error("Error updating remarks:", err);
    }
  };

  const getWorkerName = (id: string) => workers.find(w => w.id === id)?.name || "Unknown";
  const getSiteName = (id: string) => sites.find(s => s.id === id)?.name || "Unknown";

  return (
    <div className="bg-transparent p-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Advance</h2>
        <p className="text-indigo-400 dark:text-indigo-400/60 text-xs font-semibold uppercase tracking-wider mt-0.5">Personnel payment records and advance entries</p>
      </div>

      {/* Form */}
      <div className="glass-card p-6 rounded-2xl mb-8 border border-indigo-50 dark:border-indigo-500/10 shadow-xl shadow-indigo-100/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />
        <form onSubmit={handleAddAdvance} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 relative z-10 items-end">
          <div className="space-y-2 xl:col-span-2">
            <label className="block min-h-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 pl-1">
              Archive Date
            </label>
            <input type="date" required className="h-14 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm cursor-pointer" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2 xl:col-span-2">
            <label className="block min-h-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 pl-1">
              Entity Type
            </label>
            <div className="flex gap-2 p-1.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-14 items-center">
              <button
                type="button"
                onClick={() => { setEngType("Engineer"); setSelectedEngId(""); setSelectedSiteId(""); setSelectedWorkerId(""); }}
                className={`flex-1 h-full rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${engType === "Engineer" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-indigo-600"}`}
              >
                Engineer
              </button>
              <button
                type="button"
                onClick={() => { setEngType("Contractor"); setSelectedEngId(""); setSelectedSiteId(""); setSelectedWorkerId(""); }}
                className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${engType === "Contractor" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-indigo-600"}`}
              >
                Contractor
              </button>
            </div>
          </div>

          <div className="space-y-2 xl:col-span-2">
            <label className="block min-h-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 pl-1">
              {engType}
            </label>
            <select required className="h-14 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-slate-900 dark:text-white font-black appearance-none focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all cursor-pointer shadow-sm" value={selectedEngId} onChange={(e) => { setSelectedEngId(e.target.value); setSelectedSiteId(""); setSelectedWorkerId(""); }}>
              <option value="" className="bg-white">-- Select --</option>
              {engineers.filter(e => e.type === engType || (!e.type && engType === "Engineer")).map(e => <option key={e.id} value={e.id} className="bg-white dark:bg-slate-900">{e.name}</option>)}
            </select>
          </div>

          <div className="space-y-2 xl:col-span-2">
            <label className="block min-h-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 pl-1">
              Regional Hub
            </label>
            <select required className="h-14 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-slate-900 dark:text-white font-black appearance-none focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all cursor-pointer shadow-sm disabled:opacity-30" value={selectedSiteId} onChange={(e) => { setSelectedSiteId(e.target.value); setSelectedWorkerId(""); }} disabled={!selectedEngId}>
              <option value="" className="bg-white">-- Select --</option>
              {currentSites.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900">{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2 xl:col-span-2">
            <label className="block min-h-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 pl-1">
              Personnel
            </label>
            <select required className="h-14 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-slate-900 dark:text-white font-black appearance-none focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all cursor-pointer shadow-sm disabled:opacity-30" value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)} disabled={!selectedSiteId}>
              <option value="" className="bg-white">-- Select --</option>
              {currentWorkers.map(w => <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900">{w.name}</option>)}
            </select>
          </div>

          <div className="space-y-2 xl:col-span-2">
            <label className="block min-h-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-rose-600 pl-1">
              Amount (₹)
            </label>
            <input type="number" min="1" required className="h-14 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 ring-rose-500/10 transition-all shadow-sm" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>

          <div className="space-y-2 xl:col-span-2">
            <label className="block min-h-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600/60 dark:text-indigo-400/60 pl-1">
              Memo
            </label>
            <div className="flex gap-2">
              <input type="text" placeholder="Note" className="h-14 w-full min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              <button type="submit" className="shrink-0 bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 text-2xl font-bold">+</button>
            </div>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-100 shadow-xl shadow-indigo-100/10">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-500/5">
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-100">Archive Date</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-100">Personnel</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-100">Regional Hub</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-rose-600 border-b border-slate-100 text-right bg-rose-500/5">Amount (₹)</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-100">Memo Upload</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-red-500 border-b border-slate-100 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {advances.slice().reverse().map((a) => (
                <tr key={a.id!} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-8 py-6 text-slate-600 dark:text-slate-400 text-sm font-black italic">{new Date(a.date).toLocaleDateString("en-GB")}</td>
                  <td className="px-8 py-6 font-black text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{getWorkerName(a.workerId)}</td>
                  <td className="px-8 py-6 text-slate-600 dark:text-slate-400 text-sm font-black uppercase tracking-tight">{getSiteName(a.siteId)}</td>
                  <td className="px-8 py-6 text-right font-black text-rose-600 bg-rose-500/5 dark:bg-rose-500/10 text-lg">₹{a.amount.toLocaleString("en-IN")}</td>
                  <td className="px-8 py-6">
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl p-2 text-sm text-slate-700 dark:text-slate-300 font-black focus:ring-2 ring-indigo-500/10 outline-none transition-all"
                      placeholder="Add memo..."
                      value={a.remarks || ""}
                      onChange={(e) => handleUpdateRemarks(a.id!, e.target.value)}
                    />
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button onClick={() => deleteAdvance(a.id!)} className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all mx-auto">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {advances.length === 0 && (
                <tr><td colSpan={6} className="px-8 py-10 text-center text-slate-400 font-black uppercase tracking-widest text-xs">No advances recorded in system registry.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvanceTab;

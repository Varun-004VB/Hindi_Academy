import React, { useState, useMemo } from "react";
import { useEngineerData } from "../../hooks/useEngineerData";
import { Transaction } from "../../types";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Calendar, User, Layout, CreditCard, Wallet, Trash2, Plus, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { apiService } from "../../lib/api";

// Helper components
const Pagination = ({ currentPage, totalPages, setCurrentPage }: { currentPage: number, totalPages: number, setCurrentPage: (p: number) => void }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/30">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const TransactionTab: React.FC = () => {
  const { engineers, sites, workers, transactions, addTransaction, deleteTransaction, duties, advances } = useEngineerData();

  const [type, setType] = useState<"Received" | "Paid">("Received");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [engType, setEngType] = useState<"Engineer" | "Contractor">("Engineer");
  const [selectedEngId, setSelectedEngId] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  // We will compute backendSiteTotal and backendGlobalPendingAmt via useMemo below
  const [remarks, setRemarks] = useState<string>("");
  const [backendPendingAmount, setBackendPendingAmount] = useState<number>(0);

  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  React.useEffect(() => {
    setSelectedWorkerId("");
    setPaidAmount("");
    setRemarks("");
  }, [selectedSiteId, type]);

  const { backendSiteTotal, backendGlobalPendingAmt } = useMemo(() => {
    if (type !== "Received" || !selectedSiteId || !date) {
      return { backendSiteTotal: 0, backendGlobalPendingAmt: 0 };
    }

    const start = new Date(date);
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      weekDates.push(formatDateLocal(d));
    }

    const siteWorkers = workers.filter((w) => w.siteId === selectedSiteId);
    
    // 1. Calculate Site Gross Total (Earnings for the week)
    const siteGrossTotal = siteWorkers.reduce((acc, w) => {
      const totalDuty = duties
        .filter((d) => d.workerId === w.id && weekDates.includes(d.date))
        .reduce((s, d) => s + d.dutyValue, 0);
      const rate = w.payoutRate ?? (w.selectedWage ?? 0);
      return acc + (totalDuty * rate);
    }, 0);

    // 2. Calculate Global Pending Amount for Site (Cumulative across all time)
    const totalSiteEarnings = siteWorkers.reduce((acc, w) => {
      const totalDuty = duties.filter(d => d.workerId === w.id).reduce((s, d) => s + d.dutyValue, 0);
      const rate = w.payoutRate ?? (w.selectedWage ?? 0);
      const totalAdvances = advances.filter(a => a.workerId === w.id).reduce((s, a) => s + a.amount, 0);
      return acc + (totalDuty * rate) - totalAdvances;
    }, 0);

    const totalSitePaid = transactions
      .filter(t => t.type === "Paid" && t.siteId === selectedSiteId)
      .reduce((sum, t) => sum + t.paidAmount, 0);

    const pendingGlobal = Math.max(0, totalSiteEarnings - totalSitePaid);

    return { backendSiteTotal: siteGrossTotal, backendGlobalPendingAmt: pendingGlobal };
  }, [selectedSiteId, type, date, duties, workers, transactions, advances]);

  React.useEffect(() => {
    if (type === "Paid" && selectedSiteId) {
      const formDate = new Date(date);
      const weekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const copy = new Date(formDate);
        copy.setDate(copy.getDate() + i);
        weekDates.push(formatDateLocal(copy));
      }

      const siteWorkers = workers.filter(w => w.siteId === selectedSiteId);
      const sitePayoutTotal = siteWorkers.reduce((acc, w) => {
        const totalDuty = duties.filter(d => d.workerId === w.id && weekDates.includes(d.date)).reduce((s, d) => s + d.dutyValue, 0);
        const rate = w.payoutRate || (w.selectedWage || 0);
        const totalAmount = totalDuty * rate;
        const advance = advances.filter(a => a.workerId === w.id && weekDates.includes(a.date)).reduce((s, a) => s + a.amount, 0);
        return acc + (totalAmount - advance);
      }, 0);

      void sitePayoutTotal;
    } else {
      // no-op
    }
  }, [selectedSiteId, date, type, duties, workers, advances]);

  React.useEffect(() => {
    if (type !== "Paid" || !selectedWorkerId) {
      setBackendPendingAmount(0);
      return;
    }

    const fetchWorkerBalance = async () => {
      try {
        // Fetch balance directly from backend via the hook's getWorkerPayout method
        const payout = await apiService.getWorkerPayout(selectedWorkerId);
        // The balance returned accounts for new_total_wages - advances - payments
        setBackendPendingAmount(payout.balance);
        
        // REQUIREMENT: Paying Amount input must always be EMPTY by default
        setPaidAmount("");
      } catch (err) {
        console.error("Error fetching worker balance:", err);
      }
    };

    fetchWorkerBalance();
  }, [selectedWorkerId, type, transactions.length]);

  const currentSites = sites.filter((s) => s.engineerId === selectedEngId);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEngId || !paidAmount || !date) return;

    if (type === "Paid" && !selectedWorkerId) return;
    if (type === "Received" && Number(paidAmount) > backendGlobalPendingAmt) {
      alert(`Backend Error: The server only has ₹${backendGlobalPendingAmt.toLocaleString("en-IN")} recorded as pending for this site. You cannot receive more than the recorded payout total. Please ensure all distributions are logged first.`);
      return;
    }

    if (type === "Received" && Number(paidAmount) > backendSiteTotal) {
      alert(`Error: Amount ₹${Number(paidAmount).toLocaleString("en-IN")} exceeds the Site Total value of ₹${backendSiteTotal.toLocaleString("en-IN")}.`);
      return;
    }

    // Only warn if pending > 0 and trying to overpay (skip if pending is 0 — might not have duties logged)
    if (type === "Paid" && backendPendingAmount > 0 && Number(paidAmount) > backendPendingAmount) {
      const ok = window.confirm(`Warning: Paying ₹${Number(paidAmount).toLocaleString("en-IN")} exceeds the calculated pending balance of ₹${backendPendingAmount.toLocaleString("en-IN")}. Continue anyway?`);
      if (!ok) return;
    }


    const computedBalance = type === "Received"
      ? backendSiteTotal - Number(paidAmount)
      : backendPendingAmount - Number(paidAmount);

    const newTx: Partial<Transaction> = {
      type,
      date,
      engineerId: selectedEngId,
      siteId: selectedSiteId || undefined,
      fullAmount: type === "Received" ? backendSiteTotal : undefined,
      totalAmount: type === "Paid" ? backendPendingAmount : undefined,
      paidAmount: Number(paidAmount),
      balanceAmount: computedBalance,
      workerId: type === "Paid" ? selectedWorkerId : undefined,
      remarks: remarks || undefined,
    };

    try {
      await addTransaction(newTx);
      setPaidAmount("");
      setRemarks("");
    } catch (error: any) {
      alert(`Error saving transaction: ${error.message || "Unknown error occurred"}`);
    }
  };

  const getEngineerName = (id?: string) => id ? (engineers.find(e => e.id === id)?.name || "Unknown") : "N/A";
  const getWorkerName = (id: string) => workers.find(w => w.id === id)?.name || "Unknown";
  const getSiteName = (id?: string) => id ? (sites.find(s => s.id === id)?.name || "Global") : "Global";

  // --- Table State for Payment Received ---
  const [searchRec, setSearchRec] = useState("");
  const [filterBranchRec, setFilterBranchRec] = useState("");
  const [sortRec, setSortRec] = useState<{ key: string, dir: "asc" | "desc" }>({ key: "date", dir: "desc" });
  const [pageRec, setPageRec] = useState(1);
  const rowsPerPage = 5;

  const receivedData = useMemo(() => {
    let data = transactions.filter(t => t.type === "Received").map(t => ({
      ...t,
      branchName: getSiteName(t.siteId),
      receivedFrom: t.personName || getEngineerName(t.engineerId),
    })) as (Transaction & { branchName: string; receivedFrom: string })[];

    if (searchRec) {
      const q = searchRec.toLowerCase();
      data = data.filter(d =>
        d.branchName.toLowerCase().includes(q) ||
        d.receivedFrom.toLowerCase().includes(q) ||
        (d.remarks && d.remarks.toLowerCase().includes(q))
      );
    }
    if (filterBranchRec) {
      data = data.filter(d => d.siteId === filterBranchRec);
    }

    data.sort((a, b) => {
      let valA = (a[sortRec.key as keyof typeof a] as any) ?? "";
      let valB = (b[sortRec.key as keyof typeof b] as any) ?? "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortRec.dir === "asc" ? -1 : 1;
      if (valA > valB) return sortRec.dir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [transactions, searchRec, filterBranchRec, sortRec, engineers, sites]);

  const paginatedRec = receivedData.slice((pageRec - 1) * rowsPerPage, pageRec * rowsPerPage);
  const totalPagesRec = Math.ceil(receivedData.length / rowsPerPage);
  const totalAmountRec = receivedData.reduce((sum, d) => sum + d.paidAmount, 0);

  const handleSortRec = (key: string) => {
    setSortRec(prev => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));
  };

  // --- Table State for Worker Payment ---
  const [searchPay, setSearchPay] = useState("");
  const [filterBranchPay, setFilterBranchPay] = useState("");
  const [sortPay, setSortPay] = useState<{ key: string, dir: "asc" | "desc" }>({ key: "date", dir: "desc" });
  const [pagePay, setPagePay] = useState(1);

  const paidData = useMemo(() => {
    let data = transactions.filter(t => t.type === "Paid").map(t => ({
      ...t,
      branchName: getSiteName(t.siteId),
      workerName: t.workerId ? getWorkerName(t.workerId) : "Unknown",
      workerSystemId: t.workerId ? `W-${t.workerId.slice(0, 4).toUpperCase()}` : "N/A",
    })) as (Transaction & { branchName: string; workerName: string; workerSystemId: string })[];

    if (searchPay) {
      const q = searchPay.toLowerCase();
      data = data.filter(d =>
        d.branchName.toLowerCase().includes(q) ||
        d.workerName.toLowerCase().includes(q) ||
        d.workerSystemId.toLowerCase().includes(q) ||
        (d.remarks && d.remarks.toLowerCase().includes(q))
      );
    }
    if (filterBranchPay) {
      data = data.filter(d => d.siteId === filterBranchPay);
    }

    data.sort((a, b) => {
      let valA = (a[sortPay.key as keyof typeof a] as any) ?? "";
      let valB = (b[sortPay.key as keyof typeof b] as any) ?? "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortPay.dir === "asc" ? -1 : 1;
      if (valA > valB) return sortPay.dir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [transactions, searchPay, filterBranchPay, sortPay, workers, sites]);

  const paginatedPay = paidData.slice((pagePay - 1) * rowsPerPage, pagePay * rowsPerPage);
  const totalPagesPay = Math.ceil(paidData.length / rowsPerPage);
  const totalAmountPay = paidData.reduce((sum, d) => sum + d.paidAmount, 0);

  const handleSortPay = (key: string) => {
    setSortPay(prev => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));
  };

  return (
    <div className="bg-transparent p-0 space-y-12">
      <div className="mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Transaction</h2>
          <p className="text-indigo-600/60 dark:text-indigo-400/60 text-xs font-semibold uppercase tracking-wider mt-1">Financial tracking and ledger records</p>
        </div>
      </div>

      {/* --- ENTRY FORM --- */}
      <div className="mb-10">
        <h3 className="font-black text-slate-500 text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
          <span>Create Ledger Entry</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/50" />
        </h3>

        {/* Type Selector Toggle */}
        <div className="flex p-1 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm w-full max-w-lg mb-6 overflow-hidden relative">
          <button
            onClick={() => setType("Received")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all relative z-10 ${type === "Received" ? "text-white" : "text-slate-400 hover:text-emerald-600"}`}
          >
            <ArrowDownLeft className={`w-4 h-4 ${type === "Received" ? "text-white" : "text-emerald-500"}`} />
            Payments Received
          </button>
          <button
            onClick={() => setType("Paid")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all relative z-10 ${type === "Paid" ? "text-white" : "text-slate-400 hover:text-rose-600"}`}
          >
            <ArrowUpRight className={`w-4 h-4 ${type === "Paid" ? "text-white" : "text-rose-500"}`} />
            Worker Payments
          </button>
          <motion.div
            animate={{ x: type === "Received" ? "0%" : "100%" }}
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl shadow-xl transition-colors duration-500 ${type === "Received" ? "bg-emerald-600 shadow-emerald-600/20" : "bg-rose-600 shadow-rose-600/20"}`}
          />
        </div>

        {/* Entry Form Card */}
        <div className={`glass-card p-6 rounded-2xl border border-indigo-50 dark:border-indigo-800/20 shadow-xl relative overflow-hidden transition-all duration-700 ${type === "Received" ? "shadow-emerald-100/10" : "shadow-rose-100/10"}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] -mr-32 -mt-32 transition-colors duration-700 ${type === "Received" ? "bg-emerald-500/5" : "bg-rose-500/5"}`} />

          <div className="mb-8 relative z-10 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-700 ${type === "Received" ? "bg-emerald-600 text-white shadow-emerald-600/20" : "bg-rose-600 text-white shadow-rose-600/20"}`}>
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{type === "Received" ? "Log Incoming Capital" : "Record Distribution"}</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">New system ledger entry</p>
            </div>
          </div>

          <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2"><Calendar className="w-3 h-3" /> Entry Date</label>
              <input type="date" required className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm cursor-pointer" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Entity Profile</label>
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
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2"><User className="w-3 h-3" /> Accountability</label>
              <select required className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black appearance-none focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all cursor-pointer shadow-sm" value={selectedEngId} onChange={(e) => { setSelectedEngId(e.target.value); setSelectedSiteId(""); }}>
                <option value="" className="bg-white dark:bg-slate-900">-- Select Account --</option>
                {engineers.filter(e => e.type === engType || (!e.type && engType === "Engineer")).map(e => <option key={e.id} value={e.id} className="bg-white dark:bg-slate-900">{e.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2"><Layout className="w-3 h-3" /> Regional Hub</label>
              <select required={type === "Received"} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black appearance-none focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all cursor-pointer shadow-sm disabled:opacity-30" value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)} disabled={!selectedEngId}>
                <option value="" className="bg-white dark:bg-slate-900">-- Select Location --</option>
                {currentSites.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900">{s.name}</option>)}
              </select>
            </div>

            {type === "Received" ? (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2"><CreditCard className="w-3 h-3" /> Total Distribution (₹)</label>
                  <div className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 text-indigo-600 dark:text-indigo-400 font-black text-center shadow-sm h-[60px] flex items-center justify-center">
                    ₹{backendSiteTotal.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="space-y-2 lg:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 ml-1 flex items-center gap-2">Actual Inflow (₹)</label>
                  <input type="number" min="0" required className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4 text-emerald-600 dark:text-emerald-400 font-black focus:outline-none focus:ring-2 ring-emerald-500/10 transition-all shadow-sm text-center text-xl" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Enter Amount" />
                </div>
                <div className="space-y-2 lg:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">Remarks</label>
                  <input type="text" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Note..." />
                </div>
                <div className="space-y-2 lg:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">Save Record</label>
                  <button type="submit" className="w-full bg-emerald-600 text-white h-[60px] rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 font-black uppercase tracking-widest text-sm">
                    <Plus className="w-6 h-6" />
                    <span>Add Entry</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2"><User className="w-3 h-3" /> Recipient Personnel</label>
                  <select required className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black appearance-none focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all cursor-pointer shadow-sm" value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)}>
                    <option value="" className="bg-white dark:bg-slate-900">-- Select Personnel --</option>
                    {workers.filter(w => !selectedSiteId || w.siteId === selectedSiteId).map(w => <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900">{w.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2 lg:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 ml-1 flex items-center gap-2">Total Paying Amount</label>
                  <div className="w-full bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4 text-indigo-600 dark:text-indigo-400 font-black text-center shadow-sm h-[60px] flex items-center justify-center">
                    ₹{selectedWorkerId ? backendPendingAmount.toLocaleString("en-IN") : "0"}
                  </div>
                </div>
                <div className="space-y-2 lg:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-rose-600 ml-1 flex items-center gap-2">Paying Amount (₹)</label>
                  <input type="number" min="1" required className="w-full bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-500/20 rounded-2xl p-4 text-rose-600 dark:text-rose-400 font-bold focus:outline-none focus:ring-2 ring-rose-500/10 transition-all shadow-sm text-center text-xl" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Enter Amount" />
                </div>
                <div className="space-y-2 lg:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 ml-1 flex items-center gap-2">Remaining Balance (₹)</label>
                  <div className={`w-full border rounded-2xl p-4 font-black text-center shadow-sm h-[60px] flex items-center justify-center ${
                    (backendPendingAmount - (Number(paidAmount) || 0)) < 0
                      ? "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400"
                      : "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}>
                    ₹{(backendPendingAmount - (Number(paidAmount) || 0)).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="space-y-2 lg:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">Remarks</label>
                  <input type="text" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Note..." />
                </div>
                <div className="space-y-2 lg:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">Save Record</label>
                  <button type="submit" className="w-full bg-rose-600 text-white h-[60px] rounded-2xl flex items-center justify-center gap-3 hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20 active:scale-95 font-black uppercase tracking-widest text-sm">
                    <Plus className="w-6 h-6" />
                    <span>Add Disbursement</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {type === "Received" && (
        <>
          {/* --- SECTION 1: PAYMENT RECEIVED TABLE --- */}
          <h3 className="font-black text-emerald-800 dark:text-emerald-400 text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
            <span>Section 1: Payment Received (Branch-wise)</span>
            <div className="flex-1 h-px bg-emerald-200 dark:bg-emerald-800/30" />
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden border border-emerald-100/50 dark:border-emerald-900/20 shadow-xl shadow-emerald-100/10 mb-12">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search branch, name, ID..."
                  value={searchRec}
                  onChange={(e) => { setSearchRec(e.target.value); setPageRec(1); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <div className="relative w-full md:w-64">
                <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={filterBranchRec}
                  onChange={(e) => { setFilterBranchRec(e.target.value); setPageRec(1); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 appearance-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                >
                  <option value="">All Branches</option>
                  {sites.map(s => <option key={`rec-` + s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-emerald-50/50 dark:bg-emerald-900/10">
                    {[{ key: "date", label: "Date" }, { key: "branchName", label: "Branch Name" }, { key: "receivedFrom", label: "Received From" }, { key: "fullAmount", label: "Total Distributions" }, { key: "paidAmount", label: "Actual Inflow" }, { key: "balanceAmount", label: "Balance" }, { key: "remarks", label: "Remarks" }].map((col) => (
                      <th key={col.key} onClick={() => col.key !== "remarks" && handleSortRec(col.key)} className={`px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-emerald-800 dark:text-emerald-400 border-b border-emerald-100 dark:border-emerald-800/30 ${col.key !== "remarks" ? "cursor-pointer hover:bg-emerald-100/50 dark:hover:bg-emerald-800/20" : ""} transition-colors ${["paidAmount", "fullAmount", "balanceAmount"].includes(col.key) ? "text-right" : ""}`}>
                        <div className={`flex items-center gap-2 ${["paidAmount", "fullAmount", "balanceAmount"].includes(col.key) ? "justify-end" : ""}`}>
                          {col.label}
                          {sortRec.key === col.key && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 border-b border-emerald-100 dark:border-emerald-800/30"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                  {paginatedRec.map(t => (
                    <tr key={t.id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-semibold">{new Date(t.date).toLocaleDateString("en-GB")}</td>
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-200 text-sm font-bold">{t.branchName}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm font-bold">{t.receivedFrom}</td>
                      <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 text-sm font-bold">₹{(t.fullAmount || 0).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 text-base font-black">₹{t.paidAmount.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-right text-amber-600 dark:text-amber-500 text-sm font-bold">₹{(t.balanceAmount || 0).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs truncate max-w-[150px]">{t.remarks || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => deleteTransaction(t.id!)} className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedRec.length === 0 && (
                    <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-xs">No Payment Received Records Found</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-emerald-600 text-white border-t border-emerald-700">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest">Total Selection Amount</td>
                    <td className="px-6 py-4 text-right text-xl font-black">₹{totalAmountRec.toLocaleString("en-IN")}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <Pagination currentPage={pageRec} totalPages={totalPagesRec} setCurrentPage={setPageRec} />
          </div>
        </>
      )}

      {type === "Paid" && (
        <>
          {/* --- SECTION 2: WORKER PAYMENT TABLE --- */}
          <h3 className="font-black text-rose-800 dark:text-rose-400 text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
            <span>Section 2: Worker Payment (Branch-wise)</span>
            <div className="flex-1 h-px bg-rose-200 dark:bg-rose-800/30" />
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden border border-rose-100/50 dark:border-rose-900/20 shadow-xl shadow-rose-100/10 mb-12">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search branch, worker name, ID..."
                  value={searchPay}
                  onChange={(e) => { setSearchPay(e.target.value); setPagePay(1); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 transition-all"
                />
              </div>
              <div className="relative w-full md:w-64">
                <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={filterBranchPay}
                  onChange={(e) => { setFilterBranchPay(e.target.value); setPagePay(1); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 appearance-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                >
                  <option value="">All Branches</option>
                  {sites.map(s => <option key={`pay-` + s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-rose-50/50 dark:bg-rose-900/10">
                    {[{ key: "date", label: "Date" }, { key: "branchName", label: "Branch Name" }, { key: "workerName", label: "Worker Name" }, { key: "workerSystemId", label: "Worker ID" }, { key: "paidAmount", label: "Amount" }, { key: "remarks", label: "Remarks" }].map((col) => (
                      <th key={col.key} onClick={() => col.key !== "remarks" && handleSortPay(col.key)} className={`px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-rose-800 dark:text-rose-400 border-b border-rose-100 dark:border-rose-800/30 ${col.key !== "remarks" ? "cursor-pointer hover:bg-rose-100/50 dark:hover:bg-rose-800/20" : ""} transition-colors ${col.key === "paidAmount" ? "text-right" : ""}`}>
                        <div className={`flex items-center gap-2 ${col.key === "paidAmount" ? "justify-end" : ""}`}>
                          {col.label}
                          {sortPay.key === col.key && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 border-b border-rose-100 dark:border-rose-800/30"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                  {paginatedPay.map(t => (
                    <tr key={t.id} className="group hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors">
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-semibold">{new Date(t.date).toLocaleDateString("en-GB")}</td>
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-200 text-sm font-bold">{t.branchName}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm font-bold">{t.workerName}</td>
                      <td className="px-6 py-4 pb-0 text-indigo-600 dark:text-indigo-400 text-xs font-black bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg inline-block my-2 mx-6 px-3 py-1">{t.workerSystemId}</td>
                      <td className="px-6 py-4 text-right text-rose-600 dark:text-rose-400 text-base font-black">₹{t.paidAmount.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs truncate max-w-[150px]">{t.remarks || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => deleteTransaction(t.id!)} className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedPay.length === 0 && (
                    <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-xs">No Worker Payment Records Found</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-rose-600 text-white border-t border-rose-700">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest">Total Selection Amount</td>
                    <td className="px-6 py-4 text-right text-xl font-black">₹{totalAmountPay.toLocaleString("en-IN")}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <Pagination currentPage={pagePay} totalPages={totalPagesPay} setCurrentPage={setPagePay} />
          </div>
        </>
      )}

    </div>
  );
};

export default TransactionTab;
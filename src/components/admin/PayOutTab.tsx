import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useEngineerData } from "../../hooks/useEngineerData";
import { generateProfessionalPDF, shareToWhatsApp } from "../../lib/pdfReportGenerator";
import { Search, Filter, Download, MessageSquare, Calculator, Trash2 } from "lucide-react";

const RateInput = ({ worker, currentRate, handleRateChange }: { worker: any, currentRate: number, handleRateChange: (id: string, val: string) => void }) => {
  const [val, setVal] = useState(currentRate === 0 ? "" : currentRate.toString());

  useEffect(() => {
    setVal(currentRate === 0 ? "" : currentRate.toString());
  }, [currentRate]);

  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="text-slate-400 text-xs font-medium">₹</span>
      <input
        type="number"
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          handleRateChange(worker.id, e.target.value);
        }}
        className="w-24 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-lg p-2 text-center text-sm text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all shadow-sm"
        placeholder={(worker.selectedWage ?? 0).toString()}
      />
    </div>
  );
};

const PayOutTab: React.FC = () => {
  const { engineers, sites, workers, duties, advances, payouts, addPayout, deletePayout } = useEngineerData();

  const [engType, setEngType] = useState<"Engineer" | "Contractor">("Engineer");
  const [selectedEngId, setSelectedEngId] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [editedWages, setEditedWages] = useState<Record<string, number>>({});

  const filteredEngineers = engineers.filter(e => e.type === engType || (!e.type && engType === "Engineer"));
  const currentSites = sites.filter((s) => s.engineerId === selectedEngId);
  const currentWorkers = workers.filter((w) => w.siteId === selectedSiteId);

  const weekDates = React.useMemo(() => {
    if (!startDate) return [];
    const start = new Date(startDate);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  }, [startDate]);

  const getWorkerTotalDuty = (workerId: string) => {
    return duties
      .filter((d) => d.workerId === workerId && d.siteId === selectedSiteId && weekDates.includes(d.date))
      .reduce((sum, d) => sum + d.dutyValue, 0);
  };

  const getWorkerAdvance = (workerId: string) => {
    return advances
      .filter((a) => a.workerId === workerId && a.siteId === selectedSiteId && weekDates.includes(a.date))
      .reduce((sum, a) => sum + a.amount, 0);
  };

  const displayWorkers = (selectedSiteId ? currentWorkers : workers.filter(w => !selectedEngId || sites.find(s => s.id === w.siteId)?.engineerId === selectedEngId));

  const totals = displayWorkers.reduce((acc, w) => {
    const totalDuty = getWorkerTotalDuty(w.id);
    const rate = editedWages[w.id] !== undefined ? editedWages[w.id] : (w.selectedWage ?? 0);
    const amount = totalDuty * rate;
    const advance = getWorkerAdvance(w.id);
    const balance = amount - advance;

    return {
      duty: acc.duty + totalDuty,
      amount: acc.amount + amount,
      advance: acc.advance + advance,
      balance: acc.balance + balance
    };
  }, { duty: 0, amount: 0, advance: 0, balance: 0 });

  const { duty: totalDutySum, amount: totalAmountSum, advance: totalAdvanceSum, balance: totalBalanceSum } = totals;

  const handlePrintPDF = () => {
    const data = {
      title: "Pay Out Statement",
      engineer: selectedEngId ? engineers.find(e => e.id === selectedEngId)?.name : "All Engineers",
      site: selectedSiteId ? sites.find(s => s.id === selectedSiteId)?.name : "All Sites",
      period: startDate ? `${new Date(startDate).toLocaleDateString("en-GB")} - ${new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 6)).toLocaleDateString("en-GB")}` : "All Time",
      tableHead: [["WORKER NAME", "DUTY COUNT", "PER DUTY AMOUNT (₹)", "TOTAL AMOUNT (₹)", "ADVANCE (₹)", "BALANCE AMOUNT (₹)"]],
      tableBody: (selectedSiteId ? currentWorkers : workers.filter(w => !selectedEngId || sites.find(s => s.id === w.siteId)?.engineerId === selectedEngId)).map(w => {
        const totalDuty = getWorkerTotalDuty(w.id);
        const rate = editedWages[w.id] !== undefined ? editedWages[w.id] : (w.selectedWage ?? 0);
        const amount = totalDuty * rate;
        const advance = getWorkerAdvance(w.id);
        const balance = amount - advance;
        return [
          w.name.toUpperCase(),
          totalDuty,
          rate.toLocaleString("en-IN"),
          amount.toLocaleString("en-IN"),
          advance.toLocaleString("en-IN"),
          balance.toLocaleString("en-IN")
        ];
      }),
      tableFooter: ["GRAND TOTAL", totalDutySum, "", totalAmountSum.toLocaleString("en-IN"), totalAdvanceSum.toLocaleString("en-IN"), totalBalanceSum.toLocaleString("en-IN")]
    };
    const doc = generateProfessionalPDF(data);
    doc.save(`PayOut_Statement_${data.site}_${data.period}.pdf`);
  };

  const handleShareWhatsApp = async () => {
    const data = {
      title: "Pay Out Statement",
      engineer: selectedEngId ? engineers.find(e => e.id === selectedEngId)?.name : "All Engineers",
      site: selectedSiteId ? sites.find(s => s.id === selectedSiteId)?.name : "All Sites",
      period: startDate ? `${new Date(startDate).toLocaleDateString("en-GB")} - ${new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 6)).toLocaleDateString("en-GB")}` : "All Time",
      tableHead: [["WORKER NAME", "DUTY COUNT", "PER DUTY AMOUNT (₹)", "TOTAL AMOUNT (₹)", "ADVANCE (₹)", "BALANCE AMOUNT (₹)"]],
      tableBody: (selectedSiteId ? currentWorkers : workers.filter(w => !selectedEngId || sites.find(s => s.id === w.siteId)?.engineerId === selectedEngId)).map(w => {
        const totalDuty = getWorkerTotalDuty(w.id);
        const rate = editedWages[w.id] !== undefined ? editedWages[w.id] : (w.selectedWage ?? 0);
        const amount = totalDuty * rate;
        const advance = getWorkerAdvance(w.id);
        const balance = amount - advance;
        return [
          w.name.toUpperCase(),
          totalDuty,
          rate.toLocaleString("en-IN"),
          amount.toLocaleString("en-IN"),
          advance.toLocaleString("en-IN"),
          balance.toLocaleString("en-IN")
        ];
      }),
      tableFooter: ["GRAND TOTAL", totalDutySum, "", totalAmountSum.toLocaleString("en-IN"), totalAdvanceSum.toLocaleString("en-IN"), totalBalanceSum.toLocaleString("en-IN")]
    };
    const doc = generateProfessionalPDF(data);
    const summary = `Pay Out Statement: ${data.site}\nPeriod: ${data.period}\nTotal Workers: ${(selectedSiteId ? currentWorkers : workers.filter(w => !selectedEngId || sites.find(s => s.id === w.siteId)?.engineerId === selectedEngId)).length}\nTotal Payout: ₹${totalBalanceSum.toLocaleString("en-IN")}`;
    await shareToWhatsApp(doc, `PayOut_Statement_${data.site}`, summary);
  };

  const handleRateChange = (workerId: string, newRate: string) => {
    const rate = newRate === "" ? 0 : parseFloat(newRate);
    setEditedWages(prev => ({ ...prev, [workerId]: rate }));
  };

  const handleSubmitPayout = async () => {
    if (!selectedSiteId) {
      alert("Please select a site first.");
      return;
    }

    const currentDisplayWorkers = (selectedSiteId ? currentWorkers : workers.filter(w => !selectedEngId || sites.find(s => s.id === w.siteId)?.engineerId === selectedEngId));

    if (currentDisplayWorkers.length === 0) {
      alert("No workers found for the current selection.");
      return;
    }

    const engineer = selectedEngId ? engineers.find(e => e.id === selectedEngId) : null;
    const role = engType.toLowerCase();
    const personName = engineer?.name || "General";

    try {
      let totalBalances = 0;
      const payoutData: { worker: any; totalDuty: number; rate: number; balance: number }[] = [];

      currentDisplayWorkers.forEach(w => {
        const totalDuty = getWorkerTotalDuty(w.id);
        const rate = editedWages[w.id] !== undefined ? editedWages[w.id] : (w.selectedWage ?? 0);
        const amount = totalDuty * rate;
        const advance = getWorkerAdvance(w.id);
        const balance = amount - advance;

        if (balance > 0) {
          totalBalances += balance;
          payoutData.push({ worker: w, totalDuty, rate, balance });
        }
      });

      if (totalBalances <= 0) {
        alert("No positive balance to payout for selected workers.");
        return;
      }

      const confirmSubmit = window.confirm(`Are you sure you want to submit payouts totalling ₹${totalBalances.toLocaleString("en-IN")} for ${payoutData.length} workers?`);
      if (!confirmSubmit) return;

      const promises = payoutData.map(p =>
        addPayout({
          role: role,
          person_name: personName,
          site: Number(selectedSiteId),
          worker: Number(p.worker.id),
          total_duty: p.totalDuty,
          new_amount: p.rate
        })
      );

      await Promise.all(promises);
      alert("Payouts submitted successfully to server!");
      setEditedWages({});
    } catch (err) {
      console.error("Payout submission error:", err);
      alert("Error submitting payouts. Please try again.");
    }
  };

  const handleDeletePayout = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this payout record?")) return;
    try {
      await deletePayout(id);
    } catch (err) {
      alert("Failed to delete payout");
    }
  };

  return (
    <div className="bg-transparent p-0 print:p-0 print:border-none print:shadow-none">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Payout</h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5">Weekly closures and settlement calculations</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white dark:bg-slate-900/60 p-5 rounded-xl mb-6 border border-slate-200/70 dark:border-slate-700/40 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-t-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Entity Type Toggle */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-0.5">Entity Type</label>
            <div className="flex gap-1.5 p-1 bg-slate-100/70 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/40">
              <button
                onClick={() => { setEngType("Engineer"); setSelectedEngId(""); setSelectedSiteId(""); }}
                className={`flex-1 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${engType === "Engineer"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-400 hover:text-indigo-600"
                  }`}
              >
                Engineer
              </button>
              <button
                onClick={() => { setEngType("Contractor"); setSelectedEngId(""); setSelectedSiteId(""); }}
                className={`flex-1 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${engType === "Contractor"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-400 hover:text-indigo-600"
                  }`}
              >
                Contractor
              </button>
            </div>
          </div>

          {/* Select Engineer */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-0.5">Select {engType}</label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer"
                value={selectedEngId}
                onChange={(e) => { setSelectedEngId(e.target.value); setSelectedSiteId(""); }}
              >
                <option value="">All {engType}s</option>
                {filteredEngineers.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Select Site */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-0.5">Assigned Site</label>
            <div className="relative">
              <select
                className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer ${!selectedEngId ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                disabled={!selectedEngId}
              >
                <option value="">All Sites</option>
                {currentSites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-0.5">Week Start Date</label>
            <input
              type="date"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Payout Table ── */}
      <div className="bg-white dark:bg-slate-900/60 rounded-xl overflow-hidden border border-slate-200/70 dark:border-slate-700/40 shadow-md mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200/70 dark:border-slate-700/50">
                {/* Col 1: Worker Name */}
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Worker Name
                </th>
                {/* Col 2: Duty Count */}
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 text-center bg-indigo-50/60 dark:bg-indigo-500/10">
                  Duty Count
                </th>
                {/* Col 3: Per Duty Amount */}
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">
                  Per Duty Amount
                </th>
                {/* Col 4: Total Amount */}
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">
                  Total Amount
                </th>
                {/* Col 5: Advance */}
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-rose-500 dark:text-rose-400 text-right bg-rose-50/60 dark:bg-rose-500/10">
                  Advance
                </th>
                {/* Col 6: Balance Amount */}
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 text-right bg-emerald-50/60 dark:bg-emerald-500/10">
                  Balance Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {(selectedSiteId ? currentWorkers : workers.filter(w => !selectedEngId || sites.find(s => s.id === w.siteId)?.engineerId === selectedEngId)).map((w, idx) => {
                const totalDuty = getWorkerTotalDuty(w.id);
                const rate = w.selectedWage ?? 0;
                const amount = totalDuty * rate;
                const advance = getWorkerAdvance(w.id);
                const balance = amount - advance;


                return (
                  <tr
                    key={w.id}
                    className={`group transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5 ${idx % 2 === 1 ? 'bg-slate-50/40 dark:bg-slate-800/20' : ''
                      }`}
                  >
                    {/* Col 1: Worker Name */}
                    <td className="px-6 py-4 font-semibold text-sm text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {w.name}
                    </td>
                    {/* Col 2: Duty Count */}
                    <td className="px-6 py-4 text-center font-bold text-indigo-600 dark:text-indigo-400 text-base bg-indigo-50/40 dark:bg-indigo-500/5">
                      {totalDuty}
                    </td>
                    {/* Col 3: Per Duty Amount */}
                    <td className="px-6 py-4">
                      <RateInput 
                        worker={w} 
                        currentRate={editedWages[w.id] !== undefined ? editedWages[w.id] : (w.selectedWage ?? 0)}
                        handleRateChange={handleRateChange} 
                      />
                    </td>
                    {/* Col 4: Total Amount = Duty Count × Per Duty Amount */}
                    <td className="px-6 py-4 text-right font-semibold text-sm text-slate-700 dark:text-slate-300">
                      ₹{amount.toLocaleString("en-IN")}
                    </td>
                    {/* Col 5: Advance */}
                    <td className="px-6 py-4 text-right font-semibold text-sm text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-500/5">
                      ₹{advance.toLocaleString("en-IN")}
                    </td>
                    {/* Col 6: Balance Amount = Total Amount − Advance */}
                    <td className="px-6 py-4 text-right font-bold text-base text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-500/5">
                      ₹{balance.toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* ── Footer Totals ── */}
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/30 border-t-2 border-slate-200 dark:border-slate-700/50">
                {/* Label */}
                <td className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Total
                </td>
                {/* Total Duty Count */}
                <td className="px-6 py-5 text-center border-l border-slate-200 dark:border-slate-700/50 bg-indigo-50/50 dark:bg-indigo-500/10">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{totalDutySum}</span>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Duty Units</p>
                </td>
                {/* Per Duty Amount — blank (not summable) */}
                <td className="px-6 py-5 border-l border-slate-200 dark:border-slate-700/50">
                </td>
                {/* Total Amount */}
                <td className="px-6 py-5 text-right border-l border-slate-200 dark:border-slate-700/50">
                  <span className="text-lg font-bold text-slate-800 dark:text-white">₹{totalAmountSum.toLocaleString("en-IN")}</span>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Total Amount</p>
                </td>
                {/* Total Advance */}
                <td className="px-6 py-5 text-right border-l border-slate-200 dark:border-slate-700/50 bg-rose-50/50 dark:bg-rose-500/10">
                  <span className="text-lg font-bold text-rose-600 dark:text-rose-400">₹{totalAdvanceSum.toLocaleString("en-IN")}</span>
                  <p className="text-[9px] text-rose-500 uppercase tracking-wider mt-0.5">Advance Total</p>
                </td>
                {/* Net Balance Amount */}
                <td className="px-6 py-5 text-right border-l border-slate-200 dark:border-slate-700/50 bg-emerald-50/50 dark:bg-emerald-500/10">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{totalBalanceSum.toLocaleString("en-IN")}</span>
                  <p className="text-[9px] text-emerald-600 uppercase tracking-wider mt-0.5">Balance Total</p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Submit Payout Button ── */}
      <div className="flex justify-end mt-8 print:hidden">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmitPayout}
          className="group relative bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/25 overflow-hidden transition-all"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Calculator className="w-5 h-5" />
            Finalize Weekly Settlement
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </motion.button>
      </div>

      {/* ── Payout Records (Ledger) ── */}
      <div className="mt-12 bg-white dark:bg-slate-900/60 rounded-xl overflow-hidden border border-slate-200/70 dark:border-slate-700/40 shadow-md">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-tight">Settlement Records</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest mt-0.5">Historical payout logs from backend</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
               {payouts.length} Records
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Worker</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Site ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center text-slate-400">Duty</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center text-slate-400">Per Duty Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right text-slate-400">Total Wages</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right text-slate-400">Pending</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
              {payouts.length === 0 ? (
                <tr>
                   <td colSpan={8} className="px-6 py-10 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">No settlement records found on server.</td>
                </tr>
              ) : (
                payouts.slice().reverse().map((p: any) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-slate-700 dark:text-slate-200">{p.person_name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {p.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">Site {p.site}</td>
                    <td className="px-6 py-4 text-center font-bold text-indigo-600">{p.total_duty}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-200">₹{p.new_amount}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">₹{p.new_total_wages || (p.total_duty * p.new_amount)}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-bold">₹{p.pending_amount || 0}</td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleDeletePayout(p.id)} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-400 hover:text-rose-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayOutTab;
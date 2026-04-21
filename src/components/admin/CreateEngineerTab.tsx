import React, { useState, useMemo } from "react";
import { useEngineerData } from "../../hooks/useEngineerData";
import { generateProfessionalPDF, shareToWhatsApp } from "../../lib/pdfReportGenerator";
import { Users, UserCheck, UserX, Tags, Search, Briefcase, Plus, Filter, Printer, Share2 } from "lucide-react";

const CreateEngineerTab: React.FC = () => {
  const {
    engineers,
    sites,
    workers,
    workerDatabase,
    addEngineer,
    addSite,
    addWorker,
    deleteEngineer,
    deleteSite,
    deleteWorker,
    duties,
    workerCategories,
    saveWeeklyDuties
  } = useEngineerData();

  // Selected values
  const [selectedEngId, setSelectedEngId] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [searchWorker, setSearchWorker] = useState<string>("");

  // Forms
  const [engForm, setEngForm] = useState("");
  const [engTypeForm, setEngTypeForm] = useState<"Engineer" | "Contractor">("Engineer");
  const [siteForm, setSiteForm] = useState("");
  const [siteAmountForm, setSiteAmountForm] = useState("");
  const [workerForm, setWorkerForm] = useState({ name: "", category: "", wagePerDuty: "" as unknown as number });

  React.useEffect(() => {
    if (workerCategories.length > 0 && !workerForm.category) {
      const defaultCat = workerCategories[0];
      setWorkerForm(prev => ({
        ...prev,
        category: defaultCat.id,
        wagePerDuty: 0
      }));
    }
  }, [workerCategories]);

  // Grid
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [draftDuties, setDraftDuties] = useState<Record<string, number>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  React.useEffect(() => {
    const newDraft: Record<string, number> = {};
    duties.forEach(d => {
      newDraft[`${d.workerId}_${d.date}`] = d.dutyValue;
    });
    setDraftDuties(newDraft);
    setHasUnsavedChanges(false);
  }, [duties]);

  // Helper date generators
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const generate7Days = (start: string) => {
    if (!start) return [];
    const dates = [];
    const d = new Date(start);
    for (let i = 0; i < 7; i++) {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + i);
      dates.push(formatDateLocal(copy));
    }
    return dates;
  };

  const days = useMemo(() => generate7Days(startDate), [startDate]);
  // Use a set so totals are calculated strictly for the selected 7-day week range.
  const weekDateSet = useMemo(() => new Set(days), [days]);

  // Derived state
  const currentSites = sites.filter((s) => s.engineerId === selectedEngId);
  const currentWorkers = workers.filter((w) => w.siteId === selectedSiteId);

  // Handlers
  const handleAddEngineer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!engForm.trim()) return;
    try {
      const newEng = await addEngineer({ name: engForm, type: engTypeForm });
      setSelectedEngId(newEng.id!);
      setEngForm("");
    } catch (err) {
      alert("Error adding engineer");
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteForm.trim() || !selectedEngId) return;
    try {
      const newSite = await addSite({
        engineerId: selectedEngId,
        name: siteForm,
        fullAmount: parseFloat(siteAmountForm) || 0
      });
      setSelectedSiteId(newSite.id!);
      setSiteForm("");
      setSiteAmountForm("");
    } catch (err) {
      alert("Error adding site");
    }
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerForm.name.trim() || !selectedSiteId || !workerForm.category) {
      alert("Please select a valid site and category");
      return;
    }
    try {
      await addWorker({
        name: workerForm.name,
        selectedWage: workerForm.wagePerDuty,
        siteId: selectedSiteId,
        category: workerForm.category
      });
      setWorkerForm(prev => {
        return {
          ...prev,
          name: "",
          wagePerDuty: 0
        };
      });
    } catch (err: any) {
      console.error(err.response?.data);
      alert("Error adding worker: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  const handleDraftDutyChange = (workerId: string, date: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setDraftDuties(prev => ({
      ...prev,
      [`${workerId}_${date}`]: numValue
    }));
    setHasUnsavedChanges(true);
  };

  const handleSubmitDuties = async () => {
    try {
      const promises: Promise<any>[] = [];
      const hasDays = days.length === 7;
      if (!hasDays || !selectedSiteId) return;

      currentWorkers.forEach(w => {
        let hasDuty = false;
        const daysData = days.map(d => {
          const val = draftDuties[`${w.id}_${d}`] || 0;
          if (val > 0) hasDuty = true;
          return val;
        });

        const hadPreviousDuty = days.some(d => duties.find(duty => duty.workerId === w.id && duty.date === d && duty.dutyValue > 0));

        // Save if they have duties assigned or if we are zeroing out previously set duties
        if (hasDuty || hadPreviousDuty) {
          promises.push(saveWeeklyDuties(selectedSiteId, w.id!, startDate, daysData));
        }
      });

      if (promises.length === 0) {
        alert("No attendances to save");
        return;
      }

      await Promise.all(promises);
      setHasUnsavedChanges(false);
      alert("Duties saved successfully!");
    } catch (err) {
      alert("Error saving duties");
    }
  };

  const getDutyValue = (workerId: string, date: string) => {
    return draftDuties[`${workerId}_${date}`] || 0;
  };

  const getWorkerTotalDuty = (workerId: string) => {
    return duties
      .filter((d) => d.workerId === workerId && weekDateSet.has(d.date))
      .reduce((sum, d) => sum + d.dutyValue, 0);
  };

  const totalAllDuty = currentWorkers.reduce((acc, w) => acc + getWorkerTotalDuty(w.id!), 0);
  const totalAllAmount = currentWorkers.reduce((acc, w) => acc + (getWorkerTotalDuty(w.id!) * (w.selectedWage || 0)), 0);

  const handlePrintPDF = () => {
    const data = {
      title: "Weekly Manpower Report",
      engineer: engineers.find(e => e.id === selectedEngId)?.name,
      site: sites.find(s => s.id === selectedSiteId)?.name,
      period: startDate ? `${new Date(startDate).toLocaleDateString("en-GB")} TO ${new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 6)).toLocaleDateString("en-GB")}` : "-",
      totalWorkers: currentWorkers.length,
      tableHead: [["WORKER", "CATEGORY", ...days.map(d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })), "TOTAL DUTY", "AMOUNT (₹)"]],
      tableBody: currentWorkers.map(w => [
        w.name.toUpperCase(),
        w.category,
        ...days.map(date => getDutyValue(w.id!, date) || "-"),
        getWorkerTotalDuty(w.id!),
        (getWorkerTotalDuty(w.id!) * (w.selectedWage || 0)).toLocaleString("en-IN")
      ]),
      tableFooter: ["TOTAL", "", ...Array(7).fill(""), totalAllDuty, totalAllAmount.toLocaleString("en-IN")]
    };
    const doc = generateProfessionalPDF(data);
    doc.save(`Weekly_Manpower_Report_${data.site}_${data.period}.pdf`);
  };

  const handleShareWhatsApp = async () => {
    const data = {
      title: "Weekly Manpower Report",
      engineer: engineers.find(e => e.id === selectedEngId)?.name,
      site: sites.find(s => s.id === selectedSiteId)?.name,
      period: startDate ? `${new Date(startDate).toLocaleDateString("en-GB")} TO ${new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 6)).toLocaleDateString("en-GB")}` : "-",
      totalWorkers: currentWorkers.length,
      tableHead: [["WORKER", "CATEGORY", ...days.map(d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })), "TOTAL DUTY", "AMOUNT (₹)"]],
      tableBody: currentWorkers.map(w => [
        w.name.toUpperCase(),
        w.category,
        ...days.map(date => getDutyValue(w.id!, date) || "-"),
        getWorkerTotalDuty(w.id!),
        (getWorkerTotalDuty(w.id!) * (w.selectedWage || 0)).toLocaleString("en-IN")
      ]),
      tableFooter: ["TOTAL", "", ...Array(7).fill(""), totalAllDuty, totalAllAmount.toLocaleString("en-IN")]
    };
    const doc = generateProfessionalPDF(data);
    const summary = `Manpower Report: ${data.site}\nPeriod: ${data.period}\nTotal Workers: ${data.totalWorkers}\nGrand Total: ₹${totalAllAmount.toLocaleString("en-IN")}`;
    await shareToWhatsApp(doc, `Manpower_Report_${data.site}`, summary);
  };

  // Delete Handlers
  const handleDeleteEngineer = async (id: string) => {
    if (!window.confirm("Delete this engineer? This will also remove their sites and workers.")) return;
    await deleteEngineer(id);
    if (selectedEngId === id) {
      setSelectedEngId("");
      setSelectedSiteId("");
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!window.confirm("Delete this site? This will also remove its workers.")) return;
    await deleteSite(id);
    if (selectedSiteId === id) {
      setSelectedSiteId("");
    }
  };

  const handleDeleteWorker = async (id: string) => {
    if (!window.confirm("Delete this worker? History will be lost.")) return;
    await deleteWorker(id);
  };

  return (
    <div className="bg-transparent rounded-2xl p-0 print:p-0">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 print:hidden gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Manpower Attendance</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Register entities, sites, and track daily workforce attendance in one place.</p>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 print:hidden">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-indigo-100/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-16 h-16 text-indigo-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Total Workers</h3>
            </div>
            <p className="text-3xl font-black text-slate-800 mt-2">{workerDatabase.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-indigo-100/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <UserCheck className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Active Workers</h3>
            </div>
            <p className="text-3xl font-black text-slate-800 mt-2">{workerDatabase.filter(w => w.status === "Active").length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-indigo-100/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <UserX className="w-16 h-16 text-rose-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-50 rounded-lg">
                <UserX className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Inactive Workers</h3>
            </div>
            <p className="text-3xl font-black text-slate-800 mt-2">{workerDatabase.filter(w => w.status === "Inactive").length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-indigo-100/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Tags className="w-16 h-16 text-amber-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Tags className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Categories</h3>
            </div>
            <p className="text-3xl font-black text-slate-800 mt-2">{workerCategories.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:hidden">
        {/* Step 1: Engineers / Contractors */}
        <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl relative overflow-hidden group border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-t-2xl opacity-80" />
          <h3 className="font-bold text-[11px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black shadow-sm">1</span>
            Registration Basis
          </h3>
          <div className="flex gap-4 mb-6 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <button onClick={() => { setEngTypeForm("Engineer"); setSelectedEngId(""); }} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${engTypeForm === "Engineer" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" : "text-slate-500"}`}>Engineer</button>
            <button onClick={() => { setEngTypeForm("Contractor"); setSelectedEngId(""); }} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${engTypeForm === "Contractor" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" : "text-slate-500"}`}>Contractor</button>
          </div>
          <form onSubmit={handleAddEngineer} className="flex gap-2.5 mb-6">
            <input className="flex-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all font-semibold shadow-sm" placeholder={`Type ${engTypeForm} Name`} value={engForm} onChange={(e) => setEngForm(e.target.value)} />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md shadow-indigo-600/20 active:scale-95 text-xl font-bold flex-shrink-0 group"><Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /></button>
          </form>
          <div className="relative">
            <select
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 pl-4 pr-10 text-sm text-slate-800 dark:text-white font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              value={selectedEngId}
              onChange={e => { setSelectedEngId(e.target.value); setSelectedSiteId(""); }}
            >
              <option value="" className="bg-white dark:bg-slate-800">-- Select Entity --</option>
              {engineers.filter(e => e.type === engTypeForm || (!e.type && engTypeForm === "Engineer")).map(e => <option key={e.id} value={e.id} className="bg-white dark:bg-slate-800 font-medium">{e.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
          </div>
        </div>

        {/* Step 2: Sites */}
        <div className={`bg-white dark:bg-slate-900/60 p-6 rounded-2xl relative overflow-hidden group border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-500 ${!selectedEngId ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-violet-600 rounded-t-2xl opacity-80" />
          <h3 className="font-bold text-[11px] uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-6 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center text-[10px] font-black shadow-sm">2</span>
            Site Location
          </h3>
          <form onSubmit={handleAddSite} className="flex flex-col gap-3 mb-6">
            <div className="flex gap-2.5">
              <input className="flex-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all font-semibold shadow-sm" placeholder="Site Name" value={siteForm} onChange={(e) => setSiteForm(e.target.value)} />
            </div>
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</span>
                <input type="number" className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 pl-8 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all font-semibold shadow-sm" placeholder="Budget (Optional)" value={siteAmountForm} onChange={(e) => setSiteAmountForm(e.target.value)} />
              </div>
              <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md shadow-violet-600/20 active:scale-95 text-xl font-bold flex-shrink-0 group"><Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /></button>
            </div>
          </form>
          <div className="relative">
            <select
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 pl-4 pr-10 text-sm text-slate-800 dark:text-white font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              value={selectedSiteId}
              onChange={e => setSelectedSiteId(e.target.value)}
            >
              <option value="" className="bg-white dark:bg-slate-800">-- Select Site --</option>
              {currentSites.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-800 font-medium">{s.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
          </div>
        </div>

        {/* Step 3: Workers */}
        <div className={`bg-white dark:bg-slate-900/60 p-6 rounded-2xl relative overflow-hidden group border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-500 ${!selectedSiteId ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl opacity-80" />
          <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-black shadow-sm">3</span>
            Assign Personnel
          </h3>
          <form onSubmit={handleAddWorker} className="flex flex-col gap-3">
            <input className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all font-semibold shadow-sm" placeholder="Personnel Name" value={workerForm.name} onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })} />

            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <select
                  className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 pl-4 pr-8 text-sm text-slate-800 dark:text-white font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all cursor-pointer shadow-sm"
                  value={workerForm.category}
                  onChange={(e) => {
                    const catId = e.target.value;
                    const catName = workerCategories.find(c => c.id === catId)?.name.toLowerCase() || "";
                    const isMason = catName === "mason";
                    setWorkerForm({
                      ...workerForm,
                      category: catId,
                      wagePerDuty: isMason ? 900 : 700
                    });
                  }}
                >
                  <option value="" disabled className="bg-white dark:bg-slate-800">-- Category --</option>
                  {workerCategories.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800">{c.name}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-[10px]">▼</div>
              </div>

              <div className="flex-1 right-0 relative flex items-center">
                <input
                  type="number"
                  className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all font-semibold shadow-sm text-center"
                  placeholder="Wage"
                  value={workerForm.wagePerDuty === 0 ? "" : workerForm.wagePerDuty}
                  onChange={(e) => setWorkerForm({ ...workerForm, wagePerDuty: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md shadow-blue-600/20 active:scale-95 text-xl font-bold flex-shrink-0 group"><Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /></button>
            </div>
          </form>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:hidden">
        {/* Engineers */}
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[350px]">
          <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-4 flex justify-between items-center">
            Registered Entities
            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-100">{engineers.filter(e => e.type === engTypeForm || (!e.type && engTypeForm === "Engineer")).length}</span>
          </h3>
          <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {engineers.filter(e => e.type === engTypeForm || (!e.type && engTypeForm === "Engineer")).map(e => (
                  <tr key={e.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-2 font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors uppercase flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {e.name}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button onClick={() => handleDeleteEngineer(e.id!)} className="text-slate-300 hover:text-rose-500 transition-colors">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sites */}
        <div className={`bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[350px] transition-all ${!selectedEngId ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
          <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-4 flex justify-between items-center">
            Active Hubs
            <span className="px-2 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-md border border-violet-100">{currentSites.length}</span>
          </h3>
          <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {currentSites.map(s => (
                  <tr key={s.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-violet-600 transition-colors uppercase leading-none">{s.name}</div>
                      {s.fullAmount ? <div className="text-[9px] font-bold text-slate-400 mt-1">₹{s.fullAmount.toLocaleString("en-IN")}</div> : null}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button onClick={() => handleDeleteSite(s.id!)} className="text-slate-300 hover:text-rose-500 transition-colors">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workers */}
        <div className={`bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[350px] transition-all ${!selectedSiteId ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
          <div className="mb-4">
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-3 flex justify-between items-center">
              assigned personnel
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100">{currentWorkers.length}</span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500/30" placeholder="Filter..." value={searchWorker} onChange={e => setSearchWorker(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {currentWorkers.filter(w => w.name.toLowerCase().includes(searchWorker.toLowerCase())).map(w => (
                  <tr key={w.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors uppercase leading-none">{w.name}</div>
                      <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{workerCategories.find(c => c.id === w.category)?.name || w.category}</div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button onClick={() => handleDeleteWorker(w.id!)} className="text-slate-300 hover:text-rose-500 transition-colors">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Attendance Grid Section */}
      {selectedSiteId && (
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-10 print:pt-0 print:border-none">

          {/* Print Header Logic */}
          <div className="hidden print:block mb-10 border-b-2 border-slate-900 pb-5">
            <h1 className="text-4xl font-black text-center uppercase tracking-widest">Workforce Distribution Report</h1>
            <div className="flex justify-between mt-6 text-lg font-bold">
              <div>
                <p>Entity: <span className="font-black uppercase">{engineers.find(e => e.id === selectedEngId)?.name}</span></p>
                <p>Site/Hub: <span className="font-black uppercase">{sites.find(s => s.id === selectedSiteId)?.name}</span></p>
              </div>
              <div className="text-right">
                <p>Week Beginning: <span className="font-black">{startDate}</span></p>
                <p>Strength: <span className="font-black">{currentWorkers.length} Personnel</span></p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 print:hidden gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                  <Filter className="w-5 h-5 text-indigo-500" />
                  Attendance Registry
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">7-Day Dynamic Distribution</p>
              </div>
              <input type="date" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 px-5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            {startDate && (
              <div className="flex gap-3">
                <button onClick={handlePrintPDF} className="bg-white dark:bg-slate-900 hover:bg-slate-50 text-indigo-600 px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-xs transition-all shadow-sm border border-slate-200 dark:border-slate-700"><Printer className="w-4 h-4" /> Export Document</button>
                <button onClick={handleShareWhatsApp} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-xs transition-all shadow-sm border border-emerald-100 dark:border-emerald-500/20"><Share2 className="w-4 h-4" /> Share Summary</button>
              </div>
            )}
          </div>

          {startDate ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Personnel Name</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 border-l border-slate-100 dark:border-slate-700">Type</th>
                      {days.map(d => (
                        <th key={d} className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-center border-l border-slate-100 dark:border-slate-700">
                          {new Date(d).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                        </th>
                      ))}
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 text-center bg-indigo-50/40 dark:bg-indigo-900/20 border-l border-slate-100 dark:border-slate-700">UT.</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right bg-emerald-50/40 dark:bg-emerald-900/20 border-l border-slate-100 dark:border-slate-700">Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {currentWorkers.map(w => (
                      <tr key={w.id} className="group hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5 transition-all">
                        <td className="p-6 font-bold text-sm text-slate-700 dark:text-slate-200 uppercase">{w.name}</td>
                        <td className="p-6 border-l border-slate-100 dark:border-slate-800">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[9px] font-black rounded text-slate-500 uppercase">{workerCategories.find(c => c.id === w.category)?.name || w.category}</span>
                        </td>
                        {days.map(d => (
                          <td key={d} className="p-2 border-l border-slate-100 dark:border-slate-800">
                            <input type="number" step="0.5" className="w-16 p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center text-xs font-black focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all" value={getDutyValue(w.id, d) || ""} onChange={e => handleDraftDutyChange(w.id!, d, e.target.value)} placeholder="0" />
                          </td>
                        ))}
                        <td className="p-6 font-black text-indigo-600 bg-indigo-50/10 text-center text-lg">{getWorkerTotalDuty(w.id)}</td>
                        <td className="p-6 font-black text-emerald-600 bg-emerald-50/10 text-right text-lg">₹{(getWorkerTotalDuty(w.id) * (w.selectedWage || 0)).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/80 border-t-2 border-slate-100 dark:border-slate-700 font-black">
                    <tr>
                      <td colSpan={2} className="p-8 text-right uppercase text-slate-500 tracking-widest text-xs">site Grand totals</td>
                      <td colSpan={7}></td>
                      <td className="p-8 text-center text-2xl text-indigo-600 bg-indigo-50/20 border-l border-slate-100 dark:border-slate-700">{totalAllDuty}</td>
                      <td className="p-8 text-right text-2xl text-emerald-600 bg-emerald-50/20 border-l border-slate-100 dark:border-slate-700">₹{totalAllAmount.toLocaleString("en-IN")}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-4xl">🗓️</span>
              <h4 className="text-lg font-black text-slate-400 mt-4 uppercase tracking-widest">Select Starting Date to Unlock Grid</h4>
            </div>
          )}

          {startDate && (
            <div className="mt-12 flex justify-end print:hidden">
              <button onClick={handleSubmitDuties} className="p-5 px-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full bg-white ${hasUnsavedChanges ? 'animate-ping' : ''}`} />
                {hasUnsavedChanges ? "Commit Unsaved Changes*" : "Save To Global Database"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateEngineerTab;

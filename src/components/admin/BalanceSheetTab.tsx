import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Printer,
  FileText,
  Save,
  CheckCircle2,
  User
} from "lucide-react";
import { useEngineerData } from "../../hooks/useEngineerData";
import { generateProfessionalPDF } from "../../lib/pdfReportGenerator";
import { BalanceSheet, Transaction } from "../../types";

const BalanceSheetTab: React.FC = () => {
  const {
    engineers, sites, workers, advances, expenses, transactions, companyExpenses,
    balanceSheets,
    cashInHand: globalCashInHand, cashInBank: globalCashInBank, updateCashStatusValue
  } = useEngineerData();

  // --- Statement Filters ---
  const [engType, setEngType] = useState<"Engineer" | "Contractor">("Engineer");
  const [selectedEngId, setSelectedEngId] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Local form state for cash
  const [cashInHandForm, setCashInHandForm] = useState<number | "">(globalCashInHand || 0);
  const [cashInBankForm, setCashInBankForm] = useState<number | "">(globalCashInBank || 0);

  const handleSaveCash = () => {
    updateCashStatusValue(Number(cashInHandForm) || 0, Number(cashInBankForm) || 0);
    alert("Cash balances saved successfully!");
  };

  const currentSites = sites.filter((s) => !selectedEngId || s.engineerId === selectedEngId);


  // --- Filtered Analytics for Executive Summary (Reactive) ---

  const activeBackendSheet = selectedSiteId ? balanceSheets.find((b: BalanceSheet) => String(b.site) === selectedSiteId) : null;

  // --- Summary Totals (Backend Driven) ---
  const displayTotalReceived = activeBackendSheet ? activeBackendSheet.inflow_total : 0;
  const displayTotalOutflow = activeBackendSheet ? activeBackendSheet.site_paid_total : 0;
  const displayTotalPending = activeBackendSheet ? (activeBackendSheet.inflow_data?.[activeBackendSheet.inflow_data.length - 1]?.pending_site_amt || 0) : 0;
  const displayTotalCompanyExpenses = activeBackendSheet ? activeBackendSheet.company_expense_total : 0;
  
  // Define missing sub-totals for analytics cards
  const displayTotalAdvances = activeBackendSheet ? activeBackendSheet.advance_total : 0;
  const displayTotalExpenses = activeBackendSheet ? activeBackendSheet.expense_total : 0;
  const displayTotalDirectPaid = activeBackendSheet ? activeBackendSheet.site_paid_total : 0;
  const displayTotalWages = activeBackendSheet ? (activeBackendSheet.outflow_total || 0) : 0; 
  const displayWorkerLiability = displayTotalWages - (displayTotalAdvances + displayTotalDirectPaid);

  // Net Balance = (Cash in Hand + Cash in Bank + (Inflow - Outflow))
  const displayNetBalance = (Number(cashInHandForm) + Number(cashInBankForm) + (activeBackendSheet?.siteprofit || 0));

  // --- Report specific aggregates (Global if no site selected) ---
  const {
    reportTotalInflow,
    reportTotalExpenses,
    reportTotalAdvances,
    reportTotalCompanyExpenses,
    reportTotalWages,
    reportWorkerLiability,
    reportCurrentFunds,
    reportTotalSitesValue,
    reportTotalPendingReceivables
  } = React.useMemo(() => {
    const inflow = activeBackendSheet ? activeBackendSheet.inflow_total : balanceSheets.reduce((sum: number, b: BalanceSheet) => sum + b.inflow_total, 0);
    const outflow = activeBackendSheet ? activeBackendSheet.site_paid_total : balanceSheets.reduce((sum: number, b: BalanceSheet) => sum + b.site_paid_total, 0);
    const expensesAgg = activeBackendSheet ? activeBackendSheet.expense_total : balanceSheets.reduce((sum: number, b: BalanceSheet) => sum + b.expense_total, 0);
    const advancesAgg = activeBackendSheet ? activeBackendSheet.advance_total : balanceSheets.reduce((sum: number, b: BalanceSheet) => sum + b.advance_total, 0);
    const companyExp = activeBackendSheet ? activeBackendSheet.company_expense_total : balanceSheets.reduce((sum: number, b: BalanceSheet) => sum + b.company_expense_total, 0);
    const wages = activeBackendSheet ? (activeBackendSheet.outflow_total || 0) : balanceSheets.reduce((sum: number, b: BalanceSheet) => sum + (b.outflow_total || 0), 0);
    
    const sitesValue = sites
      .filter(s => (!selectedEngId || s.engineerId === selectedEngId) && (!selectedSiteId || s.id === selectedSiteId))
      .reduce((sum, s) => sum + (s.fullAmount || 0), 0);

    const pendingRec = activeBackendSheet ? displayTotalPending : balanceSheets.reduce((sum: number, b: BalanceSheet) => {
      const lastInflow = b.inflow_data?.[b.inflow_data.length - 1];
      return sum + (lastInflow?.pending_site_amt || 0);
    }, 0);

    return {
      reportTotalInflow: inflow,
      reportTotalOutflow: outflow,
      reportTotalExpenses: expensesAgg,
      reportTotalAdvances: advancesAgg,
      reportTotalCompanyExpenses: companyExp,
      reportTotalWages: wages,
      reportWorkerLiability: wages - (advancesAgg + outflow),
      reportCurrentFunds: inflow - (advancesAgg + expensesAgg + outflow + companyExp),
      reportTotalSitesValue: sitesValue,
      reportTotalPendingReceivables: pendingRec
    };
  }, [activeBackendSheet, balanceSheets, sites, selectedEngId, selectedSiteId, displayTotalPending]);




  // --- Filtered Statement Ledger Logic ---
  // --- Filtered Statement Ledger Logic ---
  const { ledger, ledgerTotalReceived, ledgerTotalPaid, closingBalance } = React.useMemo(() => {
    const isWithinDate = (dateStr: string) => {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);

      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        if (d < s) return false;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(0, 0, 0, 0);
        if (d > e) return false;
      }
      return true;
    };

    const getWorkerName = (id: string) => workers.find((w) => w.id === id)?.name || "Worker";

    const newLedger: { date: string; ref: string; description: string; received: number; paid: number }[] = [];

    if (activeBackendSheet) {
      (activeBackendSheet.inflow_data || []).forEach((t: any) => {
        if (!isWithinDate(t.date)) return;
        newLedger.push({
          date: t.date,
          ref: `IN-${String(t.id).padStart(4, '0')}`,
          description: t.remarks || `Inflow Payment`,
          received: t.curr_emp_paid || t.amount || 0,
          paid: 0
        });
      });
      (activeBackendSheet.outflow_data || []).forEach((t: any) => {
        if (!isWithinDate(t.date)) return;
        newLedger.push({
          date: t.date,
          ref: `OUT-${String(t.id).padStart(4, '0')}`,
          description: t.remarks || `Outflow Payment`,
          received: 0,
          paid: t.curr_paying_amt || t.amount || 0
        });
      });
      (activeBackendSheet.expense_data || []).forEach((t: any) => {
        if (!isWithinDate(t.date)) return;
        newLedger.push({
          date: t.date,
          ref: `EXP-${String(t.id).padStart(4, '0')}`,
          description: t.remarks || `Site Expense`,
          received: 0,
          paid: t.amount
        });
      });
      (activeBackendSheet.advance_data || []).forEach((t: any) => {
        if (!isWithinDate(t.date)) return;
        newLedger.push({
          date: t.date,
          ref: `ADV-${String(t.id).padStart(4, '0')}`,
          description: t.remarks || `Worker Advance`,
          received: 0,
          paid: t.advance
        });
      });
      (activeBackendSheet.company_expense_data || []).forEach((t: any) => {
        if (!isWithinDate(t.date)) return;
        newLedger.push({
          date: t.date,
          ref: `CMP-${String(t.id).padStart(4, '0')}`,
          description: t.remarks || `Company Expense`,
          received: 0,
          paid: t.amount
        });
      });
    } else {
      transactions.filter((t: Transaction) => t.type === "Received" && isWithinDate(t.date)).forEach((t: Transaction) => {
        if (selectedSiteId && t.siteId !== selectedSiteId) return;
        if (selectedEngId && t.engineerId !== selectedEngId) return;
        newLedger.push({
          date: t.date,
          ref: `TXN-${t.id.slice(-4)}`,
          description: `Payment Received from Engineer`,
          received: t.paidAmount,
          paid: 0
        });
      });

      transactions.filter(t => t.type === "Paid" && isWithinDate(t.date)).forEach(t => {
        if (selectedSiteId && t.siteId !== selectedSiteId) return;
        if (selectedEngId && t.engineerId !== selectedEngId) return;
        newLedger.push({
          date: t.date,
          ref: `TXN-${t.id.slice(-4)}`,
          description: `Direct Paid to ${getWorkerName(t.workerId!)}`,
          received: 0,
          paid: t.paidAmount
        });
      });

      expenses.filter(e => isWithinDate(e.date)).forEach(e => {
        if (selectedSiteId && e.siteId !== selectedSiteId) return;
        if (selectedEngId && !selectedSiteId && e.siteId) {
          const s = sites.find(s => s.id === e.siteId);
          if (s?.engineerId !== selectedEngId) return;
        }
        newLedger.push({
          date: e.date,
          ref: `EXP-${e.id.slice(-4)}`,
          description: `Expense: ${e.expenseType} ${e.remarks ? `(${e.remarks})` : ''}`,
          received: 0,
          paid: e.amount
        });
      });

      companyExpenses.filter(e => isWithinDate(e.date)).forEach(e => {
        newLedger.push({
          date: e.date,
          ref: `CMP-${e.id.slice(-4)}`,
          description: `Company Expense: ${e.remarks}`,
          received: 0,
          paid: e.amount
        });
      });

      advances.filter(a => isWithinDate(a.date)).forEach(a => {
        if (selectedSiteId && a.siteId !== selectedSiteId) return;
        if (selectedEngId && !selectedSiteId && a.siteId) {
          const s = sites.find(s => s.id === a.siteId);
          if (s?.engineerId !== selectedEngId) return;
        }
        newLedger.push({
          date: a.date,
          ref: `ADV-${a.id.slice(-4)}`,
          description: `Advance to ${getWorkerName(a.workerId)}`,
          received: 0,
          paid: a.amount
        });
      });
    }

    newLedger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalReceived = newLedger.reduce((sum, l) => sum + l.received, 0);
    const totalPaid = newLedger.reduce((sum, l) => sum + l.paid, 0);

    return {
      ledger: newLedger,
      ledgerTotalReceived: totalReceived,
      ledgerTotalPaid: totalPaid,
      closingBalance: totalReceived - totalPaid
    };
  }, [
    activeBackendSheet,
    transactions,
    expenses,
    companyExpenses,
    advances,
    workers,
    sites,
    startDate,
    endDate,
    selectedSiteId,
    selectedEngId
  ]);

  const handlePrintPDF = () => {
    const data = {
      title: "Account Statement Ledger",
      engineer: selectedEngId ? engineers.find(e => e.id === selectedEngId)?.name : "All Engineers",
      site: selectedSiteId ? sites.find(s => s.id === selectedSiteId)?.name : "All Sites",
      period: (startDate || endDate) ? `${startDate || "Start"} TO ${endDate || "Present"}` : "All Time",
      tableHead: [["DATE", "REFERENCE / DETAILS", "RECEIVED (₹)", "PAID (₹)"]],
      tableBody: ledger.map(l => [
        new Date(l.date).toLocaleDateString("en-GB"),
        l.description.toUpperCase(),
        l.received > 0 ? l.received.toLocaleString("en-IN") : "-",
        l.paid > 0 ? l.paid.toLocaleString("en-IN") : "-"
      ]),
      tableFooter: ["TOTAL FOR PERIOD", "",
        (activeBackendSheet ? activeBackendSheet.inflow_total : ledgerTotalReceived).toLocaleString("en-IN"),
        (activeBackendSheet ? activeBackendSheet.site_paid_total : ledgerTotalPaid).toLocaleString("en-IN")
      ],
      notes: [
        `Total Inflow: ₹${(activeBackendSheet ? activeBackendSheet.inflow_total : ledgerTotalReceived).toLocaleString("en-IN")}`,
        `Total Outflow: ₹${(activeBackendSheet ? activeBackendSheet.site_paid_total : ledgerTotalPaid).toLocaleString("en-IN")}`,
        activeBackendSheet ? `Total Expenses: ₹${activeBackendSheet.expense_total.toLocaleString("en-IN")}` : "",
        activeBackendSheet ? `Total Advance: ₹${activeBackendSheet.advance_total.toLocaleString("en-IN")}` : "",
        `Net Balance: ₹${((activeBackendSheet ? activeBackendSheet.siteprofit : closingBalance) + Number(cashInHandForm) + Number(cashInBankForm)).toLocaleString("en-IN")}`,
        activeBackendSheet ? `Contractor Pending Amount: ₹${activeBackendSheet.contractor_pending_amount.toLocaleString("en-IN")}` : ""
      ].filter(Boolean)
    };
    const doc = generateProfessionalPDF(data);
    doc.save(`Statement_Ledger_${data.site}_${data.period}.pdf`);
  };

  const handlePrintExecutiveSummary = () => {
    const data = {
      title: "Executive Financial Summary Report",
      engineer: selectedEngId ? engineers.find(e => e.id === selectedEngId)?.name : "MASTER OVERVIEW",
      site: selectedSiteId ? sites.find(s => s.id === selectedSiteId)?.name : "ALL PROJECTS",
      period: (startDate || endDate) ? `${startDate || "Start"} TO ${endDate || "Present"}` : "LIFETIME TO DATE",
      tableHead: [["CATEGORY", "DESCRIPTION", "AMOUNT (₹)"]],
      tableBody: [
        ["REVENUE", "TOTAL CONTRACT VALUES (PROJECTED)", reportTotalSitesValue.toLocaleString("en-IN")],
        ["REVENUE", "TOTAL COLLECTED FROM ENGINEERS", reportTotalInflow.toLocaleString("en-IN")],
        ["REVENUE", "TOTAL ENGINEER YET TO BE PAID", reportTotalPendingReceivables.toLocaleString("en-IN")],
        ["-", "-", "-"],
        ["EXPENSES", "TOTAL WAGES EARNED BY WORKERS", reportTotalWages.toLocaleString("en-IN")],
        ["EXPENSES", "TOTAL ADVANCES GIVEN (PENDING)", reportTotalAdvances.toLocaleString("en-IN")],
        ["EXPENSES", "TOTAL DIRECT SITE EXPENSES", reportTotalExpenses.toLocaleString("en-IN")],
        ["EXPENSES", "TOTAL COMPANY EXPENSES", reportTotalCompanyExpenses.toLocaleString("en-IN")],
        ["-", "-", "-"],
        ["SUMMARY", reportCurrentFunds >= 0 ? "TOTAL PROFIT FOR PERIOD" : "TOTAL LOSS FOR PERIOD", `₹${reportCurrentFunds.toLocaleString("en-IN")}`],
        ["SUMMARY", "DECLARED CASH ASSETS (HAND+BANK)", `₹${(Number(cashInHandForm) + Number(cashInBankForm)).toLocaleString("en-IN")}`],
        ["SUMMARY", "CLOSING BALANCE (RECEIVED - PAID)", `₹${reportCurrentFunds.toLocaleString("en-IN")}`],
        ["SUMMARY", "TOTAL ADJUSTED ASSETS (CLOSING + HAND + BANK)", `₹${(Number(cashInHandForm) + Number(cashInBankForm) + reportCurrentFunds).toLocaleString("en-IN")}`],
        ["-", "-", "-"],
        ["LIABILITY", "YET TO BE PAID (WORKER BALANCE)", reportWorkerLiability.toLocaleString("en-IN")],
        ["-", "-", "-"],
        ["FINAL", "PROJECT CLOSEOUT BALANCE", (Number(cashInHandForm) + Number(cashInBankForm) + reportCurrentFunds - reportWorkerLiability).toLocaleString("en-IN")],
      ],
      notes: [
        `System Balance: ₹${reportCurrentFunds.toLocaleString("en-IN")}`,
        `Total Worker Liability: ₹${reportWorkerLiability.toLocaleString("en-IN")}`
      ]
    };
    const doc = generateProfessionalPDF(data);
    doc.save(`Executive_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="bg-transparent rounded-2xl p-4 print:p-0 print:border-none print:shadow-none">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          .print-section { display: block !important; opacity: 1 !important; transform: none !important; margin: 0 !important; padding: 20px !important; }
          .no-print { display: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; }
          th, td { border: 1px solid #ddd !important; padding: 12px !important; color: #000 !important; }
          thead { display: table-header-group !important; }
          tfoot { display: table-footer-group !important; }
          .total-row { background-color: #f8fafc !important; font-weight: bold !important; -webkit-print-color-adjust: exact; }
          .net-balance-card { border: 2px solid #000 !important; page-break-inside: avoid !important; }
          h2, h3 { color: #000 !important; margin-top: 20px !important; }
          body { background: white !important; }
        }
      `}} />

      {/* ── Sovereign Fiscal Oversight (Premium Section) ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-14 print:opacity-100 print:translate-y-0"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase">Balance Sheet</h2>
            <p className="text-indigo-400 dark:text-indigo-400/60 text-xs font-semibold uppercase tracking-wider mt-0.5">Monitor cash flow and financial transactions</p>
          </div>
          <button
            onClick={handlePrintExecutiveSummary}
            className="group bg-indigo-600 hover:bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <Printer className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Executive Export
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Revenue Card (Capital Matrix) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden glass-card border border-slate-100 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl shadow-emerald-100/10"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] -mr-24 -mt-24" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-wider mb-8 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
                <TrendingUp className="w-4 h-4" />
                Inflow Summary
              </div>
              <div className="space-y-8">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total Inflow Collection</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">₹{displayTotalReceived.toLocaleString("en-IN")}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-50">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2">Collected</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{displayTotalReceived.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">Site Pending</p>
                    <p className="text-xl font-bold text-orange-500">₹{displayTotalPending.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Expenses Card (Disbursement Flow) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden glass-card border border-slate-100 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl shadow-rose-100/10"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 blur-[80px] -mr-24 -mt-24" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 text-rose-600 font-bold text-[10px] uppercase tracking-wider mb-8 bg-rose-500/5 px-4 py-2 rounded-full border border-rose-500/10">
                <TrendingDown className="w-4 h-4" />
                Outflow Summary
              </div>
              <div className="space-y-8">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total Outflow disbursement</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">₹{displayTotalOutflow.toLocaleString("en-IN")}</p>
                </div>
                <div className="grid grid-cols-1 gap-6 pt-8 border-t border-slate-50">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2">Total Company Expenses</p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">₹{displayTotalCompanyExpenses.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Net Position Card (Global Equity) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 shadow-2xl shadow-indigo-900/20 text-white"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="inline-flex items-center gap-3 text-indigo-400 font-bold text-[10px] uppercase tracking-wider mb-8 bg-white/5 px-4 py-2 rounded-full border border-white/5 self-start">
                <Wallet className="w-4 h-4" />
                Liquid Equity
              </div>
              <div className="space-y-8 flex-1">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Net Balance Portfolio</p>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    ₹{displayNetBalance.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="pt-8 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Cash in Hand</p>
                    <p className="text-lg font-bold text-emerald-400">₹{Number(cashInHandForm).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Cash in Bank</p>
                    <p className="text-lg font-bold text-indigo-300">₹{Number(cashInBankForm).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Left Column: Cash Flow Analytics */}
        <div className="space-y-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="glass-card p-8 rounded-2xl border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group shadow-xl shadow-emerald-100/10"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-24 h-24 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mb-2 uppercase tracking-tight">{selectedSiteId || selectedEngId ? 'Filtered Absorption' : 'Global Capital Absorption'}</h3>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-8 leading-relaxed">
              {selectedSiteId ? `Inflow via ${sites.find(s => s.id === selectedSiteId)?.name}` :
                selectedEngId ? `Inflow via ${engineers.find(e => e.id === selectedEngId)?.name}` :
                  'Total aggregate collection from all operational channels'}
            </p>
            <p className="text-6xl font-bold text-slate-900 dark:text-white tracking-tight">₹{displayTotalReceived.toLocaleString("en-IN")}</p>

            <div className="mt-10 pt-8 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Receivable Arrears:</span>
              <span className="text-xl font-bold text-orange-500 bg-orange-500/5 px-6 py-2 rounded-2xl border border-orange-500/10 shadow-sm">₹{displayTotalPending.toLocaleString("en-IN")}</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="glass-card p-8 rounded-2xl border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group shadow-xl shadow-rose-100/10"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingDown className="w-24 h-24 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-rose-800 dark:text-rose-400 mb-2 uppercase tracking-tight">{selectedSiteId || selectedEngId ? 'Filtered Velocity' : 'Global Disbursement Velocity'}</h3>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-8 leading-relaxed">AGGREGATE LEAKAGE (ADVANCES + EXPENSES + SETTLEMENTS)</p>
            <p className="text-6xl font-bold text-slate-900 dark:text-white tracking-tight">₹{(displayTotalAdvances + displayTotalExpenses + displayTotalDirectPaid + displayTotalCompanyExpenses).toLocaleString("en-IN")}</p>

            <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Advances</p>
                <p className="text-sm font-bold text-rose-600">₹{displayTotalAdvances.toLocaleString("en-IN")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Site Exp</p>
                <p className="text-sm font-bold text-rose-600">₹{displayTotalExpenses.toLocaleString("en-IN")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Personnel</p>
                <p className="text-sm font-bold text-rose-600">₹{displayTotalDirectPaid.toLocaleString("en-IN")}</p>
              </div>
              <div className="space-y-1 border-l border-slate-100 pl-4">
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Corporate</p>
                <p className="text-sm font-bold text-indigo-600">₹{displayTotalCompanyExpenses.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Liability Analytics */}
        <div className="h-full">
          <motion.div
            whileHover={{ y: -5 }}
            className="glass-card p-8 rounded-2xl border border-slate-100 dark:border-slate-800/50 h-full relative overflow-hidden group shadow-xl shadow-indigo-100/10 flex flex-col"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <User className="w-24 h-24 text-indigo-600" />
            </div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase">Human Capital Debt</h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Personnel Wage Liability</p>
              </div>
            </div>

            <div className="space-y-10 flex-1">
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Total Accrued (Audit Basis)</p>
                <p className="text-5xl font-bold text-slate-800 dark:text-white tracking-tight">₹{displayTotalWages.toLocaleString("en-IN")}</p>
              </div>

              <div className="pt-8 border-t border-slate-50">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Aggregate Disbursements</p>
                <p className="text-2xl font-bold text-slate-700 tracking-tight">
                  ₹{(displayTotalAdvances + displayTotalDirectPaid).toLocaleString("en-IN")}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-wider border border-slate-100">ADV ₹{displayTotalAdvances.toLocaleString("en-IN")}</span>
                  <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-wider border border-slate-100">PAID ₹{displayTotalDirectPaid.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="pt-8">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4">Required Liquidation</p>
                <div className={`inline-flex px-8 py-4 rounded-2xl font-bold text-3xl tracking-tight shadow-xl transition-all ${displayWorkerLiability > 0 ? 'bg-rose-600 text-white shadow-rose-600/20' : 'bg-emerald-600 text-white shadow-emerald-600/20'}`}>
                  {displayWorkerLiability > 0 ? `DEBT: ₹${displayWorkerLiability.toLocaleString("en-IN")}` : `SETTLED`}
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-indigo-600/5 rounded-2xl border border-indigo-600/10 flex items-start gap-4 shadow-inner">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-indigo-800 font-bold uppercase tracking-wider text-[10px]">Fiscal Stability Index</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters Grid - Premium Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14 glass-card p-8 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-xl shadow-indigo-100/5">
        <div className="space-y-3">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">Account Categorization</label>
          <div className="flex p-1.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-inner h-[60px]">
            <button
              onClick={() => { setEngType("Engineer"); setSelectedEngId(""); setSelectedSiteId(""); }}
              className={`flex-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${engType === "Engineer" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-indigo-600"}`}
            >
              Engineer
            </button>
            <button
              onClick={() => { setEngType("Contractor"); setSelectedEngId(""); setSelectedSiteId(""); }}
              className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${engType === "Contractor" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-indigo-600"}`}
            >
              Contractor
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Assigned Controller</label>
          <select className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black appearance-none focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all cursor-pointer shadow-sm" value={selectedEngId} onChange={e => { setSelectedEngId(e.target.value); setSelectedSiteId(""); }}>
            <option value="" className="bg-white dark:bg-slate-900">-- ALL CONTROLLERS --</option>
            {engineers.filter(e => e.type === engType || (!e.type && engType === "Engineer")).map(e => <option key={e.id} value={e.id} className="bg-white dark:bg-slate-900">{e.name}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Operational Hub</label>
          <select className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black appearance-none focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all cursor-pointer shadow-sm" value={selectedSiteId} onChange={e => setSelectedSiteId(e.target.value)}>
            <option value="" className="bg-white dark:bg-slate-900">-- ALL SITE REGISTRIES --</option>
            {currentSites.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900">{s.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-1 space-y-3">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Audit Period</label>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm text-xs cursor-pointer" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <input type="date" className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm text-xs cursor-pointer" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Liquid Asset: Cash</label>
          <input type="number" min="0" placeholder="0.00" className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm" value={cashInHandForm} onChange={e => setCashInHandForm(e.target.value === "" ? "" : Number(e.target.value))} />
        </div>
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
            Digital Asset: Bank
          </label>
          <div className="flex gap-3">
            <input type="number" min="0" placeholder="0.00" className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white font-black focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all shadow-sm" value={cashInBankForm} onChange={e => setCashInBankForm(e.target.value === "" ? "" : Number(e.target.value))} />
            <button
              onClick={handleSaveCash}
              className="bg-indigo-600 text-white w-16 h-[60px] rounded-2xl flex items-center justify-center hover:bg-slate-900 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              title="Save Cash Balances"
            >
              <Save className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Transactional Audit Stream (Backend Driven) ── */}
      <div className="border-t border-slate-100 pt-16 print:border-t-2 print:border-slate-900 print:pt-8 print-section">
        <div className="flex justify-between items-end mb-10 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase">Transactional Audit Stream</h2>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-2">Verified Backend Fiscal Registry</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePrintPDF}
              className="bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-2xl flex items-center gap-3 font-bold uppercase tracking-wider text-[10px] transition-all border border-slate-200 shadow-xl shadow-slate-200/20 active:scale-95"
            >
              <FileText className="w-5 h-5 text-indigo-600" />
              Download Audit PDF
            </button>
          </div>
        </div>

        {!activeBackendSheet ? (
          <div className="glass-card p-20 text-center rounded-2xl border border-slate-100">
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">Please select an Operational Hub to view the Verified Backend Balance Sheet.</p>
          </div>
        ) : (
          <div className="space-y-8 print:space-y-12">
            <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm print:border-slate-900 print:rounded-none">
              <table className="w-full text-left border-collapse print:text-black">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 print:bg-slate-100 print:border-slate-900">
                    <th className="px-6 py-5 font-black text-slate-700 text-[10px] uppercase tracking-widest print:text-black print:font-bold">Date</th>
                    <th className="px-6 py-5 font-black text-slate-700 text-[10px] uppercase tracking-widest print:text-black print:font-bold">Type</th>
                    <th className="px-6 py-5 font-black text-slate-700 text-[10px] uppercase tracking-widest print:text-black print:font-bold">Description / Remarks</th>
                    <th className="px-6 py-5 font-black text-slate-700 text-[10px] uppercase tracking-widest text-right print:text-black print:font-bold">Inflow (₹)</th>
                    <th className="px-6 py-5 font-black text-slate-700 text-[10px] uppercase tracking-widest text-right print:text-black print:font-bold">Outflow (₹)</th>
                    <th className="px-6 py-5 font-black text-slate-700 text-[10px] uppercase tracking-widest text-right print:text-black print:font-bold">Pending (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ...(activeBackendSheet.inflow_data || []).map((t: any) => ({ ...t, rowType: 'Inflow' })),
                    ...(activeBackendSheet.outflow_data || []).map((t: any) => ({ ...t, rowType: 'Outflow' })),
                    ...(activeBackendSheet.expense_data || []).map((t: any) => ({ ...t, rowType: 'Outflow', isGeneralExp: true })),
                    ...(activeBackendSheet.company_expense_data || []).map((t: any) => ({ ...t, rowType: 'Outflow', isCoExp: true })),
                    ...(activeBackendSheet.advance_data || []).map((t: any) => ({ ...t, rowType: 'Outflow', isAdvance: true }))
                  ]
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                          {new Date(row.date).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${row.rowType === 'Inflow' ? 'bg-emerald-50 text-emerald-600' :
                              (row.isGeneralExp || row.isCoExp) ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                            {row.isGeneralExp || row.isCoExp ? 'Company Expenses' : row.isAdvance ? 'Advance Paid' : (row.rowType === 'Outflow' ? 'Worker Payment' : row.rowType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs italic">
                          {row.remarks || row.description || row.workername || (row.rowType === 'Inflow' ? 'Payment Received' : 'Payment Disbursed')}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600 text-sm">
                          {row.rowType === 'Inflow' ? `₹${(row.curr_emp_paid || 0).toLocaleString("en-IN")}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-rose-600 text-sm">
                          {row.rowType === 'Outflow' ? (
                            (parseFloat(row.curr_paying_amt || row.amount || row.advance) > 0) ?
                              `₹${Number(row.curr_paying_amt || row.amount || row.advance).toLocaleString("en-IN")}` : '-'
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-500 text-sm">
                          {row.rowType === 'Inflow' ?
                            `₹${(row.pending_site_amt || 0).toLocaleString("en-IN")}` :
                            (row.pending_amount !== undefined ? `₹${(row.pending_amount || 0).toLocaleString("en-IN")}` : '-')}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white print:bg-slate-100 print:text-black print:border-t-2 print:border-black total-row">
                    <td colSpan={3} className="px-6 py-5 font-black text-xs uppercase tracking-[0.2em] print:text-black">Total</td>
                    <td className="px-6 py-5 text-right font-black text-base text-emerald-400 print:text-black font-bold">
                      ₹{activeBackendSheet.inflow_total.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-5 text-right font-black text-base text-rose-400">
                      ₹{activeBackendSheet.site_paid_total.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-400 text-xs">
                      REF ONLY
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 text-white p-10 rounded-3xl flex flex-col justify-center border-l-8 border-indigo-500 shadow-2xl print:bg-slate-50 print:text-black print:border-slate-900 print:rounded-none print:shadow-none print:border-2">
                <span className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs mb-4 print:text-slate-500">Total Company Expenses</span>
                <span className="text-6xl font-black tracking-tighter text-white print:text-black print:text-4xl">
                  ₹{displayTotalCompanyExpenses.toLocaleString("en-IN")}
                </span>
                <p className="text-slate-500 text-[10px] mt-6 uppercase font-bold tracking-widest print:hidden">Aggregate site-specific corporate expenditures</p>
              </div>

              <div className="bg-white border-2 border-slate-900 p-10 rounded-3xl flex flex-col justify-center shadow-xl print:rounded-none print:shadow-none net-balance-card">
                <span className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs mb-4">Net Balance</span>
                <span className="text-6xl font-black tracking-tighter text-slate-900 print:text-4xl">
                  ₹{(Number(cashInHandForm) + Number(cashInBankForm) + activeBackendSheet.siteprofit).toLocaleString("en-IN")}
                </span>
                <div className="mt-8 pt-8 border-t border-slate-100 flex gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hand Cash</span>
                    <span className="text-sm font-bold text-slate-600">₹{Number(cashInHandForm).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bank Cash</span>
                    <span className="text-sm font-bold text-slate-600">₹{Number(cashInBankForm).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex flex-col ml-auto">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Site Profit</span>
                    <span className="text-sm font-bold text-indigo-600">₹{activeBackendSheet.siteprofit.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceSheetTab;

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Wallet,
  TrendingUp,
  ShoppingCart,
  History,
  LayoutDashboard
} from "lucide-react";
import CreateEngineerTab from "./CreateEngineerTab";
import PayOutTab from "./PayOutTab";
import AdvanceTab from "./AdvanceTab";
import ExpensesTab from "./ExpensesTab";
import TransactionTab from "./TransactionTab";
import BalanceSheetTab from "./BalanceSheetTab";
import { useEngineerData } from "../../hooks/useEngineerData";

type SubTab = "create_engineer" | "pay_out" | "advance" | "expenses" | "transaction" | "balance_sheet";

const ManpowerSection: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("create_engineer");
  const { loading, error, refreshData } = useEngineerData();

  const tabs: { id: SubTab; label: string; description: string; icon: React.ElementType }[] = [
    { id: "create_engineer", label: "Create Engineer & Site", description: "Create engineers, sites and workers", icon: UserPlus },
    { id: "pay_out", label: "Payout", description: "Weekly payout and settlement view", icon: Wallet },
    { id: "advance", label: "Advance", description: "Track worker advance amounts", icon: TrendingUp },
    { id: "expenses", label: "Expenses", description: "Manage site and company expenses", icon: ShoppingCart },
    { id: "transaction", label: "Transaction", description: "Record received and paid entries", icon: History },
    { id: "balance_sheet", label: "Balance Sheet", description: "Review financial summary and cash flow", icon: LayoutDashboard },
  ];

  const activeTabConfig = tabs.find((tab) => tab.id === activeSubTab);

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* ── Section Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="print:hidden space-y-4"
      >
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/70 dark:border-slate-700/40 shadow-lg shadow-slate-200/20 dark:shadow-black/20 p-5 md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-indigo-500/80 dark:text-indigo-400/80">
                Manpower Control
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {activeTabConfig?.label}
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                {activeTabConfig?.description}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-2 border border-indigo-100 shadow-xl shadow-indigo-100/10 mx-1 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max relative px-1 py-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 outline-none overflow-hidden whitespace-nowrap border-2 ${
                    isActive
                      ? "text-white border-transparent"
                      : "text-slate-500 hover:text-indigo-600 bg-indigo-50/30 border-indigo-50/50 hover:bg-white hover:border-indigo-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSubTabPill"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}

                  <Icon className={`w-5 h-5 relative z-10 transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"}`} />
                  <div className="relative z-10 text-left">
                    <span className="block text-[12px] uppercase tracking-wider font-black">{tab.label}</span>
                    <span className={`block text-[9px] font-bold opacity-60 mt-0.5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"}`}>{tab.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Active Tab Content ── */}
      <main className="flex-1 px-1 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-1 border border-slate-200/40 dark:border-slate-700/30 overflow-hidden relative min-h-[500px] shadow-xl shadow-slate-200/10 dark:shadow-black/10">
              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md flex items-center justify-center rounded-2xl">
                  <div className="flex flex-col items-center gap-5">
                    <div className="w-12 h-12 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <div className="flex flex-col items-center">
                      <p className="text-slate-800 dark:text-white font-bold text-sm tracking-wide">Loading Data</p>
                      <p className="text-indigo-500/70 text-xs font-medium animate-pulse mt-1">Syncing records...</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error Banner */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200/50 dark:border-red-500/20 px-6 py-4 text-red-600 dark:text-red-400 text-sm font-medium flex justify-between items-center rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    <p>Error: {error}</p>
                  </div>
                  <button onClick={refreshData} className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm">Retry</button>
                </div>
              )}

              <div className="p-5 md:p-6">
                {activeSubTab === "create_engineer" && <CreateEngineerTab />}
                {activeSubTab === "pay_out" && <PayOutTab />}
                {activeSubTab === "advance" && <AdvanceTab />}
                {activeSubTab === "expenses" && <ExpensesTab />}
                {activeSubTab === "transaction" && <TransactionTab />}
                {activeSubTab === "balance_sheet" && <BalanceSheetTab />}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ManpowerSection;
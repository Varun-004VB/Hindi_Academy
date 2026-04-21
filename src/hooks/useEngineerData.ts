import { useState, useEffect, useCallback } from "react";
import { apiService } from "../lib/api";
import {
  Engineer, Site, Worker, Duty, Advance, Transaction, Expense,
  BalanceSheet, WorkerProfile, WorkerCategory
} from "../types";

export type {
  Engineer, Site, Worker, Duty, Advance, Transaction, Expense,
  BalanceSheet, WorkerProfile, WorkerCategory
};

// Hook for backend data management
export function useEngineerData() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [duties, setDuties] = useState<Duty[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashInHand, setCashInHand] = useState<number>(0);
  const [cashInBank, setCashInBank] = useState<number>(0);
  const [companyExpenses, setCompanyExpenses] = useState<Expense[]>([]);
  const [workerCategories, setWorkerCategories] = useState<WorkerCategory[]>([]);
  const [balanceSheets, setBalanceSheets] = useState<BalanceSheet[]>([]);
  const [workerDatabase, setWorkerDatabase] = useState<WorkerProfile[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        engs, sts, wrks, dts, advs, trns, cats, status, genExps, compExps, bSheets, wDb, payoutsData
      ] = await Promise.all([
        apiService.getEngineers(),
        apiService.getSites(),
        apiService.getWorkers(),
        apiService.getDuties(),
        apiService.getAdvances(),
        apiService.getTransactions(),
        apiService.getWorkerCategories(),
        apiService.getGlobalStatus(),
        apiService.getGeneralExpenses(),
        apiService.getCompanyExpenses(),
        apiService.getBalanceSheets(),
        apiService.getWorkerDatabase(),
        apiService.getPayouts()
      ]);

      setEngineers(engs || []);
      setSites(sts || []);
      setWorkers(wrks || []);
      setDuties(dts || []);
      setAdvances(advs || []);
      setTransactions(trns || []);
      setExpenses(genExps || []);
      setCompanyExpenses(compExps || []);
      setWorkerCategories(cats || []);
      setBalanceSheets(bSheets || []);
      setWorkerDatabase(wDb || []);
      setPayouts(payoutsData || []);
      setCashInHand(status?.cashInHand || 0);
      setCashInBank(status?.cashInBank || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching local data:", err);
      setError("System initialization error. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- API Sync Handlers ---

  const addEngineer = async (data: Partial<Engineer>) => {
    try {
      const newEng = await apiService.createEngineer(data);
      setEngineers(prev => [...prev, newEng]);
      return newEng;
    } catch (err) {
      console.error("Error adding engineer:", err);
      throw err;
    }
  };

  const deleteEngineer = async (id: string) => {
    try {
      await apiService.deleteEngineer(id);
      setEngineers(prev => prev.filter(e => e.id !== id));
      setSites(prev => prev.filter(s => s.engineerId !== id));
    } catch (err) {
      console.error("Error deleting engineer:", err);
    }
  };

  const addSite = async (data: Partial<Site>) => {
    try {
      const newSite = await apiService.createSite(data);
      setSites(prev => [...prev, newSite]);
      return newSite;
    } catch (err) {
      console.error("Error adding site:", err);
      throw err;
    }
  };

  const deleteSite = async (id: string) => {
    try {
      await apiService.deleteSite(id);
      setSites(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Error deleting site:", err);
    }
  };

  const addWorker = async (data: Partial<Worker>) => {
    try {
      const newWorker = await apiService.createWorker(data);
      setWorkers(prev => [...prev, newWorker]);
      return newWorker;
    } catch (err) {
      console.error("Error adding worker:", err);
      throw err;
    }
  };

  const updateWorker = async (id: string, data: Partial<Worker>) => {
    // Optimistic Update
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));

    try {
      const updatedWorker = await apiService.updateWorker(id, data);
      
      // Ensure local state matches server response
      setWorkers(prev => prev.map(w => w.id === id ? updatedWorker : w));
      
      return updatedWorker;
    } catch (err) {
      console.error("Error updating worker:", err);
      throw err;
    }
  };

  const deleteWorker = async (id: string) => {
    try {
      await apiService.deleteWorker(id);
      setWorkers(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error("Error deleting worker:", err);
    }
  };

  const saveWeeklyDuties = async (siteId: string, workerId: string, startDate: string, daysList: number[]) => {
    try {
      await apiService.saveWeeklyDuties(siteId, workerId, startDate, daysList);
      // Fetch fresh data after saving to get updated duties
      await fetchData();
    } catch (err) {
      console.error("Error saving weekly duties:", err);
      throw err;
    }
  };

  const addAdvance = async (data: Partial<Advance>) => {
    try {
      const newAdv = await apiService.createAdvance(data);
      setAdvances(prev => [...prev, newAdv]);
      return newAdv;
    } catch (err) {
      console.error("Error adding advance:", err);
      throw err;
    }
  };

  const updateAdvance = async (id: string, data: Partial<Advance>) => {
    try {
      const updatedAdv = await apiService.updateAdvance(id, data);
      setAdvances(prev => prev.map(a => a.id === id ? updatedAdv : a));
      return updatedAdv;
    } catch (err) {
      console.error("Error updating advance:", err);
      throw err;
    }
  };

  const deleteAdvance = async (id: string) => {
    try {
      await apiService.deleteAdvance(id);
      setAdvances(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Error deleting advance:", err);
    }
  };

  const addExpense = async (data: Partial<Expense>, isCompany: boolean = false) => {
    try {
      if (isCompany) {
        const newExp = await apiService.createCompanyExpense(data);
        await fetchData(); // Fetch fresh data to ensure all totals & balance sheets are updated
        return newExp;
      } else {
        const newExp = await apiService.createGeneralExpense(data);
        await fetchData(); // Refresh state from backend
        return newExp;
      }
    } catch (err) {
      console.error("Error adding expense:", err);
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const isCompany = companyExpenses.some(e => e.id === id);
      if (isCompany) {
        await apiService.deleteCompanyExpense(id);
      } else {
        await apiService.deleteGeneralExpense(id);
      }
      await fetchData(); // Sync state after deletion
    } catch (err) {
      console.error("Error deleting expense:", err);
      throw err;
    }
  };

  const addTransaction = async (data: Partial<Transaction>) => {
    try {
      const newTrn = await apiService.createTransaction(data);
      setTransactions(prev => [...prev, newTrn]);
      return newTrn;
    } catch (err) {
      console.error("Error adding transaction:", err);
      throw err;
    }
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    try {
      const updatedTrn = await apiService.updateTransaction(id, data);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTrn : t));
      return updatedTrn;
    } catch (err) {
      console.error("Error updating transaction:", err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await apiService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const addBalanceSheet = async (data: Partial<BalanceSheet>) => {
    try {
      const newBs = await apiService.createBalanceSheet(data);
      setBalanceSheets(prev => [...prev, newBs]);
      return newBs;
    } catch (err) {
      console.error("Error adding balance sheet:", err);
      throw err;
    }
  };

  const updateBalanceSheet = async (id: string, data: Partial<BalanceSheet>) => {
    setBalanceSheets(prev => prev.map(bs => bs.id === id ? { ...bs, ...data as BalanceSheet } : bs));
    try {
      const updatedBs = await apiService.updateBalanceSheet(id, data);
      setBalanceSheets(prev => prev.map(bs => bs.id === id ? updatedBs : bs));
      return updatedBs;
    } catch (err) {
      console.error("Error updating balance sheet:", err);
      throw err;
    }
  };

  const deleteBalanceSheet = async (id: string) => {
    try {
      await apiService.deleteBalanceSheet(id);
      setBalanceSheets(prev => prev.filter(bs => bs.id !== id));
    } catch (err) {
      console.error("Error deleting balance sheet:", err);
    }
  };

  const addWorkerDatabaseEntry = async (data: Partial<WorkerProfile>, imageFile?: File | null) => {
    try {
      const res = await apiService.createWorkerDatabase(data, imageFile);
      // Backend returns the created object, but we trigger a refresh or manually add
      const freshData = await apiService.getWorkerDatabase();
      setWorkerDatabase(freshData);
      return freshData.find((w: any) => String(w.id) === String(res.id));
    } catch (err) {
      console.error("Error adding worker to database:", err);
      throw err;
    }
  };

  const updateWorkerDatabaseEntry = async (id: string, data: Partial<WorkerProfile>, imageFile?: File | null) => {
    try {
      await apiService.updateWorkerDatabase(id, data, imageFile);
      const freshData = await apiService.getWorkerDatabase();
      setWorkerDatabase(freshData);
      return freshData.find((w: any) => String(w.id) === String(id));
    } catch (err) {
      console.error("Error updating worker in database:", err);
      throw err;
    }
  };

  const deleteWorkerDatabaseEntry = async (id: string) => {
    try {
      await apiService.deleteWorkerDatabase(id);
      setWorkerDatabase(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error("Error deleting worker from database:", err);
      throw err;
    }
  };

  const toggleWorkerStatus = async (worker: WorkerProfile) => {
    try {
      const updatedData = await apiService.toggleWorkerStatus(worker);

      // Update local state IMMEDIATELY for instant UI feedback
      setWorkerDatabase(prev => prev.map(w => String(w.id) === String(worker.id) ? {
        ...w,
        active: updatedData.active,
        status: updatedData.active ? 'Active' : 'Inactive',
        date_of_relieving: updatedData.date_of_relieving || w.date_of_relieving
      } : w));

      // Also refresh the global state to stay in sync
      await fetchData();
    } catch (err: any) {
      console.error(err.message || "Unknown error toggling status");
      throw err;
    }
  };

  const searchWorkerDatabase = async (term: string) => {
    try {
      setLoading(true);
      const data = await apiService.getWorkerDatabase(term);
      setWorkerDatabase(data);
    } catch (err) {
      console.error("Error searching worker database:", err);
    } finally {
      setLoading(false);
    }
  };

  const addPayout = async (data: any) => {
    try {
      const resp = await apiService.createPayout(data);
      setPayouts(prev => [...prev, resp]);
      return resp;
    } catch (err) {
      console.error("Error adding payout:", err);
      throw err;
    }
  };

  const updatePayout = async (id: number, data: any) => {
    try {
      const resp = await apiService.updatePayout(id, data);
      setPayouts(prev => prev.map(p => p.id === id ? resp : p));
      return resp;
    } catch (err) {
      console.error("Error updating payout:", err);
      throw err;
    }
  };

  const deletePayout = async (id: number) => {
    try {
      await apiService.deletePayout(id);
      setPayouts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting payout:", err);
      throw err;
    }
  };

  const updateCashStatusValue = async (hand: number, bank: number) => {
    try {
      await apiService.updateGlobalStatus({ cashInHand: hand, cashInBank: bank });
      setCashInHand(hand);
      setCashInBank(bank);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return {
    engineers, addEngineer, deleteEngineer,
    sites, addSite, deleteSite,
    workers, addWorker, updateWorker, deleteWorker,
    duties, saveWeeklyDuties,
    advances, addAdvance, updateAdvance, deleteAdvance,
    expenses, addExpense, deleteExpense,
    companyExpenses,
    workerCategories,
    transactions, addTransaction, updateTransaction, deleteTransaction,
    balanceSheets, addBalanceSheet, updateBalanceSheet, deleteBalanceSheet,
    workerDatabase, addWorkerDatabaseEntry, updateWorkerDatabaseEntry, deleteWorkerDatabaseEntry, toggleWorkerStatus, searchWorkerDatabase,
    payouts, addPayout, updatePayout, deletePayout,
    cashInHand, setCashInHand, cashInBank, setCashInBank, updateCashStatusValue,
    getWorkerPayout: apiService.getWorkerPayout,
    getSiteBalance: apiService.getSiteBalance,
    getTransactionSummary: apiService.getTransactionSummary,
    loading,
    error,
    refreshData: fetchData,
    setTransactions
  };
}


import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Interfaces ---
interface Owner { id: number; name: string; phone: string; email: string; address: string; site_location: string; }
interface Site { id: number; owner: number; site_name: string; location: string; start_date: string; expected_end_date: string; }
interface Category { id: number; name: string; wage: number; }
interface Worker { id: number; category: number; name: string; phone: string; daily_wage: number; is_active: boolean; }
interface Attendance { id: number; date: string; site: number; worker: number; status: 'Present' | 'Absent' | 'Half Day'; hours?: number; duty?: number; }
interface WorkEntry { id: number; work_date: string; site: number; worker: number; work_description: string; owner_paid_amount: number; worker_paid_amount: number; hours?: number; }
interface Advance { id: number; given_date: string; worker: number; amount: number; note: string; }
interface Expense { id: number; expense_date: string; site: number; expense_type: string; amount: number; note: string; }
interface OwnerPayment { id: number; payment_date: string; site: number; amount: number; payment_method: string; note: string; }
interface Transaction { id: number; date: string; reference_id: number; transaction_type: 'Owner Received' | 'Worker Paid' | 'Expense' | 'Advance'; amount: number; note: string; }

// --- Constants for Fixed Categories ---
const HARDCODED_CATEGORIES = [
    { name: 'helper', hourly: 75 },
    { name: 'Mason (Fresher)', hourly: 90 },
    { name: 'Mason (Intermediate)', hourly: 100 },
    { name: 'Mason (Best)', hourly: 110 }
];

const ManpowerSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async (endpoint: string, setter: (data: any) => void) => {
        try {
            const res = await fetch(`https://caren-habitudinal-hazardously.ngrok-free.dev/manpower/${endpoint}/`);
            const data = await res.json();
            setter(data);
        } catch (err) {
            console.error(`Failed to fetch ${endpoint}:`, err);
        }
    };

    const getAllData = async () => {
        setLoading(true);
        const setOwnersRaw = (data: any) => setOwners(data);
        const setSitesRaw = (data: any) => setSites(data);
        const setCategoriesRaw = (data: any) => setCategories(data);
        const setWorkersRaw = (data: any) => setWorkers(data);
        const setAttendancesRaw = (data: any) => setAttendances(data);
        const setWorkEntriesRaw = (data: any) => setWorkEntries(data);
        const setAdvancesRaw = (data: any) => setAdvances(data);
        const setExpensesRaw = (data: any) => setExpenses(data);
        const setOwnerPaymentsRaw = (data: any) => setOwnerPayments(data);
        const setTransactionsRaw = (data: any) => setTransactions(data);

        await Promise.all([
            fetchData('owners', setOwnersRaw),
            fetchData('sites', setSitesRaw),
            fetchData('categories', setCategoriesRaw),
            fetchData('workers', setWorkersRaw),
            fetchData('attendance', setAttendancesRaw),
            fetchData('work-entries', setWorkEntriesRaw),
            fetchData('advances', setAdvancesRaw),
            fetchData('expenses', setExpensesRaw),
            fetchData('owner-payments', setOwnerPaymentsRaw),
            fetchData('transactions', setTransactionsRaw),
        ]);
        setLoading(false);
    };

    const [owners, setOwners] = useState<Owner[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
    const [advances, setAdvances] = useState<Advance[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [ownerPayments, setOwnerPayments] = useState<OwnerPayment[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const deleteItem = async (endpoint: string, id: number, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            const res = await fetch(`https://caren-habitudinal-hazardously.ngrok-free.dev/manpower/${endpoint}/${id}/`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setter((prev: any[]) => prev.filter(item => String(item.id) !== String(id)));
            } else {
                console.error(`Failed to delete from ${endpoint}`);
            }
        } catch (err) {
            console.error(`Error deleting from ${endpoint}:`, err);
        }
    };

    useEffect(() => {
        getAllData();
    }, []);

    // Form states
    const [formData, setFormData] = useState<any>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };

        // Auto-calculate Expected End Date for Site Creation (Tab 1)
        if (activeTab === 1 && name === 'start_date' && value) {
            const startDate = new Date(value);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); // 7 days inclusive
            newFormData.expected_end_date = endDate.toISOString().split('T')[0];
        }

        // Dynamic Wage Calculation Logic for Category Creation (Tab 2)
        if (activeTab === 2 && (name === 'name' || name === 'experience_level')) {
            const categoryMode = name === 'name' ? value : formData.name;
            const level = name === 'experience_level' ? value : (formData.experience_level || 'Intermediate');

            if (categoryMode === 'helper') {
                newFormData.wage = 75;
            } else if (categoryMode === 'Mason') {
                const baseWage = 100;
                if (level === 'Fresh') newFormData.wage = baseWage * 0.9;
                else if (level === 'Best') newFormData.wage = baseWage * 1.1;
                else newFormData.wage = baseWage;
            }
        }

        // Auto-populate Daily Wage for Worker Creation (Tab 3 -> Now 2)
        if (activeTab === 2 && name === 'category_static_name') {
            const selected = HARDCODED_CATEGORIES.find(c => c.name === value);
            if (selected) {
                newFormData.daily_wage = selected.hourly * 8;
                // We'll also try to find the matching backend ID if categories are loaded
                const backendCat = categories.find(c => c.name === selected.name);
                if (backendCat) {
                    newFormData.category = backendCat.id;
                }
            } else {
                newFormData.daily_wage = '';
                newFormData.category = '';
            }
        }

        setFormData(newFormData);
    };

    const resetForm = () => setFormData({});

    // --- Submit Handlers ---
    const submitOwner = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            site_location: formData.site_location,
        };
        try {
            const res = await fetch('https://caren-habitudinal-hazardously.ngrok-free.dev/manpower/owners/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                setOwners([...owners, data]);
                resetForm();
                alert("✅ Owner Registered Successfully!");
            } else {
                const errorData = await res.json().catch(() => null);
                console.error("Server Error:", errorData);
                alert(`Registration failed. Server returned an error.`);
            }
        } catch (err) {
            console.error('Failed to create owner:', err);
            alert("Registration failed due to network error.");
        }
    };

    const submitSite = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            owner: Number(formData.owner),
            site_name: formData.site_name,
            location: formData.location,
            start_date: formData.start_date,
            expected_end_date: formData.expected_end_date,
        };
        try {
            const res = await fetch('https://caren-habitudinal-hazardously.ngrok-free.dev/manpower/sites/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setSites([...sites, data]);
                resetForm();
                alert("✅ Site Created Successfully!");
            } else {
                alert("❌ Failed to create site: " + JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to create site:', err);
            alert("❌ Network Error.");
        }
    };



    const submitWorker = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Ensure we have a numeric category ID
        let categoryId = Number(formData.category);
        if (!categoryId && formData.category_static_name) {
            const backendCat = categories.find(c => c.name === formData.category_static_name);
            if (backendCat) categoryId = backendCat.id;
        }

        if (!categoryId) {
            alert("⚠️ Category ID not found. Please wait for sync or ensure categories exist on backend.");
            return;
        }

        const payload = {
            category: categoryId,
            name: formData.name,
            phone: formData.phone,
            daily_wage: Number(formData.daily_wage),
            is_active: true,
        };
        try {
            const res = await fetch('https://caren-habitudinal-hazardously.ngrok-free.dev/manpower/workers/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (res.ok) {
                // If the response is OK, append the exact returned object
                setWorkers(prev => [...prev, data]);
                alert("✅ Worker Added Successfully!");
                resetForm();
            } else {
                console.error('Validation Error:', data);
                alert("❌ Failed to add worker: " + JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to create worker:', err);
            alert("❌ Network Error while adding worker.");
        }
    };

    const submitAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        const hours = Number(formData.hours);
        const duty = hours / 8;
        const payload = {
            worker: Number(formData.worker),
            site: Number(formData.site),
            date: formData.date,
            status: formData.status || 'Present',
            hours: hours,
            duty: duty
        };
        try {
            const res = await fetch('https://caren-habitudinal-hazardously.ngrok-free.dev/manpower/attendance/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setAttendances([...attendances, data]);
                // Preserve Date and Site for consecutive entries
                setFormData({
                    date: formData.date,
                    site: formData.site,
                    status: 'Present',
                    hours: ''
                });
                alert("✅ Attendance Marked!");
            } else {
                alert("❌ Failed to mark attendance: " + JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to mark attendance:', err);
            alert("❌ Network Error.");
        }
    };

    const submitWorkEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            site: Number(formData.site),
            worker: Number(formData.worker),
            work_date: formData.work_date,
            work_description: formData.work_description,
            owner_paid_amount: Number(formData.owner_paid_amount),
            worker_paid_amount: Number(formData.worker_paid_amount),
        };
        try {
            const res = await fetch('https://caren-habitudinal-hazardously.ngrok-free.dev/manpower/work-entries/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setWorkEntries([...workEntries, data]);
                resetForm();
                alert("✅ Work Entry Added!");
            } else {
                alert("❌ Error: " + JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to create work entry:', err);
            alert("❌ Network Error.");
        }
    };

    const submitAdvance = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            worker: Number(formData.worker),
            amount: Number(formData.amount),
            given_date: formData.given_date,
            note: formData.note || '',
        };
        try {
            const res = await fetch('https://caren-habitudinal-hazardously.ngrok-free.dev/manpower/advances/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setAdvances([...advances, data]);
                resetForm();
                alert("✅ Advance Recorded!");
            } else {
                alert("❌ Error: " + JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to give advance:', err);
            alert("❌ Network Error.");
        }
    };

    const submitExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            site: Number(formData.site),
            expense_type: formData.expense_type,
            amount: Number(formData.amount),
            expense_date: formData.expense_date,
            note: formData.note || '',
        };
        try {
            const res = await fetch('https://caren-habitudinal-hazardously.ngrok-free.dev/manpower/expenses/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setExpenses([...expenses, data]);
                resetForm();
                alert("✅ Expense Logged!");
            } else {
                alert("❌ Error: " + JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to create expense:', err);
            alert("❌ Network Error.");
        }
    };

    const submitOwnerPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            site: Number(formData.site),
            amount: Number(formData.amount),
            payment_date: formData.payment_date,
            payment_method: formData.payment_method,
            note: formData.note || '',
        };
        try {
            const res = await fetch('https://caren-habitudinal-hazardously.ngrok-free.dev/manpower/owner-payments/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setOwnerPayments([...ownerPayments, data]);
                resetForm();
                alert("✅ Payment Recorded!");
            } else {
                alert("❌ Error: " + JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to create owner payment:', err);
            alert("❌ Network Error.");
        }
    };

    const submitTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            transaction_type: formData.transaction_type as 'Owner Received' | 'Worker Paid' | 'Expense' | 'Advance',
            reference_id: Number(formData.reference_id),
            amount: Number(formData.amount),
            date: formData.date,
            note: formData.note || '',
        };
        try {
            const res = await fetch('https://caren-habitudinal-hazardously.ngrok-free.dev/manpower/transactions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setTransactions([...transactions, data]);
                resetForm();
                alert("✅ Transaction Recorded!");
            } else {
                alert("❌ Error: " + JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to create transaction:', err);
            alert("❌ Network Error.");
        }
    };

    // --- Navigation Tabs ---
    const [searchQuery, setSearchQuery] = useState("");

    const getDetailedSiteFinancials = (siteId: number) => {
        const siteWork = workEntries.filter(e => e.site === siteId);
        const siteExp = expenses.filter(e => e.site === siteId);
        const sitePay = ownerPayments.filter(p => p.site === siteId);

        const totalIncome = sitePay.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalExpenses = siteExp.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalWages = siteWork.reduce((sum, e) => sum + (e.worker_paid_amount || 0), 0);
        const totalBilled = siteWork.reduce((sum, e) => sum + (e.owner_paid_amount || 0), 0);

        return {
            income: totalIncome,
            outflow: totalExpenses + totalWages,
            profit: totalBilled - totalWages - totalExpenses
        };
    };

    const tabs = [
        { title: "Create Owner", icon: "👤" },
        { title: "Create Site", icon: "🏗️" },
        { title: "Create Worker", icon: "👷" },
        { title: "Mark Attendance", icon: "📅" },
        { title: "Add Work Entry", icon: "📝" },
        { title: "Add Advance", icon: "💸" },
        { title: "Add Expenses", icon: "📉" },
        { title: "Owner Payment", icon: "💰" },
        { title: "Record Transaction", icon: "📖" },
    ];

    // --- In-memory Calculations for Profit (used in Owner Payment Tab) ---
    const calculateSiteFinancials = () => {
        const siteId = Number(formData.site);
        if (!siteId) return { income: 0, outflow: 0, profit: 0, hasData: false };

        const siteWork = workEntries.filter(e => e.site === siteId);
        const siteExp = expenses.filter(e => e.site === siteId);
        const sitePay = ownerPayments.filter(p => p.site === siteId);

        // Income: What the owner owes for work + what the owner has actually paid
        const income = siteWork.reduce((sum, e) => sum + (e.owner_paid_amount || 0), 0) +
            sitePay.reduce((sum, p) => sum + (p.amount || 0), 0);

        // Outflow: What the worker is paid for work + site material expenses
        const outflow = siteWork.reduce((sum, e) => sum + (e.worker_paid_amount || 0), 0) +
            siteExp.reduce((sum, e) => sum + (e.amount || 0), 0);

        return { income, outflow, profit: income - outflow, hasData: true };
    };

    const [transactionStartDate, setTransactionStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [expenseStartDate, setExpenseStartDate] = useState(new Date().toISOString().split('T')[0]);

    const getFilteredTransactions = () => {
        const start = new Date(transactionStartDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // 7 days inclusive range

        const all = [
            ...ownerPayments.map(p => ({ ...p, type: 'Income', date: p.payment_date, displayType: 'Owner Received', amount: p.amount, note: p.note, siteId: p.site, endpoint: 'owner-payments', setter: setOwnerPayments })),
            ...expenses.map(e => ({ ...e, type: 'Expense', date: e.expense_date, displayType: 'Expense', amount: e.amount, note: `${e.expense_type}: ${e.note}`, siteId: e.site, endpoint: 'expenses', setter: setExpenses })),
            ...advances.map(a => ({ ...a, type: 'Advance', date: a.given_date, displayType: 'Advance', amount: a.amount, note: a.note, siteId: null, endpoint: 'advances', setter: setAdvances })),
            ...transactions.map(t => ({ ...t, type: t.transaction_type === 'Owner Received' ? 'Income' : 'Expense', date: t.date, displayType: t.transaction_type, amount: t.amount, note: t.note, siteId: Number(t.reference_id), endpoint: 'transactions', setter: setTransactions }))
        ];

        return all.filter(item => {
            const itemDate = new Date(item.date);
            const dateMatch = itemDate >= start && itemDate <= end;
            const siteMatch = searchQuery === "" || (item.siteId && sites.find(s => s.id === item.siteId)?.site_name.toLowerCase().includes(searchQuery.toLowerCase()));
            return dateMatch && siteMatch;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const filteredTransactions = getFilteredTransactions();

    const siteFinancials = calculateSiteFinancials();

    const generatePDF = (title: string, columns: string[], data: any[][], fileName: string) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        autoTable(doc, {
            head: [columns],
            body: data,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] },
        });

        window.open(doc.output('bloburl'), '_blank');
    };

    const [workerSearchId, setWorkerSearchId] = useState<number | null>(null);
    const [workerSearchSiteId, setWorkerSearchSiteId] = useState<number | null>(null);

    const getWorkerSalarySummary = () => {
        if (!workerSearchId || !workerSearchSiteId) return null;
        const worker = workers.find(w => w.id === workerSearchId);
        const site = sites.find(s => s.id === workerSearchSiteId);
        if (!worker || !site) return null;

        const workerAttendances = attendances.filter(a => a.worker === workerSearchId && a.site === workerSearchSiteId);
        const totalHours = workerAttendances.reduce((sum, a) => sum + (a.hours || 0), 0);
        const totalDuty = workerAttendances.reduce((sum, a) => sum + (a.duty || (a.hours ? a.hours / 8 : 0)), 0);
        const salary = totalDuty * worker.daily_wage;

        return { worker, site, totalHours, totalDuty, salary, workerAttendances };
    };

    const workerSummary = getWorkerSalarySummary();

    return (
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[800px] w-full mt-4">
            {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-600 font-bold animate-pulse text-sm">Synchronizing Cloud Data...</p>
                    </div>
                </div>
            )}
            {/* --- Left Sidebar Component Column --- */}
            <div className="w-72 bg-gray-50/80 border-r border-gray-200 flex flex-col pt-6 overflow-y-auto">
                <h4 className="px-6 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Construction Flow</h4>
                {tabs.map((tab, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setActiveTab(idx); resetForm(); }}
                        className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all group ${activeTab === idx ? "bg-white text-blue-600 border-r-4 border-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"}`}
                    >
                        <span className="text-lg opacity-70 group-hover:scale-110 transition-transform">{tab.icon}</span>
                        {tab.title}
                    </button>
                ))}
            </div>

            {/* --- Main Sub-Content Area --- */}
            <div className="flex-1 overflow-auto p-10 bg-white">

                {/* 1. OWNERS */}
                {activeTab === 0 && (
                    <div className="max-w-3xl">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">👤</span> Create Owner
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <form onSubmit={submitOwner} className="space-y-4">
                                    <div><label className="block text-sm font-bold mb-1 text-gray-700">Name</label><input required name="name" onChange={handleInputChange} value={formData.name || ''} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Ramesh Kumar" /></div>
                                    <div><label className="block text-sm font-bold mb-1 text-gray-700">Phone</label><input required name="phone" onChange={handleInputChange} value={formData.phone || ''} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20" placeholder="9876543210" /></div>
                                    <div><label className="block text-sm font-bold mb-1 text-gray-700">Email</label><input required type="email" name="email" onChange={handleInputChange} value={formData.email || ''} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. ramesh@gmail.com" /></div>
                                    <div><label className="block text-sm font-bold mb-1 text-gray-700">Address</label><input required name="address" onChange={handleInputChange} value={formData.address || ''} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Chennai" /></div>
                                    <div><label className="block text-sm font-bold mb-1 text-gray-700">Site Location</label><input required name="site_location" onChange={handleInputChange} value={formData.site_location || ''} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. OMR Chennai" /></div>
                                    <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-3 font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">Register Owner</button>
                                </form>
                            </div>
                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 overflow-x-auto">
                                <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Registered Owners</h4>
                                <table className="w-full text-left">
                                    <thead className="border-b border-gray-200">
                                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <th className="pb-3 text-center">Name</th>
                                            <th className="pb-3 text-center">Site Location</th>
                                            <th className="pb-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {owners.map(o => (
                                            <tr key={o.id} className="text-sm">
                                                <td className="py-3 font-bold text-gray-700">{o.name}</td>
                                                <td className="py-3 text-gray-500">{o.site_location}</td>
                                                <td className="py-3 text-right">
                                                    <button onClick={() => deleteItem('owners', o.id, setOwners)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {owners.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">No owners found.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. SITES */}
                {activeTab === 1 && (
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-xl font-extrabold mb-8 text-gray-900 flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20 text-lg">🏗️</span> Create Site under Owner
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white p-8 rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50">
                                <form onSubmit={submitSite} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700">Select Owner</label>
                                            <select required name="owner" onChange={handleInputChange} value={formData.owner || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20">
                                                <option value="">-- Select Owner --</option>
                                                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                            </select>
                                        </div>
                                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Site Name</label><input required name="site_name" onChange={handleInputChange} value={formData.site_name || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Green Valley Villa" /></div>
                                    </div>
                                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Location</label><input required name="location" onChange={handleInputChange} value={formData.location || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. OMR Chennai" /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Start Date</label><input required type="date" name="start_date" onChange={handleInputChange} value={formData.start_date || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20" /></div>
                                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Expected End Date</label><input required type="date" name="expected_end_date" onChange={handleInputChange} value={formData.expected_end_date || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20" /></div>
                                    </div>
                                    <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-4 font-bold hover:bg-blue-700 transition-all shadow-md">Establish New Site</button>
                                </form>
                            </div>
                            <div className="bg-white p-7 rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50">
                                <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Active Sites</h4>
                                <ul className="space-y-2">
                                    {sites.map(s => (
                                        <li key={s.id} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm flex justify-between items-center group">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700">{s.site_name}</span>
                                                <span className="text-[10px] text-gray-400">Started: {s.start_date}</span>
                                            </div>
                                            <button onClick={() => deleteItem('sites', s.id, setSites)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all">
                                                🗑️
                                            </button>
                                        </li>
                                    ))}
                                    {sites.length === 0 && <p className="text-gray-400 text-sm italic text-center">No sites established yet.</p>}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}



                {/* 3. WORKERS */}
                {activeTab === 2 && (
                    <div className="max-w-4xl">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl shadow-md shadow-orange-500/20 text-lg">👷</span> Create Worker
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white p-8 rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50">
                                <form onSubmit={submitWorker} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700">Worker Category</label>
                                            <select required name="category_static_name" onChange={handleInputChange} value={formData.category_static_name || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white">
                                                <option value="">-- Select Category --</option>
                                                {HARDCODED_CATEGORIES.map(c => (
                                                    <option key={c.name} value={c.name}>
                                                        {c.name} - ₹{c.hourly}/hr (₹{c.hourly * 8}/day)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Worker Name</label><input required name="name" onChange={handleInputChange} value={formData.name || ''} className="w-full border-gray-200 rounded-lg px-4 py-3" placeholder="e.g. Suresh" /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Phone</label><input required name="phone" onChange={handleInputChange} value={formData.phone || ''} className="w-full border-gray-200 rounded-lg px-4 py-3" placeholder="9123456789" /></div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700">Daily Wage (₹)</label>
                                            <input required type="number" name="daily_wage" onChange={handleInputChange} value={formData.daily_wage || ''} className="w-full border-gray-200 rounded-lg px-4 py-3" placeholder="e.g. 900" />
                                            {formData.category && categories.find(c => c.id === Number(formData.category)) && (
                                                <p className="text-[10px] text-gray-500 mt-1.5 italic font-medium">
                                                    Calculated: 8 hrs × ₹{categories.find(c => c.id === Number(formData.category))?.wage}/hr
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-4 font-bold hover:bg-blue-700 shadow-md">Add to Workforce</button>
                                </form>
                            </div>
                            <div className="bg-white p-7 rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50">
                                <h4 className="font-bold text-gray-500 mb-5 uppercase text-[11px] tracking-widest">Active Workforce</h4>
                                <ul className="space-y-2">
                                    {workers.map(w => (
                                        <li key={w.id} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm flex justify-between items-center group">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700">{w.name}</span>
                                                <span className="text-[10px] text-blue-600 font-medium">{categories.find(c => c.id === w.category)?.name || 'General'}</span>
                                            </div>
                                            <button onClick={() => deleteItem('workers', w.id, setWorkers)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all">
                                                🗑️
                                            </button>
                                        </li>
                                    ))}
                                    {workers.length === 0 && <p className="text-gray-400 text-sm italic text-center">No workers found.</p>}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. ATTENDANCE */}
                {activeTab === 3 && (
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-xl font-extrabold mb-8 text-gray-900 flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 text-lg">📅</span> Mark Attendance
                        </h3>
                        <div className="grid grid-cols-1 gap-8">
                            <div className="bg-white p-8 rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50">
                                <form onSubmit={submitAttendance} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 text-xs md:text-sm">
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold mb-2 text-gray-700 uppercase tracking-wider">Date</label>
                                                <input required type="date" name="date" onChange={handleInputChange} value={formData.date || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold mb-2 text-gray-700 uppercase tracking-wider">Time/Hours</label>
                                                <input required type="number" step="0.5" name="hours" placeholder="e.g. 8 or 10" onChange={handleInputChange} value={formData.hours || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 bg-blue-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-bold text-blue-700" title="8hr=1 duty, 10hr=1.25 duty" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-2 text-gray-700 uppercase tracking-wider">Assigned Site</label>
                                            <select required name="site" onChange={handleInputChange} value={formData.site || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white">
                                                <option value="">-- Select --</option>
                                                {sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold mb-2 text-gray-700 uppercase tracking-wider">Worker</label>
                                            <select required name="worker" onChange={handleInputChange} value={formData.worker || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white">
                                                <option value="">-- Select --</option>
                                                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-2 text-gray-700 uppercase tracking-wider text-gray-400">Attendance Status (Optional)</label>
                                            <div className="flex gap-4">
                                                {['Present', 'Absent'].map(stat => (
                                                    <label key={stat} className="flex-1">
                                                        <input type="radio" name="status" value={stat} checked={formData.status === stat} onChange={handleInputChange} className="hidden peer" />
                                                        <div className={`text-center py-3 rounded-lg border-2 cursor-pointer transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-600 border-gray-100 text-gray-400 font-bold text-xs bg-gray-50/50`}>
                                                            {stat}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div className="text-xs text-gray-400 italic">
                                            Auto-duty: {formData.hours ? (Number(formData.hours) / 8).toFixed(2) : '0.00'} Duty
                                        </div>
                                        <button type="submit" className="bg-blue-600 text-white px-12 py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-transform active:scale-95">Submit Attendance</button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 shadow-sm mt-8">
                                <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Worker Weekly Salary Summary</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Worker</label>
                                        <select onChange={(e) => setWorkerSearchId(Number(e.target.value))} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                                            <option value="">-- All Workers --</option>
                                            {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Site</label>
                                        <select onChange={(e) => setWorkerSearchSiteId(Number(e.target.value))} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                                            <option value="">-- All Sites --</option>
                                            {sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {workerSummary ? (
                                    <div className="bg-white p-4 rounded-xl border border-blue-100 animate-in fade-in zoom-in duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h5 className="font-black text-gray-800 text-lg">{workerSummary.worker.name}</h5>
                                                <p className="text-xs text-gray-400 italic">Site: {workerSummary.site.site_name}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const data = workerSummary.workerAttendances.map(a => [a.date, a.hours || 0, (a.duty || (a.hours ? a.hours / 8 : 0)).toFixed(2)]);
                                                    generatePDF(`Attendance Report: ${workerSummary.worker.name}`, ["Date", "Hours", "Duty"], data, "attendance.pdf");
                                                }}
                                                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md flex items-center gap-2"
                                            >
                                                🖨️ Print PDF
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-50">
                                            <div className="text-center"><p className="text-[8px] text-gray-400 uppercase font-bold">Total Hrs</p><p className="text-sm font-black text-gray-700">{workerSummary.totalHours}</p></div>
                                            <div className="text-center"><p className="text-[8px] text-gray-400 uppercase font-bold">Total Duty</p><p className="text-sm font-black text-orange-600">{workerSummary.totalDuty.toFixed(2)}</p></div>
                                            <div className="text-center"><p className="text-[8px] text-gray-400 uppercase font-bold">Total Salary</p><p className="text-sm font-black text-green-600">₹{workerSummary.salary.toFixed(2)}</p></div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-400 text-xs italic py-10">Select both worker and site to see calculation</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <h4 className="p-4 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest border-b">Recent Attendance</h4>
                            <div className="max-h-[300px] overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50/50 text-[10px] text-gray-400 uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Worker</th>
                                            <th className="px-6 py-3">Site</th>
                                            <th className="px-6 py-3 text-center">Hrs</th>
                                            <th className="px-6 py-3 text-center">Duty</th>
                                            <th className="px-6 py-3 text-center">Salary</th>
                                            <th className="px-6 py-3 text-center">Status</th>
                                            <th className="px-6 py-3 text-right">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {attendances.slice().reverse().map(a => {
                                            const worker = workers.find(w => w.id === a.worker);
                                            const salary = worker && a.hours ? (worker.daily_wage / 8) * a.hours : 0;
                                            return (
                                                <tr key={a.id}>
                                                    <td className="px-6 py-4">{a.date}</td>
                                                    <td className="px-6 py-4 font-bold">{worker?.name}</td>
                                                    <td className="px-6 py-4">{sites.find(s => s.id === a.site)?.site_name}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-blue-600">{a.hours !== undefined && a.hours !== null ? a.hours : '—'}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-orange-600">
                                                        {a.duty !== undefined && a.duty !== null ? a.duty.toFixed(2) : (a.hours ? (a.hours / 8).toFixed(2) : '0.00')}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-green-600">
                                                        ₹{salary.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.status === 'Absent' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{a.status || 'Present'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => deleteItem('attendance', a.id, setAttendances)} className="text-red-400 hover:text-red-600">🗑️</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. WORK ENTRY */}
                {activeTab === 4 && (
                    <div className="max-w-6xl mx-auto">
                        <h3 className="text-xl font-extrabold mb-8 text-gray-900 flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20 text-lg">📝</span> Work Entry / Worker Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white p-8 rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50">
                                <form onSubmit={submitWorkEntry} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-bold mb-1">Work Date</label><input required type="date" name="work_date" onChange={handleInputChange} value={formData.work_date || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5" /></div>
                                        <div><label className="block text-sm font-bold mb-1">Site</label><select required name="site" onChange={handleInputChange} value={formData.site || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50">{sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}</select></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-bold mb-1">Worker</label><select required name="worker" onChange={handleInputChange} value={formData.worker || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50">{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                                        <div><label className="block text-sm font-bold mb-1">Owner Billed Amount (₹)</label><input required type="number" name="owner_paid_amount" onChange={handleInputChange} value={formData.owner_paid_amount || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5" placeholder="e.g. 1500" /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-bold mb-1">Worker Paid Amount (₹)</label><input required type="number" name="worker_paid_amount" onChange={handleInputChange} value={formData.worker_paid_amount || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5" placeholder="e.g. 1000" /></div>
                                        <div><label className="block text-sm font-bold mb-1">Work Hrs</label><input required type="number" name="hours" onChange={handleInputChange} value={formData.hours || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5" placeholder="e.g. 8" /></div>
                                    </div>
                                    <div><label className="block text-sm font-bold mb-1">Work Description</label><textarea required name="work_description" onChange={handleInputChange} value={formData.work_description || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 h-24" placeholder="Describe the work done today..." /></div>
                                    <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-4 font-bold hover:bg-blue-700 shadow-md">Record Progress</button>
                                </form>
                            </div>

                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Site-wise Work Logs</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const data = workEntries.map(e => [e.work_date, sites.find(s => s.id === e.site)?.site_name || '', workers.find(w => w.id === e.worker)?.name || '', e.hours || '—']);
                                                generatePDF("Work Logs (Owner Copy)", ["Date", "Site", "Worker", "Hrs"], data, "owner_logs.pdf");
                                            }}
                                            className="text-[10px] bg-white border border-gray-200 px-3 py-1 rounded-lg font-bold hover:bg-gray-100"
                                        >
                                            👤 Owner PDF
                                        </button>
                                        <button
                                            onClick={() => {
                                                const data = workEntries.map(e => [e.work_date, sites.find(s => s.id === e.site)?.site_name || '', workers.find(w => w.id === e.worker)?.name || '', e.hours || '—', `₹${e.owner_paid_amount}`, `₹${e.worker_paid_amount}`]);
                                                generatePDF("Work Logs (Admin Copy)", ["Date", "Site", "Worker", "Hrs", "Owner Billed", "Worker Paid"], data, "admin_logs.pdf");
                                            }}
                                            className="text-[10px] bg-gray-800 text-white px-3 py-1 rounded-lg font-bold hover:bg-black"
                                        >
                                            ⚙️ Admin PDF
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search by worker name..."
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-6 max-h-[600px] overflow-y-auto">
                                    {sites.map(site => {
                                        const entries = workEntries.filter(e => e.site === site.id && (searchQuery === "" || workers.find(w => w.id === e.worker)?.name.toLowerCase().includes(searchQuery.toLowerCase())));
                                        if (entries.length === 0) return null;
                                        return (
                                            <div key={site.id} className="space-y-2">
                                                <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full w-fit">{site.site_name}</h5>
                                                {entries.reverse().map(e => (
                                                    <div key={e.id} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm relative group">
                                                        <button onClick={() => deleteItem('work-entries', e.id, setWorkEntries)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all text-xs">🗑️</button>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-[10px] font-bold text-gray-400">{e.work_date}</span>
                                                            <span className="text-[10px] font-black text-gray-800">{workers.find(w => w.id === e.worker)?.name} • {e.hours || '—'} hrs</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 italic mt-1">{e.work_description}</p>
                                                        <div className="mt-3 flex justify-between border-t pt-2 border-gray-50">
                                                            <div><p className="text-[8px] uppercase text-gray-400">Billed</p><p className="text-xs font-bold text-green-600">₹{e.owner_paid_amount}</p></div>
                                                            <div className="text-right"><p className="text-[8px] uppercase text-gray-400">Paid Worker</p><p className="text-xs font-bold text-red-600">₹{e.worker_paid_amount}</p></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                    {workEntries.length === 0 && <p className="text-gray-400 text-sm italic text-center">No work entries yet.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. ADVANCES */}
                {activeTab === 5 && (
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-xl font-extrabold mb-8 text-gray-900 flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-rose-500 to-red-500 text-white rounded-xl shadow-md shadow-red-500/20 text-lg">💸</span> Add Employee Advance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white p-8 rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50">
                                <form onSubmit={submitAdvance} className="space-y-6">
                                    <div><label className="block text-sm font-bold">Worker</label><select required name="worker" onChange={handleInputChange} value={formData.worker || ''} className="w-full border rounded-lg px-4 py-3 bg-gray-50">{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-bold">Date</label><input required type="date" name="given_date" onChange={handleInputChange} value={formData.given_date || ''} className="w-full border rounded-lg px-4 py-3" /></div>
                                        <div><label className="block text-sm font-bold">Amount (₹)</label><input required type="number" name="amount" onChange={handleInputChange} value={formData.amount || ''} className="w-full border rounded-lg px-4 py-3" /></div>
                                    </div>
                                    <div><label className="block text-sm font-bold">Note</label><input name="note" onChange={handleInputChange} value={formData.note || ''} className="w-full border rounded-lg px-4 py-3" placeholder="e.g. Festival advance" /></div>
                                    <button type="submit" className="w-full bg-red-500 text-white rounded-lg py-4 font-bold hover:bg-red-600 transition-all">Deduct & Pay Advance</button>
                                </form>
                            </div>

                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 max-h-[500px] overflow-y-auto">
                                <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Advance History</h4>
                                <div className="space-y-3">
                                    {advances.slice().reverse().map(a => {
                                        const worker = workers.find(w => w.id === a.worker);
                                        const workerWorkerEntries = workEntries.filter(e => e.worker === a.worker);
                                        const totalEarned = workerWorkerEntries.reduce((s, e) => s + (e.worker_paid_amount || 0), 0);
                                        const totalAdvance = advances.filter(adv => adv.worker === a.worker).reduce((s, adv) => s + adv.amount, 0);
                                        const balance = totalEarned - totalAdvance;

                                        return (
                                            <div key={a.id} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm flex justify-between items-center group">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800">{worker?.name}</p>
                                                    <p className="text-[10px] text-gray-400">{a.given_date} • {a.note || 'Advance'}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <p className="text-xs font-black text-red-600">₹{a.amount}</p>
                                                        <span className="text-[10px] text-gray-300">|</span>
                                                        <p className="text-[10px] font-bold text-gray-500">Bal: <span className={balance >= 0 ? 'text-green-600' : 'text-orange-600'}>₹{balance.toFixed(2)}</span></p>
                                                    </div>
                                                </div>
                                                <button onClick={() => deleteItem('advances', a.id, setAdvances)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all">🗑️</button>
                                            </div>
                                        );
                                    })}
                                    {advances.length === 0 && <p className="text-gray-400 text-sm italic text-center">No advances recorded.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. EXPENSES */}
                {activeTab === 6 && (
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-xl font-extrabold mb-8 text-gray-900 flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-gray-600 to-gray-800 text-white rounded-xl shadow-md shadow-gray-500/20 text-lg">📉</span> Add Expenses
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white p-8 rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50">
                                <form onSubmit={submitExpense} className="space-y-6">
                                    <div><label className="block text-sm font-bold">Target Site</label><select required name="site" onChange={handleInputChange} value={formData.site || ''} className="w-full border rounded-lg px-4 py-3 bg-gray-50">{sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}</select></div>
                                    <div><label className="block text-sm font-bold">Expense Type</label><input required name="expense_type" onChange={handleInputChange} value={formData.expense_type || ''} className="w-full border rounded-lg px-4 py-3" placeholder="e.g. Cement" /></div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-bold">Date</label><input required type="date" name="expense_date" onChange={handleInputChange} value={formData.expense_date || ''} className="w-full border rounded-lg px-4 py-3" /></div>
                                        <div><label className="block text-sm font-bold">Total Cost (₹)</label><input required type="number" name="amount" onChange={handleInputChange} value={formData.amount || ''} className="w-full border rounded-lg px-4 py-3" /></div>
                                    </div>
                                    <div><label className="block text-sm font-bold">Note</label><input name="note" onChange={handleInputChange} value={formData.note || ''} className="w-full border rounded-lg px-4 py-3" placeholder="e.g. 50 bags cement" /></div>
                                    <button type="submit" className="w-full bg-gray-800 text-white rounded-lg py-4 font-bold hover:bg-black">Log Material Expense</button>
                                </form>
                            </div>

                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 max-h-[500px] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Expense log</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-400">From:</span>
                                        <input
                                            type="date"
                                            value={expenseStartDate}
                                            onChange={(e) => setExpenseStartDate(e.target.value)}
                                            className="text-[10px] border-gray-200 rounded px-2 py-1 font-bold text-blue-600"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {expenses.filter(ex => {
                                        const start = new Date(expenseStartDate);
                                        const end = new Date(start);
                                        end.setDate(end.getDate() + 6); // 7 days inclusive range
                                        const d = new Date(ex.expense_date);
                                        return d >= start && d <= end;
                                    }).reverse().map(ex => (
                                        <div key={ex.id} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm relative group">
                                            <button onClick={() => deleteItem('expenses', ex.id, setExpenses)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all text-xs">🗑️</button>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight">{sites.find(s => s.id === ex.site)?.site_name}</span>
                                                <span className="text-[10px] text-gray-400">{ex.expense_date}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800">{ex.expense_type}</p>
                                            <p className="text-xs font-black text-red-600 mt-1">₹{ex.amount}</p>
                                        </div>
                                    ))}
                                    {expenses.filter(ex => {
                                        const start = new Date(expenseStartDate);
                                        const end = new Date(start);
                                        end.setDate(end.getDate() + 6);
                                        const d = new Date(ex.expense_date);
                                        return d >= start && d <= end;
                                    }).length === 0 && <p className="text-gray-400 text-sm italic text-center py-10">No expenses logged in this range.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 8. OWNER PAYMENTS */}
                {activeTab === 7 && (
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-xl font-extrabold mb-8 text-gray-900 flex items-center gap-3">
                            <span className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-md shadow-green-500/20 text-lg">💰</span> Add Owner Payment
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Summary Section */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Site Financial Summary</h4>
                                    {siteFinancials.hasData && (
                                        <button
                                            onClick={() => {
                                                const site = sites.find(s => s.id === Number(formData.site));
                                                const data = [
                                                    ["Total Income", `₹${siteFinancials.income}`],
                                                    ["Total Outflow", `₹${siteFinancials.outflow}`],
                                                    ["Estimated Profit", `₹${siteFinancials.profit}`]
                                                ];
                                                generatePDF(`Financial Summary: ${site?.site_name}`, ["Category", "Amount"], data, "financial_summary.pdf");
                                            }}
                                            className="text-[10px] bg-white border border-gray-300 px-3 py-1 rounded-lg font-bold hover:bg-gray-50"
                                        >
                                            🖨️ Print Report
                                        </button>
                                    )}
                                </div>
                                {siteFinancials.hasData ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                                            <span>Total site Income:</span>
                                            <span className="text-green-600 font-bold">₹{siteFinancials.income}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                                            <span>Total site Outflow:</span>
                                            <span className="text-red-600 font-bold">₹{siteFinancials.outflow}</span>
                                        </div>
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-gray-800 uppercase">Estimated Profit:</span>
                                                <span className={`text-xl font-black ${siteFinancials.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ₹{siteFinancials.profit}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-[10px] text-gray-400 leading-tight">
                                                *Calculated based on Work Entries (Billed vs. Paid Wages) + Direct Material Expenses + Recorded Payments.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center">
                                        <p className="text-gray-400 text-xs font-semibold italic">Select a site to view financial summary</p>
                                    </div>
                                )}
                            </div>

                            {/* Form Section */}
                            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                                <form onSubmit={submitOwnerPayment} className="space-y-6">
                                    <div><label className="block text-sm font-bold">Target Site</label><select required name="site" onChange={handleInputChange} value={formData.site || ''} className="w-full border rounded-lg px-4 py-3 bg-gray-50">{sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}</select></div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-bold">Payment Date</label><input required type="date" name="payment_date" onChange={handleInputChange} value={formData.payment_date || ''} className="w-full border rounded-lg px-4 py-3" /></div>
                                        <div><label className="block text-sm font-bold">Received Amount (₹)</label><input required type="number" name="amount" onChange={handleInputChange} value={formData.amount || ''} className="w-full border rounded-lg px-4 py-3" /></div>
                                    </div>
                                    <div><label className="block text-sm font-bold">Payment Method</label><input required name="payment_method" onChange={handleInputChange} value={formData.payment_method || ''} className="w-full border rounded-lg px-4 py-3" placeholder="e.g. Cash, Bank Transfer" /></div>
                                    <div><label className="block text-sm font-bold">Note</label><input name="note" onChange={handleInputChange} value={formData.note || ''} className="w-full border rounded-lg px-4 py-3" placeholder="e.g. First installment" /></div>
                                    <button type="submit" className="w-full bg-green-600 text-white rounded-lg py-4 font-bold hover:bg-green-700 shadow-md shadow-green-500/20">Record Payment Input</button>
                                </form>
                            </div>
                        </div>

                        {/* Recent Payments List */}
                        <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <h4 className="p-4 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest border-b">Recent Owner Payments</h4>
                            <div className="max-h-[300px] overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50/50 text-[10px] text-gray-400 uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Site</th>
                                            <th className="px-6 py-3">Method</th>
                                            <th className="px-6 py-3">Note</th>
                                            <th className="px-6 py-3 text-right">Amount</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {ownerPayments.slice().reverse().map(p => (
                                            <tr key={p.id}>
                                                <td className="px-6 py-4">{p.payment_date}</td>
                                                <td className="px-6 py-4 font-bold">{sites.find(s => s.id === p.site)?.site_name}</td>
                                                <td className="px-6 py-4">{p.payment_method}</td>
                                                <td className="px-6 py-4 text-gray-400 italic text-xs">{p.note}</td>
                                                <td className="px-6 py-4 text-right font-bold text-green-600">₹{p.amount}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => deleteItem('owner-payments', p.id, setOwnerPayments)} className="text-red-400 hover:text-red-600">🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {ownerPayments.length === 0 && (
                                            <tr><td colSpan={6} className="py-10 text-center text-gray-400 italic">No payments recorded yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 9. RECORD TRANSACTION (Ledger) */}
                {activeTab === 8 && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
                                <span className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl shadow-md shadow-purple-500/20 text-lg">📖</span> Transaction Ledger
                            </h3>
                            <button
                                onClick={() => {
                                    const data = filteredTransactions.map(t => [t.date, t.siteId ? (sites.find(s => s.id === t.siteId)?.site_name || 'Manual') : 'Worker', t.displayType, t.note || '—', `${t.type === 'Income' ? '+' : '-'}₹${t.amount}`]);
                                    generatePDF(`Ledger Report (${transactionStartDate} to +6 days)`, ["Date", "Site/Worker", "Type", "Note", "Amount"], data, "ledger.pdf");
                                }}
                                className="bg-gray-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-black shadow-lg flex items-center gap-2"
                            >
                                🖨️ Print Ledger
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Add Entry Form */}
                            <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Record Manual Entry</h4>
                                <form onSubmit={submitTransaction} className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Type</label>
                                        <select required name="transaction_type" onChange={handleInputChange} value={formData.transaction_type || ''} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50">
                                            <option value="">-- Type --</option>
                                            <option value="Owner Received">💰 Owner Received</option>
                                            <option value="Worker Paid">👷 Worker Paid</option>
                                            <option value="Expense">📉 Expense</option>
                                            <option value="Advance">💸 Advance</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Site</label>
                                        <select required name="reference_id" onChange={handleInputChange} value={formData.reference_id || ''} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50">
                                            <option value="">-- Site --</option>
                                            {sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Date</label>
                                        <input required type="date" name="date" onChange={handleInputChange} value={formData.date || ''} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount</label>
                                        <input required type="number" name="amount" onChange={handleInputChange} value={formData.amount || ''} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Note</label>
                                        <input name="note" onChange={handleInputChange} value={formData.note || ''} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div className="col-span-2 pt-2">
                                        <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700">Record Entry</button>
                                    </div>
                                </form>
                            </div>

                            {/* Search & Filter */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Filter Ledger</h4>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Scan Start Date</label>
                                    <input
                                        type="date"
                                        value={transactionStartDate}
                                        onChange={(e) => setTransactionStartDate(e.target.value)}
                                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-600"
                                    />
                                    <p className="text-[9px] text-gray-400 mt-1 italic tracking-tight">Scanning range: {transactionStartDate} to {new Date(new Date(transactionStartDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} (7 days inclusive)</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Search Site</label>
                                    <input
                                        type="text"
                                        placeholder="Type site name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="pt-4 border-t">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Weekly Summary</p>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500">Total In:</span>
                                        <span className="text-xs font-bold text-green-600">₹{filteredTransactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Total Out:</span>
                                        <span className="text-xs font-bold text-red-600">₹{filteredTransactions.filter(t => t.type !== 'Income').reduce((s, t) => s + t.amount, 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction List */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 text-[10px] text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Site/Target</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Note</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredTransactions.map((t, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500">{t.date}</td>
                                            <td className="px-6 py-4 font-bold text-gray-700">
                                                {t.siteId ? (sites.find(s => s.id === t.siteId)?.site_name) : 'Worker Balance'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${t.type === 'Income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {t.displayType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-400 italic">{t.note}</td>
                                            <td className={`px-6 py-4 text-right font-black ${t.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                                                {t.type === 'Income' ? '+' : '-'}₹{t.amount}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => deleteItem(t.endpoint, t.id, t.setter)} className="text-red-400 hover:text-red-600">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center text-gray-400 italic">No entries match the selected date range and search filter.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ManpowerSection;

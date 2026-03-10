import React, { useState, useEffect } from 'react';

// --- Interfaces ---
interface Owner { id: number; name: string; phone: string; email: string; address: string; site_location: string; }
interface Site { id: number; owner: number; site_name: string; location: string; start_date: string; expected_end_date: string; }
interface Category { id: number; name: string; wage: number; }
interface Worker { id: number; category: number; name: string; phone: string; daily_wage: number; is_active: boolean; }
interface Attendance { id: number; date: string; site: number; worker: number; status: 'Present' | 'Absent' | 'Half Day'; }
interface WorkEntry { id: number; work_date: string; site: number; worker: number; work_description: string; owner_paid_amount: number; worker_paid_amount: number; }
interface Advance { id: number; given_date: string; worker: number; amount: number; note: string; }
interface Expense { id: number; expense_date: string; site: number; expense_type: string; amount: number; note: string; }
interface OwnerPayment { id: number; payment_date: string; site: number; amount: number; payment_method: string; note: string; }
interface Transaction { id: number; date: string; reference_id: number; transaction_type: 'Owner Received' | 'Worker Paid' | 'Expense' | 'Advance'; amount: number; note: string; }

const ManpowerSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async (endpoint: string, setter: (data: any) => void) => {
        try {
            const res = await fetch(`https://api.codingboss.in/manpower/${endpoint}/`);
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
            const res = await fetch(`https://api.codingboss.in/manpower/${endpoint}/${id}/`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setter((prev: any[]) => prev.filter(item => item.id !== id));
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            const res = await fetch('https://api.codingboss.in/manpower/owners/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                setOwners([...owners, { id: data.id ?? Date.now(), ...payload }]);
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
            const res = await fetch('https://api.codingboss.in/manpower/sites/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setSites([...sites, { id: data.id ?? Date.now(), ...payload }]);
            resetForm();
        } catch (err) {
            console.error('Failed to create site:', err);
        }
    };

    const submitCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { name: formData.name };
        try {
            const res = await fetch('https://api.codingboss.in/manpower/categories/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setCategories([...categories, { id: data.id ?? Date.now(), name: payload.name, wage: Number(formData.wage) }]);
            resetForm();
        } catch (err) {
            console.error('Failed to create category:', err);
        }
    };

    const submitWorker = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            category: Number(formData.category),
            name: formData.name,
            phone: formData.phone,
            daily_wage: Number(formData.daily_wage),
            is_active: true,
        };
        try {
            const res = await fetch('https://api.codingboss.in/manpower/workers/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setWorkers([...workers, { id: data.id ?? Date.now(), ...payload }]);
            resetForm();
        } catch (err) {
            console.error('Failed to create worker:', err);
        }
    };

    const submitAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            worker: Number(formData.worker),
            site: Number(formData.site),
            date: formData.date,
            status: formData.status,
        };
        try {
            const res = await fetch('https://api.codingboss.in/manpower/attendance/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setAttendances([...attendances, { id: data.id ?? Date.now(), ...payload }]);
            resetForm();
        } catch (err) {
            console.error('Failed to mark attendance:', err);
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
            const res = await fetch('https://api.codingboss.in/manpower/work-entries/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setWorkEntries([...workEntries, { id: data.id ?? Date.now(), ...payload }]);
            resetForm();
        } catch (err) {
            console.error('Failed to create work entry:', err);
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
            const res = await fetch('https://api.codingboss.in/manpower/advances/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setAdvances([...advances, { id: data.id ?? Date.now(), ...payload }]);
            resetForm();
        } catch (err) {
            console.error('Failed to give advance:', err);
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
            const res = await fetch('https://api.codingboss.in/manpower/expenses/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setExpenses([...expenses, { id: data.id ?? Date.now(), ...payload }]);
            resetForm();
        } catch (err) {
            console.error('Failed to create expense:', err);
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
            const res = await fetch('https://api.codingboss.in/manpower/owner-payments/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setOwnerPayments([...ownerPayments, { id: data.id ?? Date.now(), ...payload }]);
            resetForm();
        } catch (err) {
            console.error('Failed to create owner payment:', err);
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
            const res = await fetch('https://api.codingboss.in/manpower/transactions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setTransactions([...transactions, { id: data.id ?? Date.now(), ...payload }]);
            resetForm();
        } catch (err) {
            console.error('Failed to create transaction:', err);
        }
    };

    // --- Navigation Tabs ---
    const tabs = [
        { title: "Create Owner", icon: "👤" },
        { title: "Create Site", icon: "🏗️" },
        { title: "Worker Category", icon: "📂" },
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

    const siteFinancials = calculateSiteFinancials();

    return (
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex h-[750px] w-full mt-4">
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
                    <div className="max-w-4xl">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">🏗️</span> Create Site under Owner
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
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
                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Active Sites</h4>
                                <ul className="space-y-2">
                                    {sites.map(s => (
                                        <li key={s.id} className="p-3 bg-white rounded-lg border border-gray-100 font-bold text-gray-700 shadow-sm flex justify-between items-center group">
                                            <span>{s.site_name}</span>
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

                {/* 3. CATEGORIES */}
                {activeTab === 2 && (
                    <div className="max-w-3xl">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📂</span> Worker Category
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <form onSubmit={submitCategory} className="space-y-4">
                                    <div><label className="block text-sm font-bold mb-1 text-gray-700">Category Name</label><input required name="name" onChange={handleInputChange} value={formData.name || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5" placeholder="e.g. Mason" /></div>
                                    <div><label className="block text-sm font-bold mb-1 text-gray-700">Daily Wage (₹)</label><input required type="number" name="wage" onChange={handleInputChange} value={formData.wage || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5" placeholder="500" /></div>
                                    <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-3 font-bold hover:bg-blue-700">Create Category</button>
                                </form>
                            </div>
                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Active Categories</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {categories.map(c => (
                                        <div key={c.id} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm font-bold text-sm text-gray-800 flex justify-between items-center group">
                                            <span>{c.name}</span>
                                            <button onClick={() => deleteItem('categories', c.id, setCategories)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all">
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                    {categories.length === 0 && <p className="text-gray-400 text-sm italic text-center">No categories.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. WORKERS */}
                {activeTab === 3 && (
                    <div className="max-w-4xl">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">👷</span> Create Worker
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                                <form onSubmit={submitWorker} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700">Worker Category</label>
                                            <select required name="category" onChange={handleInputChange} value={formData.category || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white">
                                                <option value="">-- Select --</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Worker Name</label><input required name="name" onChange={handleInputChange} value={formData.name || ''} className="w-full border-gray-200 rounded-lg px-4 py-3" placeholder="e.g. Suresh" /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Phone</label><input required name="phone" onChange={handleInputChange} value={formData.phone || ''} className="w-full border-gray-200 rounded-lg px-4 py-3" placeholder="9123456789" /></div>
                                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Daily Wage (₹)</label><input required type="number" name="daily_wage" onChange={handleInputChange} value={formData.daily_wage || ''} className="w-full border-gray-200 rounded-lg px-4 py-3" placeholder="e.g. 900" /></div>
                                    </div>
                                    <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-4 font-bold hover:bg-blue-700 shadow-md">Add to Workforce</button>
                                </form>
                            </div>
                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Active Workforce</h4>
                                <ul className="space-y-2">
                                    {workers.map(w => (
                                        <li key={w.id} className="p-3 bg-white rounded-lg border border-gray-100 font-bold text-gray-700 shadow-sm flex justify-between items-center group">
                                            <span>{w.name}</span>
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

                {/* 5. ATTENDANCE */}
                {activeTab === 4 && (
                    <div className="max-w-4xl">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📅</span> Mark Attendance
                        </h3>
                        <div className="grid grid-cols-1 gap-8">
                            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg">
                                <form onSubmit={submitAttendance} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                                    <div className="space-y-6">
                                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Date</label><input required type="date" name="date" onChange={handleInputChange} value={formData.date || ''} className="w-full border-gray-200 rounded-lg px-4 py-3" /></div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700">Assigned Site</label>
                                            <select required name="site" onChange={handleInputChange} value={formData.site || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                                                <option value="">-- Select --</option>
                                                {sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700">Worker</label>
                                            <select required name="worker" onChange={handleInputChange} value={formData.worker || ''} className="w-full border-gray-200 rounded-lg px-4 py-3">
                                                <option value="">-- Select --</option>
                                                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-gray-700">Work Status</label>
                                            <div className="flex gap-4">
                                                {['Present', 'Absent', 'Half Day'].map(stat => (
                                                    <label key={stat} className="flex-1">
                                                        <input type="radio" name="status" value={stat} checked={formData.status === stat} onChange={handleInputChange} className="hidden peer" />
                                                        <div className={`text-center py-3 rounded-lg border-2 cursor-pointer transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-600 border-gray-100 text-gray-400 font-bold text-sm bg-gray-50/50`}>
                                                            {stat}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2 pt-4 border-t border-gray-100 flex justify-end">
                                        <button type="submit" className="bg-blue-600 text-white px-12 py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg">Submit Entry</button>
                                    </div>
                                </form>
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
                                                <th className="px-6 py-3 text-center">Status</th>
                                                <th className="px-6 py-3 text-right">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {attendances.slice().reverse().map(a => (
                                                <tr key={a.id}>
                                                    <td className="px-6 py-4">{a.date}</td>
                                                    <td className="px-6 py-4 font-bold">{workers.find(w => w.id === a.worker)?.name}</td>
                                                    <td className="px-6 py-4">{sites.find(s => s.id === a.site)?.site_name}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.status === 'Present' ? 'bg-green-50 text-green-600' : a.status === 'Absent' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{a.status}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => deleteItem('attendance', a.id, setAttendances)} className="text-red-400 hover:text-red-600">🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. WORK ENTRY */}
                {activeTab === 5 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                            <form onSubmit={submitWorkEntry} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-bold mb-1">Work Date</label><input required type="date" name="work_date" onChange={handleInputChange} value={formData.work_date || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5" /></div>
                                    <div><label className="block text-sm font-bold mb-1">Site</label><select required name="site" onChange={handleInputChange} value={formData.site || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50">{sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}</select></div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-bold mb-1">Worker</label><select required name="worker" onChange={handleInputChange} value={formData.worker || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50">{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                                    <div><label className="block text-sm font-bold mb-1">Owner Paid Amount (₹)</label><input required type="number" name="owner_paid_amount" onChange={handleInputChange} value={formData.owner_paid_amount || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5" placeholder="e.g. 1500" /></div>
                                </div>
                                <div><label className="block text-sm font-bold mb-1">Worker Paid Amount (₹)</label><input required type="number" name="worker_paid_amount" onChange={handleInputChange} value={formData.worker_paid_amount || ''} className="w-full border-gray-200 rounded-lg px-4 py-2.5" placeholder="e.g. 1000" /></div>
                                <div><label className="block text-sm font-bold mb-1">Work Description</label><textarea required name="work_description" onChange={handleInputChange} value={formData.work_description || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 h-32" placeholder="Describe the work done today..." /></div>
                                <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-4 font-bold hover:bg-blue-700 shadow-md">Record Work Progress</button>
                            </form>
                        </div>

                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 max-h-[600px] overflow-y-auto">
                            <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Recent Work Logs</h4>
                            <div className="space-y-4">
                                {workEntries.slice().reverse().map(e => (
                                    <div key={e.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm relative group">
                                        <button onClick={() => deleteItem('work-entries', e.id, setWorkEntries)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all">🗑️</button>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-gray-400">{e.work_date}</span>
                                            <span className="text-[10px] font-black text-blue-600">Site: {sites.find(s => s.id === e.site)?.site_name}</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-800">{workers.find(w => w.id === e.worker)?.name}</p>
                                        <p className="text-xs text-gray-500 italic mt-1">{e.work_description}</p>
                                        <div className="mt-3 flex justify-between border-t pt-2 border-gray-50">
                                            <div><p className="text-[8px] uppercase text-gray-400">Billed</p><p className="text-xs font-bold text-green-600">₹{e.owner_paid_amount}</p></div>
                                            <div className="text-right"><p className="text-[8px] uppercase text-gray-400">Paid Worker</p><p className="text-xs font-bold text-red-600">₹{e.worker_paid_amount}</p></div>
                                        </div>
                                    </div>
                                ))}
                                {workEntries.length === 0 && <p className="text-gray-400 text-sm italic text-center">No work entries yet.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. ADVANCES */}
                {activeTab === 6 && (
                    <div className="max-w-2xl">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">💸</span> Add Employee Advance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
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
                                    {advances.slice().reverse().map(a => (
                                        <div key={a.id} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm flex justify-between items-center group">
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{workers.find(w => w.id === a.worker)?.name}</p>
                                                <p className="text-[10px] text-gray-400">{a.given_date} • {a.note || 'Advance'}</p>
                                                <p className="text-xs font-black text-red-600">₹{a.amount}</p>
                                            </div>
                                            <button onClick={() => deleteItem('advances', a.id, setAdvances)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all">🗑️</button>
                                        </div>
                                    ))}
                                    {advances.length === 0 && <p className="text-gray-400 text-sm italic text-center">No advances recorded.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 8. EXPENSES */}
                {activeTab === 7 && (
                    <div className="max-w-2xl">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📉</span> Add Expenses
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
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
                                <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Expense log</h4>
                                <div className="space-y-3">
                                    {expenses.slice().reverse().map(ex => (
                                        <div key={ex.id} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm relative group">
                                            <button onClick={() => deleteItem('expenses', ex.id, setExpenses)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all">🗑️</button>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-bold text-blue-600">{sites.find(s => s.id === ex.site)?.site_name}</span>
                                                <span className="text-[10px] text-gray-400">{ex.expense_date}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800">{ex.expense_type}</p>
                                            <p className="text-xs font-black text-red-600 mt-1">₹{ex.amount}</p>
                                        </div>
                                    ))}
                                    {expenses.length === 0 && <p className="text-gray-400 text-sm italic text-center">No expenses logged.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 9. OWNER PAYMENTS */}
                {activeTab === 8 && (
                    <div className="max-w-4xl">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">💰</span> Add Owner Payment
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Summary Section */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">Site Financial Summary</h4>
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
                    </div>
                )}

                {/* 10. RECORD TRANSACTION (Ledger) */}
                {activeTab === 9 && (
                    <div className="max-w-5xl">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📖</span> Record Transaction (Total Ledger)
                        </h3>

                        {/* Input Form */}
                        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm mb-8">
                            <h4 className="text-base font-bold text-gray-700 mb-6">Add Manual Entry</h4>
                            <form onSubmit={submitTransaction} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Transaction Type</label>
                                        <select required name="transaction_type" onChange={handleInputChange} value={formData.transaction_type || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20">
                                            <option value="">-- Select Type --</option>
                                            <option value="Owner Received">💰 Owner Received</option>
                                            <option value="Worker Paid">👷 Worker Paid</option>
                                            <option value="Expense">📉 Expense</option>
                                            <option value="Advance">💸 Advance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Reference ID</label>
                                        <input required type="number" name="reference_id" onChange={handleInputChange} value={formData.reference_id || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. 1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Date</label>
                                        <input required type="date" name="date" onChange={handleInputChange} value={formData.date || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Amount (₹)</label>
                                        <input required type="number" name="amount" onChange={handleInputChange} value={formData.amount || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. 5000" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Note</label>
                                        <input name="note" onChange={handleInputChange} value={formData.note || ''} className="w-full border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Owner payment recorded" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">Record Entry</button>
                                </div>
                            </form>
                        </div>

                        {/* Ledger Table */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5">Entity / Site</th>
                                        <th className="px-8 py-5">Type</th>
                                        <th className="px-8 py-5">Notes</th>
                                        <th className="px-8 py-5 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {ownerPayments.map(p => (
                                        <tr key={`p-${p.id}`}>
                                            <td className="px-8 py-5 text-sm text-gray-500">{p.payment_date}</td>
                                            <td className="px-8 py-5 font-bold text-gray-800">{sites.find(s => s.id === p.site)?.site_name}</td>
                                            <td className="px-8 py-5"><span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase">Income</span></td>
                                            <td className="px-8 py-5 text-sm text-gray-400">{p.note || '—'}</td>
                                            <td className="px-8 py-5 text-right font-bold text-green-600">+₹{p.amount}</td>
                                        </tr>
                                    ))}
                                    {expenses.map(e => (
                                        <tr key={`e-${e.id}`}>
                                            <td className="px-8 py-5 text-sm text-gray-500">{e.expense_date}</td>
                                            <td className="px-8 py-5 font-bold text-gray-800">{sites.find(s => s.id === e.site)?.site_name}</td>
                                            <td className="px-8 py-5"><span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase">Expense</span></td>
                                            <td className="px-8 py-5 text-sm text-gray-400">{e.expense_type}: {e.note}</td>
                                            <td className="px-8 py-5 text-right font-bold text-red-600">-₹{e.amount}</td>
                                        </tr>
                                    ))}
                                    {advances.map(a => (
                                        <tr key={`a-${a.id}`}>
                                            <td className="px-8 py-5 text-sm text-gray-500">{a.given_date}</td>
                                            <td className="px-8 py-5 font-bold text-gray-800">{workers.find(w => w.id === a.worker)?.name}</td>
                                            <td className="px-8 py-5"><span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase">Advance</span></td>
                                            <td className="px-8 py-5 text-sm text-gray-400">{a.note || '—'}</td>
                                            <td className="px-8 py-5 text-right font-bold text-orange-600">-₹{a.amount}</td>
                                        </tr>
                                    ))}
                                    {transactions.map(t => (
                                        <tr key={`t-${t.id}`}>
                                            <td className="px-8 py-5 text-sm text-gray-500">{t.date}</td>
                                            <td className="px-8 py-5 font-bold text-gray-800">{t.reference_id}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.transaction_type === 'Owner Received' ? 'bg-green-50 text-green-600' :
                                                    t.transaction_type === 'Expense' ? 'bg-red-50 text-red-600' :
                                                        'bg-orange-50 text-orange-600'
                                                    }`}>{t.transaction_type}</span>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-400">{t.note || '—'}</td>
                                            <td className={`px-8 py-5 text-right font-bold ${t.transaction_type === 'Owner Received' ? 'text-green-600' : 'text-red-600'
                                                }`}>{t.transaction_type === 'Owner Received' ? '+' : '-'}₹{t.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(ownerPayments.length + expenses.length + advances.length + transactions.length === 0) && (
                                <div className="py-20 text-center bg-gray-50/30">
                                    <p className="text-gray-400 font-medium">No ledger entries found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ManpowerSection;

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

const BASE_URL = 'https://api.codingboss.in/manpower';

const ManpowerSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async (endpoint: string, setter: (data: any) => void) => {
        try {
            const res = await fetch(`${BASE_URL}/${endpoint}/`);
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
            const res = await fetch(`${BASE_URL}/${endpoint}/${id}/`, {
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
            const res = await fetch(`${BASE_URL}/owners/`, {
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
            const res = await fetch(`${BASE_URL}/sites/`, {
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
            const res = await fetch(`${BASE_URL}/workers/`, {
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
            const res = await fetch(`${BASE_URL}/attendance/`, {
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
            const res = await fetch(`${BASE_URL}/work-entries/`, {
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
            const res = await fetch(`${BASE_URL}/advances/`, {
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
            const res = await fetch(`${BASE_URL}/expenses/`, {
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
            const res = await fetch(`${BASE_URL}/owner-payments/`, {
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
            const res = await fetch(`${BASE_URL}/transactions/`, {
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

    const generatePDF = (title: string, columns: string[], data: any[][], fileName: string, siteName?: string) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // --- Header Section ---
        doc.setFillColor(31, 41, 55); // Dark Gray / Slate
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("HINDI ACADEMY", pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("CONSTRUCTION DIVISION • MANPOWER & SITE MANAGEMENT", pageWidth / 2, 28, { align: 'center' });

        // --- Report Info ---
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), 15, 50);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 56);
        if (siteName) {
            doc.text(`Site: ${siteName}`, 150, 56);
        }
        doc.text(`Report ID: HA-CONST-${Math.floor(Math.random() * 10000)}`, 15, 61);

        // --- Table Section ---
        const columnStyles: { [key: number]: any } = {};
        columns.forEach((col, index) => {
            const lowCol = col.toLowerCase();
            if (lowCol.includes('date')) {
                columnStyles[index] = { cellWidth: 25, halign: 'center' };
            } else if (lowCol.includes('amount') || lowCol.includes('billed') || lowCol.includes('paid') || lowCol.includes('balance') || lowCol.includes('salary') || lowCol.includes('income') || lowCol.includes('outflow') || lowCol.includes('profit')) {
                columnStyles[index] = { cellWidth: 28, halign: 'right' };
            } else if (lowCol.includes('hrs') || lowCol.includes('duty') || lowCol.includes('status')) {
                columnStyles[index] = { cellWidth: 15, halign: 'center' };
            } else if (lowCol.includes('type')) {
                columnStyles[index] = { cellWidth: 25 };
            } else {
                columnStyles[index] = { cellWidth: 'auto' }; // Site, Worker, Note take remaining space
            }
        });

        autoTable(doc, {
            head: [columns],
            body: data,
            startY: 68,
            theme: 'striped',
            headStyles: {
                fillColor: [37, 99, 235],
                fontSize: 10,
                cellPadding: 4,
                halign: 'inherit'
            },
            bodyStyles: {
                fontSize: 9,
                cellPadding: 3,
                valign: 'middle'
            },
            columnStyles: columnStyles,
            alternateRowStyles: {
                fillColor: [249, 250, 251]
            },
            margin: { left: 15, right: 15 },
            didDrawCell: (data) => {
                // Colorize income/outflow values in Amount column
                if (data.section === 'body' && data.column.index === columns.length - 1) {
                    const text = data.cell.text[0];
                    if (text.includes('+')) {
                        doc.setTextColor(22, 163, 74); // Green
                    } else if (text.includes('-')) {
                        doc.setTextColor(220, 38, 38); // Red
                    }
                }
            }
        });

        // --- Totals Row (Optional Calculation) ---
        const lastY = (doc as any).lastAutoTable.finalY + 10;

        // --- Footer / Signatures ---
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor(200, 200, 200);
        doc.line(15, lastY + 20, 75, lastY + 20);
        doc.line(135, lastY + 20, 195, lastY + 20);

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("AUTHORIZED SIGNATORY", 30, lastY + 25);
        doc.text("VERIFIED BY ADMIN", 155, lastY + 25);

        doc.setFontSize(7);
        doc.text("This is a computer-generated report and remains the property of Hindi Academy Construction Division.", 15, pageHeight - 10);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, 190, pageHeight - 10);

        window.open(doc.output('bloburl'), '_blank');
    };

    const [workerSearchId, setWorkerSearchId] = useState<number | null>(null);
    const [workerSearchSiteId, setWorkerSearchSiteId] = useState<number | null>(null);
    const [summaryStartDate, setSummaryStartDate] = useState(new Date().toISOString().split('T')[0]);

    const getWorkerSalarySummary = () => {
        if (!workerSearchId || !workerSearchSiteId) return null;
        const worker = workers.find(w => w.id === workerSearchId);
        const site = sites.find(s => s.id === workerSearchSiteId);
        if (!worker || !site) return null;

        const start = new Date(summaryStartDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        const workerAttendances = attendances.filter(a => {
            const d = new Date(a.date);
            return a.worker === workerSearchId && a.site === workerSearchSiteId && d >= start && d <= end;
        });

        const workerAdvances = advances.filter(adv => {
            const d = new Date(adv.given_date);
            return adv.worker === workerSearchId && d >= start && d <= end;
        });

        const totalHours = workerAttendances.reduce((sum, a) => sum + (a.hours || 0), 0);
        const totalDuty = workerAttendances.reduce((sum, a) => sum + (a.duty || (a.hours ? a.hours / 8 : 0)), 0);
        const grossSalary = totalDuty * worker.daily_wage;
        const totalAdvances = workerAdvances.reduce((sum, adv) => sum + adv.amount, 0);
        const netSalary = grossSalary - totalAdvances;

        return { worker, site, totalHours, totalDuty, grossSalary, totalAdvances, netSalary, workerAttendances, workerAdvances, start, end };
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
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-black mb-8 text-gray-900 flex items-center gap-3">
                            <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm text-lg">👤</span> Manage Project Owners
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">Register New Owner</h4>
                                <form onSubmit={submitOwner} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-5">
                                        <div><label className="block text-xs font-black text-gray-500 uppercase mb-1.5 ml-1">Full Name</label><input required name="name" onChange={handleInputChange} value={formData.name || ''} className="w-full border-gray-200 bg-gray-50/30 focus:bg-white rounded-xl px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Ramesh Kumar" /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-xs font-black text-gray-500 uppercase mb-1.5 ml-1">Phone</label><input required name="phone" onChange={handleInputChange} value={formData.phone || ''} className="w-full border-gray-200 bg-gray-50/30 focus:bg-white rounded-xl px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-blue-500/20" placeholder="9876543210" /></div>
                                            <div><label className="block text-xs font-black text-gray-500 uppercase mb-1.5 ml-1">Email</label><input required type="email" name="email" onChange={handleInputChange} value={formData.email || ''} className="w-full border-gray-200 bg-gray-50/30 focus:bg-white rounded-xl px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-blue-500/20" placeholder="ramesh@email.com" /></div>
                                        </div>
                                        <div><label className="block text-xs font-black text-gray-500 uppercase mb-1.5 ml-1">Site Location</label><input required name="site_location" onChange={handleInputChange} value={formData.site_location || ''} className="w-full border-gray-200 bg-gray-50/30 focus:bg-white rounded-xl px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. OMR Chennai" /></div>
                                    </div>
                                    <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-4 font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Confirm Registration</button>
                                </form>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">Owner Registry ({owners.length})</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                                <th className="pb-4">Name</th>
                                                <th className="pb-4 text-center">Location</th>
                                                <th className="pb-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {owners.map(o => (
                                                <tr key={o.id} className="group hover:bg-blue-50/30 transition-colors">
                                                    <td className="py-4 font-bold text-gray-800 text-sm">{o.name}</td>
                                                    <td className="py-4 text-center text-xs text-gray-400 font-medium">{o.site_location}</td>
                                                    <td className="py-4 text-right">
                                                        <button onClick={() => deleteItem('owners', o.id, setOwners)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {owners.length === 0 && <p className="text-gray-400 text-xs italic text-center py-10">Empty owner database.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MANAGE SITES */}
                {activeTab === 1 && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-8 px-2">
                           <div>
                                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <span className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 text-lg">🚧</span>
                                    Create Site
                                </h3>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1 ml-1">New Project Baseline & Record</p>
                           </div>
                           <div className="text-right border-l border-gray-100 pl-6 hidden md:block">
                                <span className="text-3xl font-black text-blue-600 block">{sites.length}</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Live Projects</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            {/* Create Site Form */}
                            <div className="lg:col-span-2 bg-white p-10 rounded-3xl border border-gray-100 shadow-2xl shadow-blue-900/5">
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-10 border-b border-gray-50 pb-4">Establish New Construction Baseline</h4>
                                <form onSubmit={submitSite} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-tighter ml-1">Site Title</label>
                                            <input required name="site_name" onChange={handleInputChange} value={formData.site_name || ''} className="w-full border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-medium transition-all" placeholder="e.g. Skyline Heights II" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-tighter ml-1">Assigned Owner</label>
                                            <select required name="owner" onChange={handleInputChange} value={formData.owner || ''} className="w-full border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-medium transition-all appearance-none cursor-pointer">
                                                <option value="">-- Choose Dedicated Owner --</option>
                                                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-tighter ml-1">Physical Site Location</label>
                                            <input required name="location" onChange={handleInputChange} value={formData.location || ''} className="w-full border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-medium transition-all" placeholder="Enter Full Address..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-tighter ml-1">Start Date</label>
                                            <input required type="date" name="start_date" onChange={handleInputChange} value={formData.start_date || ''} className="w-full border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-tighter ml-1">Expected End Date</label>
                                            <input required type="date" name="expected_end_date" onChange={handleInputChange} value={formData.expected_end_date || ''} className="w-full border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 transition-all" />
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <button type="submit" className="w-full bg-blue-600 text-white rounded-2xl py-5 font-black hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/30 transition-all text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20">Establish Site & Launch</button>
                                    </div>
                                </form>
                            </div>

                            {/* Active Registry */}
                            <div className="lg:col-span-1 space-y-4 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-4">Project Registry</h4>
                                {sites.slice().reverse().map(s => (
                                    <div key={s.id} className="p-6 bg-white rounded-3xl border border-gray-50 hover:border-blue-100 shadow-sm hover:shadow-lg transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-extrabold text-gray-800 text-sm group-hover:text-blue-600 transition-colors uppercase mb-1">{s.site_name}</h4>
                                                <p className="text-xs text-gray-500 font-medium leading-relaxed">📍 {s.location}</p>
                                            </div>
                                            <button onClick={() => deleteItem('sites', s.id, setSites)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-200 hover:text-red-500 transition-all">✕</button>
                                        </div>
                                        <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-gray-300 uppercase">Assigned To</span>
                                                <span className="text-xs font-bold text-gray-600">{owners.find(o => o.id === s.owner)?.name || 'N/A'}</span>
                                            </div>
                                            <span className="text-[8px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full">LIVE</span>
                                        </div>
                                    </div>
                                ))}
                                {sites.length === 0 && (
                                    <div className="py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                                        <p className="text-[10px] font-black text-gray-400 uppercase italic">No Active Projects</p>
                                    </div>
                                )}
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

                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl shadow-blue-900/5 mt-10">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-50 pb-6">
                                    <div>
                                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest ">Weekly Payroll Summary</h4>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mt-1">Calculated Net Payable for 7-Day Range</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase ml-2">Week Starting:</span>
                                        <input
                                            type="date"
                                            value={summaryStartDate}
                                            onChange={(e) => setSummaryStartDate(e.target.value)}
                                            className="text-xs font-bold text-blue-600 bg-white border-none rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-100 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-tighter ml-1">Select Personnel</label>
                                        <select
                                            value={workerSearchId || ''}
                                            onChange={(e) => setWorkerSearchId(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl px-5 py-3.5 text-sm font-medium transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">-- Choose Worker --</option>
                                            {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-tighter ml-1">Assigned Work Site</label>
                                        <select
                                            value={workerSearchSiteId || ''}
                                            onChange={(e) => setWorkerSearchSiteId(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl px-5 py-3.5 text-sm font-medium transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">-- Choose Site --</option>
                                            {sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {workerSummary ? (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Main Stats Card */}
                                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors"></div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div>
                                                        <h5 className="font-black text-2xl uppercase tracking-tight">{workerSummary.worker.name}</h5>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest">{workerSummary.site.site_name}</span>
                                                            <span className="text-[9px] font-medium text-blue-100">📅 {workerSummary.start.toLocaleDateString()} - {workerSummary.end.toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const data = workerSummary.workerAttendances.map(a => [a.date, a.hours || 0, (a.duty || (a.hours ? a.hours / 8 : 0)).toFixed(2), `₹${(workerSummary.worker.daily_wage * (a.duty || (a.hours ? a.hours / 8 : 0))).toFixed(0)}`]);
                                                            generatePDF(`Payroll Statement: ${workerSummary.worker.name}`, ["Date", "Hrs", "Duty", "Earned"], data, "payroll_report.pdf", workerSummary.site.site_name);
                                                        }}
                                                        className="bg-white text-blue-600 p-3 rounded-2xl shadow-lg hover:scale-110 active:scale-90 transition-all group/btn"
                                                    >
                                                        <span className="text-lg group-hover/btn:rotate-12 block">📄</span>
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                                                        <p className="text-[9px] font-black text-blue-100 uppercase tracking-widest mb-1">Total Duty</p>
                                                        <p className="text-xl font-black">{workerSummary.totalDuty.toFixed(2)} <span className="text-[10px] font-medium opacity-60">Days</span></p>
                                                    </div>
                                                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                                                        <p className="text-[9px] font-black text-blue-100 uppercase tracking-widest mb-1">Gross Salary</p>
                                                        <p className="text-xl font-black">₹{workerSummary.grossSalary.toFixed(0)}</p>
                                                    </div>
                                                    <div className="bg-red-500/20 p-4 rounded-2xl backdrop-blur-md border border-red-400/20">
                                                        <p className="text-[9px] font-black text-red-100 uppercase tracking-widest mb-1">Advances</p>
                                                        <p className="text-xl font-black text-red-100">-₹{workerSummary.totalAdvances.toFixed(0)}</p>
                                                    </div>
                                                    <div className="bg-white p-5 rounded-2xl shadow-inner md:col-span-1 border border-white/20">
                                                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Net Payable</p>
                                                        <p className="text-2xl font-black text-gray-900">₹{workerSummary.netSalary.toFixed(0)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attendance Breakdown List */}
                                        <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100">
                                            <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Verification Breakdown</h6>
                                            <div className="space-y-3">
                                                {workerSummary.workerAttendances.length > 0 ? workerSummary.workerAttendances.map(a => (
                                                    <div key={a.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-[10px]">{a.date.split('-')[2]}</div>
                                                            <div>
                                                                <p className="text-xs font-black text-gray-800">{a.date}</p>
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{a.status}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-black text-gray-800">{a.hours || 0} Hrs</p>
                                                            <p className="text-[9px] font-bold text-orange-600 uppercase tracking-tighter">{(a.duty || (a.hours ? a.hours / 8 : 0)).toFixed(2)} Duty</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                                                        <p className="text-[10px] font-black text-gray-300 uppercase italic">No Attendance Data for this Week</p>
                                                    </div>
                                                )}
                                                
                                                {workerSummary.workerAdvances.length > 0 && (
                                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                                        <h6 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 ml-2">Advance Records</h6>
                                                        {workerSummary.workerAdvances.map(adv => (
                                                            <div key={adv.id} className="flex items-center justify-between p-3 bg-red-50/30 rounded-xl border border-red-100/50 mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs">💸</span>
                                                                    <p className="text-[10px] font-bold text-gray-600">{adv.given_date}: {adv.note || 'Cash Advance'}</p>
                                                                </div>
                                                                <p className="text-xs font-black text-red-600">₹{adv.amount}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-24 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📋</div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Select worker and site to preview payroll</p>
                                        <p className="text-[9px] text-gray-300 font-bold mt-1 uppercase tracking-tighter italic">Weekly calculation resets automatically based on selected date</p>
                                    </div>
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
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                const data = workEntries.map(e => [e.work_date, sites.find(s => s.id === e.site)?.site_name || '', workers.find(w => w.id === e.worker)?.name || '', e.hours || '—']);
                                                generatePDF("Work Logs (Owner Copy)", ["Date", "Site", "Worker", "Hrs"], data, "owner_logs.pdf");
                                            }}
                                            className="text-[10px] bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                                        >
                                            <span className="text-xs">👤</span> Owner PDF
                                        </button>
                                        <button
                                            onClick={() => {
                                                const entries = workEntries;
                                                const totalOwner = entries.reduce((s, e) => s + (e.owner_paid_amount || 0), 0);
                                                const totalWorker = entries.reduce((s, e) => s + (e.worker_paid_amount || 0), 0);

                                                const data = [
                                                    ...entries.map(e => [e.work_date, sites.find(s => s.id === e.site)?.site_name || '', workers.find(w => w.id === e.worker)?.name || '', e.hours || '—', `₹${e.owner_paid_amount}`, `₹${e.worker_paid_amount}`]),
                                                    [{
                                                        content: `SUMMARY >>  Total Billed: ₹${totalOwner}  |  Total Paid: ₹${totalWorker}  |  Site Margin: ₹${totalOwner - totalWorker}`,
                                                        colSpan: 6,
                                                        styles: { halign: 'center', fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 }
                                                    }]
                                                ];
                                                generatePDF("Work Logs (Admin Copy)", ["Date", "Site", "Worker", "Hrs", "Owner Billed", "Worker Paid"], data, "admin_logs.pdf");
                                            }}
                                            className="text-[10px] bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-gray-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                                        >
                                            <span className="text-xs">⚙️</span> Admin PDF
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
                                                    ["Total Income (Owner Payments)", `₹${siteFinancials.income}`],
                                                    ["Total Outflow (Wages + Expenses)", `₹${siteFinancials.outflow}`],
                                                    ["Estimated Profit / Balance", `₹${siteFinancials.profit}`]
                                                ];
                                                generatePDF(`Financial Summary: ${site?.site_name}`, ["Account Description", "Amount"], data, "financial_summary.pdf", site?.site_name);
                                            }}
                                            className="text-[10px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                                        >
                                            <span className="text-xs">🖨️</span> Print Report
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
                                    const totalIn = filteredTransactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
                                    const totalOut = filteredTransactions.filter(t => t.type !== 'Income').reduce((s, t) => s + t.amount, 0);

                                    const data = [
                                        ...filteredTransactions.map(t => [t.date, t.siteId ? (sites.find(s => s.id === t.siteId)?.site_name || 'Manual') : 'Worker', t.displayType, t.note || '—', `${t.type === 'Income' ? '+' : '-'}₹${t.amount}`]),
                                        [{
                                            content: `LEDGER SUMMARY >>  Total IN: ₹${totalIn}  |  Total OUT: ₹${totalOut}  |  NET BALANCE: ₹${totalIn - totalOut}`,
                                            colSpan: 5,
                                            styles: { halign: 'center', fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 }
                                        }]
                                    ];
                                    generatePDF(`Ledger Report (${transactionStartDate} to +6 days)`, ["Date", "Site/Worker", "Type", "Note", "Amount"], data, "ledger.pdf");
                                }}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-2 border border-white/10"
                            >
                                <span className="text-lg">🖨️</span> Print Ledger
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

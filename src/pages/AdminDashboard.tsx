import React, { useState, useEffect } from "react";
// Moon and Sun imports removed as theme toggle is gone.
import { useNavigate, useLocation } from "react-router-dom";
import ManpowerSection from "../components/admin/ManpowerSection";
import PremiumBackground from "../components/admin/PremiumBackground";
import WorkerDatabaseTab from "../components/admin/WorkerDatabaseTab";
import { LogOut, Layout, Play, Briefcase, Settings, Bell, Plus, Users } from "lucide-react";
// ─── Interfaces ───
interface Course {
  id: number;
  name: string;
  category: string;
  instructor: string;
  price: number;
  status: "Active" | "Draft";
}

// ─── Mock Data ───
const initialCourses: Course[] = [
  { id: 1, name: "Hindi Speaking (Beginner)", category: "Language", instructor: "Priya Sharma", price: 2999, status: "Active" },
  { id: 2, name: "Hindi Grammar Mastery", category: "Grammar", instructor: "Ravi Kumar", price: 1999, status: "Active" },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Force Light Mode
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  // Initialize tab from URL query param if present (?tab=manpower)
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") as "courses" | "manpower" | "live" | "workerDatabase" || "courses";

  const [activeTab, setActiveTab] = useState<"courses" | "manpower" | "live" | "workerDatabase">(initialTab as any);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(localStorage.getItem('isLiveActive') === 'true');
  const [tempLink, setTempLink] = useState<string>('');

  const [courses, setCourses] = useState<Course[]>(initialCourses);

  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState<Partial<Course>>({ status: "Active" });

  useEffect(() => {
    if (!localStorage.getItem("admin")) navigate("/admin");
  }, [navigate]);

  useEffect(() => {
    const tab = queryParams.get("tab") as "courses" | "manpower" | "live" | "workerDatabase";
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin");
  };

  const startLiveClass = () => {
    if (!tempLink) return;
    localStorage.setItem('isLiveActive', 'true');
    localStorage.setItem('liveMeetingLink', tempLink);
    setIsLiveActive(true);
  };

  const endLiveClass = () => {
    localStorage.removeItem('isLiveActive');
    localStorage.removeItem('liveMeetingLink');
    setIsLiveActive(false);
    setTempLink('');
  };

  const openManpowerInNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    // Opens the current URL but with the manpower tab param in a new browser tab
    window.open("/admin-dashboard?tab=manpower", "_blank");
  };

  // ─── Course Handlers ───
  const saveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name) return;
    setCourses([...courses, { ...courseForm, id: Date.now() } as Course]);
    setShowCourseForm(false);
    setCourseForm({ status: "Active" });
  };
  const deleteCourse = (id: number) => setCourses(courses.filter((c) => c.id !== id));

  return (
    <div className="flex h-screen bg-transparent font-sans text-slate-800 transition-colors duration-500 overflow-hidden relative">
      <PremiumBackground />

      {/* ── Sidebar ── */}
      <div className="w-72 bg-white/90 backdrop-blur-xl border-r border-indigo-100 flex flex-col transition-all duration-500 relative z-20 shadow-2xl shadow-indigo-100/20">
        <div className="p-8 border-b border-indigo-50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-500">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-indigo-950 tracking-tight">Admin<span className="text-indigo-600">Panel</span></h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-0.5">Control Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-5 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          <button
            onClick={() => { setActiveTab("courses"); navigate("/admin-dashboard?tab=courses"); }}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === "courses" 
              ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 font-bold" 
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"}`}
          >
            <Settings className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-12 ${activeTab === "courses" ? "opacity-100" : "opacity-60"}`} />
            <span className="text-sm">Course Details</span>
          </button>

          <button
            onClick={openManpowerInNewTab}
            title="Opens in a new tab"
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === "manpower" 
              ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 font-bold" 
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"}`}
          >
            <Briefcase className={`w-5 h-5 transition-transform duration-300 group-hover:-rotate-12 ${activeTab === "manpower" ? "opacity-100" : "opacity-60"}`} />
            <span className="text-sm flex-1 text-left">Manpower Services</span>
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => { setActiveTab("live"); navigate("/admin-dashboard?tab=live"); }}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === "live" 
              ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 font-bold" 
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"}`}
          >
            <Play className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${activeTab === "live" ? "opacity-100 text-red-100" : "opacity-60"}`} />
            <span className="text-sm">Live Broadcast</span>
          </button>

          <button
            onClick={() => { setActiveTab("workerDatabase"); navigate("/admin-dashboard?tab=workerDatabase"); }}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === "workerDatabase" 
              ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 font-bold" 
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"}`}
          >
            <Users className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${activeTab === "workerDatabase" ? "opacity-100" : "opacity-60"}`} />
            <span className="text-sm">Worker Database</span>
          </button>
        </nav>

        <div className="p-6 border-t border-indigo-50 space-y-3 bg-indigo-50/20">
          <div className="flex items-center justify-between px-2 mb-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">System</span>
             <div className="w-10 h-[1px] bg-indigo-100" />
          </div>
          

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-300 font-bold text-xs uppercase tracking-wider group"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
              <LogOut className="w-4 h-4" />
            </div>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-auto p-12 relative z-10 no-scrollbar">
        <header className="flex justify-between items-start mb-12">
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 opacity-80">Platform Management</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeTab === "courses" ? "Course Inventory" : activeTab === "live" ? "Broadcasting Suite" : activeTab === "workerDatabase" ? "Worker Database" : "Manpower Management"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-xl leading-relaxed">
              {activeTab === "courses" ? "Manage and catalog your educational offerings with precision." : activeTab === "live" ? "Real-time engagement tools for your interactive global classroom." : activeTab === "workerDatabase" ? "Complete registry and management of active and inactive workforce profiles." : "Handle engineer setup, payouts, advances, expenses, transactions, and balance tracking in one place."}
            </p>
          </div>

          <div className="flex items-center gap-4">
             {/* Notification Bell */}
             <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shadow-sm relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900" />
             </button>

            {activeTab === "courses" && (
              <button
                onClick={() => setShowCourseForm(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Add Course
              </button>
            )}
          </div>
        </header>

        <div className="animate-fade-in-up duration-700">
          {activeTab === "courses" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Course Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Instructor</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {courses.map(course => (
                    <tr key={course.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{course.name}</td>
                      <td className="px-6 py-4"><span className="bg-blue-50 dark:bg-indigo-500/10 text-blue-700 dark:text-indigo-400 px-3 py-1 rounded-full text-sm">{course.category}</span></td>
                      <td className="px-6 py-4 text-gray-800 dark:text-slate-300">{course.instructor}</td>
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">₹{course.price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          course.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteCourse(course.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">No courses found. Add a course to get started.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        {/* ── Live Class Section ── */}
        {activeTab === "live" && (
          <>
            <div className={`rounded-[2.5rem] p-10 text-white transition-all duration-700 relative overflow-hidden shadow-2xl ${isLiveActive 
              ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 shadow-emerald-500/20' 
              : 'bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 shadow-indigo-500/20'}`}>
              
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] -mr-48 -mt-48 rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-[100px] -ml-32 -mb-32 rounded-full" />

              <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                <div className="flex items-center gap-8">
                  <div className="bg-white/20 p-6 rounded-[2rem] backdrop-blur-3xl border border-white/30 shadow-2xl animate-bounce-slow">
                    <Play className="w-12 h-12 text-white fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`w-2 h-2 rounded-full animate-ping ${isLiveActive ? 'bg-red-400' : 'bg-white/50'}`} />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70">Studio Status: {isLiveActive ? 'ON AIR' : 'Ready'}</span>
                    </div>
                    <h3 className="text-4xl font-black tracking-tight">Broadcast Control</h3>
                    <p className="text-white/80 mt-2 font-medium max-w-sm">
                      {isLiveActive
                        ? `A production session is currently streaming to students.`
                        : 'Deploy your next educational experience live.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {!isLiveActive && (
                    <button
                      onClick={() => window.open('https://api.codingboss.in/app/?room=lus1863cm', '_blank')}
                      className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Open Meeting Engine
                    </button>
                  )}
                  {isLiveActive && (
                    <button
                      onClick={endLiveClass}
                      className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Stop Current Meeting
                    </button>
                  )}
                </div>
              </div>

              {!isLiveActive && (
                <div className="mt-8 pt-8 border-t border-white/20">
                  <label className="block text-sm font-bold mb-2">Paste Meeting Link to Start:</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="https://api.codingboss.in/app/?room=lus1863cm"
                      className="flex-1 px-4 py-3 rounded-xl text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none"
                      value={tempLink}
                      onChange={(e) => setTempLink(e.target.value)}
                    />
                    <button
                      onClick={startLiveClass}
                      className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
                    >
                      Start Session
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">Step 1: Open Engine</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">Click "Open Meeting Engine" to create a new room on the external platform.</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">Step 2: Copy Link</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">Once in the room, copy the full browser URL of the meeting.</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">Step 3: Start Here</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">Paste the link above and click "Start Session" to notify all students.</p>
              </div>
            </div>
          </>
        )}

        {/* ── Manpower Section ── */}
        {activeTab === "manpower" && (
          <ManpowerSection />
        )}

        {/* ── Worker Database Section ── */}
        {activeTab === "workerDatabase" && (
          <WorkerDatabaseTab />
        )}



      </div>

      {/* ── Course Form Modal ── */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-transparent dark:border-slate-800">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Add New Course</h3>
            <form onSubmit={saveCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Course Name</label>
                <input required type="text" className="w-full bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 rounded-lg shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 dark:text-white" value={courseForm.name || ""} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category</label>
                <input required type="text" className="w-full bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 rounded-lg shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 dark:text-white" value={courseForm.category || ""} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Instructor</label>
                <input required type="text" className="w-full bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 rounded-lg shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 dark:text-white" value={courseForm.instructor || ""} onChange={e => setCourseForm({ ...courseForm, instructor: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Price (₹)</label>
                  <input required type="number" className="w-full bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 rounded-lg shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 dark:text-white" value={courseForm.price || ""} onChange={e => setCourseForm({ ...courseForm, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status</label>
                  <select className="w-full bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 rounded-lg shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 dark:text-white" value={courseForm.status} onChange={e => setCourseForm({ ...courseForm, status: e.target.value as any })}>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition">Save Course</button>
                <button type="button" onClick={() => setShowCourseForm(false)} className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg py-2 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default AdminDashboard;

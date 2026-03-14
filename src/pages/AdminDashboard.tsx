import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ManpowerSection from "../components/admin/ManpowerSection";
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

  // Initialize tab from URL query param if present (?tab=manpower)
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") as "courses" | "manpower" | "live" || "courses";

  const [activeTab, setActiveTab] = useState<"courses" | "manpower" | "live">(initialTab as any);
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
    const tab = queryParams.get("tab") as "courses" | "manpower" | "live";
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
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* ── Sidebar ── */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => { setActiveTab("courses"); navigate("/admin-dashboard?tab=courses"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "courses" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            Course Details
          </button>

          <button
            onClick={openManpowerInNewTab}
            title="Opens in a new tab"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "manpower" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <div className="flex-1 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Manpower Construction
            </div>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </button>
          <button
            onClick={() => { setActiveTab("live"); navigate("/admin-dashboard?tab=live"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "live" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Live Class
          </button>
        </nav>


        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-auto p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === "courses" ? "Course Details" : activeTab === "live" ? "Live Class Management" : "Manpower Construction Services"}
            </h2>
            <p className="text-gray-500 mt-1">
              {activeTab === "courses" ? "Manage your educational courses here." : activeTab === "live" ? "Manage your live interactive sessions here." : "Manage the complete lifecycle of construction sites, workforce, and financials."}
            </p>
          </div>

          {activeTab === "courses" && (
            <button
              onClick={() => setShowCourseForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Course
            </button>
          )}
        </header>

        {/* ── Courses Tab ── */}
        {activeTab === "courses" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Course Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Instructor</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                    <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{course.category}</span></td>
                    <td className="px-6 py-4">{course.instructor}</td>
                    <td className="px-6 py-4 font-medium">₹{course.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${course.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteCourse(course.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No courses found. Add a course to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Live Class Section ── */}
        {activeTab === "live" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className={`rounded-2xl p-8 text-white transition-all duration-500 bg-gradient-to-r ${isLiveActive ? 'from-green-600 to-teal-600' : 'from-blue-600 to-indigo-600'}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Live Class Management</h3>
                    <p className="text-white/80 mt-1">
                      {isLiveActive
                        ? `Session is active with external link.`
                        : 'Manage your live interactive sessions here.'}
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
                      className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none"
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
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-2">Step 1: Open Engine</h4>
                <p className="text-sm text-gray-600">Click "Open Meeting Engine" to create a new room on the external platform.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-2">Step 2: Copy Link</h4>
                <p className="text-sm text-gray-600">Once in the room, copy the full browser URL of the meeting.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-2">Step 3: Start Here</h4>
                <p className="text-sm text-gray-600">Paste the link above and click "Start Session" to notify all students.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Manpower Section ── */}
        {activeTab === "manpower" && (
          <ManpowerSection />
        )}



      </div>

      {/* ── Course Form Modal ── */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Add New Course</h3>
            <form onSubmit={saveCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" value={courseForm.name || ""} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" value={courseForm.category || ""} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" value={courseForm.instructor || ""} onChange={e => setCourseForm({ ...courseForm, instructor: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input required type="number" className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" value={courseForm.price || ""} onChange={e => setCourseForm({ ...courseForm, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" value={courseForm.status} onChange={e => setCourseForm({ ...courseForm, status: e.target.value as any })}>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition">Save Course</button>
                <button type="button" onClick={() => setShowCourseForm(false)} className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 font-medium hover:bg-gray-200 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

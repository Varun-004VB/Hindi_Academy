import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ChevronRight, ShieldCheck } from "lucide-react";
import PremiumBackground from "../components/admin/PremiumBackground";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate premium loading feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (email === "admin@gmail.com" && password === "admin") {
      localStorage.setItem("admin", "true");
      navigate("/admin-dashboard");
    } else {
      alert("Invalid Admin Credentials ❌");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <PremiumBackground />
      
      {/* Abstract Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[15%] left-[20%] w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-[20%] right-[25%] w-80 h-80 bg-violet-500/10 blur-3xl rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden">
          {/* Subtle Glow Effect at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className="text-center mb-10 relative">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-6 shadow-[0_0_30px_-5px_rgba(79,70,229,0.3)]"
            >
              <ShieldCheck className="w-10 h-10" />
            </motion.div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Admin Portal</h2>
            <p className="text-indigo-200/50 text-sm font-medium uppercase tracking-[0.2em]">Secure Authentication</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-300/60 uppercase tracking-widest ml-1">Email System</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-indigo-400/40 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@gmail.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-indigo-300/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-300/60 uppercase tracking-widest ml-1">Master Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-indigo-400/40 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-indigo-300/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_50px_-5px_rgba(79,70,229,0.8)] border border-indigo-400/50 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <span className="text-lg uppercase tracking-wider">Access Panel</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </AnimatePresence>
              
              {/* Dynamic Reflection Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-indigo-200/30">
            System version 2.4.0 • Build 829
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
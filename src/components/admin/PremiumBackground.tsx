import React from "react";
import { motion } from "framer-motion";

const PremiumBackground: React.FC = () => (
  <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#F3E8FF] dark:bg-[#F3E8FF] transition-colors duration-700">
    {/* Base Gradient Layer */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#F3E8FF_0%,#E9D5FF_100%)] dark:bg-[radial-gradient(circle_at_50%_0%,#F3E8FF_0%,#E9D5FF_100%)] transition-opacity duration-700" />

    {/* Dynamic Soft Aurora Blobs */}
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        x: [0, 50, 0],
        y: [0, 30, 0],
        rotate: [0, 20, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-5%] w-[70%] h-[70%] bg-blue-400/10 dark:bg-indigo-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-700"
    />
    
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        x: [0, -60, 0],
        y: [0, 40, 0],
        rotate: [0, -30, 0],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-[-20%] right-[-5%] w-[80%] h-[80%] bg-indigo-300/10 dark:bg-violet-600/15 blur-[140px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-700"
    />

    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        x: [0, 30, 0],
        y: [0, -50, 0],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      className="absolute top-[30%] right-[15%] w-[40%] h-[40%] bg-violet-200/20 dark:bg-indigo-400/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-700"
    />

    <motion.div
      animate={{
        opacity: [0.2, 0.4, 0.2],
        scale: [1, 1.02, 1],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] dark:opacity-[0.03] contrast-125 brightness-110"
    />

    {/* Subtle Grid overlay for 'Tech' feel */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] transition-opacity duration-700" />
  </div>
);

export default PremiumBackground;

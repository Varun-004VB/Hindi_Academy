import {
  CheckCircle,
  Play,
  Star,
  Users,
  Award,
  BookOpen,
  Target,
  Trophy,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  onOpenModal: (modal: string) => void;
}

// Hook for animation (kept the same as original)
function AnimatedSection({
  children,
  direction = "left",
  delay = 0,
  className = "",
}: any) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    );

    ref.current && observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, []);

  const animations: any = {
    left: "translate-x-[-80px] opacity-0",
    right: "translate-x-[80px] opacity-0",
    up: "translate-y-[40px] opacity-0",
    fade: "opacity-0",
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? "translate-x-0 translate-y-0 opacity-100"
          : animations[direction]
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Hero({ onOpenModal }: HeroProps) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      {/* HERO SECTION - NEW MODERN THEME */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 text-white overflow-hidden">
        
        {/* Subtle futuristic grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        
        {/* Ambient light glow spots */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] translate-x-1/2 translate-y-1/2"></div>


        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-24 sm:pt-32 pb-32 sm:pb-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT CONTENT */}
            <div className="space-y-8">
              
             

              {/* Heading */}
              <AnimatedSection delay={200}>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                   Raanuva Veeran
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-400 animate-pulse">
                    Spoken Hindi Academy
                  </span>
                </h1>
              </AnimatedSection>

              {/* Description - Updated Text */}
              <AnimatedSection delay={400}>
                <p className="text-lg text-indigo-200/90 max-w-xl leading-relaxed">
                  Forget boring lectures. Learn Hindi naturally with our
                  immersive, interactive platform designed to build real-world
                  confidence fast.
                </p>
              </AnimatedSection>

              {/* Features - Modern Glass Look */}
              <AnimatedSection delay={600}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { text: "Interactive Live Labs", icon: Target },
                    { text: "Native Expert Mentors", icon: Users },
                    { text: "Modern Curriculum", icon: BookOpen },
                    { text: "Verified Certification", icon: Trophy },
                  ].map(({ text, icon: Icon }, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                        <Icon className="w-5 h-5 text-cyan-300" />
                      </div>
                      <span className="font-medium text-white/90">{text}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Buttons - Modern Gradients */}
              <AnimatedSection delay={800}>
                <div className="flex flex-col sm:flex-row gap-5">
                  <button
                    onClick={() => navigate("/courses")}
                    className="
                      group
                      px-8 py-4 rounded-full font-bold text-lg
                      bg-gradient-to-r from-cyan-500 to-purple-600
                      hover:from-cyan-400 hover:to-purple-500
                      text-white shadow-lg shadow-purple-500/25
                      transition-all hover:scale-[1.02] active:scale-[0.98]
                      flex items-center gap-3 justify-center
                    "
                  >
                    Get Started Free{" "}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => onOpenModal("demo")}
                    className="px-8 py-4 rounded-full font-bold text-lg border-2 border-indigo-400/30 bg-indigo-950/50 backdrop-blur
                      hover:bg-indigo-900/50 hover:border-cyan-400/50 text-indigo-100 transition flex items-center gap-3 justify-center"
                  >
                    <Play className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />{" "}
                    Watch Gameplay
                  </button>
                </div>
              </AnimatedSection>

              {/* Metrics - Modern Colors & Labels */}
              <AnimatedSection delay={1000}>
                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                  {[
                    { value: "50K+", label: "Active Learners" },
                    { value: "4.9/5", label: "Course Rating" },
                    { value: "100+", label: "Interactive Modules" },
                  ].map((m, i) => (
                    <div key={i}>
                      <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                        {m.value}
                      </div>
                      <div className="text-sm font-semibold uppercase tracking-wider text-indigo-300 mt-1">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* RIGHT IMAGE - With Glow Effect */}
            <AnimatedSection direction="right" delay={400}>
              <div className="relative group perspective-1000">
                {/* Behind glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-cyan-600 to-purple-600 rounded-[2.5rem] blur-2xl opacity-30 group-hover:opacity-50 transition duration-1000 animate-tilt"></div>
                
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=80"
                  className="relative rounded-[2rem] shadow-2xl border border-white/10 z-10 object-cover w-full h-full transform transition duration-500 group-hover:scale-[1.01]"
                  alt="Students learning"
                />

            
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* WAVE DIVIDER - Blending into white */}
        <div className="absolute bottom-0 w-full translate-y-[1px]">
            <svg viewBox="0 0 1440 120" className="w-full h-auto block text-white fill-current">
            <path d="M0,96L48,85.3C96,75,192,53,288,53.3C384,53,480,75,576,85.3C672,96,768,96,864,85.3C960,75,1056,53,1152,42.7C1248,32,1344,32,1392,32L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
            </svg>
        </div>
      </div>

      {/* ANIMATIONS (Kept bounce-slow, added others inline via Tailwind) */}
      <style>{`
        @keyframes bounce-slow {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
import React, { useRef, useEffect, useState } from "react";
import { PlayCircle, Clock, Award, Star } from "lucide-react";
import { motion } from "framer-motion";

interface Course {
  title: string;
  description: string;
  level: string;
  duration: string;
  lessons: number;
  students: string;
  rating: number;
  image: string;
  color: string;
  direction?: "left" | "right" | "up";
}

interface CoursesProps {
  onOpenModal: (modal: string) => void;
}

const courses: Course[] = [
  {
    title: "Hindi for Beginners",
    description: "Learn Hindi basics - alphabet, words and fundamental sentence structures",
    level: "Beginner",
    duration: "4 Weeks",
    lessons: 30,
    students: "15,000+",
    rating: 4.8,
    image: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=1600",
    color: "from-purple-400 to-purple-500",
    direction: "left",
  },
  {
    title: "Conversational Hindi",
    description: "Learn to speak Hindi fluently in everyday conversations",
    level: "Intermediate",
    duration: "6 Weeks",
    lessons: 45,
    students: "12,000+",
    rating: 4.9,
    image: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1600",
    color: "from-orange-400 to-red-500",
    direction: "right",
  },
  {
    title: "Advanced Hindi",
    description: "Master grammar, literature and advanced writing skills",
    level: "Advanced",
    duration: "8 Weeks",
    lessons: 60,
    students: "8,000+",
    rating: 5.0,
    image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1600",
    color: "from-purple-400 to-purple-500",
    direction: "up",
  },
];


// ---- Utility: check touch device
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

export default function Courses({ onOpenModal }: CoursesProps) {
  // used to disable tilt on mobile
  const [disableTilt, setDisableTilt] = useState<boolean>(false);

  useEffect(() => {
    setDisableTilt(isTouchDevice());
  }, []);

  // motion variants for cards
  const fadeVariants = {
    hiddenLeft: { opacity: 0, x: -60 },
    hiddenRight: { opacity: 0, x: 60 },
    hiddenUp: { opacity: 0, y: 60 },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          id="courses"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Popular Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the right course for your level and start learning today
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, idx) => (
            <ParallaxCourseCard
              key={idx}
              course={course}
              index={idx}
              disableTilt={disableTilt}
              onOpenModal={onOpenModal}
              fadeVariants={fadeVariants}
            />
          ))}
        </div>

       <motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, delay: 0.15 }}
  className="mt-16 relative rounded-3xl p-8 md:p-12 text-center text-white shadow-xl overflow-hidden"
>
  {/* Background image + gradient overlay */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: `
        linear-gradient(to right, rgba(255,94,0,0.7), rgba(255,0,0,0.7)),
        url('https://images.pexels.com/photos/5553929/pexels-photo-5553929.jpeg?auto=compress&cs=tinysrgb&w=1600')
      `
    }}
  />

  {/* Foreground Content */}
  <div className="relative z-10">
    <Award className="w-16 h-16 mx-auto mb-4" />
    <h3 className="text-3xl md:text-4xl font-bold mb-4">
      Complete the Course & Expand Your Business Reach!
    </h3>
    <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">
      Watch all videos and clear the quizzes to gain practical knowledge and grow professionally.
    </p>

    <button
      onClick={() => onOpenModal("certificate")}
      className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all transform hover:scale-105"
    >
      Learn Here
    </button>
  </div>
</motion.div>

      </div>
    </section>
  );
}

/* =========================
   ParallaxCourseCard component
   - handles mouse move tilt
   - image parallax
   - glare and shadow
   - mobile fallback
   ========================= */
function ParallaxCourseCard({
  course,
  index,
  disableTilt,
  onOpenModal,
  fadeVariants,
}: {
  course: Course;
  index: number;
  disableTilt: boolean;
  onOpenModal: (modal: string) => void;
  fadeVariants: any;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // reactive target transforms
  const target = useRef({
    rotX: 0,
    rotY: 0,
    transX: 0,
    transY: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
  });

  // current applied transforms (for lerping)
  const current = useRef({ rotX: 0, rotY: 0, transX: 0, transY: 0, glareX: 50, glareY: 50, glareOpacity: 0 });

  // friction for lerp - tune for smoothness
  const friction = 0.12;

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // core animation loop: lerp current -> target, then apply transforms
  const animate = () => {
    // lerp helper
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    current.current.rotX = lerp(current.current.rotX, target.current.rotX, friction);
    current.current.rotY = lerp(current.current.rotY, target.current.rotY, friction);
    current.current.transX = lerp(current.current.transX, target.current.transX, friction);
    current.current.transY = lerp(current.current.transY, target.current.transY, friction);
    current.current.glareX = lerp(current.current.glareX, target.current.glareX, friction);
    current.current.glareY = lerp(current.current.glareY, target.current.glareY, friction);
    current.current.glareOpacity = lerp(current.current.glareOpacity, target.current.glareOpacity, friction);

    // apply transform to card and inner layers
    const card = cardRef.current;
    if (card) {
      const cardInner = card.querySelector<HTMLElement>("[data-card-inner]");
      const img = card.querySelector<HTMLElement>("[data-card-img]");
      const glare = card.querySelector<HTMLElement>("[data-card-glare]");
      const shadow = card.querySelector<HTMLElement>("[data-card-shadow]");

      if (cardInner) {
        // rotate card
        cardInner.style.transform = `perspective(1000px) rotateX(${current.current.rotX}deg) rotateY(${current.current.rotY}deg) scale(${disableTilt ? 0.995 : 1})`;
      }

      if (img) {
        // subtle parallax on image
        img.style.transform = `translate3d(${current.current.transX}px, ${current.current.transY}px, 0) scale(${disableTilt ? 1.03 : 1.08})`;
      }

      if (glare) {
        glare.style.background = `radial-gradient(circle at ${current.current.glareX}% ${current.current.glareY}%, rgba(255,255,255,0.65), rgba(255,255,255,0.12) 12%, rgba(255,255,255,0.02) 40%)`;
        glare.style.opacity = `${current.current.glareOpacity}`;
      }

      if (shadow) {
        // soft shadow that intensifies with tilt
        const intensity = Math.min(0.45, Math.abs(current.current.rotX) / 40 + Math.abs(current.current.rotY) / 60);
        shadow.style.boxShadow = `0 ${10 + Math.abs(current.current.rotX) + Math.abs(current.current.rotY)}px ${24 + 40 * intensity}px rgba(20,20,40, ${0.10 + intensity * 0.25})`;
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  };

  // start animation loop
  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableTilt]);

  // on mouse move: compute target rotations and parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (disableTilt) return;

    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1

    // map to rotation: center is 0
    const rotMax = 10; // degrees
    const rotY = (px - 0.5) * rotMax * 2; // left negative, right positive
    const rotX = -(py - 0.5) * rotMax * 2; // top positive, bottom negative

    // parallax translate for image (small)
    const transMax = 18;
    const transX = (px - 0.5) * transMax * -1; // invert for nicer parallax
    const transY = (py - 0.5) * transMax * -1;

    // glare pos
    const glareX = px * 100;
    const glareY = py * 100;
    const glareOpacity = 0.85;

    target.current.rotX = rotX;
    target.current.rotY = rotY;
    target.current.transX = transX;
    target.current.transY = transY;
    target.current.glareX = glareX;
    target.current.glareY = glareY;
    target.current.glareOpacity = glareOpacity;
  };

  const handleMouseLeave = () => {
    // reset targets
    target.current.rotX = 0;
    target.current.rotY = 0;
    target.current.transX = 0;
    target.current.transY = 0;
    target.current.glareOpacity = 0;
    target.current.glareX = 50;
    target.current.glareY = 50;
  };

  // for keyboard accessibility: focus/blur should give subtle scale
  const handleFocus = () => {
    // subtle pop
    target.current.glareOpacity = 0.2;
  };
  const handleBlur = () => {
    target.current.glareOpacity = 0;
  };

  // determine initial hidden variant for staggered entrance
  const hiddenVariant =
    course.direction === "left"
      ? "hiddenLeft"
      : course.direction === "right"
      ? "hiddenRight"
      : "hiddenUp";

  return (
    <motion.div
      initial={hiddenVariant}
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={fadeVariants}
      transition={{ duration: 0.7, delay: index * 0.12 }}
      className="relative"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        // use role/grouping to keep a11y clear; inner button has actual action
        className={`
          relative group
          rounded-3xl overflow-hidden
          transition-transform duration-500
          will-change-transform
          cursor-pointer
          `}
        style={{
          perspective: 1200,
        }}
        aria-label={`${course.title} course card`}
      >
        {/* soft shadow element (updated by js) */}
        <div
          data-card-shadow
          className="absolute inset-0 -z-10 rounded-3xl"
          style={{
            transition: "box-shadow 220ms linear",
            boxShadow: "0 18px 30px rgba(20,20,40,0.12)",
          }}
          aria-hidden
        />

        {/* Card inner (rotated) */}
        <div
          data-card-inner
          className={`
            bg-white rounded-3xl overflow-hidden
            shadow-md
            transform
            `}
        >
          {/* Image area (layers: gradient overlay, image, glare) */}
          <div className="relative h-48 overflow-hidden">
            {/* gradient overlay behind image for vibrance */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-85 mix-blend-multiply`}
              aria-hidden
            />

            {/* image (parallax translate applied) */}
            <img
              data-card-img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-700"
              style={{
                transform: disableTilt ? "scale(1.03)" : "scale(1.08)",
                willChange: "transform",
              }}
            />

            {/* level badge */}
            <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-semibold text-gray-900 shadow">
              {course.level}
            </div>

            {/* subtle moving glare */}
            <div
              data-card-glare
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                opacity: 0,
                transition: "opacity 220ms linear, background 220ms linear",
                mixBlendMode: "screen",
              }}
              aria-hidden
            />
          </div>

          {/* content */}
          <div className="p-6">
            {/* rating row */}
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-bold text-gray-900">{course.rating}</span>
              <span className="text-gray-500 text-sm">({course.students} students)</span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h3>

            <p className="text-gray-600 mb-6 leading-relaxed">{course.description}</p>

            <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <PlayCircle className="w-4 h-4" />
                <span>{course.lessons} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>Knowledge</span>
              </div>
            </div>

            {/* actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onOpenModal("enroll")}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-800 text-white py-3 rounded-xl font-semibold text-sm hover:scale-105 transition-transform"
                aria-label={`Enroll in ${course.title}`}
              >
                Enroll Now
              </button>

              <button
                onClick={() => onOpenModal("preview")}
                className="flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
                aria-label={`Preview ${course.title}`}
              >
                <PlayCircle className="w-5 h-5" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* subtle floating accent - decorative */}
        <div
          className="pointer-events-none absolute -bottom-6 left-6 opacity-70 transform -rotate-6"
          aria-hidden
        >
          <svg width="120" height="42" viewBox="0 0 120 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`g-${index}`} x1="0" x2="1">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="1" stopColor="#fb923c" />
              </linearGradient>
            </defs>
            <rect width="120" height="42" rx="10" fill={`url(#g-${index})`} opacity="0.12" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

// import { useEffect, useRef } from "react";
// import { UserPlus, BookOpen, GraduationCap, Award } from 'lucide-react';

// // Steps List
// const steps = [
//   {
//     icon: UserPlus,
//     title: 'Sign Up',
//     description: 'Create a free account and choose your course',
//     color: 'bg-blue-500',
//     number: '1'
//   },
//   {
//     icon: BookOpen,
//     title: 'Start Learning',
//     description: 'Watch videos and do interactive exercises',
//     color: 'bg-green-500',
//     number: '2'
//   },
//   {
//     icon: GraduationCap,
//     title: 'Practice',
//     description: 'Practice with quizzes and assignments',
//     color: 'bg-orange-500',
//     number: '3'
//   },
//   {
//     icon: Award,
//     title: 'Get Certified',
//     description: 'Complete course and download certificate',
//     color: 'bg-teal-500',
//     number: '4'
//   }
// ];

// // Hook for scroll-trigger animation
// function useScrollReveal() {
//   const ref = useRef(null);

//   useEffect(() => {
//     const elements = ref.current?.querySelectorAll(".reveal-item");

//     const observer = new IntersectionObserver(
//       entries => {
//         entries.forEach(entry => {
//           if (entry.isIntersecting) {
//             entry.target.classList.add("animate-3d-reveal");
//           }
//         });
//       },
//       { threshold: 0.2 }
//     );

//     elements?.forEach(el => observer.observe(el));
//   }, []);

//   return ref;
// }

// export default function HowItWorks() {
//   const sectionRef = useScrollReveal();

//   return (
//     <section
//       ref={sectionRef}
//       className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
//     >
//       <div className="text-center mb-16" id="how-it-works">
//         <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//           How It Works?
//         </h2>
//         <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//           Start learning Hindi in just 4 easy steps
//         </p>
//       </div>

//       {/* LINE BEHIND CARDS */}
//       <div className="relative">
//         <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 via-orange-500 to-purple-500 transform -translate-y-1/2"></div>

//         {/* STEPS GRID */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
//           {steps.map((step, index) => (
//             <div
//               key={index}
//               className="relative reveal-item"
//               style={{ animationDelay: `${index * 200}ms` }}
//             >
//               <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
//                 <div
//                   className={`${step.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg`}
//                 >
//                   <step.icon className="w-10 h-10 text-white" />
//                 </div>

//                 <div className="absolute top-4 right-4 text-6xl font-bold text-gray-100">
//                   {step.number}
//                 </div>

//                 <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">
//                   {step.title}
//                 </h3>

//                 <p className="text-gray-600 leading-relaxed relative z-10">
//                   {step.description}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* CERTIFICATE SECTION */}
//       <div
//         className="mt-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 reveal-item"
//         style={{ animationDelay: "900ms" }}
//       >
//         <div className="grid md:grid-cols-2 gap-8 items-center">
//           <div>
//             <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//               Certificate on 100% Completion
//             </h3>
//             <p className="text-lg text-gray-600 mb-6 leading-relaxed">
//               When you complete all videos in your course and pass all quizzes,
//               you can instantly download your official certificate.
//               This certificate is proof of your achievement and can be shared on LinkedIn.
//             </p>

//             <div className="flex flex-wrap gap-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                 <span className="text-gray-700">Complete all videos</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                 <span className="text-gray-700">Score 80% in quizzes</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                 <span className="text-gray-700">Download instantly</span>
//               </div>
//             </div>
//           </div>

//           <div className="relative reveal-item" style={{ animationDelay: "1100ms" }}>
//             <div className="bg-white rounded-2xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform">
//               <div className="border-8 border-orange-500 rounded-xl p-6">
//                 <div className="text-center">
//                   <Award className="w-16 h-16 text-orange-500 mx-auto mb-4" />
//                   <h4 className="text-2xl font-bold text-gray-900 mb-2">
//                     Certificate
//                   </h4>
//                   <p className="text-lg font-semibold text-orange-600 mb-4">
//                     Hindi Course Completion
//                   </p>

//                   <div className="border-t-2 border-gray-200 pt-4">
//                     <p className="text-gray-600 italic">
//                       "This certifies that"
//                     </p>
//                     <p className="text-xl font-bold text-gray-900 my-2">
//                       [Your Name]
//                     </p>
//                     <p className="text-gray-600">
//                       has successfully completed the course
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }

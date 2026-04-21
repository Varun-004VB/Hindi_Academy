import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Minimize2, Bot, User, Sparkles } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

interface IntentMatch {
  intent: string;
  response: string;
  quickReplies?: string[];
  confidence: number;
}

// ─── Knowledge Base ──────────────────────────────────────────────
const knowledgeBase = {
  courses: {
    overview: `📚 **Our 48-Hour Hindi Mastery Program**\n\nThe course is divided into 3 comprehensive modules:\n\n🟢 **Module 1 — Foundation & Basics** (बुनियादी हिंदी)\n16 hours • 32 videos • Devanagari script, pronunciation, 500+ words, basic grammar\n\n🟠 **Module 2 — Conversational Skills** (बातचीत और व्याकरण)\n16 hours • 32 videos • Daily conversations, verb conjugations, tenses, common phrases\n\n🟣 **Module 3 — Advanced & Professional** (उन्नत हिंदी)\n16 hours • 32 videos • Complex grammar, business communication, writing, literature\n\nEach module ends with a 50-question test (60 min, 70% to pass).`,
    module1: `🟢 **Module 1: Foundation & Basics** (बुनियादी हिंदी)\n\n⏱ Duration: 16 Hours • 32 Videos\n\nTopics covered:\n• Devanagari Script (वर्णमाला)\n• Vowels & Consonants (स्वर और व्यंजन)\n• Basic Pronunciation Rules\n• Numbers & Counting (गिनती)\n• Days, Months & Time\n• Essential Vocabulary (500+ words)\n• Simple Sentence Formation\n• Basic Grammar Structures\n\n📝 Test: 50 questions • 60 minutes • 70% to pass`,
    module2: `🟠 **Module 2: Conversational Skills** (बातचीत और व्याकरण)\n\n⏱ Duration: 16 Hours • 32 Videos\n\nTopics covered:\n• Daily Conversations\n• Verb Conjugations (क्रिया)\n• Tenses (Past, Present, Future)\n• Question Formation\n• Common Phrases & Idioms\n• Family & Relationships\n• Shopping & Dining\n• Travel & Directions\n\n📝 Test: 50 questions • 60 minutes • 70% to pass`,
    module3: `🟣 **Module 3: Advanced & Professional** (उन्नत हिंदी)\n\n⏱ Duration: 16 Hours • 32 Videos\n\nTopics covered:\n• Complex Grammar Structures\n• Formal & Informal Speech\n• Business Communication\n• Writing Skills (लेखन)\n• Reading Comprehension\n• Cultural Context & Etiquette\n• News & Media Language\n• Literature Basics\n\n📝 Test: 50 questions • 60 minutes • 70% to pass`,
    liveClass: `🎥 **Live Classes**\n\nWe offer interactive live sessions with instructors! When a live class is active, you'll see the "LIVE NOW" badge on the Courses page.\n\nTo join:\n1. Go to the Courses page\n2. Copy the meeting link shown\n3. Paste it in the join box\n4. Click "Join Class"\n\nLive sessions help you practice conversation and get real-time feedback from native Hindi speakers.`,
    certificate: `🏆 **Certification**\n\nYes! You receive a verified completion certificate after finishing all 3 modules and passing their tests.\n\nRequirements:\n• Complete all 96 videos across 3 modules\n• Pass each module test with 70% or higher\n• Certificate is recognized and shareable`,
  },

  enrollment: {
    howTo: `📝 **How to Enroll**\n\n1. Visit our Courses page\n2. Click "Get Started Free" or "Enroll Now"\n3. Fill in your name, email, and phone number\n4. Submit the form — you'll get instant access!\n\nIt's quick and easy. You can start learning right away after enrollment.`,
    requirements: `✅ **What You Need**\n\n• A device (phone, tablet, or computer) with internet\n• No prior Hindi knowledge required — we start from zero!\n• Just your enthusiasm to learn 😊`,
  },

  pricing: {
    info: `💰 **Pricing Information**\n\nWe offer affordable plans for everyone. Visit our Courses page or Contact us for detailed pricing.\n\n✅ 7-day money-back guarantee\n✅ Lifetime access to course materials\n✅ All payment methods accepted: Credit/Debit cards, UPI, Net Banking, PayPal, Google Pay, Paytm\n\nNot sure? Start with a free demo first!`,
    refund: `💸 **Refund Policy**\n\nWe offer a **7-day money-back guarantee**. If you're not satisfied with the course within the first 7 days, we'll provide a full refund — no questions asked.\n\nTo request a refund:\n📧 Email: raanuvaveeranhindiacademy666@gmail.com\n📞 Call: +91 6397 255 377`,
  },

  support: {
    contact: `📞 **Contact Information**\n\n📧 Email: info@raanuvaveeran.com\n📞 Phone: +91 6397 255 377\n📍 Main Office: Tamil Nadu, India\n\n🕘 Office Hours:\nMonday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed\n\n⚡ Average response time: Less than 2 hours!`,
    offices: `📍 **Our Office Locations**\n\n🏢 **Tamil Nadu (HQ)**\n22, Sri Angalamman Illam, Krishnasamy Street, near Zeon Cinema, Vandipettai, Gobichettipalayam - 638476\n\n🏢 **Mumbai**\n456 Bandra West, Mumbai - 400050\n\n🏢 **Bangalore**\n789 Koramangala, Bangalore - 560034\n\nAll offices: Mon-Sat, 9AM-6PM`,
    technical: `🔧 **Technical Support**\n\nHaving technical issues? Here are some common fixes:\n\n• **Video not playing?** Check your internet connection and try refreshing the page\n• **Can't login?** Clear your browser cache or try a different browser\n• **Audio issues?** Check your device volume and browser audio permissions\n• **App not loading?** Make sure JavaScript is enabled\n\nStill stuck? Contact us:\n📧 raanuvaveeranhindiacademy666@gmail.com\n📞 +91 6397 255 377`,
  },

  company: {
    about: `🏫 **About Raanuva Veeran Hindi Academy**\n\nFounded in 2020, we're India's leading online Hindi learning platform.\n\n📊 Our Impact:\n• 50,000+ students enrolled\n• 40+ countries reached\n• 95% success rate\n• 4.9/5 average rating\n\n🎯 Mission: To make quality Hindi education accessible, affordable, and effective for everyone worldwide.\n\n🌍 Vision: To become the world's most trusted platform for learning Hindi.`,
    teachers: `👨‍🏫 **Our Teaching Team**\n\nAll our teachers are:\n• Certified native Hindi speakers\n• Experienced educators with years of teaching\n• Passionate about sharing Hindi language & culture\n• Available for one-on-one tutoring sessions\n\nThey use simple, engaging methods to make learning fun and effective. Weekly live practice sessions with instructors are included!`,
    features: `✨ **Platform Features**\n\n🎥 Interactive Video Lessons — HD quality with subtitles\n💬 Live Practice Sessions — Weekly with instructors\n📖 Study Materials — PDFs, flashcards, worksheets, audio files\n🤖 Personalized Learning Path — Adapts to your progress\n📱 Learn Anywhere — Works on phone, tablet, and computer\n📥 Offline Access — Download lessons for offline study\n🔓 Sequential Learning — Unlock videos progressively\n🏆 Certification — Verified completion certificate`,
  },

  faqs: [
    { q: 'How do I enroll in a Hindi course?', a: 'You can enroll by visiting our Courses page, selecting your desired course, and clicking the "Enroll Now" button. Follow the simple registration process to get started.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, UPI, net banking, and popular digital wallets like PayPal, Google Pay, and Paytm.' },
    { q: "Can I get a refund if I'm not satisfied?", a: "Yes! We offer a 7-day money-back guarantee. If you're not satisfied with the course within the first 7 days, we'll provide a full refund." },
    { q: 'Do you offer one-on-one tutoring?', a: 'Absolutely! We offer personalized one-on-one sessions with our expert teachers. Contact us to schedule a session that fits your availability.' },
    { q: 'How long does it take to learn Hindi?', a: 'The learning timeline varies based on your dedication and starting level. Typically, students achieve conversational fluency in 6-12 months with consistent practice.' },
    { q: 'Are the courses suitable for complete beginners?', a: 'Yes! We have specially designed courses for absolute beginners. Our teachers use simple methods to make learning easy and enjoyable.' },
  ],
};

// ─── Intent Patterns ─────────────────────────────────────────────
const intentPatterns: { keywords: string[]; intent: string; response: string; quickReplies?: string[] }[] = [
  // Greetings
  {
    keywords: ['hello', 'hi', 'hey', 'hola', 'namaste', 'namaskar', 'good morning', 'good afternoon', 'good evening', 'sup', 'howdy'],
    intent: 'greeting',
    response: `Namaste! 🙏 Welcome to Raanuva Veeran Hindi Academy!\n\nI'm your learning assistant. I can help you with:\n• Course information & modules\n• Enrollment & pricing\n• Technical support\n• FAQs and more\n\nWhat would you like to know?`,
    quickReplies: ['📚 Explore Courses', '💰 Pricing Info', '❓ FAQs', '📞 Contact Support'],
  },
  // Thanks
  {
    keywords: ['thank', 'thanks', 'thx', 'appreciate', 'grateful', 'awesome', 'great', 'perfect', 'helpful'],
    intent: 'thanks',
    response: `You're welcome! 😊 I'm always happy to help.\n\nIs there anything else you'd like to know about our Hindi courses or platform?`,
    quickReplies: ['📚 Course Details', '❓ More Questions', '👋 That\'s All'],
  },
  // Goodbye
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'that\'s all', 'no more', 'done', 'exit'],
    intent: 'goodbye',
    response: `Thank you for chatting with us! 🙏\n\nRemember, your Hindi learning journey is just a click away. We're here 24/7 if you need anything.\n\nNamaste! 🇮🇳`,
  },

  // Course — General
  {
    keywords: ['course', 'courses', 'program', 'curriculum', 'syllabus', 'what do you teach', 'what can i learn', 'modules', 'lesson', 'lessons'],
    intent: 'course_overview',
    response: knowledgeBase.courses.overview,
    quickReplies: ['Module 1 Details', 'Module 2 Details', 'Module 3 Details', '🎥 Live Classes', '📝 Enroll Now'],
  },
  // Module 1
  {
    keywords: ['module 1', 'foundation', 'basics', 'beginner', 'basic', 'start', 'beginning', 'alphabet', 'devanagari', 'script'],
    intent: 'module1',
    response: knowledgeBase.courses.module1,
    quickReplies: ['Module 2 Details', '📝 How to Enroll', '💰 Pricing'],
  },
  // Module 2
  {
    keywords: ['module 2', 'conversation', 'conversational', 'intermediate', 'speaking', 'talk', 'tenses', 'verb'],
    intent: 'module2',
    response: knowledgeBase.courses.module2,
    quickReplies: ['Module 1 Details', 'Module 3 Details', '📝 How to Enroll'],
  },
  // Module 3
  {
    keywords: ['module 3', 'advanced', 'professional', 'business', 'writing', 'literature', 'formal'],
    intent: 'module3',
    response: knowledgeBase.courses.module3,
    quickReplies: ['Module 1 Details', 'Module 2 Details', '📝 How to Enroll'],
  },
  // Live class
  {
    keywords: ['live', 'live class', 'live session', 'jitsi', 'meeting', 'join class', 'interactive'],
    intent: 'live_class',
    response: knowledgeBase.courses.liveClass,
    quickReplies: ['📚 Course Overview', '📞 Contact Support'],
  },
  // Certificate
  {
    keywords: ['certificate', 'certification', 'credential', 'diploma', 'qualify', 'verified'],
    intent: 'certificate',
    response: knowledgeBase.courses.certificate,
    quickReplies: ['📚 Course Overview', '📝 How to Enroll'],
  },
  // Videos & Duration
  {
    keywords: ['video', 'videos', 'how many', 'hours', 'duration', 'long', 'time', '48 hour', '48-hour', 'length'],
    intent: 'duration',
    response: `⏱ **Course Duration**\n\nThe full program is 48 hours of video content:\n• Module 1: 16 hours (32 videos)\n• Module 2: 16 hours (32 videos)\n• Module 3: 16 hours (32 videos)\n\nTotal: 96 videos across 3 modules!\n\nVideos unlock sequentially — complete one to unlock the next. Learn at your own pace with lifetime access.`,
    quickReplies: ['📚 Course Details', '📝 How to Enroll', '💰 Pricing'],
  },
  // Tests
  {
    keywords: ['test', 'exam', 'quiz', 'assessment', 'pass', 'score', 'question'],
    intent: 'tests',
    response: `📝 **Module Tests**\n\nEach of the 3 modules has a test at the end:\n\n• 50 multiple-choice questions\n• 60 minutes to complete\n• 70% passing score required\n• Must pass Module 1 to unlock Module 2, etc.\n\nComplete all videos in a module to unlock its test. Tests ensure you've mastered the material before moving on!`,
    quickReplies: ['📚 Course Overview', '🏆 Certificate Info'],
  },

  // Enrollment
  {
    keywords: ['enroll', 'enrol', 'register', 'sign up', 'signup', 'join', 'start learning', 'get started', 'begin', 'admission'],
    intent: 'enrollment',
    response: knowledgeBase.enrollment.howTo,
    quickReplies: ['💰 Pricing Info', '📚 Course Overview', '❓ Requirements'],
  },
  // Requirements
  {
    keywords: ['requirement', 'need', 'prerequisite', 'what do i need', 'device', 'computer', 'phone', 'equipment'],
    intent: 'requirements',
    response: knowledgeBase.enrollment.requirements,
    quickReplies: ['📝 Enroll Now', '📚 Course Overview'],
  },

  // Pricing
  {
    keywords: ['price', 'pricing', 'cost', 'fee', 'fees', 'pay', 'payment', 'money', 'charge', 'expensive', 'cheap', 'affordable', 'free', 'discount', 'offer'],
    intent: 'pricing',
    response: knowledgeBase.pricing.info,
    quickReplies: ['📝 Enroll Now', '💸 Refund Policy', '📞 Contact for Pricing'],
  },
  // Refund
  {
    keywords: ['refund', 'money back', 'cancel', 'cancellation', 'return', 'guarantee', 'not satisfied', 'unsatisfied'],
    intent: 'refund',
    response: knowledgeBase.pricing.refund,
    quickReplies: ['📞 Contact Support', '📚 Course Overview'],
  },

  // Support — Contact
  {
    keywords: ['contact', 'reach', 'phone', 'call', 'email', 'mail', 'address', 'office', 'location', 'where are you', 'reach you'],
    intent: 'contact',
    response: knowledgeBase.support.contact,
    quickReplies: ['📍 Office Locations', '🔧 Technical Help', '📚 Course Info'],
  },
  // Office locations
  {
    keywords: ['office', 'location', 'branch', 'visit', 'tamil nadu', 'mumbai', 'bangalore', 'bengaluru', 'direction', 'address'],
    intent: 'offices',
    response: knowledgeBase.support.offices,
    quickReplies: ['📞 Contact Info', '📚 Course Overview'],
  },
  // Technical support
  {
    keywords: ['technical', 'tech', 'bug', 'error', 'not working', 'broken', 'issue', 'problem', 'help', 'troubleshoot', 'fix', 'crash', 'loading', 'stuck', 'slow'],
    intent: 'tech_support',
    response: knowledgeBase.support.technical,
    quickReplies: ['📞 Call Support', '📧 Email Support', '📚 Course Info'],
  },

  // Company — About
  {
    keywords: ['about', 'who are you', 'company', 'academy', 'raanuva', 'veeran', 'institution', 'organization', 'founded', 'history', 'mission', 'vision'],
    intent: 'about',
    response: knowledgeBase.company.about,
    quickReplies: ['👨‍🏫 Our Teachers', '✨ Features', '📚 Courses'],
  },
  // Teachers
  {
    keywords: ['teacher', 'teachers', 'instructor', 'tutor', 'mentor', 'faculty', 'who teaches', 'one on one', 'one-on-one', '1 on 1', 'private'],
    intent: 'teachers',
    response: knowledgeBase.company.teachers,
    quickReplies: ['📚 Course Overview', '📝 Enroll Now', '📞 Schedule Tutoring'],
  },
  // Features
  {
    keywords: ['feature', 'features', 'what do you offer', 'benefit', 'benefits', 'special', 'unique', 'why choose', 'offline', 'download', 'study material'],
    intent: 'features',
    response: knowledgeBase.company.features,
    quickReplies: ['📚 Course Overview', '📝 Enroll Now', '💰 Pricing'],
  },

  // FAQs
  {
    keywords: ['faq', 'faqs', 'frequently asked', 'common question', 'question'],
    intent: 'faq_list',
    response: `❓ **Frequently Asked Questions**\n\nHere are our most common questions. Click one to get the answer:\n\n1️⃣ How do I enroll?\n2️⃣ What payment methods?\n3️⃣ Refund policy?\n4️⃣ One-on-one tutoring?\n5️⃣ How long to learn Hindi?\n6️⃣ Suitable for beginners?\n\nOr just type your question and I'll answer it!`,
    quickReplies: ['How to enroll?', 'Payment methods?', 'Refund policy?', 'Beginner friendly?'],
  },
  // Specific FAQ matches
  {
    keywords: ['payment method', 'how to pay', 'upi', 'credit card', 'debit card', 'google pay', 'paytm', 'paypal', 'net banking'],
    intent: 'faq_payment',
    response: `💳 **Payment Methods**\n\n${knowledgeBase.faqs[1].a}\n\nAll transactions are secure and encrypted.`,
    quickReplies: ['📝 Enroll Now', '💸 Refund Policy', '📞 Contact'],
  },
  {
    keywords: ['tutor', 'tutoring', 'private session', 'personal', 'one on one', '1-on-1', 'individual'],
    intent: 'faq_tutoring',
    response: `👨‍🏫 **One-on-One Tutoring**\n\n${knowledgeBase.faqs[3].a}\n\n📞 Call: +91 6397 255 377\n📧 Email: raanuvaveeranhindiacademy666@gmail.com`,
    quickReplies: ['📞 Schedule Session', '📚 Course Overview', '💰 Pricing'],
  },
  {
    keywords: ['how long', 'timeline', 'fluent', 'fluency', 'months', 'weeks', 'quickly'],
    intent: 'faq_timeline',
    response: `⏳ **Learning Timeline**\n\n${knowledgeBase.faqs[4].a}\n\nOur 48-hour structured program helps you build a strong foundation. Consistent daily practice of 30-60 minutes yields the best results!`,
    quickReplies: ['📚 Course Overview', '📝 Enroll Now'],
  },
  {
    keywords: ['beginner', 'newbie', 'no experience', 'zero knowledge', 'scratch', 'never learned', 'suitable', 'easy'],
    intent: 'faq_beginners',
    response: `🌱 **Perfect for Beginners!**\n\n${knowledgeBase.faqs[5].a}\n\nModule 1 starts from the very basics — the Hindi alphabet (Devanagari script). No prior knowledge needed at all!`,
    quickReplies: ['Module 1 Details', '📝 Enroll Now', '💰 Pricing'],
  },

  // Hindi language questions
  {
    keywords: ['hindi', 'learn hindi', 'speak hindi', 'hindi language', 'hindi course', 'why hindi'],
    intent: 'why_hindi',
    response: `🇮🇳 **Why Learn Hindi?**\n\nHindi is the 4th most spoken language in the world! Here's why learning it is valuable:\n\n• 🌍 600+ million speakers worldwide\n• 💼 Career opportunities in India's booming economy\n• 🎬 Enjoy Bollywood movies, music & literature in original\n• 🏛 Connect with India's rich culture & heritage\n• 🧠 Cognitive benefits of learning a new language\n\nOur course makes it easy and fun to learn!`,
    quickReplies: ['📚 Explore Courses', '📝 Enroll Now', '👨‍🏫 Meet Teachers'],
  },

  // Feedback
  {
    keywords: ['feedback', 'review', 'rate', 'rating', 'opinion', 'suggestion', 'improve', 'complaint', 'complain', 'bad', 'poor', 'worst', 'terrible', 'disappointed'],
    intent: 'feedback',
    response: `📝 **We Value Your Feedback!**\n\nThank you for wanting to share your thoughts with us. Your feedback helps us improve!\n\nHow would you rate your experience with us?`,
    quickReplies: ['⭐ Excellent', '😊 Good', '😐 Average', '😞 Needs Improvement'],
  },
];

// ─── Page Context ────────────────────────────────────────────────
const getPageGreeting = (): { message: string; quickReplies: string[] } => {
  const path = window.location.pathname;

  if (path === '/' || path === '') {
    return {
      message: `Hello! 👋 Welcome to **Raanuva Veeran Hindi Academy**!\n\nI'm your smart assistant. I can help you with:\n\n🎓 Course details & modules\n💰 Pricing & enrollment\n❓ FAQs & support\n🧭 Navigate the website\n\nHow can I help you today?`,
      quickReplies: ['📚 Explore Courses', '💰 Pricing Info', '❓ FAQs', '📞 Contact Support'],
    };
  }
  if (path.includes('/courses')) {
    return {
      message: `Welcome to the **Courses** page! 📚\n\nYou're browsing our 48-Hour Hindi Mastery Program. I can help you with:\n\n• Details about each module\n• How to enroll & get started\n• Live class information\n• Certificate details\n\nWhat would you like to know?`,
      quickReplies: ['Module 1 Details', 'Module 2 Details', 'Module 3 Details', '🎥 Live Classes'],
    };
  }
  if (path.includes('/about')) {
    return {
      message: `You're on the **About** page! 🏫\n\nLearning about us? Here's a quick snapshot:\n• Founded in 2020\n• 50K+ happy students\n• 40+ countries\n• 4.9/5 rating\n\nWant to know more?`,
      quickReplies: ['👨‍🏫 Our Teachers', '✨ Features', '📚 Courses', '📞 Contact'],
    };
  }
  if (path.includes('/contact')) {
    return {
      message: `You're on the **Contact** page! 📞\n\nNeed to reach us? I can help right here, or you can:\n\n📧 Email: info@raanuvaveeran.com\n📞 Call: +91 6397 255 377\n\nOr ask me anything — I might have the answer!`,
      quickReplies: ['📍 Office Locations', '🔧 Technical Help', '❓ FAQs', '📝 Give Feedback'],
    };
  }
  if (path.includes('/teachers')) {
    return {
      message: `Welcome to the **Teachers** page! 👨‍🏫\n\nOur team consists of certified native Hindi speakers with years of teaching experience.\n\nWould you like to know about tutoring or our teaching methods?`,
      quickReplies: ['👨‍🏫 About Teachers', '📚 Course Overview', '📝 Enroll Now'],
    };
  }
  if (path.includes('/blog')) {
    return {
      message: `You're on the **Blog** page! 📖\n\nBrowsing our Hindi learning tips and articles? Feel free to ask me any question about learning Hindi!\n\nI can help with course info, enrollment, or language tips.`,
      quickReplies: ['📚 Course Info', '❓ Hindi Learning Tips', '📞 Contact'],
    };
  }

  return {
    message: `Hello! 👋 Welcome to **Raanuva Veeran Hindi Academy**!\n\nI'm your smart learning assistant. How can I help you today?`,
    quickReplies: ['📚 Explore Courses', '💰 Pricing Info', '❓ FAQs', '📞 Contact Support'],
  };
};

// ─── Intent Matching Engine ──────────────────────────────────────
const findBestResponse = (input: string): IntentMatch => {
  const normalizedInput = input.toLowerCase().trim();

  // Check for feedback ratings
  if (['excellent', '⭐ excellent'].some(k => normalizedInput.includes(k))) {
    return {
      intent: 'feedback_response', confidence: 1,
      response: `🌟 **Thank you so much!** We're thrilled you had an excellent experience!\n\nYour kind words motivate our whole team. If you have a moment, we'd love a review on our social media pages too!\n\nIs there anything else I can help with?`,
      quickReplies: ['📚 Courses', '👋 Goodbye'],
    };
  }
  if (['good', '😊 good'].some(k => normalizedInput.includes(k)) && normalizedInput.length < 20) {
    return {
      intent: 'feedback_response', confidence: 1,
      response: `😊 **Glad to hear that!** Thank you for your positive feedback.\n\nWe're always working to improve. If you have specific suggestions, feel free to share!\n\nAnything else I can help with?`,
      quickReplies: ['📚 Courses', '💡 Suggestions', '👋 Goodbye'],
    };
  }
  if (['average', '😐 average'].some(k => normalizedInput.includes(k))) {
    return {
      intent: 'feedback_response', confidence: 1,
      response: `Thank you for your honest feedback! 🙏\n\nWe want to do better. Could you tell us what we can improve?\n\n📧 Email your suggestions to: raanuvaveeranhindiacademy666@gmail.com\n📞 Or call: +91 6397 255 377\n\nYour input helps us grow!`,
      quickReplies: ['📧 Email Feedback', '📞 Call Us', '📚 Courses'],
    };
  }
  if (['needs improvement', '😞 needs improvement', 'bad', 'poor', 'terrible', 'worst', 'disappointed'].some(k => normalizedInput.includes(k))) {
    return {
      intent: 'feedback_response', confidence: 1,
      response: `We're sorry to hear that. 😔 Your experience matters a lot to us.\n\nPlease share the details of your concern so we can make it right:\n\n📧 Email: raanuvaveeranhindiacademy666@gmail.com\n📞 Call: +91 6397 255 377\n\nOur support team will personally address your feedback within 24 hours.`,
      quickReplies: ['📧 Email Support', '📞 Call Support', '💸 Refund Policy'],
    };
  }

  // Score each pattern
  let bestMatch: IntentMatch = {
    intent: 'fallback',
    confidence: 0,
    response: `I'm not sure I understood that completely, but I'm here to help! 🤔\n\nHere are some things I can help with:\n\n📚 Course information & modules\n💰 Pricing & enrollment\n❓ FAQs & common questions\n📞 Contact & support\n👨‍🏫 Teacher information\n🏆 Certificate details\n\nTry asking about any of these topics, or click a button below!`,
    quickReplies: ['📚 Courses', '💰 Pricing', '❓ FAQs', '📞 Contact', '📝 Enroll Now'],
  };

  for (const pattern of intentPatterns) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (normalizedInput.includes(keyword.toLowerCase())) {
        // Longer keyword matches are weighted more heavily
        score += keyword.length;
      }
    }

    if (score > bestMatch.confidence) {
      bestMatch = {
        intent: pattern.intent,
        response: pattern.response,
        quickReplies: pattern.quickReplies,
        confidence: score,
      };
    }
  }

  return bestMatch;
};

// ─── Generate Unique ID ─────────────────────────────────────────
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

// ─── Format Time ─────────────────────────────────────────────────
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// ─── Simple Markdown bold renderer ───────────────────────────────
const renderContent = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

// ═══════════════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════════════
const HindiLearningChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initialize with page-aware greeting when opened
  useEffect(() => {
    if (isOpen && !hasInitialized) {
      const greeting = getPageGreeting();
      setMessages([
        {
          id: generateId(),
          role: 'assistant',
          content: greeting.message,
          timestamp: new Date(),
          quickReplies: greeting.quickReplies,
        },
      ]);
      setHasInitialized(true);
    }
  }, [isOpen, hasInitialized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Listen for external open event (from Contact page)
  useEffect(() => {
    const openChat = () => setIsOpen(true);
    window.addEventListener('open-hindi-chat', openChat);
    return () => window.removeEventListener('open-hindi-chat', openChat);
  }, []);

  const addBotMessage = useCallback((response: string, quickReplies?: string[]) => {
    setIsTyping(true);
    const delay = Math.min(600 + response.length * 3, 2000);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          quickReplies,
        },
      ]);
    }, delay);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    // Add user message
    setMessages(prev => [
      ...prev,
      { id: generateId(), role: 'user', content: trimmed, timestamp: new Date() },
    ]);
    setInput('');

    // Get smart response
    const match = findBestResponse(trimmed);
    addBotMessage(match.response, match.quickReplies);
  }, [input, isTyping, addBotMessage]);

  const handleQuickReply = useCallback((reply: string) => {
    if (isTyping) return;

    setMessages(prev => [
      ...prev,
      { id: generateId(), role: 'user', content: reply, timestamp: new Date() },
    ]);

    const match = findBestResponse(reply);
    addBotMessage(match.response, match.quickReplies);
  }, [isTyping, addBotMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  // Get the last assistant message's quick replies
  const lastBotMessage = [...messages].reverse().find(m => m.role === 'assistant');
  const activeQuickReplies = lastBotMessage?.quickReplies;

  return (
    <div id="hindi-chat" className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      {/* ─── Floating Chat Button ─── */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} aria-label="Open chat assistant">
          <img
            src="/aichaticon.png"
            alt="Chat"
            className="w-14 h-14 md:w-20 md:h-20 object-cover"
          />
        </button>
      )}

      {/* ─── Chat Window ─── */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden border border-gray-100 ${
            isMinimized ? 'h-16' : 'h-[520px] md:h-[600px]'
          } w-[calc(100vw-2rem)] md:w-[400px] fixed bottom-4 right-4 md:relative`}
          style={{ boxShadow: '0 25px 60px -12px rgba(128, 0, 255, 0.25), 0 0 0 1px rgba(0,0,0,0.05)' }}
        >
          {/* ─── Header ─── */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white px-4 py-3 flex justify-between items-center flex-shrink-0 relative overflow-hidden">
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Hindi Learning Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-[11px] text-white/80">Online • Ready to help</p>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 relative z-10">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Minimize chat"
              >
                <Minimize2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* ─── Messages Area ─── */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-purple-50/50 to-white/80">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    style={{ animation: 'slideIn 0.3s ease-out' }}
                  >
                    {/* Bot Avatar */}
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mt-1 shadow-sm">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-br-md shadow-md shadow-purple-200/50'
                            : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">
                          {renderContent(msg.content)}
                        </p>
                      </div>
                      <p className={`text-[10px] text-gray-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left ml-1'}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>

                    {/* User Avatar */}
                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mt-1 shadow-sm">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-2 justify-start" style={{ animation: 'slideIn 0.3s ease-out' }}>
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mt-1 shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex gap-1.5 items-center h-5">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ─── Quick Reply Buttons ─── */}
              {activeQuickReplies && activeQuickReplies.length > 0 && !isTyping && (
                <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50 flex flex-wrap gap-2">
                  {activeQuickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 shadow-sm hover:shadow active:scale-95 font-medium"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* ─── Input Area ─── */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2 items-center flex-shrink-0">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  disabled={isTyping}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent disabled:opacity-50 transition-all placeholder:text-gray-400 bg-gray-50 focus:bg-white"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white flex items-center justify-center hover:from-purple-700 hover:to-pink-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-purple-200/50"
                  aria-label="Send message"
                >
                  <Send size={16} className="translate-x-[1px]" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Animations ─── */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HindiLearningChat;

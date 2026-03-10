import { Mail, Phone, MapPin, Clock, Send, MessageCircle, HelpCircle, Globe, Facebook, Twitter, Instagram, Linkedin, Youtube, Users, Headphones, Award, CheckCircle, MessageSquare, CalendarCheck, Zap, Shield, Star, Loader2, AlertCircle, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// ------------------- CONSTANTS & DATA -------------------
const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Send us an email anytime',
    value: 'info@raanuvaveeran.com',
    link: 'mailto:raanuvaveeranhindiacademy666@gmail.com',
    color: 'bg-orange-100',
    iconColor: 'text-orange-500'
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Mon-Sat from 9am to 6pm',
    value: '+91 6397255377',
    link: 'tel:+916397255377',
    color: 'bg-blue-100',
    iconColor: 'text-blue-500'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    description: 'Come say hello',
    value: 'Tamil Nadu, India',
    link: '#map',
    color: 'bg-green-100',
    iconColor: 'text-green-500'
  }
];

const supportStats = [
  { icon: Users, label: 'Happy Students', value: '50,000+', color: 'bg-blue-500' },
  { icon: Headphones, label: 'Support Tickets', value: '10K+', color: 'bg-purple-500' },
  { icon: Award, label: 'Satisfaction Rate', value: '98%', color: 'bg-orange-500' },
  { icon: Clock, label: 'Avg Response Time', value: '< 2hrs', color: 'bg-green-500' }
];

const faqs = [
  {
    question: 'How do I enroll in a Hindi course?',
    answer: 'You can enroll by visiting our Courses page, selecting your desired course, and clicking the "Enroll Now" button. Follow the simple registration process to get started.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, UPI, net banking, and popular digital wallets like PayPal, Google Pay, and Paytm.'
  },
  {
    question: 'Can I get a refund if I\'m not satisfied?',
    answer: 'Yes! We offer a 7-day money-back guarantee. If you\'re not satisfied with the course within the first 7 days, we\'ll provide a full refund.'
  },
  {
    question: 'Do you offer one-on-one tutoring?',
    answer: 'Absolutely! We offer personalized one-on-one sessions with our expert teachers. Contact us to schedule a session that fits your availability.'
  },
  {
    question: 'How long does it take to learn Hindi?',
    answer: 'The learning timeline varies based on your dedication and starting level. Typically, students achieve conversational fluency in 6-12 months with consistent practice.'
  },
  {
    question: 'Are the courses suitable for complete beginners?',
    answer: 'Yes! We have specially designed courses for absolute beginners. Our teachers use simple methods to make learning easy and enjoyable.'
  }
];

const officeLocations = [
  {
    city: 'Tamil Nadu',
    address: '22, Sri Angalamman Illam, Krishnasamy Street,near Zeon Cinema, Vandipettai,Gobichettipalayam, Tamil Nadu - 638476',
    phone: '+91 63972 55377',
    email: 'raanuvaveeranhindiacademy666@gmail.com',
    hours: 'Mon-Sat: 9AM-6PM'
  },
  {
    city: 'Mumbai',
    address: '456 Bandra West, Mumbai - 400050',
    phone: '+91 98765 43211',
    email: 'raanuvaveeranhindiacademy666@gmail.com',
    hours: 'Mon-Sat: 9AM-6PM'
  },
  {
    city: 'Bangalore',
    address: '789 Koramangala, Bangalore - 560034',
    phone: '+91 98765 43212',
    email: 'raanuvaveeranhindiacademy666@gmail.com',
    hours: 'Mon-Sat: 9AM-6PM'
  }
];

const socialLinks = [
  { icon: Facebook, name: 'Facebook', link: '#', color: 'bg-blue-600' },
  { icon: Twitter, name: 'Twitter', link: '#', color: 'bg-sky-500' },
  { icon: Instagram, name: 'Instagram', link: '#', color: 'bg-pink-600' },
  { icon: Linkedin, name: 'LinkedIn', link: '#', color: 'bg-blue-700' },
  { icon: Youtube, name: 'YouTube', link: '#', color: 'bg-red-600' }
];

const whyContactUs = [
  {
    icon: Zap,
    title: 'Quick Response',
    description: 'Get answers within 2 hours during business hours'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your information is safe and confidential'
  },
  {
    icon: Star,
    title: 'Expert Support',
    description: 'Talk to experienced Hindi learning consultants'
  },
  {
    icon: CheckCircle,
    title: 'Problem Solved',
    description: '99% of queries resolved on first contact'
  }
];

// ------------------- ANIMATION COMPONENT -------------------
function AnimatedSection({ children, direction = 'left', className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const animations = {
    left: 'translate-x-[-100px] opacity-0',
    right: 'translate-x-[100px] opacity-0',
    up: 'translate-y-[50px] opacity-0',
    fade: 'opacity-0'
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'translate-x-0 translate-y-0 opacity-100' : animations[direction]
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ------------------- MAIN COMPONENT -------------------
export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState(null);

  // 1. ADDED: State for form handling
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: '' });

  // 2. ADDED: Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. ADDED: Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    // 🔴 REPLACE WITH YOUR DEPLOYED GOOGLE SCRIPT URL
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlQ6c1XZgOkvqPryBvnc9IVxhr8_1z5sqQQLAQTR8t7w_8xRrEtsfsAvbnEe6Vx1we/exec"; 

    try {
      // We use 'no-cors' mode often for Google Scripts to avoid CORS errors, 
      // but standard fetch works best if the script returns proper JSON headers.
      // If you get CORS errors, ensure your Script is deployed as "Anyone".
      await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(formData)
        // Note: We don't set Content-Type header to avoid preflight OPTIONS request issues with GAS
      });

      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you! Your message has been sent successfully.' 
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });

    } catch (error) {
      console.error("Error submitting form", error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again later.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-16 overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-orange-400/20 backdrop-blur-xl py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection direction="fade" className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-purple-600 mb-6">
              Get in Touch
            </h1>
            <p className="text-lg sm:text-xl text-purple-500 max-w-3xl mx-auto">
              Have questions? We're here to help you on your Hindi learning journey
            </p>
          </AnimatedSection>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Support Stats */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {supportStats.map((stat, index) => (
              <AnimatedSection key={index} direction={index % 2 === 0 ? 'left' : 'right'}>
                <div className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition-all">
                  <div className={`${stat.color} w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How Can We Help?</h2>
            <p className="text-base sm:text-lg text-gray-600">Choose your preferred way to reach us</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {contactMethods.map((method, index) => (
              <AnimatedSection key={index} direction={index === 0 ? 'left' : index === 1 ? 'up' : 'right'}>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
                  <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <method.icon className={`w-8 h-8 ${method.iconColor}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3">{method.description}</p>
                  <a href={method.link} className={`${method.iconColor} font-semibold hover:underline text-sm sm:text-base`}>
                    {method.value}
                  </a>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Why Contact Us */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Students Choose Our Support</h2>
            <p className="text-base sm:text-lg text-gray-600">We're committed to providing excellent service</p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {whyContactUs.map((item, index) => (
              <AnimatedSection key={index} direction={index % 2 === 0 ? 'left' : 'right'}>
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                  <div className="bg-gradient-to-br from-orange-500 to-pink-500 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form & Info */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* 4. UPDATED: Form Section */}
            <AnimatedSection direction="left">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Send Us a Message</h2>
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                  Fill out the form below and our team will get back to you within 24 hours.
                </p>

                {submitStatus.message && (
                  <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${submitStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {submitStatus.type === 'success' ? <Check className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                    <p>{submitStatus.message}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="John"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <select 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option>General Inquiry</option>
                      <option>Course Information</option>
                      <option>Technical Support</option>
                      <option>Partnership Opportunities</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Tell us how we can help you..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm sm:text-base"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </AnimatedSection>

            {/* Side Info */}
            <div className="space-y-6 sm:space-y-8">
              <AnimatedSection direction="right">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Office Hours</h3>
                      <div className="space-y-2 text-sm sm:text-base text-gray-600">
                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="right">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Live Chat Support</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        Get instant answers to your questions from our support team.
                      </p>
                      <button
                        onClick={() => {
                          document
                            .getElementById('hindi-chat')
                            ?.scrollIntoView({ behavior: 'smooth' });

                          window.dispatchEvent(new Event('open-hindi-chat'));
                        }}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Start Chat
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="right">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">FAQs</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        Find quick answers to commonly asked questions in our help center.
                      </p>
                      <button
                        onClick={() => {
                          document
                            .getElementById('faq-section')
                            ?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm sm:text-base"
                      >
                        View FAQs
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="right">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 sm:p-8 text-white">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4">Need Immediate Help?</h3>
                  <p className="mb-6 text-sm sm:text-base">
                    Our support team is available to assist you with any urgent queries.
                  </p>
                  <a
                    href="tel:+916397255377"
                    className="inline-block bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors text-sm sm:text-base"
                  >
                    Call Now: +91 6397 255 377
                  </a>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq-section" className="bg-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-base sm:text-lg text-gray-600">Quick answers to questions you may have</p>
          </AnimatedSection>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <AnimatedSection key={index} direction={index % 2 === 0 ? 'left' : 'right'}>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-gray-900 pr-4 text-sm sm:text-base">{faq.question}</span>
                    <MessageSquare className={`w-5 h-5 text-orange-500 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 sm:pb-5 text-sm sm:text-base text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Office Locations */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Office Locations</h2>
            <p className="text-base sm:text-lg text-gray-600">Visit us at any of our centers across India</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {officeLocations.map((location, index) => (
              <AnimatedSection key={index} direction={index === 0 ? 'left' : index === 1 ? 'up' : 'right'}>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{location.city}</h3>
                  </div>
                  <div className="space-y-3 text-sm sm:text-base text-gray-600">
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-1" />
                      {location.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                      {location.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                      {location.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                      {location.hours}
                    </p>
                  </div>
                  <button className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-sm sm:text-base">
                    Get Directions
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Connect With Us</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8">Follow us on social media for updates and tips</p>
            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  className={`${social.color} w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg`}
                >
                  <social.icon className="w-6 h-6 text-white" />
                </a>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      <AnimatedSection direction="up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
          <div id="map" className="bg-white rounded-2xl overflow-hidden shadow-xl">
            <div className="h-64 sm:h-80 lg:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15641.745997116495!2d77.45705008494906!3d11.448387052413247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1764853670846!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              ></iframe>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
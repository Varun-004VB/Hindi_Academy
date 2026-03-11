import { Award, BookOpen, Users, Star, Linkedin, Mail, GraduationCap, Trophy, MessageCircle, Target, Globe, Video, Calendar } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const teachers = [
  {
    name: 'Dr. Priya Sharma',
    title: 'Senior Hindi Instructor',
    specialization: 'Grammar & Literature',
    experience: '15 years',
    students: '10,000+',
    rating: 4.9,
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'PhD in Hindi Literature from Delhi University. Specialized in teaching advanced grammar and classical literature with a modern approach.',
    achievements: ['Published 3 Hindi textbooks', 'TEDx Speaker', 'National Award Winner']
  },
  {
    name: 'Rahul Mehta',
    title: 'Conversation Expert',
    specialization: 'Spoken Hindi & Pronunciation',
    experience: '12 years',
    students: '12,000+',
    rating: 5.0,
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Native Hindi speaker from Delhi with expertise in conversational Hindi and regional dialects. Makes learning fun and practical.',
    achievements: ['Certified Language Coach', '5000+ hours teaching', 'Fluency Expert']
  },
  {
    name: 'Anita Patel',
    title: 'Beginner Specialist',
    specialization: 'Foundation & Basics',
    experience: '10 years',
    students: '15,000+',
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Expert in teaching Hindi to absolute beginners. Patient, encouraging, and skilled at breaking down complex concepts.',
    achievements: ['Best Teacher Award 2023', 'Curriculum Developer', 'Student Favorite']
  },
  {
    name: 'Vikram Singh',
    title: 'Business Hindi Coach',
    specialization: 'Professional & Corporate Hindi',
    experience: '8 years',
    students: '5,000+',
    rating: 4.8,
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Former corporate trainer specializing in business Hindi for professionals. Helps students excel in workplace communication.',
    achievements: ['Corporate Trainer', 'MBA from IIM', 'Business Communication Expert']
  },
  {
    name: 'Meera Kulkarni',
    title: 'Kids Hindi Teacher',
    specialization: 'Children\'s Education',
    experience: '14 years',
    students: '8,000+',
    rating: 5.0,
    image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Specialized in teaching Hindi to children with interactive games and activities. Makes learning enjoyable for young minds.',
    achievements: ['Child Psychology Certified', 'Award-winning Educator', 'Published Children\'s Books']
  },
  {
    name: 'Aditya Verma',
    title: 'Advanced Level Instructor',
    specialization: 'Literature & Poetry',
    experience: '18 years',
    students: '6,000+',
    rating: 4.9,
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Masters in Hindi Literature with deep knowledge of classical and modern Hindi poetry. Inspires students with his passion.',
    achievements: ['Published Poet', 'Literary Critic', 'University Lecturer']
  }
];

const stats = [
  { icon: Users, label: 'Active Students', value: '50,000+', color: 'bg-blue-500' },
  { icon: GraduationCap, label: 'Expert Teachers', value: '25+', color: 'bg-purple-500' },
  { icon: Trophy, label: 'Success Rate', value: '98%', color: 'bg-orange-500' },
  { icon: Globe, label: 'Countries', value: '45+', color: 'bg-green-500' }
];

const features = [
  {
    icon: Video,
    title: 'Live Interactive Classes',
    description: 'Join real-time sessions with our expert teachers and interact directly'
  },
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Book classes at your convenience, anytime that works for you'
  },
  {
    icon: Target,
    title: 'Personalized Learning',
    description: 'Customized curriculum based on your goals and learning pace'
  },
  {
    icon: MessageCircle,
    title: '24/7 Support',
    description: 'Get help whenever you need it from our dedicated support team'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Business Professional',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'Learning Hindi with these teachers has been transformative. The personalized attention and engaging lessons made all the difference!',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Student',
    image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'I went from zero to conversational Hindi in just 6 months. The teachers are patient, knowledgeable, and truly passionate.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Parent',
    image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400',
    text: 'My daughter loves her Hindi classes! The teacher makes learning fun and interactive. Highly recommended!',
    rating: 5
  }
];

const methodology = [
  {
    step: '01',
    title: 'Assessment',
    description: 'We evaluate your current level and understand your learning goals'
  },
  {
    step: '02',
    title: 'Customization',
    description: 'Create a personalized learning path tailored to your needs'
  },
  {
    step: '03',
    title: 'Practice',
    description: 'Engage in interactive exercises and real-world conversations'
  },
  {
    step: '04',
    title: 'Progress',
    description: 'Track your improvement with regular assessments and feedback'
  }
];

function AnimatedSection({ children, direction = 'left', className = '' }: { children: React.ReactNode; direction?: 'left' | 'right' | 'up' | 'fade'; className?: string }) {
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

  const animations: Record<string, string> = {
    left: 'translate-x-[-100px] opacity-0',
    right: 'translate-x-[100px] opacity-0',
    up: 'translate-y-[50px] opacity-0',
    fade: 'opacity-0'
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? 'translate-x-0 translate-y-0 opacity-100' : animations[direction]
        } ${className}`}
    >
      {children}
    </div>
  );
}

export default function TeachersPage() {
  return (
    <div className="pt-16 overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-orange-400/20 backdrop-blur-xl py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection direction="fade" className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-purple-600 mb-6">
              Meet Our Expert Teachers
            </h1>
            <p className="text-lg sm:text-xl text-purple-500 max-w-3xl mx-auto">
              Learn from certified native speakers who are passionate about teaching Hindi
            </p>
          </AnimatedSection>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
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

      {/* Teachers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <AnimatedSection direction="up" className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Teaching Team</h2>
          <p className="text-base sm:text-lg text-gray-600">Experienced educators dedicated to your success</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-20">
          {teachers.map((teacher, index) => (
            <AnimatedSection key={index} direction={index % 2 === 0 ? 'left' : 'right'}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="md:flex">
                  <div className="md:w-1/3 relative h-48 md:h-auto">
                    <img
                      src={teacher.image}
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-bold text-gray-900">{teacher.rating}</span>
                    </div>
                  </div>
                  <div className="md:w-2/3 p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {teacher.name}
                    </h3>
                    <p className="text-orange-500 font-semibold mb-2 text-sm sm:text-base">{teacher.title}</p>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">{teacher.bio}</p>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div className="bg-orange-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center gap-2 text-orange-600 mb-1">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">Specialization</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-900 font-semibold">{teacher.specialization}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">Experience</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-900 font-semibold">{teacher.experience}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-2 sm:p-3 mb-4">
                      <div className="flex items-center gap-2 text-green-600 mb-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-medium">Students Taught</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-900 font-semibold">{teacher.students}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Key Achievements:</p>
                      <ul className="space-y-1">
                        {teacher.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-xs sm:text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                        Contact
                      </button>
                      <button className="px-3 sm:px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Teachers?</h2>
            <p className="text-base sm:text-lg text-gray-600">Experience the best in Hindi language education</p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={index} direction={index % 2 === 0 ? 'left' : 'right'}>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-orange-400 to-pink-400 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Teaching Methodology</h2>
            <p className="text-base sm:text-lg text-gray-600">A proven 4-step approach to language mastery</p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {methodology.map((item, index) => (
              <AnimatedSection key={index} direction={index % 2 === 0 ? 'left' : 'right'}>
                <div className="relative">
                  <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all transform hover:-translate-y-2">
                    <div className="text-4xl sm:text-6xl font-bold opacity-20 mb-4">{item.step}</div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-sm sm:text-base text-white/90">{item.description}</p>
                  </div>
                  {index < methodology.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-orange-300"></div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Students Say</h2>
            <p className="text-base sm:text-lg text-gray-600">Real success stories from our community</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} direction={index === 1 ? 'up' : index === 0 ? 'left' : 'right'}>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 italic">"{testimonial.text}"</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - Join Team */}
      <div className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 sm:p-12">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Want to Join Our Team?</h2>
                <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
                  We're always looking for passionate and experienced Hindi teachers to join our team. If you have a love for teaching and want to make a difference in students' lives, we'd love to hear from you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-orange-600 transition-all transform hover:scale-105">
                    Apply as a Teacher
                  </button>
                  <button className="bg-white text-orange-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-orange-50 transition-all border-2 border-orange-500">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 py-20 overflow-hidden">
        {/* Left Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                Ready to begin your Hindi learning journey?
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Join 50,000+ students across 40+ countries learning Hindi with expert native teachers and flexible online classes.
              </p>
              <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-900 transition-all transform hover:scale-105">
                Book Your First Class
              </button>
            </div>

            {/* Right Floating Cards */}
            <div className="relative h-96 lg:h-[500px] hidden lg:block">
              {/* Large Purple Circle Background */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-600 to-purple-700 rounded-full opacity-40 blur-3xl"></div>

              {/* Floating Cards */}
              {/* Learning Progress Card */}
              <div className="absolute top-8 left-12 bg-white rounded-2xl p-4 shadow-2xl w-48 animate-float">
                <div className="text-sm font-semibold text-gray-700 mb-2">Learning Progress</div>
                <div className="flex items-center gap-1 mb-1">
                  {[40, 60, 80, 50, 70].map((height, i) => (
                    <div key={i} className="flex-1">
                      <div className="bg-gradient-to-t from-purple-600 to-purple-400 rounded" style={{ height: `${height}px` }}></div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>This week</span>
                  <span>75%</span>
                </div>
              </div>

              {/* Native Teachers Card */}
              <div className="absolute top-12 right-8 bg-white rounded-2xl p-4 shadow-2xl w-44 animate-float-delayed">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-full h-20 rounded-lg mb-2 flex items-center justify-center">
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Expert Native Teachers</div>
                <button className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full w-full font-medium">
                  Meet Teachers
                </button>
              </div>

              {/* Course Levels Card */}
              <div className="absolute top-32 left-4 bg-white rounded-2xl p-4 shadow-2xl w-40 animate-float">
                <div className="text-sm font-semibold text-gray-700 mb-3">Course Levels</div>
                <div className="space-y-2">
                  {['Beginner', 'Intermediate', 'Advanced', 'Fluent'].map((level, num) => (
                    <div key={num} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">
                        {num + 1}
                      </div>
                      <div className="text-xs text-gray-600">{level}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Global Students Card */}
              <div className="absolute top-48 right-20 bg-white rounded-2xl p-4 shadow-2xl w-36 h-36 animate-float-delayed flex flex-col items-center justify-center">
                <Globe className="w-12 h-12 text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-gray-800">40+</div>
                <div className="text-xs text-gray-600 text-center">Countries Worldwide</div>
              </div>

              {/* Weekly Classes Card */}
              <div className="absolute bottom-20 left-20 bg-white rounded-2xl p-4 shadow-2xl w-36 animate-float">
                <div className="text-xs text-gray-600 mb-2">Weekly Classes</div>
                <div className="flex items-end justify-between h-20 gap-2">
                  {[60, 75, 90].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{['Mon', 'Wed', 'Fri'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Satisfaction Card */}
              <div className="absolute bottom-12 right-4 bg-white rounded-2xl p-4 shadow-2xl w-52 animate-float-delayed">
                <div className="text-sm font-semibold text-gray-700 mb-3">Student Satisfaction</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Success Rate</span>
                  <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90 w-16 h-16">
                      <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                      <circle cx="32" cy="32" r="28" stroke="#9333ea" strokeWidth="6" fill="none" strokeDasharray="176" strokeDashoffset="18" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-purple-600">95%</div>
                  </div>
                </div>
              </div>

              {/* Decorative Dots */}
              <div className="absolute top-20 right-1/3 w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-32 left-1/3 w-6 h-6 bg-cyan-300 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute top-1/2 right-12 w-5 h-5 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1s;
        }
      `}</style>
      </div>
    </div>
  );
}
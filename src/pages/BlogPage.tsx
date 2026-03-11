import { Calendar, User, Clock, ArrowRight, Tag, TrendingUp, BookOpen, Sparkles, Search, Filter, MessageCircle, Share2, Bookmark, Eye, ThumbsUp, Bell, Pen, Award, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const blogPosts = [
  {
    title: '10 Essential Hindi Phrases Every Beginner Should Know',
    excerpt: 'Start your Hindi learning journey with these fundamental phrases that will help you in everyday conversations...',
    author: 'Priya Sharma',
    date: 'Nov 25, 2024',
    readTime: '5 min read',
    category: 'Beginner Tips',
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Beginner', 'Phrases', 'Conversation'],
    views: '2.5k',
    likes: 245
  },
  {
    title: 'The History and Evolution of the Devanagari Script',
    excerpt: 'Explore the fascinating journey of the Devanagari script from ancient times to the modern era...',
    author: 'Aditya Verma',
    date: 'Nov 20, 2024',
    readTime: '8 min read',
    category: 'Culture',
    image: 'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Script', 'History', 'Culture'],
    views: '3.2k',
    likes: 312
  },
  {
    title: 'How to Improve Your Hindi Pronunciation',
    excerpt: 'Master the sounds of Hindi with these expert tips and techniques for perfect pronunciation...',
    author: 'Rahul Mehta',
    date: 'Nov 18, 2024',
    readTime: '6 min read',
    category: 'Speaking',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Pronunciation', 'Speaking', 'Tips'],
    views: '4.1k',
    likes: 428
  },
  {
    title: 'Understanding Hindi Grammar: A Comprehensive Guide',
    excerpt: 'Dive deep into Hindi grammar rules and structures to build a strong foundation for fluency...',
    author: 'Dr. Priya Sharma',
    date: 'Nov 15, 2024',
    readTime: '10 min read',
    category: 'Grammar',
    image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Grammar', 'Learning', 'Advanced'],
    views: '5.8k',
    likes: 567
  },
  {
    title: 'Top 5 Bollywood Movies to Learn Hindi',
    excerpt: 'Discover the best Bollywood films that can help you improve your Hindi while enjoying great cinema...',
    author: 'Anita Patel',
    date: 'Nov 12, 2024',
    readTime: '7 min read',
    category: 'Entertainment',
    image: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Movies', 'Entertainment', 'Learning'],
    views: '6.3k',
    likes: 642
  },
  {
    title: 'Business Hindi: Essential Vocabulary for the Workplace',
    excerpt: 'Learn the key Hindi terms and phrases you need to succeed in a professional environment...',
    author: 'Vikram Singh',
    date: 'Nov 10, 2024',
    readTime: '9 min read',
    category: 'Business',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Business', 'Professional', 'Vocabulary'],
    views: '3.7k',
    likes: 389
  },
  {
    title: 'Teaching Hindi to Children: A Parent\'s Guide',
    excerpt: 'Effective strategies and fun activities to help your children learn Hindi at home...',
    author: 'Meera Kulkarni',
    date: 'Nov 8, 2024',
    readTime: '6 min read',
    category: 'Kids',
    image: 'https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Kids', 'Parents', 'Teaching'],
    views: '4.5k',
    likes: 478
  },
  {
    title: 'The Beauty of Hindi Poetry: An Introduction',
    excerpt: 'Discover the rich tradition of Hindi poetry from classical to contemporary works...',
    author: 'Aditya Verma',
    date: 'Nov 5, 2024',
    readTime: '8 min read',
    category: 'Literature',
    image: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Poetry', 'Literature', 'Culture'],
    views: '2.9k',
    likes: 298
  },
  {
    title: 'Common Mistakes Hindi Learners Make and How to Avoid Them',
    excerpt: 'Learn about the most frequent errors students make when learning Hindi and how to correct them...',
    author: 'Rahul Mehta',
    date: 'Nov 2, 2024',
    readTime: '7 min read',
    category: 'Tips',
    image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Mistakes', 'Tips', 'Learning'],
    views: '5.2k',
    likes: 534
  }
];

const featuredPost = {
  title: 'The Ultimate Guide to Learning Hindi in 2024',
  excerpt: 'Everything you need to know about mastering Hindi language - from basics to advanced fluency. A comprehensive roadmap for your learning journey.',
  author: 'Dr. Priya Sharma',
  date: 'Nov 28, 2024',
  readTime: '15 min read',
  category: 'Featured',
  image: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=1200',
  tags: ['Guide', 'Complete', 'Learning'],
  views: '12.5k',
  likes: 1247
};

const trendingTopics = [
  { name: 'Hindi Grammar', count: 234 },
  { name: 'Pronunciation Tips', count: 189 },
  { name: 'Bollywood', count: 156 },
  { name: 'Business Hindi', count: 142 },
  { name: 'Devanagari Script', count: 128 }
];

const categories = [
  { name: 'Beginner Tips', count: 45, icon: Sparkles, color: 'bg-blue-500' },
  { name: 'Grammar', count: 38, icon: BookOpen, color: 'bg-purple-500' },
  { name: 'Culture', count: 52, icon: Award, color: 'bg-pink-500' },
  { name: 'Speaking', count: 29, icon: MessageCircle, color: 'bg-orange-500' },
  { name: 'Business', count: 24, icon: TrendingUp, color: 'bg-green-500' },
  { name: 'Kids', count: 31, icon: Zap, color: 'bg-yellow-500' }
];

const blogStats = [
  { label: 'Total Articles', value: '500+', icon: BookOpen, color: 'bg-blue-500' },
  { label: 'Monthly Readers', value: '50K+', icon: Eye, color: 'bg-purple-500' },
  { label: 'Expert Writers', value: '15+', icon: Pen, color: 'bg-orange-500' },
  { label: 'Topics Covered', value: '100+', icon: Tag, color: 'bg-green-500' }
];

const recentAuthors = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Language Expert',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    articles: 45
  },
  {
    name: 'Rahul Mehta',
    role: 'Conversation Coach',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    articles: 38
  },
  {
    name: 'Anita Patel',
    role: 'Beginner Specialist',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    articles: 52
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

export default function BlogPage() {

  return (
    <div className="pt-16 overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-orange-400/20 backdrop-blur-xl py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection direction="fade" className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-purple-600 mb-6">
              Hindi Learning Blog
            </h1>
            <p className="text-lg sm:text-xl text-purple-500 max-w-3xl mx-auto mb-8">
              Tips, resources, and insights to help you master Hindi
            </p>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, topics, authors..."
                  className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-white/50 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Blog Stats */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {blogStats.map((stat, index) => (
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

      {/* Featured Post */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Featured Article</h2>
            <p className="text-base sm:text-lg text-gray-600">Our most comprehensive guide yet</p>
          </AnimatedSection>

          <AnimatedSection direction="fade">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all">
              <div className="lg:flex">
                <div className="lg:w-1/2 relative h-64 sm:h-80 lg:h-auto">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {featuredPost.category}
                  </div>
                </div>
                <div className="lg:w-1/2 p-6 sm:p-8 lg:p-12">
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h3>

                  <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredPost.tags.map((tag, idx) => (
                      <span key={idx} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye className="w-5 h-5" />
                      <span className="font-semibold">{featuredPost.views} views</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-semibold">{featuredPost.likes} likes</span>
                    </div>
                  </div>

                  <button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    Read Full Article
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up" className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Browse by Category</h2>
            <p className="text-base sm:text-lg text-gray-600">Find articles tailored to your interests</p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, index) => (
              <AnimatedSection key={index} direction={index % 2 === 0 ? 'left' : 'right'}>
                <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1">
                  <div className={`${cat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 text-center mb-1">{cat.name}</h3>
                  <p className="text-xs text-gray-500 text-center">{cat.count} articles</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Main Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <AnimatedSection direction="up" className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Latest Articles</h2>
            <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filter</span>
            </button>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {blogPosts.map((post, index) => (
            <AnimatedSection key={index} direction={index % 3 === 0 ? 'left' : index % 3 === 1 ? 'up' : 'right'}>
              <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative overflow-hidden h-48">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {post.category}
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all">
                      <Bookmark className="w-4 h-4 text-gray-700" />
                    </button>
                    <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all">
                      <Share2 className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-3 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-orange-500 transition-colors cursor-pointer">
                    {post.title}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{post.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-orange-500 font-semibold hover:gap-3 transition-all text-sm">
                      Read
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection direction="up" className="mt-12 sm:mt-16 text-center">
          <button className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-orange-600 transition-all transform hover:scale-105">
            Load More Articles
          </button>
        </AnimatedSection>
      </div>

      {/* Trending Topics */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Trending Topics */}
            <AnimatedSection direction="left">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Trending Topics</h3>
                </div>
                <div className="space-y-4">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-all cursor-pointer">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">#{topic.name}</span>
                      <span className="text-orange-500 font-bold text-sm sm:text-base">{topic.count} posts</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Featured Authors */}
            <AnimatedSection direction="right">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-lg">
                    <Pen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Authors</h3>
                </div>
                <div className="space-y-4">
                  {recentAuthors.map((author, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all cursor-pointer">
                      <img src={author.image} alt={author.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">{author.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{author.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 text-sm sm:text-base">{author.articles}</p>
                        <p className="text-xs text-gray-500">articles</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection direction="up">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 sm:p-12">
              <div className="text-center max-w-3xl mx-auto">
                <div className="bg-gradient-to-br from-orange-500 to-pink-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Subscribe to Our Newsletter</h2>
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                  Get the latest Hindi learning tips, resources, and articles delivered to your inbox every week.
                </p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-orange-600 transition-colors whitespace-nowrap text-sm sm:text-base"
                  >
                    Subscribe Now
                  </button>
                </form>
                <p className="text-xs sm:text-sm text-gray-500 mt-4">Join 10,000+ subscribers. No spam, unsubscribe anytime.</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Writing Tips CTA */}
      <AnimatedSection direction="fade">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Have a Story to Share?</h2>
            <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8">Join our community of writers and share your Hindi learning experience</p>
            <button className="bg-white text-purple-600 px-8 sm:px-12 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
              Become a Contributor
            </button>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
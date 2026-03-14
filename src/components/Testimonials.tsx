import { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  image: string;
  text: string;
  rating: number;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [averageRating] = useState('4.6');
  const [reviewCount] = useState('50,000+');

  const fetchedTestimonials = [
    {
      name: 's.m. silambarasan',
      role: 'Spoken Hindi Learner',
      image: '',
      text: 'Excellent teaching methodology, making complex concepts easy to understand. Encourages active participation and provides equal opportunities to all students. Well-structured lessons and homeworks over all excellent teaching.',
      rating: 5
    },
    {
      name: 'Student B',
      role: 'Working Professional',
      image: 'https://thumbs.dreamstime.com/b/portrait-young-happy-indian-business-man-executive-looking-camera-portrait-young-happy-indian-business-man-executive-214230764.jpg',
      text: 'Excellent teaching methodology, making complex concepts easy to understand.Encourages active participation and provides equal opportunities to all students.Well-structured lessons and homeworksover all excellent teaching.',
      rating: 5
    },
    {
      name: 'Student C',
      role: 'New Language Speaker',
      image: 'https://elements-resized.envatousercontent.com/elements-video-cover-images/9216be04-05fb-4911-b335-a5f6229cf333/video_preview/video_preview_0000.jpg?w=500&cf_fit=cover&q=85&format=auto&s=beccaa03db3a870f6eaf52fec7683b582a8ba4e783e1c381596603066c283b41',
      text: 'I have been now completed my 4th week class. I can see a difference in my Hindi proficiency. I can say other institutes are giving training on vocabulary at the same time here you can start form sentence. The training is purely on your speaking ability I bet you can definitely manage wherever you go in India.',
      rating: 5
    },
    {
      name: 'Student D',
      role: 'Software Developer',
      image: 'https://t4.ftcdn.net/jpg/05/70/57/47/360_F_570574724_HWfki1q3XZt9WzVlCcQujOV5Jxe8UBG1.jpg',
      text: 'Excellent teaching ,such a good understanding of the language, always encouraging,teaches us all the tenses in a simplified form. Thank you Sir. You have made Hindi language easy to understand and speak.Those who would love to learn spoken Hindi dont wait anymore join immediately.I guarantee.',
      rating: 5
    },
    {
      name: 'Student E',
      role: 'Business Analyst',
      image: 'https://thumbs.dreamstime.com/b/serious-attractive-indian-man-posing-vertical-head-shot-serious-attractive-indian-man-posing-vertical-head-shot-front-312861983.jpg',
      text: 'I highly recommend this course. The structured lessons and practice exercises helped me master the language quickly. The certificate is a great bonus too!',
      rating: 5
    },
    {
      name: 'Student F',
      role: 'Educator',
      image: 'https://img.freepik.com/free-photo/cheerful-indian-businessman-smiling-closeup-portrait-jobs-career-campaign_53876-129417.jpg?semt=ais_hybrid&w=740&q=80',
      text: 'Definitely here you will come out learning Spoken Hindi. I have attended many classes. But here it is entirely different and Mr.Surendars Framework is brilliant.',
      rating: 5
    }
  ];

  useEffect(() => {
    setTestimonials(fetchedTestimonials);
    setLoading(false);

    const timer = setInterval(() => {
      setTestimonials((currentList) => {
        if (currentList.length > 0) {
          setCurrentSlide((prev) => (prev + 1) % currentList.length);
        }
        return currentList;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <section className="py-20 text-center">
        <p className="text-xl text-gray-600">Loading testimonials...</p>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" id="testimonials">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Student Testimonials
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Reviews from students of Raanuva Veeran Spoken Hindi Academy
          </p>
        </div>

        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-xl relative">
                    <Quote className="absolute top-4 right-4 w-12 h-12 text-orange-200" />

                    <div className="flex items-center gap-4 mb-6">
                      {testimonial.image && (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-orange-200"
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-600 text-sm">{testimonial.role}</p>
                      </div>
                    </div>

                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    <p className="text-gray-700 leading-relaxed italic">
                      "{testimonial.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === index
                  ? 'bg-orange-500 w-8'
                  : 'bg-gray-300'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl 
                          transition-all duration-300 transform relative
                          ${index < 3 ? "animate-move-right" : "animate-move-left"}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <Quote className="absolute top-4 right-4 w-12 h-12 text-orange-200" />

              <div className="flex items-center gap-4 mb-6">
                {testimonial.image && (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-orange-200"
                  />
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="font-bold text-gray-900">{averageRating}/5.0</span>
            <span className="text-gray-600">Average Rating</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{reviewCount} Reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
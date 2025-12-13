import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  // 1. Data for our testimonials
  const testimonials = [
    {
      name: "Alex Johnson",
      initials: "AJ",
      quote: "Mindle helped me find the perfect calculus study group. Now I'm actually understanding concepts that seemed impossible before!"
    },
    {
      name: "Maria Perez",
      initials: "MP",
      quote: "As a tutor, I've connected with amazing students. The platform makes scheduling and sharing materials so easy."
    },
    {
      name: "Tom Chen",
      initials: "TM",
      quote: "The gamification features keep me motivated, and I love earning cosmic rewards for my learning progress. It makes studying fun!"
    }
  ];

  return (
    <section className="pb-28 px-4">
      <div className="items-center mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Students Are Saying
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl">
            Join thousands of learners who have elevated their education with Mindle
          </p>
        </div>

        {/* Grid of Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-[#1F2147] rounded-3xl p-8 flex flex-col justify-between hover:-translate-y-2 transition-all duration-300"
            >
              <div>
                {/* 2. The Star Rating Loop */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* The Quote */}
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>

              {/* 3. The User Footer */}
              <div className="flex items-center gap-4">
                {/* Avatar Circle */}
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-lg">
                    {testimonial.initials}
                  </span>
                </div>
                {/* Name */}
                <div className="font-semibold text-white text-lg">
                  {testimonial.name}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
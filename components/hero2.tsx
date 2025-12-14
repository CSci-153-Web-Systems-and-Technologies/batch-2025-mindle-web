import React from 'react';
import { Search, Users, Rocket } from 'lucide-react';

const Hero2 = () => {
  // 1. Data for the three cards
  const features = [
    {
      icon: <Search className="w-12 h-12 text-blue-400" />,
      title: "Choose Subjects",
      description: "Select the subjects you want to learn or can teach others"
    },
    {
      icon: <Users className="w-12 h-12 text-blue-400" />,
      title: "Match with Tutors or Groups",
      description: "Our algorithm connects you with perfect learning partners"
    },
    {
      icon: <Rocket className="w-12 h-12 text-blue-400" />,
      title: "Start Learning",
      description: "Launch your educational journey with personalized sessions"
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-[40px] p-12">
        
        {/* Section Header */}
        <div className="text-left mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How Mindle Works
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl">
            Connect with tutors and study groups across the universe of knowledge. Explore subjects, share expertise, and launch your learning journey into orbit.
          </p>
        </div>

        {/* 3-Column Grid for Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Mapping through data to create cards */}
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-[#1F2147] rounded-3xl p-10 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300"
            >
              {/* Icon Container */}
              <div className="mb-6 p-2">
                {feature.icon}
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Hero2;
"use client";

import React, { useEffect, useState } from 'react';

const Background = () => {
  
  const [stars, setStars] = useState([]);

  
  useEffect(() => {
    const generatedStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 3}s`,
      duration: `${Math.random() * 3 + 2}s`
    }));
    
    
    setStars(generatedStars as any); 
  }, []); 

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#0a0a16]">
      
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Clouds / Nebula */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" 
           style={{ animation: 'float 10s ease-in-out infinite' }}/>
      
      {/* Stars */}
      <div className="absolute inset-0">
        {stars.map((star: any) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: 0.7,
              animation: `twinkle ${star.duration} infinite ease-in-out`,
              animationDelay: star.delay
            }}
          />
        ))}
      </div>

    </div>
  );
};

export default Background;
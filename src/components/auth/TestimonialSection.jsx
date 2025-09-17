import React from 'react';

const TestimonialSection = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-brand-teal text-white p-12 flex-col justify-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold mb-6 leading-tight">
          Streamline Your Canteen Operations with 
          <span className="block">Smart Technology</span>
        </h1>
        
        <div className="mb-8">
          <blockquote className="text-lg mb-6 opacity-90">
            "TechnoMart has completely transformed our canteen management. 
            It's reliable, efficient, and ensures our operations are always running smoothly."
          </blockquote>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-lg">MC</span>
            </div>
            <div>
              <div className="font-semibold">Maria Cruz</div>
              <div className="text-sm opacity-75">Operations Manager at TechCorp</div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-4 opacity-75">JOIN 1K+ TEAMS</p>
          <div className="grid grid-cols-2 gap-4 opacity-60">
            <div className="text-xs font-medium">📱 TechCorp</div>
            <div className="text-xs font-medium">🏢 InnovateLab</div>
            <div className="text-xs font-medium">⚡ StartupHub</div>
            <div className="text-xs font-medium">🚀 FutureWorks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
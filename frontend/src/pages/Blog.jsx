import React, { useRef } from 'react';
import { 
  ArrowRight, BookOpen, ChevronLeft, ChevronRight, 
  Zap, Brain, Target, Code, Terminal, Layers 
} from 'lucide-react';

const BlogSection = ({ darkMode }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 380;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const blogData = [
    {
      category: "Mental Models",
      readTime: "5 min",
      heading: "Building Problem-Solving Intuition",
      content: "Stop memorizing code. Start recognizing patterns. How top-tier coders visualize recursion and graph theory.",
      gradient: "from-violet-600 to-indigo-900",
      accent: "text-violet-400",
      icon: Brain
    },
    {
      category: "Strategy",
      readTime: "4 min",
      heading: "The Art of the 'Partial Submit'",
      content: "Why getting 30 points now is better than 100 points never. Managing time and risk in high-stakes contests.",
      gradient: "from-blue-600 to-slate-900",
      accent: "text-blue-400",
      icon: Target
    },
    {
      category: "Performance",
      readTime: "6 min",
      heading: "Consistency > Intensity",
      content: "Burnout kills ratings. Discover the '2-Problem Rule' that helps Grandmasters maintain their streak for years.",
      gradient: "from-emerald-600 to-teal-900",
      accent: "text-emerald-400",
      icon: Zap
    },
    {
      category: "Technique",
      readTime: "7 min",
      heading: "Mastering Dynamic Programming",
      content: "Breaking down DP into states and transitions. A visual guide to solving the hardest problems on LeetCode.",
      gradient: "from-rose-600 to-red-900",
      accent: "text-rose-400",
      icon: Layers
    },
    {
        category: "Debugging",
        readTime: "5 min",
        heading: "Debug Like a Detective",
        content: "Don't guess. Binary search your logic. How to find the bug in your code in under 3 minutes.",
        gradient: "from-amber-600 to-orange-900",
        accent: "text-amber-400",
        icon: Terminal
      },
  ];

  // Colors logic
  // If Dark Mode: Extremely dark cards (Gray 950) with light text
  // If Light Mode: White cards with dark text
  const sectionBg = darkMode ? '' : ''; 
  const cardBg = darkMode ? 'bg-[#0B0F19] border-[#1F2937]' : 'bg-white border-gray-100';
  const textTitle = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textBody = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <section className={`relative py-10 ${sectionBg}`}>
      
      {/* --- Section Header --- */}
      <div className="flex justify-between items-end mb-8 px-2">
        <div>
          <h3 className={`text-2xl font-bold flex items-center gap-2 ${textTitle}`}>
            <BookOpen className="text-indigo-500" size={24} />
            Expert Insights
          </h3>
          <p className={`mt-2 text-sm ${textBody}`}>Tactics and mental models for the modern programmer.</p>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex gap-3">
          <button 
            onClick={() => scroll('left')}
            className={`p-3 rounded-full border transition-all ${darkMode ? 'border-gray-800 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-600' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'}`}
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className={`p-3 rounded-full border transition-all ${darkMode ? 'border-gray-800 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-600' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* --- Horizontal Scroll Area --- */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-10 snap-x snap-mandatory scrollbar-hide px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {blogData.map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={index} 
              className={`
                snap-center shrink-0 w-[320px] md:w-[360px] 
                ${cardBg} border rounded-2xl overflow-hidden 
                transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 group
                flex flex-col relative
              `}
            >
              {/* 1. VISUAL COVER (The "Darker" Top Half) */}
              <div className={`h-32 w-full bg-gradient-to-br ${item.gradient} relative overflow-hidden`}>
                {/* Abstract Noise/Texture Overlay (Optional CSS trick) */}
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Large Background Icon */}
                <Icon 
                  size={140} 
                  className="absolute -right-6 -bottom-6 text-white opacity-10 transform rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ease-out" 
                />
                
                {/* Floating Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white bg-black/30 backdrop-blur-sm rounded-full border border-white/10">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* 2. CARD BODY */}
              <div className="p-6 flex-grow flex flex-col relative">
                {/* Read Time */}
                <div className={`flex items-center gap-2 text-xs font-medium mb-3 ${item.accent}`}>
                  <Zap size={12} />
                  <span>{item.readTime} read</span>
                </div>

                {/* Heading */}
                <h2 className={`text-xl font-bold mb-3 leading-tight group-hover:text-indigo-400 transition-colors ${textTitle}`}>
                  {item.heading}
                </h2>

                {/* Content */}
                <p className={`text-sm leading-relaxed mb-8 line-clamp-3 ${textBody}`}>
                  {item.content}
                </p>

                {/* Bottom Action Area */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-[10px] font-bold`}>
                        SG
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>SkillGraph Team</span>
                   </div>

                   <button className={`text-sm font-semibold flex items-center gap-1 transition-all ${item.accent} opacity-80 group-hover:opacity-100 group-hover:translate-x-1`}>
                     Read <ArrowRight size={14} />
                   </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BlogSection;
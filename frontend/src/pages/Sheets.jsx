import React, { useState } from 'react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import Footer from './Footer';

// Data extracted from your input
const SHEET_DATA = [
  {
    id: 'striver-a2z',
    title: "Strivers A2Z DSA Sheet",
    author: "Striver",
    questions: 455,
    followers: 21805,
    description: "This course is made for people who want to learn DSA from A to Z for free in a structured manner.",
    tags: ["Complete DSA", "Beginner Friendly"],
    link:"https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/"
  },
  {
    id: 'striver-sde',
    title: "Striver SDE Sheet",
    author: "Striver",
    questions: 191,
    followers: 9912,
    description: "Striver SDE Sheet contains very handily crafted and picked top coding interview questions.",
    tags: ["Popular", "Interview Prep"],
    link: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/"
  },
  {
    id: 'love-babbar',
    title: "Love Babbar Sheet",
    author: "Love Babbar",
    questions: 430,
    followers: 5429,
    description: "The DSA sheet by Love Babbar is designed to cover almost every concept in Data Structures.",
    tags: ["Complete DSA", "Popular"],
    link: "https://www.geeksforgeeks.org/dsa-sheet-by-love-babbar/ "
  },
  {
    id: 'neetcode-150',
    title: "Neetcode 150",
    author: "Navdeep Singh",
    questions: 150,
    followers: 3526,
    description: "The Neetcode 150 sheet, curated by Navdeep Singh, is a popular and beginner-friendly list.",
    tags: ["Popular", "Blind 75 Extension"],
    link: "https://neetcode.io/practice/practice/neetcode150 "
  },
  {
    id: 'top-150-leetcode',
    title: "Top Interview 150: Leetcode",
    author: "LeetCode",
    questions: 150,
    followers: 3437,
    description: "The Top 150 sheet, curated by LeetCode, features the most frequently asked interview questions.",
    tags: ["Popular", "Interview Prep"],
    link: "https://leetcode.com/studyplan/top-interview-150/ "
  },
  {
    id: 'blind-75',
    title: "Blind 75",
    author: "Blind",
    questions: 75,
    followers: 2801,
    description: "The Blind 75 sheet includes a curated list of 75 frequently asked LeetCode questions.",
    tags: ["Popular", "Classics"],
    link: "https://neetcode.io/practice/practice/blind75 "
  },
  {
    id: 'shradha-aman',
    title: "DSA by Shradha Didi & Aman Bhaiya",
    author: "Apna College",
    questions: 403,
    followers: 1586,
    description: "Curated by Sharaadha di and Aman Bhaiya, this sheet includes 375+ classical DSA questions.",
    tags: ["Complete DSA"],
    link: "https://www.scribd.com/document/596620823/DSA-by-Shradha-Didi-Aman-Bhaiya "
  },
  {
    id: 'code-army',
    title: "Code Army Sheet",
    author: "Rohit Negi",
    questions: 726,
    followers: 1223,
    description: "This sheet, designed by Rohit Negi (who secured a 2Cr+ package from Uber), is tailored for mastery.",
    tags: ["Advanced", "Complete DSA"],
    link: "https://codolio.com/question-tracker/sheet/code-army-sheet "
  },
  {
    id: 'fraz-dsa',
    title: "Fraz DSA Sheet",
    author: "Fraz Bhaiya",
    questions: 279,
    followers: 927,
    description: "The Fraz Bhaiya sheet, created by Fraz Bhaiya, is a well-organized collection of patterns.",
    tags: ["Patterns", "Medium"],
    link: "https://docs.google.com/spreadsheets/d/1Pud-vdSPhhljScynHvTUGRE5yxEV6dCMb45rOwoSt_Q"
  },
  {
    id: 'arsh-dsa',
    title: "Arsh DSA Sheet",
    author: "Arsh Goyal",
    questions: 280,
    followers: 598,
    description: "The Arsh DSA sheet, designed by Arsh Goyal, features over 280 DSA questions for placement.",
    tags: ["Placement", "Challenge"],
    link: "https://docs.google.com/spreadsheets/d/1MGVBJ8HkRbCnU6EQASjJKCqQE8BWng4qgL0n3vCVOxE/htmlview"
  }
];

const SheetCard = ({ sheet, darkMode }) => {
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-600';
  const textMain = darkMode ? 'text-gray-100' : 'text-gray-900';
  
  return (
    <div className={`${cardBg} border rounded-xl p-5 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-full`}>
      
      {/* Header Section */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-lg font-bold ${textMain} leading-tight`}>
            {sheet.title}
          </h3>
          <span className={`${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'} text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap`}>
          </span>
        </div>
        

        {/* Description */}
        <p className={`${textMuted} text-sm mb-4 line-clamp-3`}>
          {sheet.description}
        </p>
      </div>

      {/* Footer Section */}
      <div>
        {/* Progress Bar (Static 0% for now) */}
        <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5 mb-4`}>
          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '0%' }}></div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
             <span className={`${darkMode ? 'text-gray-300 border-gray-600 bg-gray-700' : 'text-gray-700 border-gray-300 bg-gray-50'} text-sm font-semibold border px-2 py-1 rounded-md`}>
               {sheet.questions} Qs
             </span>
          </div>
          
          <a 
            href={sheet.link} 
            className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} text-sm font-medium hover:underline flex items-center`}
          >
            Start Solving
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default function CodingSheetsPage({ setPage }) {
  const [activeTab, setActiveTab] = useState('All');
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or default to false
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Save dark mode preference to localStorage
  React.useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const bgMain = darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-600';

  // Simple filtering logic if you want to expand tabs later
  const filteredSheets = activeTab === 'All' 
    ? SHEET_DATA 
    : SHEET_DATA.filter(sheet => sheet.tags.includes(activeTab));

  return (
    <div className={`min-h-screen ${bgMain} font-sans transition-colors duration-200 flex flex-col`}>
      {/* Navigation Header */}
      {setPage && (
        <header className={`${cardBg} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-50`}>
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setPage('dashboard')}
                  className={`flex items-center gap-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                >
                  <span className="text-2xl font-bold text-blue-600">
                    Skill<span className={darkMode ? 'text-gray-200' : 'text-slate-800'}>Graph</span>
                  </span>
                </button>
                <div className="hidden md:flex md:space-x-4 items-center">
                  <button 
                    onClick={() => setPage('dashboard')} 
                    className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} px-3 py-2 text-sm font-medium transition-colors`}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => setPage('sheets')} 
                    className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium"
                  >
                    Explore Sheets
                  </button>
                  <button 
                    onClick={() => setPage('contests')} 
                    className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} px-3 py-2 text-sm font-medium transition-colors`}
                  >
                    Contests
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setDarkMode(!darkMode)} 
                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-700" />}
                </button>
              </div>
            </div>
          </nav>
        </header>
      )}

      <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className={`text-3xl sm:text-4xl font-extrabold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            Track Coding Sheets in One Place
          </h1>
          <p className={`text-lg ${textMuted}`}>
            Choose from 30+ structured coding paths to ace your interviews
          </p>
        </div>

        {/* Tab Navigation (Optional) */}
        <div className="flex justify-center space-x-4 mb-8">
          {['All', 'Popular', 'Complete DSA'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : `${cardBg} ${textMuted} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`
              }`}
            >
              {tab === 'All' ? 'All Sheets' : tab}
            </button>
          ))}
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSheets.map((sheet) => (
            <SheetCard key={sheet.id} sheet={sheet} darkMode={darkMode} />
          ))}
        </div>

        {/* Empty State Handler */}
        {filteredSheets.length === 0 && (
          <div className="text-center py-20">
            <p className={textMuted}>No sheets found for this category.</p>
          </div>
        )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
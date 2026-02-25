import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Code, FileText, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import AddQuestion from '../components/dashboard/contest/AddQuestion';
import CodingQuestions from '../components/dashboard/contest/CodingQuestions';
import QuestionPanel from '../components/dashboard/contest/QuestionPanel';
import QuestionViewer from '../components/dashboard/contest/QuestionViewer';
import API_CONFIG from '../api/apiconfig';

export default function EditContest({ darkMode }) {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    const [activeSection, setActiveSection] = useState('mcq'); // 'mcq' or 'coding'
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchContestDetails();
    }, [contestId]);

    const fetchContestDetails = async () => {
        try {
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/contest/${contestId}`,
                { headers: { token } }
            );
            setContest(response.data.contest);
            setQuestions(response.data.questions || []);
        } catch (error) {
            console.error('Failed to fetch contest details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionSelect = (questionId, index) => {
        if (questionId === 'add') {
            setShowAddQuestion(true);
            setSelectedQuestionId(null);
        } else {
            setSelectedQuestionId(questionId);
            setShowAddQuestion(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className={`rounded-xl p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/contest')}
                                className={`p-2 rounded-lg ${
                                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                                } hover:shadow-md transition-shadow`}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Edit: {contest?.title}
                                </h1>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Contest ID: {contestId}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(`/contest/live/${contestId}`)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Preview
                            </button>
                            <button
                                onClick={() => navigate('/contest')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Finish Setup
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section Tabs */}
                <div className={`rounded-xl mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveSection('mcq')}
                            className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
                                activeSection === 'mcq'
                                    ? darkMode 
                                        ? 'text-blue-400 border-b-2 border-blue-400' 
                                        : 'text-blue-600 border-b-2 border-blue-600'
                                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                        >
                            <FileText size={18} />
                            MCQ Questions
                        </button>
                        <button
                            onClick={() => setActiveSection('coding')}
                            className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
                                activeSection === 'coding'
                                    ? darkMode 
                                        ? 'text-blue-400 border-b-2 border-blue-400' 
                                        : 'text-blue-600 border-b-2 border-blue-600'
                                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                        >
                            <Code size={18} />
                            Coding Problems
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    {activeSection === 'mcq' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
                            <div className="lg:col-span-1">
                                <QuestionPanel
                                    questions={questions.map(q => q._id)}
                                    onSelect={handleQuestionSelect}
                                    selectedIndex={questions.findIndex(q => q._id === selectedQuestionId)}
                                    testId={contestId}
                                />
                            </div>
                            <div className="lg:col-span-3">
                                {showAddQuestion ? (
                                    <AddQuestion
                                        testId={contestId}
                                        onCancel={() => setShowAddQuestion(false)}
                                        setAllQuestions={setQuestions}
                                    />
                                ) : selectedQuestionId ? (
                                    <QuestionViewer
                                        questionId={selectedQuestionId}
                                        testId={contestId}
                                    />
                                ) : (
                                    <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Select a question to view or click "Add Question" to create a new one
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <CodingQuestions testId={contestId} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
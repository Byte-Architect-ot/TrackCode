import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, FileText, Code, Save, ArrowLeft } from 'lucide-react';
import API_CONFIG from '../api/apiconfig';

export default function CreateContest({ darkMode }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [contestData, setContestData] = useState({
        title: '',
        description: '',
        startTime: '',
        duration: 60,
        isPublic: true,
        allowLateSubmission: false,
        shuffleQuestions: false
    });
    
    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_CONTEST}`,
                contestData,
                { headers: { token } }
            );
            
            // Navigate to edit page to add questions
            navigate(`/contest/edit/${response.data.contest._id}`);
        } catch (error) {
            alert('Failed to create contest');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setContestData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/contest')}
                        className={`p-2 rounded-lg ${
                            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                        } shadow hover:shadow-md transition-shadow`}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Create New Contest
                    </h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={`rounded-xl p-6 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}>
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Contest Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={contestData.title}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300'
                                }`}
                                placeholder="Enter contest title"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={contestData.description}
                                onChange={handleChange}
                                rows="4"
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300'
                                }`}
                                placeholder="Enter contest description"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Start Time */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <Calendar size={16} className="inline mr-2" />
                                    Start Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={contestData.startTime}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        darkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300'
                                    }`}
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <Clock size={16} className="inline mr-2" />
                                    Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={contestData.duration}
                                    onChange={handleChange}
                                    min="10"
                                    max="300"
                                    required
                                    className={`w-full px-4 py-2 rounded-lg border ${
                                        darkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="space-y-3">
                            <label className={`block text-sm font-medium mb-2 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Settings
                            </label>
                            
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={contestData.isPublic}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                        Make contest public
                                    </span>
                                </label>
                                
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="allowLateSubmission"
                                        checked={contestData.allowLateSubmission}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                        Allow late submissions
                                    </span>
                                </label>
                                
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="shuffleQuestions"
                                        checked={contestData.shuffleQuestions}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                        Shuffle questions for each participant
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/contest')}
                                className={`px-6 py-2 rounded-lg ${
                                    darkMode 
                                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                } transition-colors`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Create & Add Questions
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
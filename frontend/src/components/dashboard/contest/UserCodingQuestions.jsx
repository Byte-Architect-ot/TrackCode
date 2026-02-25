import React, { useEffect, useState } from "react";
import axios from "axios";
import UserMarkdown from "./UserMarkdown";
import CodeEditor from "./CodeEditor";
import Split from 'react-split';
import { useParams, useNavigate } from "react-router-dom";

import config from "../../../api/apiconfig";
const API2 = config.JudgeBackend_url;

const UserCodingQuestions = () => {
    const { testId } = useParams();
    const navigate = useNavigate();

    const [codingQuestions, setCodingQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    const token = localStorage.getItem("usertoken") || localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchQuestions = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.post(
                    `${API2}/user/test-problems`,
                    { testId },
                    { headers: { token } }
                );
                if (res.status === 200) {
                    setCodingQuestions(res.data.problems || []);
                    
                    // Auto-select first question if available
                    if (res.data.problems?.length > 0 && !selectedQuestionId) {
                        setSelectedQuestionId(res.data.problems[0]._id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch coding questions:", err);
                setError(err.response?.data?.msg || "Failed to load questions");
            } finally {
                setLoading(false);
            }
        };

        if (testId) fetchQuestions();
    }, [testId, token, navigate]);

    // Question difficulty badge
    const getDifficultyBadge = (difficulty) => {
        const colors = {
            easy: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            hard: 'bg-red-100 text-red-800'
        };
        return colors[difficulty] || colors.medium;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-gray-600">Loading questions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-semibold">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-50">
            {selectedQuestionId === null ? (
                codingQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xl font-semibold">No coding questions available</p>
                        <p className="text-sm mt-2">Please check back later</p>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Coding Problems
                            </h2>
                            <p className="text-gray-600">
                                Select a problem to start coding ({codingQuestions.length} {codingQuestions.length === 1 ? 'problem' : 'problems'} available)
                            </p>
                        </div>

                        {/* Questions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {codingQuestions.map((q, index) => (
                                <div
                                    key={q._id}
                                    className="bg-white p-5 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group"
                                    onClick={() => setSelectedQuestionId(q._id)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 group-hover:bg-indigo-600 text-indigo-800 group-hover:text-white text-sm font-bold mr-3 transition-colors">
                                                {index + 1}
                                            </div>
                                            <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                {q.title || "Untitled Question"}
                                            </h3>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>

                                    {/* Difficulty Badge */}
                                    {q.difficulty && (
                                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyBadge(q.difficulty)}`}>
                                            {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                                        </span>
                                    )}

                                    {/* Points */}
                                    {q.mark && (
                                        <div className="mt-3 text-sm text-gray-600">
                                            <span className="font-medium">Points:</span> {q.mark}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ) : (
                <div className="w-full">
                    {/* Mobile view - stacked */}
                    <div className="block md:hidden space-y-4 p-4">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800">Problem Statement</h3>
                                <button
                                    onClick={() => setSelectedQuestionId(null)}
                                    className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-800 transition-colors"
                                >
                                    ← Back to List
                                </button>
                            </div>
                            <UserMarkdown problemId={selectedQuestionId} />
                        </div>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b bg-gray-50">
                                <h3 className="font-semibold text-gray-800">Code Editor</h3>
                            </div>
                            <CodeEditor problemId={selectedQuestionId} />
                        </div>
                    </div>

                    {/* Desktop view - split */}
                    <div className="hidden md:block h-screen">
                        <div className="p-4 bg-white border-b shadow-sm flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                Problem: {codingQuestions.find(q => q._id === selectedQuestionId)?.title}
                            </h2>
                            <button
                                onClick={() => setSelectedQuestionId(null)}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                Back to Problems
                            </button>
                        </div>
                        <Split
                            className="flex w-full"
                            sizes={[45, 55]}
                            minSize={[300, 400]}
                            gutterSize={8}
                            gutterAlign="center"
                            direction="horizontal"
                            cursor="col-resize"
                            style={{ height: 'calc(100vh - 80px)' }}
                            gutter={(index, direction) => {
                                const gutter = document.createElement('div');
                                gutter.className = `gutter gutter-${direction} bg-gray-300 hover:bg-indigo-400 transition-colors duration-200`;
                                return gutter;
                            }}
                        >
                            <div className="overflow-auto bg-white">
                                <UserMarkdown problemId={selectedQuestionId} />
                            </div>
                            <div className="overflow-auto bg-gray-50">
                                <CodeEditor problemId={selectedQuestionId} />
                            </div>
                        </Split>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserCodingQuestions;
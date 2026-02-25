// src/pages/Practice.jsx - Complete Contest Platform

import React, { useState, useCallback, useEffect, useContext, createContext } from 'react';
import {
    Plus, Trash2, Save, Play, ChevronDown, ChevronUp,
    FileText, Code, Clock, HardDrive, Tag, CheckCircle,
    XCircle, Eye, EyeOff, Copy, Download, Upload,
    Settings, List, Edit2, X, AlertCircle,
    Trophy, Users, Calendar, Zap, Terminal,
    GripVertical, ChevronLeft, ChevronRight, Loader,
    BookOpen, TestTube, Sparkles, LayoutGrid, LogIn,
    Award, BarChart3, Timer, RefreshCw, Lock, Unlock,
    ClipboardList, UserCheck, PlayCircle, StopCircle
} from 'lucide-react';

import { contestApi, problemApi, questionApi, testSessionApi, resultApi } from '../api/contestAPIs.js';

//  CONSTANTS 
const DIFFICULTY_OPTIONS = [
    { value: 'easy', label: 'Easy', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'hard', label: 'Hard', color: 'red' },
    { value: 'expert', label: 'Expert', color: 'purple' }
];

const LANGUAGE_OPTIONS = [
    { value: 'cpp', label: 'C++', ext: 'cpp', judgeId: 54 },
    { value: 'python', label: 'Python', ext: 'py', judgeId: 71 },
    { value: 'java', label: 'Java', ext: 'java', judgeId: 62 },
    { value: 'javascript', label: 'JavaScript', ext: 'js', judgeId: 63 },
    { value: 'c', label: 'C', ext: 'c', judgeId: 50 }
];

const TAG_OPTIONS = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
    'Sorting', 'Greedy', 'Binary Search', 'Tree', 'Graph',
    'DFS', 'BFS', 'Two Pointers', 'Stack', 'Queue',
    'Heap', 'Recursion', 'Backtracking', 'Bit Manipulation', 'Simulation'
];

const QUESTION_TYPES = [
    { value: 'single', label: 'Single Choice' },
    { value: 'multiple', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' }
];

//  AUTH CONTEXT (simplified) 
const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isEducator, setIsEducator] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const adminToken = localStorage.getItem('adminToken');
        const userData = localStorage.getItem('user');
        
        if (userData) {
            setUser(JSON.parse(userData));
        }
        setIsEducator(!!adminToken);
    }, []);

    return { user, isEducator };
};

//  HELPER COMPONENTS 

// Toast notification
const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-yellow-600'
    };

    return (
        <div className={`fixed bottom-4 right-4 ${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2`}>
            {type === 'success' && <CheckCircle size={18} />}
            {type === 'error' && <XCircle size={18} />}
            {type === 'info' && <AlertCircle size={18} />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-80">
                <X size={16} />
            </button>
        </div>
    );
};

// Tab Button
const TabButton = ({ active, onClick, icon: Icon, label, count, darkMode }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : darkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
    >
        <Icon size={18} />
        <span>{label}</span>
        {count !== undefined && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                active ? 'bg-white/20' : darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
                {count}
            </span>
        )}
    </button>
);

// Input Field
const InputField = ({ label, value, onChange, placeholder, type = 'text', darkMode, required, helper, error, disabled }) => (
    <div className="space-y-1">
        {label && (
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                error
                    ? 'border-red-500 focus:border-red-500'
                    : darkMode
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900 placeholder-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {helper && !error && <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{helper}</p>}
    </div>
);

// Textarea Field
const TextareaField = ({ label, value, onChange, placeholder, rows = 4, darkMode, required, helper, monospace, error }) => (
    <div className="space-y-1">
        {label && (
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
                monospace ? 'font-mono text-sm' : ''
            } ${
                error
                    ? 'border-red-500'
                    : darkMode
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {helper && !error && <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{helper}</p>}
    </div>
);

// Select Field
const SelectField = ({ label, value, onChange, options, darkMode, required }) => (
    <div className="space-y-1">
        {label && (
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                darkMode
                    ? 'bg-gray-800 border-gray-700 focus:border-blue-500 text-white'
                    : 'bg-white border-gray-300 focus:border-blue-500 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

// Tag Selector
const TagSelector = ({ selected, onChange, darkMode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleTag = (tag) => {
        if (selected.includes(tag)) {
            onChange(selected.filter(t => t !== tag));
        } else {
            onChange([...selected, tag]);
        }
    };

    return (
        <div className="space-y-1 relative">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tags
            </label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`min-h-[42px] px-3 py-2 rounded-lg border cursor-pointer ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
            >
                {selected.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {selected.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                            >
                                {tag}
                                <X
                                    size={12}
                                    className="cursor-pointer hover:text-blue-300"
                                    onClick={(e) => { e.stopPropagation(); toggleTag(tag); }}
                                />
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Select tags...</span>
                )}
            </div>
            {isOpen && (
                <div className={`absolute z-10 w-full mt-1 p-2 rounded-lg border max-h-48 overflow-y-auto ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}>
                    <div className="flex flex-wrap gap-1">
                        {TAG_OPTIONS.map(tag => (
                            <button
                                key={tag}
                                onClick={(e) => { e.stopPropagation(); toggleTag(tag); }}
                                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                    selected.includes(tag)
                                        ? 'bg-blue-600 text-white'
                                        : darkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Difficulty Badge
const DifficultyBadge = ({ difficulty }) => {
    const config = DIFFICULTY_OPTIONS.find(d => d.value === difficulty) || DIFFICULTY_OPTIONS[0];
    const colorClasses = {
        green: 'bg-green-500/20 text-green-400 border-green-500/30',
        yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        red: 'bg-red-500/20 text-red-400 border-red-500/30',
        purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses[config.color]}`}>
            {config.label}
        </span>
    );
};

// Status Badge
const StatusBadge = ({ status }) => {
    const configs = {
        upcoming: { label: 'Upcoming', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        running: { label: 'Live', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
        completed: { label: 'Ended', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
        registered: { label: 'Registered', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
        started: { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        submitted: { label: 'Submitted', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    };
    const config = configs[status] || configs.upcoming;
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
            {config.label}
        </span>
    );
};

// Loading Spinner
const LoadingSpinner = ({ size = 'md', darkMode }) => {
    const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
    return (
        <div className={`${sizes[size]} animate-spin rounded-full border-2 border-t-transparent ${
            darkMode ? 'border-blue-400' : 'border-blue-600'
        }`} />
    );
};

// Empty State
const EmptyState = ({ icon: Icon, title, description, action, darkMode }) => (
    <div className={`text-center py-12 px-4 rounded-xl border-2 border-dashed ${
        darkMode ? 'border-gray-700' : 'border-gray-300'
    }`}>
        <Icon className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
        <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {title}
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {description}
        </p>
        {action}
    </div>
);

//  MCQ EDITOR COMPONENT 
const MCQEditor = ({ questions, testId, onUpdate, darkMode }) => {
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        questionText: '',
        questionType: 'single',
        options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ],
        marks: 1,
        negativeMarks: 0,
        explanation: '',
        difficulty: 'medium'
    });

    const resetForm = () => {
        setFormData({
            questionText: '',
            questionType: 'single',
            options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ],
            marks: 1,
            negativeMarks: 0,
            explanation: '',
            difficulty: 'medium'
        });
        setEditingQuestion(null);
        setIsCreating(false);
    };

    const handleEdit = (question) => {
        setFormData({
            questionText: question.questionText,
            questionType: question.questionType,
            options: question.options.map(opt => ({
                _id: opt._id,
                text: opt.text,
                isCorrect: question.questionType === 'multiple'
                    ? question.correctAnswers?.includes(opt._id)
                    : opt._id?.toString() === question.correctAnswer?.toString()
            })),
            marks: question.marks,
            negativeMarks: question.negativeMarks || 0,
            explanation: question.explanation || '',
            difficulty: question.difficulty || 'medium'
        });
        setEditingQuestion(question);
        setIsCreating(true);
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...formData.options];
        
        if (field === 'isCorrect' && formData.questionType === 'single') {
            // For single choice, only one can be correct
            newOptions.forEach((opt, i) => {
                opt.isCorrect = i === index ? value : false;
            });
        } else {
            newOptions[index] = { ...newOptions[index], [field]: value };
        }
        
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        if (formData.options.length < 6) {
            setFormData(prev => ({
                ...prev,
                options: [...prev.options, { text: '', isCorrect: false }]
            }));
        }
    };

    const removeOption = (index) => {
        if (formData.options.length > 2) {
            setFormData(prev => ({
                ...prev,
                options: prev.options.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSave = async () => {
        // Validate
        if (!formData.questionText.trim()) {
            alert('Question text is required');
            return;
        }

        const validOptions = formData.options.filter(opt => opt.text.trim());
        if (validOptions.length < 2) {
            alert('At least 2 options are required');
            return;
        }

        const correctOption = formData.options.find(opt => opt.isCorrect && opt.text.trim());
        if (!correctOption) {
            alert('Please mark at least one correct answer');
            return;
        }

        if (!testId) {
            alert('Please save contest settings first');
            return;
        }

        setLoading(true);
        try {
            // Format options correctly for backend
            const formattedOptions = formData.options
                .filter(opt => opt.text.trim())
                .map(opt => ({ text: opt.text.trim() }));

            const payload = {
                testId: testId.toString(),
                questionText: formData.questionText.trim(),
                options: formattedOptions,
                correctAnswerText: correctOption.text.trim(),
                marks: formData.marks || 1
            };

            console.log('Creating question with payload:', payload);

            if (editingQuestion) {
                await questionApi.update(editingQuestion._id, payload);
            } else {
                const result = await questionApi.create(payload);
                console.log('Question created successfully:', result);
            }

            onUpdate(); // Refresh questions list
            resetForm();
        } catch (error) {
            console.error('Error creating question:', error);
            alert(error.message || 'Failed to save question');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (questionId) => {
        if (!confirm('Are you sure you want to delete this question?')) return;

        setLoading(true);
        try {
            await questionApi.delete(questionId);
            onUpdate();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (isCreating) {
        return (
            <div className={`rounded-xl border p-6 space-y-6 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {editingQuestion ? 'Edit Question' : 'Add New Question'}
                    </h3>
                    <button
                        onClick={resetForm}
                        className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <X size={20} />
                    </button>
                </div>

                <TextareaField
                    label="Question Text"
                    value={formData.questionText}
                    onChange={v => setFormData(prev => ({ ...prev, questionText: v }))}
                    placeholder="Enter your question here..."
                    rows={3}
                    darkMode={darkMode}
                    required
                />

                <div className="grid grid-cols-3 gap-4">
                    <SelectField
                        label="Question Type"
                        value={formData.questionType}
                        onChange={v => setFormData(prev => ({ ...prev, questionType: v }))}
                        options={QUESTION_TYPES}
                        darkMode={darkMode}
                    />
                    <InputField
                        label="Marks"
                        type="number"
                        value={formData.marks}
                        onChange={v => setFormData(prev => ({ ...prev, marks: parseInt(v) || 1 }))}
                        darkMode={darkMode}
                    />
                    <InputField
                        label="Negative Marks"
                        type="number"
                        value={formData.negativeMarks}
                        onChange={v => setFormData(prev => ({ ...prev, negativeMarks: parseFloat(v) || 0 }))}
                        darkMode={darkMode}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Options <span className="text-red-500">*</span>
                        </label>
                        {formData.options.length < 6 && (
                            <button
                                onClick={addOption}
                                className="text-sm text-blue-500 hover:text-blue-400"
                            >
                                + Add Option
                            </button>
                        )}
                    </div>

                    {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="flex items-center">
                                <input
                                    type={formData.questionType === 'multiple' ? 'checkbox' : 'radio'}
                                    name="correctAnswer"
                                    checked={option.isCorrect}
                                    onChange={e => updateOption(index, 'isCorrect', e.target.checked)}
                                    className="w-4 h-4"
                                />
                            </div>
                            <input
                                type="text"
                                value={option.text}
                                onChange={e => updateOption(index, 'text', e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className={`flex-1 px-3 py-2 rounded-lg border ${
                                    option.isCorrect ? 'border-green-500' : ''
                                } ${
                                    darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            />
                            {formData.options.length > 2 && (
                                <button
                                    onClick={() => removeOption(index)}
                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formData.questionType === 'multiple'
                            ? 'Check all correct answers'
                            : 'Select the correct answer'}
                    </p>
                </div>

                <TextareaField
                    label="Explanation (Optional)"
                    value={formData.explanation}
                    onChange={v => setFormData(prev => ({ ...prev, explanation: v }))}
                    placeholder="Explain the correct answer..."
                    rows={2}
                    darkMode={darkMode}
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={resetForm}
                        className={`px-4 py-2 rounded-lg ${
                            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : <Save size={16} />}
                        {editingQuestion ? 'Update' : 'Add'} Question
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    MCQ Questions ({questions.length})
                </h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                    <Plus size={14} /> Add Question
                </button>
            </div>

            {questions.length === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title="No Questions Yet"
                    description="Add MCQ questions to your test"
                    action={
                        <button
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus size={16} /> Add First Question
                        </button>
                    }
                    darkMode={darkMode}
                />
            ) : (
                <div className="space-y-3">
                    {questions.map((question, index) => (
                        <div
                            key={question._id}
                            className={`rounded-lg border p-4 ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Q{index + 1}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                        }`}>
                                            {question.marks} marks
                                        </span>
                                        {question.negativeMarks > 0 && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                                                -{question.negativeMarks}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {question.questionText}
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        {question.options.map((opt, optIndex) => (
                                            <div
                                                key={opt._id || optIndex}
                                                className={`flex items-center gap-2 text-sm ${
                                                    opt._id?.toString() === question.correctAnswer?.toString()
                                                        ? 'text-green-400'
                                                        : darkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}
                                            >
                                                {opt._id?.toString() === question.correctAnswer?.toString() && (
                                                    <CheckCircle size={14} />
                                                )}
                                                <span>{String.fromCharCode(65 + optIndex)}. {opt.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleEdit(question)}
                                        className={`p-2 rounded-lg ${
                                            darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(question._id)}
                                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

//  TEST CASE EDITOR 
const TestCaseEditor = ({ testCases, onChange, darkMode }) => {
    const addTestCase = () => {
        onChange([...testCases, {
            id: Date.now(),
            input: '',
            expectedOutput: '',
            isHidden: false,
            isSample: true,
            explanation: '',
            weight: 1
        }]);
    };

    const updateTestCase = (id, field, value) => {
        onChange(testCases.map(tc => {
            if (tc.id === id) {
                const updated = { ...tc, [field]: value };
                // If marking as hidden, it's not a sample
                if (field === 'isHidden' && value) {
                    updated.isSample = false;
                }
                // If marking as sample, it's not hidden
                if (field === 'isSample' && value) {
                    updated.isHidden = false;
                }
                return updated;
            }
            return tc;
        }));
    };

    const removeTestCase = (id) => {
        onChange(testCases.filter(tc => tc.id !== id));
    };

    const sampleCount = testCases.filter(tc => tc.isSample || !tc.isHidden).length;
    const hiddenCount = testCases.filter(tc => tc.isHidden).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Test Cases ({testCases.length})
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {sampleCount} sample, {hiddenCount} hidden
                    </p>
                </div>
                <button
                    onClick={addTestCase}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                    <Plus size={14} /> Add Test Case
                </button>
            </div>

            {testCases.length === 0 ? (
                <EmptyState
                    icon={TestTube}
                    title="No Test Cases"
                    description="Add sample and hidden test cases for your problem"
                    action={
                        <button
                            onClick={addTestCase}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus size={16} /> Add First Test Case
                        </button>
                    }
                    darkMode={darkMode}
                />
            ) : (
                <div className="space-y-3">
                    {testCases.map((tc, index) => (
                        <div
                            key={tc.id}
                            className={`rounded-xl border overflow-hidden ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                        >
                            <div className={`flex items-center justify-between px-4 py-2 ${
                                darkMode ? 'bg-gray-750 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Test Case #{index + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateTestCase(tc.id, 'isSample', true)}
                                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                                                tc.isSample || !tc.isHidden
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                                            }`}
                                        >
                                            <Eye size={12} /> Sample
                                        </button>
                                        <button
                                            onClick={() => updateTestCase(tc.id, 'isHidden', true)}
                                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                                                tc.isHidden
                                                    ? 'bg-orange-500/20 text-orange-400'
                                                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                                            }`}
                                        >
                                            <EyeOff size={12} /> Hidden
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <InputField
                                        value={tc.weight}
                                        onChange={v => updateTestCase(tc.id, 'weight', parseInt(v) || 1)}
                                        type="number"
                                        placeholder="Weight"
                                        darkMode={darkMode}
                                    />
                                    <button
                                        onClick={() => removeTestCase(tc.id)}
                                        className="p-1.5 rounded hover:bg-red-500/20 text-red-400"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-4">
                                <TextareaField
                                    label="Input"
                                    value={tc.input}
                                    onChange={v => updateTestCase(tc.id, 'input', v)}
                                    placeholder="Enter input..."
                                    rows={4}
                                    darkMode={darkMode}
                                    monospace
                                />
                                <TextareaField
                                    label="Expected Output"
                                    value={tc.expectedOutput}
                                    onChange={v => updateTestCase(tc.id, 'expectedOutput', v)}
                                    placeholder="Enter expected output..."
                                    rows={4}
                                    darkMode={darkMode}
                                    monospace
                                />
                            </div>
                            {(tc.isSample || !tc.isHidden) && (
                                <div className="px-4 pb-4">
                                    <TextareaField
                                        label="Explanation (shown to students)"
                                        value={tc.explanation}
                                        onChange={v => updateTestCase(tc.id, 'explanation', v)}
                                        placeholder="Explain this test case..."
                                        rows={2}
                                        darkMode={darkMode}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

//  PROBLEM EDITOR 
const ProblemEditor = ({ problem, onSave, onCancel, darkMode, testId }) => {
    const [formData, setFormData] = useState(problem || {
        title: '',
        difficulty: 'easy',
        timeLimit: 1000,
        memoryLimit: 256,
        tags: [],
        statement: '',
        inputFormat: '',
        outputFormat: '',
        constraints: '',
        testCases: [],
        starterCodes: [],
        solution: '',
        solutionLanguage: 'cpp',
        hints: [],
        maxScore: 100,
        partialScoring: false
    });

    const [activeSection, setActiveSection] = useState('details');
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            alert('Problem title is required');
            return;
        }
        if (!formData.statement.trim()) {
            alert('Problem statement is required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                testId: testId, // Link to contest if creating from contest
                testCases: formData.testCases.map(tc => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isHidden: tc.isHidden,
                    isSample: tc.isSample || !tc.isHidden,
                    explanation: tc.explanation,
                    weight: tc.weight
                }))
            };

            if (problem?._id) {
                await problemApi.update(problem._id, payload);
            } else {
                await problemApi.create(payload);
            }

            onSave(payload);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isValid = formData.title.trim() && formData.statement.trim();

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 border-b ${
                darkMode ? 'bg-gray-900/95 border-gray-800 backdrop-blur' : 'bg-white/95 border-gray-200 backdrop-blur'
            }`}>
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="font-bold text-lg">
                                {problem ? 'Edit Problem' : 'Create New Problem'}
                            </h1>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formData.title || 'Untitled Problem'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                                showPreview
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : darkMode
                                        ? 'border-gray-700 hover:bg-gray-800'
                                        : 'border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            <Eye size={16} /> Preview
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!isValid || loading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                                isValid && !loading
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {loading ? <LoadingSpinner size="sm" /> : <Save size={16} />}
                            Save Problem
                        </button>
                    </div>
                </div>

                {/* Section Tabs */}
                <div className="max-w-6xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
                    {[
                        { id: 'details', label: 'Details', icon: FileText },
                        { id: 'statement', label: 'Statement', icon: BookOpen },
                        { id: 'testcases', label: 'Test Cases', icon: TestTube },
                        { id: 'solution', label: 'Solution', icon: Code }
                    ].map(section => (
                        <button
                            key={section.id}
                            onClick={() => { setActiveSection(section.id); setShowPreview(false); }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                                activeSection === section.id && !showPreview
                                    ? 'bg-blue-600 text-white'
                                    : darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <section.icon size={14} /> {section.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto p-4">
                {showPreview ? (
                    <ProblemPreview problem={formData} darkMode={darkMode} />
                ) : (
                    <>
                        {activeSection === 'details' && (
                            <div className={`rounded-xl border p-6 space-y-6 ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                                <InputField
                                    label="Problem Title"
                                    value={formData.title}
                                    onChange={v => updateField('title', v)}
                                    placeholder="e.g., Two Sum, Binary Search..."
                                    darkMode={darkMode}
                                    required
                                />

                                <div className="grid grid-cols-4 gap-4">
                                    <SelectField
                                        label="Difficulty"
                                        value={formData.difficulty}
                                        onChange={v => updateField('difficulty', v)}
                                        options={DIFFICULTY_OPTIONS}
                                        darkMode={darkMode}
                                        required
                                    />
                                    <InputField
                                        label="Time Limit (ms)"
                                        value={formData.timeLimit}
                                        onChange={v => updateField('timeLimit', parseInt(v) || 1000)}
                                        type="number"
                                        darkMode={darkMode}
                                    />
                                    <InputField
                                        label="Memory Limit (MB)"
                                        value={formData.memoryLimit}
                                        onChange={v => updateField('memoryLimit', parseInt(v) || 256)}
                                        type="number"
                                        darkMode={darkMode}
                                    />
                                    <InputField
                                        label="Max Score"
                                        value={formData.maxScore}
                                        onChange={v => updateField('maxScore', parseInt(v) || 100)}
                                        type="number"
                                        darkMode={darkMode}
                                    />
                                </div>

                                <TagSelector
                                    selected={formData.tags}
                                    onChange={v => updateField('tags', v)}
                                    darkMode={darkMode}
                                />

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="partialScoring"
                                        checked={formData.partialScoring}
                                        onChange={e => updateField('partialScoring', e.target.checked)}
                                        className="w-4 h-4 rounded"
                                    />
                                    <label htmlFor="partialScoring" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Enable partial scoring (score based on test cases passed)
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeSection === 'statement' && (
                            <div className={`rounded-xl border p-6 space-y-6 ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                                <TextareaField
                                    label="Problem Statement"
                                    value={formData.statement}
                                    onChange={v => updateField('statement', v)}
                                    placeholder="Describe the problem clearly..."
                                    rows={8}
                                    darkMode={darkMode}
                                    required
                                    helper="Supports Markdown formatting"
                                />

                                <TextareaField
                                    label="Input Format"
                                    value={formData.inputFormat}
                                    onChange={v => updateField('inputFormat', v)}
                                    placeholder="Describe the input format..."
                                    rows={4}
                                    darkMode={darkMode}
                                />

                                <TextareaField
                                    label="Output Format"
                                    value={formData.outputFormat}
                                    onChange={v => updateField('outputFormat', v)}
                                    placeholder="Describe the expected output format..."
                                    rows={4}
                                    darkMode={darkMode}
                                />

                                <TextareaField
                                    label="Constraints"
                                    value={formData.constraints}
                                    onChange={v => updateField('constraints', v)}
                                    placeholder="List all constraints (e.g., 1 ≤ n ≤ 10^5)..."
                                    rows={4}
                                    darkMode={darkMode}
                                    monospace
                                />
                            </div>
                        )}

                        {activeSection === 'testcases' && (
                            <div className={`rounded-xl border p-6 ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                                <TestCaseEditor
                                    testCases={formData.testCases}
                                    onChange={v => updateField('testCases', v)}
                                    darkMode={darkMode}
                                />
                            </div>
                        )}

                        {activeSection === 'solution' && (
                            <div className={`rounded-xl border p-6 space-y-6 ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Reference Solution
                                    </h3>
                                    <SelectField
                                        value={formData.solutionLanguage}
                                        onChange={v => updateField('solutionLanguage', v)}
                                        options={LANGUAGE_OPTIONS}
                                        darkMode={darkMode}
                                    />
                                </div>

                                <div className={`rounded-lg border overflow-hidden ${
                                    darkMode ? 'border-gray-700' : 'border-gray-300'
                                }`}>
                                    <div className={`px-4 py-2 flex items-center gap-2 ${
                                        darkMode ? 'bg-gray-750 border-b border-gray-700' : 'bg-gray-100 border-b border-gray-300'
                                    }`}>
                                        <Code size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            solution.{LANGUAGE_OPTIONS.find(l => l.value === formData.solutionLanguage)?.ext}
                                        </span>
                                    </div>
                                    <textarea
                                        value={formData.solution}
                                        onChange={e => updateField('solution', e.target.value)}
                                        placeholder="Paste your reference solution here..."
                                        className={`w-full p-4 font-mono text-sm resize-none focus:outline-none ${
                                            darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
                                        }`}
                                        rows={15}
                                        spellCheck={false}
                                    />
                                </div>

                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    The reference solution is used to verify test cases and is never shown to students.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

//  PROBLEM PREVIEW 
const ProblemPreview = ({ problem, darkMode }) => (
    <div className={`rounded-xl border overflow-hidden ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold">{problem.title || 'Untitled Problem'}</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <DifficultyBadge difficulty={problem.difficulty} />
                        <span className={`text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Clock size={14} /> {problem.timeLimit}ms
                        </span>
                        <span className={`text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <HardDrive size={14} /> {problem.memoryLimit}MB
                        </span>
                        <span className={`text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Award size={14} /> {problem.maxScore} pts
                        </span>
                    </div>
                </div>
            </div>
            {problem.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                    {problem.tags.map(tag => (
                        <span key={tag} className={`px-2 py-0.5 text-xs rounded-full ${
                            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>

        <div className="p-6 space-y-6">
            {problem.statement && (
                <div>
                    <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Problem</h3>
                    <p className={`whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {problem.statement}
                    </p>
                </div>
            )}

            {problem.inputFormat && (
                <div>
                    <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Input Format</h3>
                    <p className={`whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {problem.inputFormat}
                    </p>
                </div>
            )}

            {problem.outputFormat && (
                <div>
                    <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Output Format</h3>
                    <p className={`whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {problem.outputFormat}
                    </p>
                </div>
            )}

            {problem.constraints && (
                <div>
                    <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Constraints</h3>
                    <pre className={`font-mono text-sm p-3 rounded-lg ${
                        darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'
                    }`}>
                        {problem.constraints}
                    </pre>
                </div>
            )}

            {problem.testCases?.filter(tc => tc.isSample || !tc.isHidden).length > 0 && (
                <div>
                    <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Examples</h3>
                    <div className="space-y-4">
                        {problem.testCases.filter(tc => tc.isSample || !tc.isHidden).map((tc, i) => (
                            <div key={tc.id || i} className={`rounded-lg border overflow-hidden ${
                                darkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                                <div className={`px-3 py-1.5 text-sm font-medium ${
                                    darkMode ? 'bg-gray-750 text-gray-300' : 'bg-gray-50 text-gray-600'
                                }`}>
                                    Example {i + 1}
                                </div>
                                <div className={`grid grid-cols-2 divide-x ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                    <div className="p-3">
                                        <div className={`text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Input:</div>
                                        <pre className="font-mono text-sm whitespace-pre-wrap">{tc.input}</pre>
                                    </div>
                                    <div className="p-3">
                                        <div className={`text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Output:</div>
                                        <pre className="font-mono text-sm whitespace-pre-wrap">{tc.expectedOutput}</pre>
                                    </div>
                                </div>
                                {tc.explanation && (
                                    <div className={`px-3 py-2 border-t ${
                                        darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
                                    }`}>
                                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <strong>Explanation:</strong> {tc.explanation}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
);

//  CODING PROBLEM MANAGER (for adding problems to contest)
const CodingProblemManager = ({ testId, problems, onUpdate, darkMode }) => {
    const [myProblems, setMyProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        try {
            const res = await problemApi.getMyProblems();
            setMyProblems(res.problems || []);
        } catch (err) {
            console.error('Failed to load problems:', err);
        }
    };

    const handleAddProblem = async (problemId) => {
        setLoading(true);
        try {
            // Update contest to include this problem
            const contest = await contestApi.getById(testId);
            const currentProblems = contest.contest?.problems || [];
            const problemIds = currentProblems.map(p => p._id || p);
            if (!problemIds.includes(problemId)) {
                await contestApi.update(testId, {
                    problems: [...problemIds, problemId]
                });
                onUpdate();
            }
        } catch (err) {
            alert('Failed to add problem: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setShowCreate(true);
    };

    if (showCreate) {
        return (
            <ProblemEditor
                problem={null}
                testId={testId}
                onSave={(problem) => {
                    setShowCreate(false);
                    loadProblems();
                    onUpdate();
                }}
                onCancel={() => setShowCreate(false)}
                darkMode={darkMode}
            />
        );
    }

    return (
        <div className={`rounded-xl border p-6 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Coding Problems ({problems.length})
                </h3>
                <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    <Plus size={16} /> Create New Problem
                </button>
            </div>

            {myProblems.length === 0 ? (
                <div className="text-center py-8">
                    <Code size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        No problems yet. Create your first problem!
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {myProblems.map(problem => {
                        const isAdded = problems.some(p => p._id === problem._id || p === problem._id);
                        return (
                            <div
                                key={problem._id}
                                className={`p-4 rounded-lg border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {problem.title}
                                        </h4>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {problem.difficulty} • {problem.testCases?.length || 0} test cases
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAddProblem(problem._id)}
                                        disabled={isAdded || loading}
                                        className={`px-4 py-2 rounded-lg ${
                                            isAdded
                                                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {isAdded ? 'Added' : 'Add to Contest'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

//  CONTEST EDITOR 
const ContestEditor = ({ contest, onSave, onCancel, darkMode }) => {
    const [formData, setFormData] = useState(contest || {
        name: '',
        description: '',
        startTime: getFutureDateTime(1),
        endTime: getFutureDateTime(3),
        contestType: 'mixed',
        isPrivate: false,
        accessCode: '',
        showLeaderboard: true,
        shuffleQuestions: false,
        publishResult: false
    });

    const [activeTab, setActiveTab] = useState('settings');
    const [mcqQuestions, setMcqQuestions] = useState([]);
    const [codingProblems, setCodingProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [testId, setTestId] = useState(contest?._id || null);

    // Load existing questions if editing
    useEffect(() => {
        if (contest?._id) {
            loadQuestions();
        }
    }, [contest]);

    const loadQuestions = async () => {
        try {
            const [questionsRes, contestRes] = await Promise.all([
                questionApi.getByTest(contest._id),
                contestApi.getById(contest._id)
            ]);
            setMcqQuestions(questionsRes.questions || []);
            setCodingProblems(contestRes.contest?.problems || []);
        } catch (error) {
            console.error('Failed to load questions:', error);
        }
    };

    function getFutureDateTime(hoursFromNow) {
        const future = new Date();
        future.setHours(future.getHours() + hoursFromNow);
        return future.toISOString().slice(0, 16);
    }

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Contest name is required';
        }

        if (!formData.startTime) {
            newErrors.startTime = 'Start time is required';
        }

        if (!formData.endTime) {
            newErrors.endTime = 'End time is required';
        }

        if (formData.startTime && formData.endTime) {
            const start = new Date(formData.startTime);
            const end = new Date(formData.endTime);
            const now = new Date();

            if (!contest && start <= now) {
                newErrors.startTime = 'Start time must be in the future';
            }

            if (end <= start) {
                newErrors.endTime = 'End time must be after start time';
            }
        }

        if (formData.isPrivate && !formData.accessCode.trim()) {
            newErrors.accessCode = 'Access code required for private contests';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveSettings = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                startTime: formData.startTime,
                endTime: formData.endTime,
                isPublic: !formData.isPrivate,
                accessCode: formData.isPrivate ? formData.accessCode : null,
                showLeaderboard: formData.showLeaderboard,
                shuffleQuestions: formData.shuffleQuestions,
                contestType: formData.contestType
            };

            let result;
            if (testId) {
                result = await contestApi.update(testId, payload);
            } else {
                result = await contestApi.create(payload);
                const newTestId = result.contest?.id || result.contest?._id || result.contest?.contest?.id;
                if (newTestId) {
                    setTestId(newTestId);
                    // Move to questions tab after creating contest
                    setActiveTab('mcq');
                } else {
                    console.error('Failed to get contest ID from response:', result);
                    alert('Contest created but failed to get ID. Please refresh and try again.');
                }
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        onSave({
            ...formData,
            _id: testId,
            questions: mcqQuestions,
            problems: codingProblems
        });
    };

    const isValid = formData.name.trim() && formData.startTime && formData.endTime && Object.keys(errors).length === 0;

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 border-b ${
                darkMode ? 'bg-gray-900/95 border-gray-800 backdrop-blur' : 'bg-white/95 border-gray-200 backdrop-blur'
            }`}>
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="font-bold text-lg">
                                {contest ? 'Edit Contest' : 'Create New Contest'}
                            </h1>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formData.name || 'Untitled Contest'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {testId && (
                            <button
                                onClick={handleFinish}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <CheckCircle size={16} /> Finish
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-5xl mx-auto px-4 pb-2 flex gap-2">
                    <TabButton
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                        icon={Settings}
                        label="Settings"
                        darkMode={darkMode}
                    />
                    <TabButton
                        active={activeTab === 'mcq'}
                        onClick={() => testId && setActiveTab('mcq')}
                        icon={ClipboardList}
                        label="MCQ Questions"
                        count={mcqQuestions.length}
                        darkMode={darkMode}
                    />
                    <TabButton
                        active={activeTab === 'coding'}
                        onClick={() => testId && setActiveTab('coding')}
                        icon={Code}
                        label="Coding Problems"
                        count={codingProblems.length}
                        darkMode={darkMode}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto p-4">
                {activeTab === 'settings' && (
                    <div className={`rounded-xl border p-6 space-y-6 ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <InputField
                            label="Contest Name"
                            value={formData.name}
                            onChange={v => updateField('name', v)}
                            placeholder="e.g., Weekly Contest #1"
                            darkMode={darkMode}
                            required
                            error={errors.name}
                        />

                        <TextareaField
                            label="Description"
                            value={formData.description}
                            onChange={v => updateField('description', v)}
                            placeholder="Describe the contest, rules, and topics covered..."
                            rows={3}
                            darkMode={darkMode}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Start Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={e => updateField('startTime', e.target.value)}
                                    className={`w-full px-3 py-2 rounded-lg border ${
                                        errors.startTime ? 'border-red-500' : ''
                                    } ${
                                        darkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                />
                                {errors.startTime && <p className="text-red-500 text-xs">{errors.startTime}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    End Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={e => updateField('endTime', e.target.value)}
                                    className={`w-full px-3 py-2 rounded-lg border ${
                                        errors.endTime ? 'border-red-500' : ''
                                    } ${
                                        darkMode
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                />
                                {errors.endTime && <p className="text-red-500 text-xs">{errors.endTime}</p>}
                            </div>
                        </div>

                        <SelectField
                            label="Contest Type"
                            value={formData.contestType}
                            onChange={v => updateField('contestType', v)}
                            options={[
                                { value: 'mcq', label: 'MCQ Only' },
                                { value: 'coding', label: 'Coding Only' },
                                { value: 'mixed', label: 'Mixed (MCQ + Coding)' }
                            ]}
                            darkMode={darkMode}
                        />

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={formData.isPrivate}
                                    onChange={e => updateField('isPrivate', e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <label htmlFor="isPrivate" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Private contest (requires access code)
                                </label>
                            </div>

                            {formData.isPrivate && (
                                <InputField
                                    label="Access Code"
                                    value={formData.accessCode}
                                    onChange={v => updateField('accessCode', v)}
                                    placeholder="Enter access code for students"
                                    darkMode={darkMode}
                                    required
                                    error={errors.accessCode}
                                />
                            )}

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="showLeaderboard"
                                    checked={formData.showLeaderboard}
                                    onChange={e => updateField('showLeaderboard', e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <label htmlFor="showLeaderboard" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Show live leaderboard during contest
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="shuffleQuestions"
                                    checked={formData.shuffleQuestions}
                                    onChange={e => updateField('shuffleQuestions', e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <label htmlFor="shuffleQuestions" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Shuffle questions for each student
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveSettings}
                                disabled={loading || !isValid}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium ${
                                    isValid && !loading
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {loading ? <LoadingSpinner size="sm" /> : <Save size={16} />}
                                {testId ? 'Update Settings' : 'Save & Continue'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'mcq' && testId && (
                    <MCQEditor
                        questions={mcqQuestions}
                        testId={testId}
                        onUpdate={loadQuestions}
                        darkMode={darkMode}
                    />
                )}

                {activeTab === 'coding' && testId && (
                    <CodingProblemManager
                        testId={testId}
                        problems={codingProblems}
                        onUpdate={async () => {
                            // Reload problems for this contest
                            try {
                                const contest = await contestApi.getById(testId);
                                setCodingProblems(contest.contest?.problems || []);
                            } catch (err) {
                                console.error('Failed to load problems:', err);
                            }
                        }}
                        darkMode={darkMode}
                    />
                )}

                {(activeTab === 'mcq' || activeTab === 'coding') && !testId && (
                    <div className={`rounded-xl border p-6 text-center ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <AlertCircle className={`mx-auto mb-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} size={48} />
                        <h3 className="text-lg font-semibold mb-2">Save Settings First</h3>
                        <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Please save the contest settings before adding questions.
                        </p>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Go to Settings
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

//  STUDENT DASHBOARD 
const StudentDashboard = ({ darkMode }) => {
    const [tests, setTests] = useState({ upcoming: [], running: [], previous: [] });
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('running');

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {
        try {
            setLoading(true);
            const response = await testSessionApi.getMyTests();
            setTests(response.tests || { upcoming: [], running: [], previous: [] });
        } catch (error) {
            console.error('Failed to load tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (testId, accessCode) => {
        try {
            await testSessionApi.register(testId, accessCode);
            loadTests();
        } catch (error) {
            alert(error.message);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" darkMode={darkMode} />
            </div>
        );
    }

    const categories = [
        { id: 'running', label: 'Live Now', icon: PlayCircle, color: 'green' },
        { id: 'upcoming', label: 'Upcoming', icon: Calendar, color: 'blue' },
        { id: 'previous', label: 'Previous', icon: Clock, color: 'gray' }
    ];

    const currentTests = tests[activeCategory] || [];

    return (
        <div className="space-y-6">
            {/* Category Tabs */}
            <div className={`flex gap-2 p-1.5 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            activeCategory === cat.id
                                ? `bg-${cat.color}-600 text-white`
                                : darkMode
                                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                        }`}
                    >
                        <cat.icon size={18} />
                        <span>{cat.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            activeCategory === cat.id ? 'bg-white/20' : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                            {tests[cat.id]?.length || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tests Grid */}
            {currentTests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentTests.map(test => (
                        <div
                            key={test._id}
                            className={`rounded-xl border p-4 hover:shadow-lg transition-shadow ${
                                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1">{test.title}</h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        by {test.creator?.name || 'Unknown'}
                                    </p>
                                </div>
                                <StatusBadge status={test.registrationStatus || activeCategory} />
                            </div>

                            <div className={`flex items-center gap-4 text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatDate(test.startTime)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {formatDuration(test.duration)}
                                </span>
                            </div>

                            {activeCategory === 'running' && (
                                <a
                                    href={`/contest/${test._id}`}
                                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                >
                                    <Play size={16} className="inline mr-2" />
                                    {test.registrationStatus === 'started' ? 'Continue' : 'Start Test'}
                                </a>
                            )}

                            {activeCategory === 'upcoming' && (
                                <button
                                    onClick={() => handleRegister(test._id)}
                                    disabled={test.registrationStatus === 'registered'}
                                    className={`w-full px-4 py-2 rounded-lg font-medium ${
                                        test.registrationStatus === 'registered'
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {test.registrationStatus === 'registered' ? (
                                        <>
                                            <CheckCircle size={16} className="inline mr-2" />
                                            Registered
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck size={16} className="inline mr-2" />
                                            Register
                                        </>
                                    )}
                                </button>
                            )}

                            {activeCategory === 'previous' && (
                                <div className="flex gap-2">
                                    <a
                                        href={`/results/${test._id}`}
                                        className="flex-1 text-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        <BarChart3 size={16} className="inline mr-2" />
                                        View Result
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={categories.find(c => c.id === activeCategory)?.icon || Calendar}
                    title={`No ${activeCategory} tests`}
                    description={
                        activeCategory === 'running'
                            ? "You don't have any live tests right now"
                            : activeCategory === 'upcoming'
                            ? "No upcoming tests. Register for tests when they become available."
                            : "You haven't participated in any tests yet"
                    }
                    darkMode={darkMode}
                />
            )}
        </div>
    );
};

//  EDUCATOR DASHBOARD 
const EducatorDashboard = ({ darkMode, onCreateContest, onCreateProblem }) => {
    const [contests, setContests] = useState([]);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contests');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [contestsRes, problemsRes] = await Promise.all([
                contestApi.getMyContests(),
                problemApi.getMyProblems()
            ]);
            setContests(contestsRes.contests || []);
            setProblems(problemsRes.problems || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContest = async (id) => {
        if (!confirm('Are you sure you want to delete this contest?')) return;
        try {
            await contestApi.delete(id);
            setContests(prev => prev.filter(c => c._id !== id));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeleteProblem = async (id) => {
        if (!confirm('Are you sure you want to delete this problem?')) return;
        try {
            await problemApi.delete(id);
            setProblems(prev => prev.filter(p => p._id !== id));
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" darkMode={darkMode} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={onCreateContest}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left hover:shadow-lg transition-shadow ${
                        darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-500'
                    }`}
                >
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Trophy className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold">Create Contest</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Set up a new test with MCQs and coding problems
                        </p>
                    </div>
                </button>

                <button
                    onClick={onCreateProblem}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left hover:shadow-lg transition-shadow ${
                        darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500' : 'bg-white border-gray-200 hover:border-green-500'
                    }`}
                >
                    <div className="p-3 bg-green-500/20 rounded-lg">
                        <Code className="text-green-500" size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold">Create Problem</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Add a new coding problem to your library
                        </p>
                    </div>
                </button>
            </div>

            {/* Tabs */}
            <div className={`flex gap-2 p-1.5 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <TabButton
                    active={activeTab === 'contests'}
                    onClick={() => setActiveTab('contests')}
                    icon={Trophy}
                    label="My Contests"
                    count={contests.length}
                    darkMode={darkMode}
                />
                <TabButton
                    active={activeTab === 'problems'}
                    onClick={() => setActiveTab('problems')}
                    icon={Code}
                    label="My Problems"
                    count={problems.length}
                    darkMode={darkMode}
                />
            </div>

            {/* Content */}
            {activeTab === 'contests' && (
                contests.length > 0 ? (
                    <div className="space-y-4">
                        {contests.map(contest => (
                            <div
                                key={contest._id}
                                className={`rounded-xl border p-4 ${
                                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold">{contest.title}</h3>
                                            <StatusBadge status={contest.phase} />
                                        </div>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {contest.description || 'No description'}
                                        </p>
                                        <div className={`flex items-center gap-4 mt-2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(contest.testTime).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {contest.totalTime} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {contest.students?.length || 0} students
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`/admin/results/${contest._id}`}
                                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                            title="View Results"
                                        >
                                            <BarChart3 size={18} />
                                        </a>
                                        <button
                                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteContest(contest._id)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Trophy}
                        title="No Contests Yet"
                        description="Create your first contest to get started"
                        action={
                            <button
                                onClick={onCreateContest}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus size={16} /> Create Contest
                            </button>
                        }
                        darkMode={darkMode}
                    />
                )
            )}

            {activeTab === 'problems' && (
                problems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {problems.map(problem => (
                            <div
                                key={problem._id}
                                className={`rounded-xl border p-4 hover:shadow-lg transition-shadow ${
                                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold">{problem.title}</h3>
                                    <div className="flex items-center gap-1">
                                        <button
                                            className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProblem(problem._id)}
                                            className="p-1.5 rounded hover:bg-red-500/20 text-red-400"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <DifficultyBadge difficulty={problem.difficulty} />
                                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {problem.testCases?.length || 0} test cases
                                    </span>
                                </div>
                                {problem.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {problem.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className={`px-2 py-0.5 text-xs rounded-full ${
                                                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Code}
                        title="No Problems Yet"
                        description="Create coding problems to add to your contests"
                        action={
                            <button
                                onClick={onCreateProblem}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Plus size={16} /> Create Problem
                            </button>
                        }
                        darkMode={darkMode}
                    />
                )
            )}
        </div>
    );
};

//  MAIN COMPONENT 
export default function Practice({ darkMode = true }) {
    const { user, isEducator } = useAuth();
    const [view, setView] = useState('home'); // home, create-contest, create-problem, join
    const [editingContest, setEditingContest] = useState(null);
    const [editingProblem, setEditingProblem] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // Show editors if active
    if (view === 'create-problem' || editingProblem) {
        return (
            <ProblemEditor
                problem={editingProblem}
                onSave={(problem) => {
                    showToast('Problem saved successfully!', 'success');
                    setEditingProblem(null);
                    setView('home');
                }}
                onCancel={() => {
                    setEditingProblem(null);
                    setView('home');
                }}
                darkMode={darkMode}
            />
        );
    }

    if (view === 'create-contest' || editingContest) {
        return (
            <ContestEditor
                contest={editingContest}
                onSave={(contest) => {
                    showToast('Contest saved successfully!', 'success');
                    setEditingContest(null);
                    setView('home');
                }}
                onCancel={() => {
                    setEditingContest(null);
                    setView('home');
                }}
                darkMode={darkMode}
            />
        );
    }

    const bgMain = darkMode ? 'bg-gray-900' : 'bg-gray-50';
    const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

    return (
        <div className={`min-h-screen ${bgMain} ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="max-w-6xl mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Sparkles className="text-blue-500" />
                            {isEducator ? 'Contest Manager' : 'Practice Hub'}
                        </h1>
                        <p className={`text-sm ${textMuted}`}>
                            {isEducator
                                ? 'Create and manage contests, problems, and view results'
                                : 'Join contests and track your progress'
                            }
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEducator && (
                            <a
                                href="/admin/login"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                                    darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                                <Lock size={16} />
                                Educator Login
                            </a>
                        )}
                    </div>
                </div>

                {/* Content based on role */}
                {isEducator ? (
                    <EducatorDashboard
                        darkMode={darkMode}
                        onCreateContest={() => setView('create-contest')}
                        onCreateProblem={() => setView('create-problem')}
                    />
                ) : (
                    <>
                        <StudentDashboard darkMode={darkMode} />
                        {/* Quick Create Contest Button for Students */}
                        <div className={`mt-8 rounded-xl border-2 border-dashed p-6 text-center ${
                            darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
                        }`}>
                            <Trophy size={32} className={`mx-auto mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Create Your Own Contest
                            </h3>
                            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Set up a contest for your friends, community, or class
                            </p>
                            <button
                                onClick={() => setView('create-contest')}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                                <Plus size={18} />
                                Create Contest
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
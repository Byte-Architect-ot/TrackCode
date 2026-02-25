import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useParams } from "react-router-dom";

import config from "../../../api/apiconfig";
const API2 = config.JudgeBackend_url;

const UserMarkdown = ({ problemId }) => {
    const [markdownContent, setMarkdownContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const token = localStorage.getItem("usertoken") || localStorage.getItem("token");
    const { testId } = useParams();

    useEffect(() => {
        const fetchMarkdown = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const res = await axios.post(
                    `${API2}/userMarkdown`,
                    {
                        testId: testId,
                        problemId: problemId
                    },
                    {
                        headers: { token }
                    }
                );

                if (res.status === 200 && res.data.markdownContent) {
                    setMarkdownContent(res.data.markdownContent);
                } else {
                    setMarkdownContent(`# Problem Loading\n\nProblem statement could not be loaded.`);
                }
            } catch (err) {
                console.error("Error fetching markdown:", err);
                setError(err.response?.data?.message || "Failed to load problem statement");
                setMarkdownContent(`# Error Loading Problem\n\n${err.response?.data?.message || "Please try again later."}`);
            } finally {
                setLoading(false);
            }
        };

        if (problemId && testId && token) {
            fetchMarkdown();
        }
    }, [problemId, testId, token]);

    const markdownComponents = {
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4 text-gray-800" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-semibold my-3 text-gray-800" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-medium my-2 text-gray-800" {...props} />,
        p: ({ node, ...props }) => <p className="whitespace-pre-wrap my-3 text-gray-700 leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 text-gray-700 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 text-gray-700 space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="my-1 text-gray-700" {...props} />,
        pre: ({ node, ...props }) => (
            <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto my-3 text-sm border border-gray-200" {...props} />
        ),
        code: ({ node, ...props }) => (
            <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
        ),
        table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3">
                <table className="min-w-full border border-gray-300 rounded-lg" {...props} />
            </div>
        ),
        th: ({ node, ...props }) => (
            <th className="px-4 py-2 bg-gray-100 border border-gray-300 text-left font-semibold text-sm text-gray-800" {...props} />
        ),
        td: ({ node, ...props }) => (
            <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-indigo-400 pl-4 italic text-gray-600 my-3 bg-indigo-50 py-2" {...props} />
        ),
        a: ({ node, ...props }) => (
            <a className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium" {...props} />
        ),
        strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-900" {...props} />
        ),
        em: ({ node, ...props }) => (
            <em className="italic text-gray-700" {...props} />
        ),
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
                    <p className="text-gray-600 text-sm">Loading problem statement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                <div className="prose prose-sm md:prose-base max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={markdownComponents}
                    >
                        {markdownContent}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default UserMarkdown;
import React from 'react';
import { useParams } from 'react-router-dom';
import Contest from './Contest'; // Your existing Contest component

export default function LiveContest({ darkMode }) {
    const { contestId } = useParams();
    
    // Use your existing Contest component with the testId
    return <Contest darkMode={darkMode} testId={contestId} />;
}
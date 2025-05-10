'use client';

import { useState } from 'react';

interface ActionButtonsProps {
    isRunning: boolean;
    onCheckStatus: () => Promise<void>;
    onStartContainer: () => Promise<void>;
    onStopContainer: () => Promise<void>;
}

export function ActionButtons({ 
    isRunning, 
    onCheckStatus, 
    onStartContainer, 
    onStopContainer 
}: ActionButtonsProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async (action: () => Promise<void>) => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            await action();
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex gap-4">
            <button 
                onClick={() => handleAction(onCheckStatus)}
                disabled={isProcessing}
                className={`font-bold py-2 px-4 rounded inline-flex items-center ${
                    isProcessing 
                        ? 'bg-gray-300 cursor-not-allowed opacity-50' 
                        : 'bg-blue-500 hover:bg-blue-700 text-white'
                }`}
            >
                {isProcessing && (
                    <svg className="animate-spin h-4 w-4 text-gray-500 -ml-2 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                Refresh Status
            </button>
            <button 
                onClick={() => handleAction(onStartContainer)}
                disabled={isProcessing || isRunning}
                className={`font-bold py-2 px-4 rounded inline-flex items-center ${
                    isProcessing || isRunning
                        ? 'bg-gray-300 cursor-not-allowed opacity-50' 
                        : 'bg-green-500 hover:bg-green-700 text-white'
                }`}
            >
                {isProcessing && (
                    <svg className="animate-spin h-4 w-4 text-gray-500 -ml-2 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                Start Container
            </button>
            <button 
                onClick={() => handleAction(onStopContainer)}
                disabled={isProcessing || !isRunning}
                className={`font-bold py-2 px-4 rounded inline-flex items-center ${
                    isProcessing || !isRunning
                        ? 'bg-gray-300 cursor-not-allowed opacity-50' 
                        : 'bg-red-500 hover:bg-red-700 text-white'
                }`}
            >
                {isProcessing && (
                    <svg className="animate-spin h-4 w-4 text-gray-500 -ml-2 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                Stop Container
            </button>
        </div>
    );
} 
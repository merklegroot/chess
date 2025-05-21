'use client';

import { apiClient } from '@/app/clients/apiClient/apiClient';
import { useEffect, useState } from 'react';
import { BetterGameDetailsResponse, BetterMoveApiModel } from '@/app/api/better-game-details/[id]/route';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { appConstants } from '@/constants/appConstants/appConstants';
import { evalResult } from '@/models/evalResult';
import toast, { Toaster } from 'react-hot-toast';

export default function BetterDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const [gameDetails, setGameDetails] = useState<BetterGameDetailsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isJsonExpanded, setIsJsonExpanded] = useState(false);
    const [moveEvals, setMoveEvals] = useState<Record<string, evalResult>>({});
    const [loadingEval, setLoadingEval] = useState<string | null>(null);

    const getMovesWithRootFen = () => {
        let allMoves: BetterMoveApiModel[] = [];

        allMoves.push({
            fen: appConstants.rootFen,
            move: '-',
            number: 0,
            isWhite: true
        });

        (gameDetails?.moves ?? []).forEach((move) => {
            allMoves.push(move);
        });

        return allMoves;
    }

    const onGetEvalPress = async (fen: string) => {
        try {
            setLoadingEval(fen);
            const response = await apiClient.getEval(fen);
            toast.success(`Evaluation for ${fen} fetched successfully!`);
            setMoveEvals(prev => ({
                ...prev,
                [fen]: response
            }));
        } catch (err) {
            toast.error(`Failed to get evaluation for ${fen}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            console.error('Failed to get evaluation:', err);
        } finally {
            setLoadingEval(null);
        }
    };

    useEffect(() => {
        if (!id) {
            setError('No game ID provided');
            setLoading(false);
            return;
        }

        const fetchGameDetails = async () => {
            try {
                const details = await apiClient.getBetterGameDetails(id);
                setGameDetails(details);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch game details');
            } finally {
                setLoading(false);
            }
        };

        fetchGameDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white shadow rounded-lg p-4">
                    <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white shadow rounded-lg p-4">
                    <h1 className="text-2xl font-bold mb-4">Error</h1>
                    <p className="text-red-600">{error}</p>
                    <Link href="/game/list" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                        ← Back to Games
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Toaster position="top-right" />
            
            <div className="mb-6 flex justify-between items-center">
                <Link href="/game/list" className="text-blue-600 hover:text-blue-800">
                    ← Back to Games
                </Link>
                <button
                    onClick={() => toast('Hello! This is a toast notification!', {
                        duration: 4000,
                        style: {
                            background: '#333',
                            color: '#fff',
                        },
                    })}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Toast
                </button>
            </div>

            <div className="mb-6">Game ID: {id}</div>
            <div className="mb-6">Root FEN: {appConstants.rootFen}</div>

            <div className="bg-white shadow rounded-lg p-6">
                <button
                    onClick={() => setIsJsonExpanded(!isJsonExpanded)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <svg
                        className={`w-4 h-4 transform transition-transform ${isJsonExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-medium">Raw JSON Data</span>
                </button>
                
                {isJsonExpanded && (
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                        {JSON.stringify(gameDetails, null, 2)}
                    </pre>
                )}

                {gameDetails && (
                    <div>
                        <h2 className="text-lg font-bold mb-2">Moves</h2>
                        <table className="w-full border-collapse border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left">Move</th>
                                    <th className="p-2 text-left">Color</th>
                                    <th className="p-2 text-left">FEN</th>
                                    <th className="p-2 text-left">Evaluation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getMovesWithRootFen().map((move, index) => (
                                    <tr key={index}>
                                        <td className="p-2 text-left">{move.move}</td>
                                        <td className="p-2 text-left">{index === 0 ? 'Root' : move.isWhite ? 'White' : 'Black'}</td>
                                        <td className="p-2 text-left font-mono text-sm">{move.fen}</td>
                                        <td className="p-2 text-left">
                                            {moveEvals[move.fen] ? (
                                                <div className="text-sm">
                                                    Score: {moveEvals[move.fen].score}
                                                    <br />
                                                    Depth: {moveEvals[move.fen].depth}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => onGetEvalPress(move.fen)}
                                                    disabled={loadingEval === move.fen}
                                                    className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                                                >
                                                    {loadingEval === move.fen ? 'Loading...' : 'Get Eval'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
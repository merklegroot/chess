import { exec } from 'child_process';
import { promisify } from 'util';
import { revalidatePath } from 'next/cache';

const execAsync = promisify(exec);

interface ContainerStatus {
    running: boolean;
    status: string;
    raw: string;
    checkedAt: string;
}

async function checkContainerStatus(): Promise<ContainerStatus> {
    try {
        const { stdout } = await execAsync('docker ps -a --filter "name=stockfish-server"');
        const isRunning = stdout.includes('Up');
        
        return { 
            running: isRunning,
            status: isRunning ? 'Container is running' : 'Container not running',
            raw: stdout.trim() || 'No output',
            checkedAt: new Date().toLocaleString()
        };
    } catch (error) {
        console.error('Error checking container status:', error);
        return { 
            running: false,
            status: 'Error checking container status',
            raw: error instanceof Error ? error.message : 'Unknown error',
            checkedAt: new Date().toLocaleString()
        };
    }
}

async function handleCheckStatus() {
    'use server';
    revalidatePath('/dock');
}

export default async function DockPage() {
    const initialStatus = await checkContainerStatus();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-4">Dock</h1>
            <div className="space-y-4">
                <form action={handleCheckStatus}>
                    <button 
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Check Container Status
                    </button>
                </form>

                <div className={`p-4 rounded-lg ${initialStatus.running ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="flex justify-between items-start">
                        <p className="font-medium">
                            Status: {initialStatus.status}
                        </p>
                        <p className="text-sm text-gray-500">
                            Last checked: {initialStatus.checkedAt}
                        </p>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Raw Output:</p>
                        <pre className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre">
                            {initialStatus.raw}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
} 
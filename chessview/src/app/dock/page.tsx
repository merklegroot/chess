import { exec } from 'child_process';
import { promisify } from 'util';
import { revalidatePath } from 'next/cache';

const execAsync = promisify(exec);

interface ContainerStatus {
    running: boolean;
    status: string;
}

async function checkContainerStatus(): Promise<ContainerStatus> {
    try {
        const { stdout } = await execAsync('docker ps --filter "name=stockfish-server" --format "{{.Status}}"');
        const isRunning = stdout.trim().length > 0;
        
        return { 
            running: isRunning,
            status: isRunning ? stdout.trim() : 'Container not running'
        };
    } catch (error) {
        console.error('Error checking container status:', error);
        return { 
            running: false,
            status: 'Error checking container status'
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
                    <p className="font-medium">
                        Status: {initialStatus.running ? 'Running' : 'Not Running'}
                    </p>
                    <p className="text-sm text-gray-600">
                        {initialStatus.status}
                    </p>
                </div>
            </div>
        </div>
    );
} 
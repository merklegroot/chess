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

interface CommandHistory {
    timestamp: string;
    command: string;
    output: string;
}

let commandHistory: CommandHistory[] = [];

async function checkContainerStatus(): Promise<ContainerStatus> {
    try {
        const { stdout } = await execAsync('docker ps -a --filter "name=stockfish-server"');
        const isRunning = stdout.includes('Up');
        const timestamp = new Date().toLocaleString();
        
        commandHistory.push({
            timestamp,
            command: 'docker ps -a --filter "name=stockfish-server"',
            output: stdout.trim() || 'No output'
        });
        
        // Keep last 10 commands
        commandHistory = commandHistory.slice(-10);
        
        return { 
            running: isRunning,
            status: isRunning ? 'Container is running' : 'Container not running',
            raw: stdout.trim() || 'No output',
            checkedAt: timestamp
        };
    } catch (error) {
        console.error('Error checking container status:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const timestamp = new Date().toLocaleString();
        
        commandHistory.push({
            timestamp,
            command: 'docker ps -a --filter "name=stockfish-server"',
            output: `Error: ${errorMessage}`
        });
        
        // Keep last 10 commands
        commandHistory = commandHistory.slice(-10);
        
        return { 
            running: false,
            status: 'Error checking container status',
            raw: errorMessage,
            checkedAt: timestamp
        };
    }
}

async function handleStartContainer() {
    'use server';
    
    try {
        const { stdout, stderr } = await execAsync('docker start stockfish-server');
        const output = stdout || stderr || 'Container started successfully';
        commandHistory.push({
            timestamp: new Date().toLocaleString(),
            command: 'docker start stockfish-server',
            output: output.trim()
        });
        // Keep last 10 commands
        commandHistory = commandHistory.slice(-10);
    } catch (error) {
        console.error('Error starting container:', error);
        commandHistory.push({
            timestamp: new Date().toLocaleString(),
            command: 'docker start stockfish-server',
            output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        // Keep last 10 commands
        commandHistory = commandHistory.slice(-10);
    }
    revalidatePath('/dock');
}

async function handleStopContainer() {
    'use server';
    
    try {
        const { stdout, stderr } = await execAsync('docker stop stockfish-server');
        const output = stdout || stderr || 'Container stopped successfully';
        commandHistory.push({
            timestamp: new Date().toLocaleString(),
            command: 'docker stop stockfish-server',
            output: output.trim()
        });
        // Keep last 10 commands
        commandHistory = commandHistory.slice(-10);
    } catch (error) {
        console.error('Error stopping container:', error);
        commandHistory.push({
            timestamp: new Date().toLocaleString(),
            command: 'docker stop stockfish-server',
            output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        // Keep last 10 commands
        commandHistory = commandHistory.slice(-10);
    }
    revalidatePath('/dock');
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
                <div className="flex gap-4">
                    <form action={handleCheckStatus}>
                        <button 
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Check Container Status
                        </button>
                    </form>
                    <form action={handleStartContainer}>
                        <button 
                            type="submit"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Start Container
                        </button>
                    </form>
                    <form action={handleStopContainer}>
                        <button 
                            type="submit"
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Stop Container
                        </button>
                    </form>
                </div>

                <div className={`p-4 rounded-lg ${initialStatus.running ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="flex justify-between items-start">
                        <p className="font-medium">
                            Status: {initialStatus.status}
                        </p>
                        <p className="text-sm text-gray-500">
                            Last checked: {initialStatus.checkedAt}
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-medium mb-2">Command History</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {[...commandHistory].reverse().map((entry, index) => (
                            <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-medium text-gray-700">
                                        {entry.command}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {entry.timestamp}
                                    </p>
                                </div>
                                <pre className="text-sm text-gray-600 bg-white p-2 rounded overflow-x-auto whitespace-pre">
                                    {entry.output}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 
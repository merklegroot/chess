import { exec } from 'child_process';
import { promisify } from 'util';
import { revalidatePath } from 'next/cache';
import { ActionButtons } from './action-buttons';

const execAsync = promisify(exec);

interface ContainerStatus {
    running: boolean;
    status: string;
    raw: string;
    checkedAt: string;
    containerInfo: {
        containerId: string;
        image: string;
        created: string;
        ports: string;
        names: string;
    } | null;
}

interface CommandHistory {
    timestamp: string;
    command: string;
    output: string;
}

let commandHistory: CommandHistory[] = [];
let isProcessing = false;

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

        // Parse container information
        let containerInfo = null;
        if (stdout.trim()) {
            const lines = stdout.trim().split('\n');
            if (lines.length > 1) { // Skip header line
                const containerData = lines[1].split(/\s{2,}/);
                if (containerData.length >= 6) {
                    // Extract the application port (e.g., "0.0.0.0:8080->8080/tcp" -> "8080")
                    const ports = containerData[5] || '';
                    const appPort = ports.split('->')[0]?.split(':')[1]?.split('/')[0] || 'None';
                    
                    containerInfo = {
                        containerId: containerData[0],
                        image: containerData[1],
                        created: containerData[3],
                        ports: appPort,
                        names: containerData[6] || 'stockfish-server'
                    };
                }
            }
        }
        
        return { 
            running: isRunning,
            status: isRunning ? 'Container is running' : 'Container not running',
            raw: stdout.trim() || 'No output',
            checkedAt: timestamp,
            containerInfo
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
            checkedAt: timestamp,
            containerInfo: null
        };
    }
}

async function handleStartContainer() {
    'use server';
    
    if (isProcessing) return;
    isProcessing = true;
    
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
    } finally {
        isProcessing = false;
    }
    revalidatePath('/dock');
}

async function handleStopContainer() {
    'use server';
    
    if (isProcessing) return;
    isProcessing = true;
    
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
    } finally {
        isProcessing = false;
    }
    revalidatePath('/dock');
}

async function handleCheckStatus() {
    'use server';
    
    if (isProcessing) return;
    isProcessing = true;
    
    try {
        await checkContainerStatus();
    } finally {
        isProcessing = false;
    }
    revalidatePath('/dock');
}

export default async function DockPage() {
    const initialStatus = await checkContainerStatus();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-4">Dock</h1>
            <div className="space-y-4">
                <ActionButtons 
                    isRunning={initialStatus.running}
                    onCheckStatus={handleCheckStatus}
                    onStartContainer={handleStartContainer}
                    onStopContainer={handleStopContainer}
                />

                <div className={`p-4 rounded-lg ${initialStatus.running ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="flex justify-between items-start">
                        <div className="w-full">
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-3 h-3 rounded-full ${initialStatus.running ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <p className="font-medium text-lg">
                                    {initialStatus.status}
                                </p>
                            </div>
                            {initialStatus.containerInfo && (
                                <div className="bg-white/50 rounded-lg p-4">
                                    <div className="flex flex-wrap gap-6">
                                        {!initialStatus.containerInfo.names && (
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Container ID</p>
                                                <p className="font-mono text-sm">{initialStatus.containerInfo.containerId}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Image</p>
                                            <p className="text-sm">{initialStatus.containerInfo.image}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Port</p>
                                            <p className="text-sm">{initialStatus.containerInfo.ports}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                                            <p className="text-sm">{initialStatus.containerInfo.names}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 ml-4 whitespace-nowrap">
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
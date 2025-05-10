import { exec } from 'child_process';
import { NextResponse } from 'next/server';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
    try {
        const { stdout } = await execAsync('docker ps --filter "name=stockfish-server" --format "{{.Status}}"');
        const isRunning = stdout.trim().length > 0;
        
        return NextResponse.json({ 
            running: isRunning,
            status: isRunning ? stdout.trim() : 'Container not running'
        });
    } catch (error) {
        console.error('Error checking container status:', error);
        return NextResponse.json({ 
            running: false,
            status: 'Error checking container status'
        }, { status: 500 });
    }
} 
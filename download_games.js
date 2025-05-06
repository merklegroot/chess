// Function to download text as a file
function downloadTextAsFile(text, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Function to get all game archives
async function getArchives(username) {
    const response = await fetch(`https://www.chess.com/callback/user/games/archives/${username}`);
    const data = await response.json();
    return data.archives;
}

// Function to get games from a specific archive
async function getGamesFromArchive(archiveUrl) {
    const response = await fetch(archiveUrl);
    const data = await response.json();
    return data.games;
}

// Main function to download all games
async function downloadAllGames(username) {
    try {
        console.log('Fetching archives...');
        const archives = await getArchives(username);
        console.log(`Found ${archives.length} months of games`);
        
        let allGames = [];
        
        for (const archiveUrl of archives) {
            console.log(`Processing ${archiveUrl}...`);
            const games = await getGamesFromArchive(archiveUrl);
            allGames = allGames.concat(games);
            
            // Be nice to the server
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Convert games to PGN format
        const pgnContent = allGames
            .filter(game => game.pgn)
            .map(game => game.pgn)
            .join('\n\n');
        
        // Download the file
        const date = new Date().toISOString().split('T')[0];
        downloadTextAsFile(pgnContent, `chess_games_${username}_${date}.pgn`);
        
        console.log(`Successfully downloaded ${allGames.length} games!`);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to download games for a specific month
async function downloadGamesForMonth(username, year, month) {
    try {
        const archiveUrl = `https://www.chess.com/callback/user/games/${username}/${year}/${month}`;
        console.log(`Fetching games from ${year}/${month}...`);
        
        const games = await getGamesFromArchive(archiveUrl);
        
        // Convert games to PGN format
        const pgnContent = games
            .filter(game => game.pgn)
            .map(game => game.pgn)
            .join('\n\n');
        
        // Download the file
        downloadTextAsFile(pgnContent, `chess_games_${username}_${year}_${month}.pgn`);
        
        console.log(`Successfully downloaded ${games.length} games!`);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Usage examples:
// To download all games:
// downloadAllGames('your_username');

// To download games for a specific month:
// downloadGamesForMonth('your_username', 2024, 2);  // For February 2024 
#!/usr/bin/env python3

import requests
import json
import time
from datetime import datetime
import os
from typing import List, Dict, Optional
import argparse
import sys

class ChessComDownloader:
    BASE_URL = "https://api.chess.com/pub/player"
    
    def __init__(self, username: str):
        self.username = username
        self.session = requests.Session()
    
    def check_user_exists(self) -> bool:
        """Check if the user exists and their profile is public."""
        try:
            url = f"{self.BASE_URL}/{self.username}"
            response = self.session.get(url)
            response.raise_for_status()
            return True
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                print(f"Error: User '{self.username}' not found on Chess.com")
            elif e.response.status_code == 403:
                print(f"Error: User '{self.username}' exists but their profile is private")
            else:
                print(f"Error: {str(e)}")
            return False
        except Exception as e:
            print(f"Error checking user: {str(e)}")
            return False
    
    def get_archives(self) -> List[str]:
        """Get list of archive URLs for the player."""
        url = f"{self.BASE_URL}/{self.username}/games/archives"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()["archives"]
    
    def get_games_from_archive(self, archive_url: str) -> List[Dict]:
        """Get games from a specific archive URL."""
        response = self.session.get(archive_url)
        response.raise_for_status()
        return response.json()["games"]
    
    def download_games(self, output_dir: str = "games", start_date: Optional[str] = None, end_date: Optional[str] = None):
        """Download all games and save them as PGN files."""
        if not self.check_user_exists():
            sys.exit(1)
            
        os.makedirs(output_dir, exist_ok=True)
        
        try:
            archives = self.get_archives()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 403:
                print(f"Error: Cannot access games for user '{self.username}'. Their games might be private.")
            else:
                print(f"Error accessing game archives: {str(e)}")
            sys.exit(1)
        except Exception as e:
            print(f"Error getting archives: {str(e)}")
            sys.exit(1)
            
        total_games = 0
        
        for archive_url in archives:
            # Extract date from archive URL
            date_str = archive_url.split("/")[-1]
            archive_date = datetime.strptime(date_str, "%Y/%m")
            
            # Check if we should process this archive based on date filters
            if start_date:
                start = datetime.strptime(start_date, "%Y-%m")
                if archive_date < start:
                    continue
            if end_date:
                end = datetime.strptime(end_date, "%Y-%m")
                if archive_date > end:
                    continue
            
            print(f"Processing games from {date_str}...")
            
            try:
                games = self.get_games_from_archive(archive_url)
                
                # Save games to PGN file
                pgn_filename = os.path.join(output_dir, f"{date_str.replace('/', '-')}.pgn")
                with open(pgn_filename, "w") as f:
                    for game in games:
                        if "pgn" in game:
                            f.write(game["pgn"] + "\n\n")
                
                total_games += len(games)
                print(f"Saved {len(games)} games to {pgn_filename}")
                
                # Be nice to the API
                time.sleep(1)
                
            except Exception as e:
                print(f"Error processing archive {archive_url}: {str(e)}")
                continue
        
        print(f"\nDownload complete! Total games downloaded: {total_games}")

def main():
    parser = argparse.ArgumentParser(description="Download chess.com game history")
    parser.add_argument("username", help="Chess.com username")
    parser.add_argument("--output", "-o", default="games", help="Output directory for PGN files")
    parser.add_argument("--start-date", help="Start date (YYYY-MM)")
    parser.add_argument("--end-date", help="End date (YYYY-MM)")
    
    args = parser.parse_args()
    
    downloader = ChessComDownloader(args.username)
    downloader.download_games(
        output_dir=args.output,
        start_date=args.start_date,
        end_date=args.end_date
    )

if __name__ == "__main__":
    main()
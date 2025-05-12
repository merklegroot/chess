/* the .env file looks like this:
CHESSVIEW_APP_NAME=ChessView
CHESSVIEW_ANALYSIS_DEPTH=20
CHESSVIEW_STOCKFISH_WORKER_COUNT=4
*/

const optionsNamespace = 'CHESSVIEW_';

type AppOptions = Record<string, string | number>;

class OptionsManager {
  private static instance: OptionsManager;
  private cachedOptions: AppOptions | null = null;

  private constructor() {}

  static getInstance(): OptionsManager {
    if (!OptionsManager.instance) {
      OptionsManager.instance = new OptionsManager();
    }
    return OptionsManager.instance;
  }

  /** List all options in the .env file, converting them to typescript convention.
   * For example, CHESSVIEW_APP_NAME=ChessView will be converted to appName: 'ChessView'.
   * CHESSVIEW_ANALYSIS_DEPTH=20 will be converted to analysisDepth: 20.
   */
  list(): AppOptions {
    // Return cached result if available
    if (this.cachedOptions) {
      return this.cachedOptions;
    }

    const options: AppOptions = {};
    
    // Get all environment variables
    const env = process.env;
    
    // Filter and convert keys that start with our namespace
    Object.keys(env).forEach(key => {
      if (key.startsWith(optionsNamespace)) {
        // Remove namespace prefix and convert to camelCase
        const camelKey = key
          .slice(optionsNamespace.length) // Remove prefix
          .toLowerCase() // Convert to lowercase
          .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()); // Convert snake_case to camelCase
        
        // Get the value and convert to number if it's numeric
        const value = env[key] || '';
        options[camelKey] = /^\d+$/.test(value) ? Number(value) : value;
      }
    });

    // Cache the result
    this.cachedOptions = options;
    return options;
  }
}

// Create a singleton instance
const manager = OptionsManager.getInstance();

export const appOptions = {
  list: () => manager.list()
};

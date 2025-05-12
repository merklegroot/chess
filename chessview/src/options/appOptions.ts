const optionsNamespace = 'CHESSVIEW_';


class OptionsManager {
  private static instance: OptionsManager;
  private cachedOptions: Record<string, string | number> | undefined = undefined;

  private constructor() {}

  static getInstance(): OptionsManager {
    if (!OptionsManager.instance) {
      OptionsManager.instance = new OptionsManager();
    }
    return OptionsManager.instance;
  }

  /** List all options in the .env file, converting them to typescript convention.
   */
  list(): Record<string, string | number> {
    // Return cached result if available
    if (this.cachedOptions) {
      return this.cachedOptions;
    }

    const options: Record<string, string | number> = {};
    
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
  list: () => manager.list(),
  getChessDotComUserName: (): string => {
    const options = manager.list();
    const username = options["chessDotComUserName"] as string;
    return username || '(Username not configured)';
  }
};

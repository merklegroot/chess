import { appOptions } from '@/options/appOptions';

function formatKey(key: string): string {
  // Convert camelCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
}

export default async function ConfigPage() {
  // Get options on the server side
  const options = appOptions.list();
  const entries = Object.entries(options);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Configuration</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {entries.map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {formatKey(key)}
                  </label>
                  <div className="mt-1 text-sm text-gray-900 font-mono">
                    {value.toString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="prose">
            <p className="text-sm text-gray-500">
              {JSON.stringify(entries, null, 2)}
            </p>
          </div>

          <div className="prose">
            <p className="text-sm text-gray-500">
              All configuration values are loaded from environment variables with the CHESSVIEW_ prefix.
              Values are cached after first load.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
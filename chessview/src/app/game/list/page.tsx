export default function GameListPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Games</h1>
      <div className="space-y-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Active Games</h2>
          <div className="text-gray-600">
            No active games found.
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Game History</h2>
          <div className="text-gray-600">
            No previous games found.
          </div>
        </div>
      </div>
    </div>
  );
} 
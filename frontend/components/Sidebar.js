import Link from 'next/link';

export default function Sidebar() {
  return (
    <nav className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-blue-400">Mission Control</h1>
        <p className="text-sm text-gray-400 mt-1">Agent Dashboard</p>
      </div>
      
      <ul className="space-y-2">
        <li>
          <Link 
            href="/" 
            className="block px-3 py-2 rounded-lg bg-gray-700 text-blue-300 font-medium"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            href="/agents" 
            className="block px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300 transition-colors"
          >
            Agents
          </Link>
        </li>
        <li>
          <Link 
            href="/tasks" 
            className="block px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300 transition-colors"
          >
            Tasks
          </Link>
        </li>
        <li>
          <Link 
            href="/activity" 
            className="block px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300 transition-colors"
          >
            Activity
          </Link>
        </li>
      </ul>

      <div className="mt-8 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">Asep Workspace</p>
        <p className="text-xs text-gray-600 mt-1">v1.0.0</p>
      </div>
    </nav>
  );
}

import { useState } from 'react';
import FarmVisitForm from './components/FarmVisitForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';

function App() {
  const [view, setView] = useState<'form' | 'admin'>('form');
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('admin_authenticated') === 'true'
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setView('form');
  };

  return (
    <div className="min-h-screen">
      {view === 'form' ? (
        <div>
          <div className="fixed top-4 right-4 z-10">
            <button
              onClick={() => setView('admin')}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-2 border-gray-200"
            >
              Admin Dashboard
            </button>
          </div>
          <FarmVisitForm />
        </div>
      ) : isAuthenticated ? (
        <div>
          <div className="fixed top-4 left-4 z-10">
            <button
              onClick={() => setView('form')}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-2 border-gray-200"
            >
              Back to Form
            </button>
          </div>
          <AdminDashboard onLogout={handleLogout} />
        </div>
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

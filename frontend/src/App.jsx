import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import ManagerDashboard from './pages/ManagerDashboard';
import GlobalDishLibrary from './pages/GlobalDishLibrary';
import ManagerInventory from './pages/ManagerInventory';

function App() {
  const { loadUser, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/manager" element={isAuthenticated ? <ManagerDashboard /> : <Navigate to="/login" />} />
        <Route path="/menu" element={isAuthenticated ? <Menu /> : <Navigate to="/login" />} />
        <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" />} />
        <Route path="/cart" element={isAuthenticated ? <Cart /> : <Navigate to="/login" />} />
        <Route path="/global-dishes" element={isAuthenticated ? <GlobalDishLibrary /> : <Navigate to="/login" />} />
        <Route path="/inventory" element={isAuthenticated ? <ManagerInventory /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

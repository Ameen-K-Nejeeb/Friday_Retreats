import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminUsersList from './pages/admin/AdminUsersList';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Admin Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* Redirect /admin directly to dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<div className="p-4 text-gray-500">Dashboard Metrics Coming Soon...</div>} />
            <Route path="/admin/users" element={<AdminUsersList />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
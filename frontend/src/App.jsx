import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import SchemeListing from './pages/SchemeListing';
import SchemeDetails from './pages/SchemeDetails';
import Compare from './pages/Compare';
import EligibilityChecker from './pages/EligibilityChecker';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EditProfile from './pages/EditProfile';
import EmiCalculator from './pages/EmiCalculator';
import Rating from './pages/Rating';
import ScrollToTop from './components/ScrollToTop';


// Protected Route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-primary-500">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/schemes" element={<SchemeListing />} />
          <Route path="/schemes/:id" element={<SchemeDetails />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/eligibility" element={<EligibilityChecker />} />
          <Route path="/emi-calculator" element={<EmiCalculator />} />
          <Route path="/rating" element={<Rating />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/edit-profile" 
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;

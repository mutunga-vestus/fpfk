import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { ContentProvider, useContent } from './context/ContentContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Ministries from './pages/Ministries';
import MinistryDetail from './pages/MinistryDetail';
import Sermons from './pages/Sermons';
import Events from './pages/Events';
import Connect from './pages/Connect';
import Give from './pages/Give';
import PlanYourVisit from './pages/PlanYourVisit';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminVerifyEmail from './pages/admin/AdminVerifyEmail';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { content, loading } = useContent();

  const announcement = !loading && content?.home?.announcement?.trim();
  const announcementLink = content?.home?.announcementLink?.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminRoute && <Navbar />}

      {!isAdminRoute && announcement && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-950">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-center">
            <span className="font-medium">{announcement}</span>
            {announcementLink &&
              (announcementLink.startsWith('http') ? (
                <a
                  href={announcementLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-2 hover:text-amber-800"
                >
                  Learn more →
                </a>
              ) : (
                <Link
                  to={announcementLink}
                  className="font-semibold underline underline-offset-2 hover:text-amber-800"
                >
                  Learn more →
                </Link>
              ))}
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/ministries" element={<Ministries />} />
        <Route path="/ministries/:slug" element={<MinistryDetail />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/events" element={<Events />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/give" element={<Give />} />
        <Route path="/visit" element={<PlanYourVisit />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/verify-email" element={<AdminVerifyEmail />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ContentProvider>
      <Router>
        <AppLayout />
      </Router>
    </ContentProvider>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Series } from './pages/Series';
import { SeriesDetail } from './pages/SeriesDetail';
import { Exhibitions } from './pages/Exhibitions';
import { AdminAuthProvider, RequireAuth } from './lib/adminAuth';
import { AdminLogin } from './pages/admin/Login';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminHomeSettings } from './pages/admin/HomeSettings';
import { AdminAboutSettings } from './pages/admin/AboutSettings';
import { AdminExhibitions } from './pages/admin/ExhibitionsAdmin';
import { AdminSeries } from './pages/admin/SeriesAdmin';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/series" element={<PublicLayout><Series /></PublicLayout>} />
        <Route path="/series/:id" element={<PublicLayout><SeriesDetail /></PublicLayout>} />
        <Route path="/exhibitions" element={<PublicLayout><Exhibitions /></PublicLayout>} />

        {/* Admin routes */}
        <Route
          path="/securez-admin-logzinz"
          element={
            <AdminAuthProvider>
              <AdminLogin />
            </AdminAuthProvider>
          }
        />
        <Route
          path="/securez-admin-logzinz/dashboard"
          element={
            <AdminAuthProvider>
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            </AdminAuthProvider>
          }
        >
          <Route index element={<AdminHomeSettings />} />
          <Route path="about" element={<AdminAboutSettings />} />
          <Route path="exhibitions" element={<AdminExhibitions />} />
          <Route path="series" element={<AdminSeries />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

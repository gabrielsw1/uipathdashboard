import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import ROI from './pages/ROI';
import RealtimeMonitoring from './pages/RealtimeMonitoring';
import Layout from './components/ui/Layout';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/roi"
          element={
            <Layout>
              <ROI />
            </Layout>
          }
        />
        <Route
          path="/monitoring"
          element={
            <Layout>
              <RealtimeMonitoring />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


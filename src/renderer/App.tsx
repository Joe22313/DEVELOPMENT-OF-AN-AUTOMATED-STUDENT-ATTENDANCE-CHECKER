import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import { Detection, Authentication } from 'pages';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from '../contexts/AuthContext';

export default function App() {
  return (
    <>
      <ToastContainer limit={1} />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Authentication />} />
            <Route path="/detection" element={<Detection />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

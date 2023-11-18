import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, Auth } from 'utils/Interfaces';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCEbXCIIq_IfA6ptYvsyXnSNWALq-IOOvo',
  authDomain: 'student-attendance-592e9.firebaseapp.com',
  projectId: 'student-attendance-592e9',
  storageBucket: 'student-attendance-592e9.appspot.com',
  messagingSenderId: '413378298095',
  appId: '1:413378298095:web:a56fe07d968d169f161b1a',
  measurementId: 'G-CGVJJ1TSHT',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export { db };



interface AppProps {
  children?: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  return useContext(AuthContext);
};

const AuthProvider: React.FC<AppProps> = ({ children }) => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<Auth>();

  useEffect(() => {
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        setAuth({
          uid: user.uid,
          email: user.email || '',
        });
        navigate('/detection');
      } else {
        navigate('/auth');
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

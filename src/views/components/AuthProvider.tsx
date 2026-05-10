import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../../models/lib/firebase';
import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signIn: async () => {},
  logOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // If user logs in, ensure their profile exists
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDocFromServer(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              userId: currentUser.uid,
              name: currentUser.displayName || '',
              email: currentUser.email || '',
              landArea: 0,
              landLocation: '',
              is_admin: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            setIsAdmin(false);
          } else {
            setIsAdmin(userSnap.data().is_admin === true);
          }
        } catch (error) {
          try {
             handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          } catch(e) {}
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      const errorMessage = error?.message || "";
      const errorCode = error?.code || "";
      if (
        errorCode !== 'auth/cancelled-popup-request' && 
        errorCode !== 'auth/popup-closed-by-user' &&
        !errorMessage.includes('cancelled-popup-request') &&
        !errorMessage.includes('popup-closed-by-user')
      ) {
        console.error("Sign in error", error);
      }
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}


"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider, firebaseInitializationError } from '@/lib/firebase'; // auth and googleProvider can be null
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { AppLogo } from '@/components/layout/app-logo';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface AuthContextType {
  currentUser: FirebaseUser | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast(); // Get toast function

  if (firebaseInitializationError || !auth || !googleProvider) {
    let detailedErrorMessage = firebaseInitializationError || "Firebase Auth o Google Provider no están disponibles. Esto usualmente indica un problema con la configuración de Firebase en tu archivo .env o en la consola de Firebase.";
    if (firebaseInitializationError && firebaseInitializationError.includes("auth/configuration-not-found")) {
        detailedErrorMessage = "Error de Firebase (auth/configuration-not-found): No se encontró la configuración de autenticación para el proyecto. Asegúrate de que el `projectId` en tu .env es correcto y que Firebase Authentication está habilitado en la Consola de Firebase para ese proyecto.";
    }


    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-red-50 text-red-700 p-6">
        <AlertTriangle className="h-20 w-20 mb-6 text-red-500" />
        <h1 className="text-3xl font-bold mb-3 text-center">Error Crítico de Configuración de Firebase</h1>
        <p className="text-center mb-2 text-lg">
          LOVERS no pudo conectarse con los servicios de Firebase correctamente.
        </p>
        <div className="bg-red-100 border border-red-300 p-4 rounded-md shadow-sm w-full max-w-2xl mb-6">
          <h2 className="text-xl font-semibold mb-2 text-red-800">Detalles del Error:</h2>
          <pre className="text-sm whitespace-pre-wrap text-left text-red-900">
            {detailedErrorMessage}
          </pre>
        </div>
        <div className="text-center text-sm text-red-600 max-w-2xl">
          <p className="mb-2">
            <strong>Por favor, verifica lo siguiente MUY CUIDADOSAMENTE:</strong>
          </p>
          <ul className="list-disc list-inside text-left mx-auto inline-block space-y-1">
            <li>Que tu archivo <code>.env</code> en la raíz del proyecto existe y tiene el nombre exacto.</li>
            <li>Que las variables (<code>NEXT_PUBLIC_FIREBASE_API_KEY</code>, <code>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code>, <code>NEXT_PUBLIC_FIREBASE_PROJECT_ID</code>, etc.) en tu archivo <code>.env</code> son correctas, válidas, y **corresponden al MISMO proyecto de Firebase**.</li>
            <li>Que **NO hay errores de tipeo** en los nombres de las variables ni en sus valores.</li>
            <li>Que en la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-800">Consola de Firebase</a>, para el proyecto con el <code>projectId</code> que estás usando:
                <ul className="list-disc list-inside pl-6 mt-1">
                    <li>El servicio de **Authentication esté HABILITADO**.</li>
                    <li>El proveedor de inicio de sesión de **Google esté HABILITADO** dentro de Authentication.</li>
                    <li>El dominio desde el que accedes (ej. `localhost` para desarrollo) esté en la lista de **Dominios Autorizados** en Authentication &gt; Sign-in method.</li>
                </ul>
            </li>
            <li>Que has **REINICIADO COMPLETAMENTE** el servidor de desarrollo de Next.js (Ctrl+C y luego <code>npm run dev</code>) después de cualquier cambio en el archivo <code>.env</code>.</li>
          </ul>
          <p className="mt-4">
            El error <code>auth/configuration-not-found</code> específicamente sugiere un problema con el <code>projectId</code> o que la autenticación no está habilitada para ese proyecto. El error <code>auth/api-key-not-valid</code> indica un problema con tu <code>apiKey</code>. El error <code>auth/unauthorized-domain</code> indica que el dominio actual no está en la lista de dominios autorizados en Firebase.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth!, (user) => { // auth is non-null here
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth!, googleProvider!); // auth and googleProvider non-null here
      setCurrentUser(result.user);
      return result.user;
    } catch (error: any) {
      console.error("Error during Google sign-in:", error);
      let title = "Error de Inicio de Sesión";
      let description = "Ocurrió un error al intentar iniciar sesión con Google. Por favor, inténtalo de nuevo.";

      if (error.code === 'auth/unauthorized-domain') {
        title = "Dominio No Autorizado";
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'tu-dominio-actual';
        description = `El dominio "${currentDomain}" desde el que intentas iniciar sesión NO ESTÁ AUTORIZADO en tu configuración de Firebase. **Esto se soluciona únicamente en la Consola de Firebase (no cambiando el código de la app)**: Ve a Authentication > Sign-in method > Dominios autorizados y añade "${currentDomain}". Si es 'localhost', añade 'localhost'.`;
      } else if (error.code === 'auth/popup-closed-by-user') {
        title = "Inicio de Sesión Cancelado";
        description = "Has cerrado la ventana de inicio de sesión de Google. Por favor, inténtalo de nuevo si deseas continuar.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        title = "Múltiples Solicitudes";
        description = "Se canceló la ventana emergente porque se abrió otra. Por favor, intenta iniciar sesión de nuevo.";
      } else if (error.code === 'auth/popup-blocked') {
        title = "Ventana Emergente Bloqueada";
        description = "El navegador bloqueó la ventana de inicio de sesión. Por favor, permite las ventanas emergentes para este sitio e inténtalo de nuevo.";
      }
      
      toast({
        variant: "destructive",
        title: title,
        description: description,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signOutUser = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth!); // auth is non-null here
      setCurrentUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
       toast({
        variant: "destructive",
        title: "Error al Cerrar Sesión",
        description: "Ocurrió un error al intentar cerrar sesión. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !currentUser && !firebaseInitializationError) { 
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-primary p-4">
        <AppLogo className="h-16 w-16 mb-4 animate-pulse" />
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Cargando LOVERS...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

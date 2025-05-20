
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useUserData } from '@/hooks/use-user-data';
import ProfileForm from '@/components/profile/profile-form';
import { Loader2, LogIn } from 'lucide-react';
import { AppLogo } from '@/components/layout/app-logo';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { currentUser: firebaseUser, isLoading: isAuthLoading, signInWithGoogle } = useAuth();
  const { currentUserProfile, isLoading: isProfileLoading } = useUserData();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthLoading && firebaseUser && !isProfileLoading && currentUserProfile) {
      router.replace('/matches');
    }
  }, [isClient, firebaseUser, isAuthLoading, currentUserProfile, isProfileLoading, router]);

  if (!isClient || isAuthLoading) {
    // This initial loading is now handled by AuthProvider for a cleaner UX
    // If AuthProvider is still loading, it shows a full-page loader.
    // If AuthProvider has loaded but this page is still determining state, show a smaller loader.
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-primary p-4">
        <AppLogo className="h-16 w-16 mb-4" />
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Un momento...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    // Not authenticated
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="py-4 border-b">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AppLogo />
              <span className="text-xl font-bold text-primary">LOVERS</span>
            </div>
            <Button onClick={signInWithGoogle}>
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión con Google
            </Button>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          <AppLogo className="h-24 w-24 mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Bienvenido/a a LOVERS</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
            Inicia sesión para crear tu perfil, descubrir coincidencias y encontrar tu conexión ideal.
          </p>
          <Button onClick={signInWithGoogle} size="lg" className="text-lg py-6 px-8">
            <LogIn className="mr-2 h-5 w-5" />
            Continuar con Google
          </Button>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LOVERS. Encuentra tu conexión.
        </footer>
      </div>
    );
  }

  // Authenticated, but profile might be loading or non-existent
  if (isProfileLoading && firebaseUser) {
     return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-primary p-4">
        <AppLogo className="h-16 w-16 mb-4" />
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Cargando tu perfil...</p>
      </div>
    );
  }

  if (firebaseUser && !currentUserProfile) {
    // Authenticated, but no profile data yet, show profile form
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="py-4 border-b">
          <div className="container mx-auto px-4 flex items-center gap-2">
            <AppLogo />
            <span className="text-xl font-bold text-primary">LOVERS</span>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">¡Casi listo/a, {firebaseUser.displayName || "Usuario"}!</h1>
            <p className="text-md md:text-lg text-muted-foreground">
              Completa tu perfil para empezar a encontrar coincidencias.
            </p>
          </div>
          <ProfileForm />
        </main>
         <footer className="py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LOVERS.
        </footer>
      </div>
    );
  }
  
  // Fallback while redirecting if all conditions met
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-primary p-4">
       <AppLogo className="h-16 w-16 mb-4" />
       <Loader2 className="h-12 w-12 animate-spin" />
       <p className="mt-4 text-lg text-muted-foreground">Llevándote a tus coincidencias...</p>
    </div>
  );
}


"use client"; // Add "use client" for hooks like useAuth and useRouter

import AppHeader from '@/components/layout/app-header';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AppLogo } from '@/components/layout/app-logo';

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/'); // Redirect to home if not authenticated
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-primary p-4">
        <AppLogo className="h-16 w-16 mb-4 animate-pulse" />
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!currentUser) {
    // This case should be handled by useEffect redirect, but as a fallback or during redirect:
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-primary p-4">
        <p className="text-lg text-muted-foreground">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LOVERS. Encuentra tu conexión.
      </footer>
    </div>
  );
}

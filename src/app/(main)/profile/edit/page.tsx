
"use client";

import ProfileForm from '@/components/profile/profile-form';
import { useUserData } from '@/hooks/use-user-data';
import { useAuth } from '@/context/auth-context'; // Import useAuth
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function EditProfilePage() {
  const { currentUser: firebaseUser, isLoading: isAuthLoading } = useAuth();
  const { currentUserProfile, isLoading: isProfileLoading } = useUserData();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthLoading && !firebaseUser) {
      // If not authenticated, redirect to home
      router.replace('/');
    } else if (isClient && !isAuthLoading && firebaseUser && !isProfileLoading && !currentUserProfile) {
      // Authenticated, but no profile exists, redirect to home to create one
      router.replace('/');
    }
  }, [isClient, firebaseUser, currentUserProfile, isAuthLoading, isProfileLoading, router]);

  if (!isClient || isAuthLoading || (firebaseUser && isProfileLoading)) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!firebaseUser || !currentUserProfile) {
     // This case should be handled by useEffect redirect, but as a fallback:
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <p>Redirigiendo...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">Edita Tu Perfil</h1>
      <ProfileForm isEditing={true} />
    </div>
  );
}

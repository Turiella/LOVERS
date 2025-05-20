
"use client";

import MatchMosaic from '@/components/matches/match-mosaic';
import { useUserData } from '@/hooks/use-user-data';
import { useAuth } from '@/context/auth-context';
import { findMatches } from '@/lib/matchmaking';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';
import { Loader2, Users } from 'lucide-react';

export default function MatchesPage() {
  const { currentUser: firebaseUser, isLoading: isAuthLoading } = useAuth();
  // Obtener las funciones y datos de likes de useUserData
  const { 
    currentUserProfile, 
    otherUsers, 
    isLoading: isProfileLoading,
    addCurrentUserLike,
    hasCurrentUserLiked 
  } = useUserData();
  const router = useRouter();
  const [matchedProfiles, setMatchedProfiles] = useState<UserProfile[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthLoading && !isProfileLoading) {
      if (!firebaseUser || !currentUserProfile) {
        router.replace('/'); 
      } else {
        const matches = findMatches(currentUserProfile, otherUsers);
        setMatchedProfiles(matches);
        setIsLoadingMatches(false);
      }
    }
  }, [isClient, firebaseUser, currentUserProfile, otherUsers, isAuthLoading, isProfileLoading, router]);

  const overallLoading = !isClient || isAuthLoading || (firebaseUser && isProfileLoading) || isLoadingMatches;

  if (overallLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Buscando tus coincidencias...</p>
      </div>
    );
  }

  if (!currentUserProfile) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p className="text-lg text-muted-foreground">Configura tu perfil para ver coincidencias.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
         <Users className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Tus Coincidencias
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Aquí tienes perfiles que coinciden con tus preferencias y cuyas preferencias coinciden contigo. ¡Feliz conexión!
        </p>
      </div>
      {/* Pasar las funciones de likes a MatchMosaic */}
      <MatchMosaic 
        profiles={matchedProfiles} 
        addCurrentUserLike={addCurrentUserLike}
        hasCurrentUserLiked={hasCurrentUserLiked}
      />
    </div>
  );
}

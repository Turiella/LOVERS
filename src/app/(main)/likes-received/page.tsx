
"use client";

import MatchMosaic from '@/components/matches/match-mosaic';
import { useUserData } from '@/hooks/use-user-data';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';
import { Loader2, HeartHandshake } from 'lucide-react';

export default function LikesReceivedPage() {
  const { currentUser: firebaseUser, isLoading: isAuthLoading } = useAuth();
  const { 
    currentUserProfile, 
    otherUsers, 
    isLoading: isProfileLoading,
    addCurrentUserLike,
    hasCurrentUserLiked 
  } = useUserData();
  const router = useRouter();
  const [profilesWhoLikedCurrent, setProfilesWhoLikedCurrent] = useState<UserProfile[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingLikes, setIsLoadingLikes] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthLoading && !isProfileLoading) {
      if (!firebaseUser || !currentUserProfile) {
        router.replace('/'); 
      } else {
        const likedProfiles = otherUsers.filter(user => user.hasLikedCurrentUser === true);
        setProfilesWhoLikedCurrent(likedProfiles);
        setIsLoadingLikes(false);
      }
    }
  }, [isClient, firebaseUser, currentUserProfile, otherUsers, isAuthLoading, isProfileLoading, router]);

  const overallLoading = !isClient || isAuthLoading || (firebaseUser && isProfileLoading) || isLoadingLikes;

  if (overallLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando a quién le gustas...</p>
      </div>
    );
  }

  if (!currentUserProfile) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p className="text-lg text-muted-foreground">Configura tu perfil para ver tus likes recibidos.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
         <HeartHandshake className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          ¡Les Gustas!
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Estos son los perfiles a los que les has gustado. ¡Devuélveles el match si también te interesan!
        </p>
      </div>
      <MatchMosaic 
        profiles={profilesWhoLikedCurrent} 
        addCurrentUserLike={addCurrentUserLike}
        hasCurrentUserLiked={hasCurrentUserLiked}
      />
    </div>
  );
}

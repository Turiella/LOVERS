
"use client";

import type { UserProfile } from '@/lib/types';
import ProfileCard from './profile-card';
import { Frown } from 'lucide-react';

interface MatchMosaicProps {
  profiles: UserProfile[];
  addCurrentUserLike: (toUserId: string) => void; // Nueva prop
  hasCurrentUserLiked: (toUserId: string) => boolean; // Nueva prop
}

export default function MatchMosaic({ profiles, addCurrentUserLike, hasCurrentUserLiked }: MatchMosaicProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <Frown className="h-24 w-24 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Aún No Hay Coincidencias</h2>
        <p className="text-muted-foreground max-w-md">
          Parece que no hay perfiles que coincidan con tus criterios en este momento, o tu perfil es nuevo.
          Las coincidencias se actualizan regularmente, ¡así que vuelve pronto! También puedes intentar ajustar tus preferencias.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {profiles.map((profile, index) => (
        <ProfileCard 
          key={profile.id} 
          profile={profile} 
          index={index}
          addCurrentUserLike={addCurrentUserLike} // Pasar la función
          hasCurrentUserLiked={hasCurrentUserLiked} // Pasar la función
        />
      ))}
    </div>
  );
}

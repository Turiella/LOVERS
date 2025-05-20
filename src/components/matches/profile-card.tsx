
"use client";

import Image from 'next/image';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Heart, Tag, Smile, CheckCircle2, MessageSquare, Images, Gem } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { useAuth } from '@/context/auth-context'; 
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProfileCardProps {
  profile: UserProfile;
  index: number;
  addCurrentUserLike: (toUserId: string) => void;
  hasCurrentUserLiked: (toUserId: string) => boolean;
}

export default function ProfileCard({ profile, index, addCurrentUserLike, hasCurrentUserLiked }: ProfileCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser: firebaseUser } = useAuth();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(hasCurrentUserLiked(profile.id));
  }, [profile.id, hasCurrentUserLiked]);

  const handleMatchClick = () => {
    if (!liked) {
      addCurrentUserLike(profile.id);
      setLiked(true);
      toast({
        title: "¡Match Enviado!",
        description: `Le has dado Match a ${profile.name}.`,
      });
    }
  };

  const isMutualMatch = liked && profile.hasLikedCurrentUser === true;

  const handleChatClick = () => {
    if (!firebaseUser || !isMutualMatch) return;
    const chatId = [firebaseUser.uid, profile.id].sort().join('_');
    router.push(`/chat/${chatId}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card 
          className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer animate-in fade-in-0 zoom-in-95 group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-0 aspect-square relative">
            <Image
              src={profile.enhancedPhotoUrl || profile.photoUrl}
              alt={profile.name}
              fill // Usar fill en lugar de layout="fill" objectFit="cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" // Ayuda a Next/Image a optimizar
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="dating profile"
              priority={index < 5} // Priorizar la carga de las primeras imágenes visibles
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
              <h3 className="text-lg font-semibold text-white truncate">{profile.name}, {profile.age}</h3>
              <p className="text-sm text-gray-200">{profile.gender}</p>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh]">
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-6"> {/* Ajustar 120px según el alto del header y footer del diálogo */}
          <DialogHeader className="items-center text-center">
            <Image 
              src={profile.enhancedPhotoUrl || profile.photoUrl} 
              alt={profile.name} 
              width={150} 
              height={150} 
              className="rounded-full border-4 border-primary object-cover aspect-square"
              data-ai-hint="profile avatar large"
            />
            <DialogTitle className="text-3xl font-bold mt-4">{profile.name}, {profile.age}</DialogTitle>
            <DialogDescription className="text-md">
              {profile.gender}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {profile.interests && (
              <div className="flex items-start gap-3">
                <Smile className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Intereses</h4>
                  <p className="text-sm text-muted-foreground">{profile.interests}</p>
                </div>
              </div>
            )}
            {profile.tags && profile.tags.length > 0 && (
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Etiquetas</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Busco</h4>
                <p className="text-sm text-muted-foreground">
                  {profile.preferences.genderPreference}, Edad: {profile.preferences.ageRange}
                </p>
              </div>
            </div>

            {/* Galería Gratuita */}
            {profile.freeGalleryUrls && profile.freeGalleryUrls.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center"><Images className="h-5 w-5 mr-2 text-primary"/>Galería Gratuita</h4>
                <div className="grid grid-cols-3 gap-2">
                  {profile.freeGalleryUrls.map((url, idx) => (
                    <div key={`free-${profile.id}-${idx}`} className="aspect-square relative rounded-md overflow-hidden shadow-md">
                      <Image src={url} alt={`Foto gratuita ${idx + 1} de ${profile.name}`} fill sizes="100px" className="object-cover" data-ai-hint="gallery photo" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Galería Premium */}
            {profile.premiumGalleryUrls && profile.premiumGalleryUrls.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center">
                  <Gem className="h-5 w-5 mr-2 text-primary"/>Galería Premium
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {profile.premiumGalleryUrls.map((url, idx) => (
                    <div key={`premium-${profile.id}-${idx}`} className="aspect-square relative rounded-md overflow-hidden shadow-md">
                       <Image src={url} alt={`Foto premium ${idx + 1} de ${profile.name}`} fill sizes="100px" className="object-cover" data-ai-hint="premium photo" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center italic">
                  Acceso completo a más fotos disponible para miembros Premium.
                </p>
                {/* <Button className="w-full mt-2" variant="outline" size="sm">
                  <Gem className="mr-2 h-4 w-4" /> Desbloquear Galería Premium
                </Button> */}
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 mt-auto border-t"> {/* Asegurar que el footer esté abajo */}
          {isMutualMatch ? (
            <Button onClick={handleChatClick} className="w-full sm:w-auto" size="lg" variant="default">
              <MessageSquare className="mr-2 h-5 w-5" />
              Abrir Chat
            </Button>
          ) : (
            <Button 
              onClick={handleMatchClick} 
              className="w-full sm:w-auto" 
              size="lg"
              disabled={liked}
            >
              {liked ? <CheckCircle2 className="mr-2 h-5 w-5" /> : <Heart className="mr-2 h-5 w-5" />}
              {liked ? "¡Match Enviado!" : "Match"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

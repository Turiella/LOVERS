
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile, UserLike } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from "@/hooks/use-toast";
import { MIN_AGE } from '@/lib/constants';

const BASE_CURRENT_USER_KEY = 'lovers_currentUser_';
const OTHER_USERS_KEY = 'lovers_otherUsers';
const BASE_USER_LIKES_KEY = 'lovers_userLikes_';

const initialOtherUsers: UserProfile[] = [
  {
    id: 'demouser1',
    name: 'Sophia',
    age: 24,
    gender: 'Mujer',
    photoUrl: 'https://placehold.co/300x300.png',
    enhancedPhotoUrl: 'https://placehold.co/300x300.png',
    interests: 'Senderismo, lectura y probar nuevos cafés. Amo los perros y la música indie.',
    tags: ['Entusiasta del Senderismo', 'Ratón de Biblioteca', 'Explorador/a de Cafés', 'Amante de los Perros', 'Música Indie'],
    preferences: { genderPreference: 'Hombres', ageRange: '28-37' },
    createdAt: new Date().toISOString(),
    hasLikedCurrentUser: true,
    freeGalleryUrls: [
      'https://placehold.co/200x200.png?text=Sophia+Galería+1',
      'https://placehold.co/201x200.png?text=Sophia+Galería+2',
      'https://placehold.co/200x201.png?text=Sophia+Galería+3',
    ],
    premiumGalleryUrls: [
      'https://placehold.co/202x202.png?text=Sophia+Premium+1',
      'https://placehold.co/203x202.png?text=Sophia+Premium+2',
    ],
  },
  {
    id: 'demouser2',
    name: 'Liam',
    age: 29,
    gender: 'Hombre',
    photoUrl: 'https://placehold.co/300x300.png',
    enhancedPhotoUrl: 'https://placehold.co/300x300.png',
    interests: 'Tocar la guitarra, programar y explorar la vida nocturna de la ciudad. Gran fan de las películas de ciencia ficción.',
    tags: ['Músico', 'Friki de la Tecnología', 'Noctámbulo/a', 'Fan de la Ciencia Ficción'],
    preferences: { genderPreference: 'Mujeres', ageRange: '18-27' },
    createdAt: new Date().toISOString(),
    hasLikedCurrentUser: true, 
    freeGalleryUrls: [
      'https://placehold.co/200x200.png?text=Liam+Galería+1',
      'https://placehold.co/200x202.png?text=Liam+Galería+2',
    ],
    premiumGalleryUrls: [
      'https://placehold.co/203x203.png?text=Liam+Premium+1',
      'https://placehold.co/204x203.png?text=Liam+Premium+2',
      'https://placehold.co/203x204.png?text=Liam+Premium+3',
    ],
  },
  {
    id: 'demouser3',
    name: 'Olivia',
    age: 35,
    gender: 'Mujer',
    photoUrl: 'https://placehold.co/300x300.png',
    enhancedPhotoUrl: 'https://placehold.co/300x300.png',
    interests: 'Yoga, pintura y cocina vegana. Disfruta de los viajes y los documentales.',
    tags: ['Practicante de Yoga', 'Artista', 'Foodie Vegano/a', 'Viajero/a', 'Aficionado/a a los Documentales'],
    preferences: { genderPreference: 'Ambos', ageRange: '28-37' },
    createdAt: new Date().toISOString(),
    hasLikedCurrentUser: true,
    freeGalleryUrls: [
      'https://placehold.co/200x200.png?text=Olivia+Galería+1',
    ],
  },
  {
    id: 'demouser4',
    name: 'Noah',
    age: 22,
    gender: 'Hombre',
    photoUrl: 'https://placehold.co/300x300.png',
    enhancedPhotoUrl: 'https://placehold.co/300x300.png',
    interests: 'Fotografía, skateboarding y diseño gráfico. Ama los animales y la música rock alternativa.',
    tags: ['Fotógrafo/a', 'Skateboarder', 'Diseñador/a Gráfico/a', 'Amante de los Animales', 'Rock Alternativo'],
    preferences: { genderPreference: 'Mujeres', ageRange: '18-27' },
    createdAt: new Date().toISOString(),
    premiumGalleryUrls: [
      'https://placehold.co/200x200.png?text=Noah+Premium+1',
      'https://placehold.co/200x203.png?text=Noah+Premium+2',
    ],
  },
    {
    id: 'demouser5',
    name: 'Emma',
    age: 27,
    gender: 'Mujer',
    photoUrl: 'https://placehold.co/300x300.png',
    enhancedPhotoUrl: 'https://placehold.co/300x300.png',
    interests: 'Viajar por el mundo, aprender nuevos idiomas y bailar salsa. Apasionada por la conservación marina.',
    tags: ['Aventurera Global', 'Políglota', 'Bailarina de Salsa', 'Ecologista Marina'],
    preferences: { genderPreference: 'Hombres', ageRange: '28-37' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demouser6',
    name: 'Lucas',
    age: 31,
    gender: 'Hombre',
    photoUrl: 'https://placehold.co/300x300.png',
    enhancedPhotoUrl: 'https://placehold.co/300x300.png',
    interests: 'Cocina gourmet, cine clásico y jugar al ajedrez. Disfruta de largas conversaciones y el vino tinto.',
    tags: ['Chef Aficionado', 'Cinéfilo Clásico', 'Estratega del Ajedrez', 'Amante del Vino'],
    preferences: { genderPreference: 'Mujeres', ageRange: '28-37' },
    createdAt: new Date().toISOString(),
    hasLikedCurrentUser: true,
  }
];

const isDataUri = (url: string | undefined): boolean => {
  return typeof url === 'string' && url.startsWith('data:image');
};

export function useUserData() {
  const { currentUser: firebaseUser, isLoading: isAuthLoading, signOutUser } = useAuth();
  const { toast } = useToast();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [otherUsers, setOtherUsers] = useState<UserProfile[]>([]);
  const [currentUserLikes, setCurrentUserLikes] = useState<UserLike[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthLoading) {
      setIsProfileLoading(true);
      if (firebaseUser) {
        const userProfileKey = `${BASE_CURRENT_USER_KEY}${firebaseUser.uid}`;
        const userLikesKey = `${BASE_USER_LIKES_KEY}${firebaseUser.uid}`;
        try {
          const storedUserProfile = localStorage.getItem(userProfileKey);
          if (storedUserProfile) {
            const profile: UserProfile = JSON.parse(storedUserProfile);
            if (profile.age < MIN_AGE) {
              setCurrentUserProfile(null);
              localStorage.removeItem(userProfileKey);
              signOutUser(); 
              toast({
                variant: "destructive",
                title: "Restricción de Edad",
                description: `Debes ser mayor de ${MIN_AGE} años para usar LOVERS. Tu sesión ha sido cerrada y el perfil anterior eliminado.`,
                duration: 7000,
              });
            } else {
              // Ensure gallery arrays are initialized if not present in stored profile
              setCurrentUserProfile({
                ...profile,
                freeGalleryUrls: profile.freeGalleryUrls || [],
                premiumGalleryUrls: profile.premiumGalleryUrls || [],
              });
            }
          } else {
            setCurrentUserProfile(null);
          }
          
          const storedUserLikes = localStorage.getItem(userLikesKey);
          if (storedUserLikes) {
            setCurrentUserLikes(JSON.parse(storedUserLikes));
          } else {
            setCurrentUserLikes([]);
          }
        } catch (error) {
          console.error("Failed to load user data from localStorage:", error);
          setCurrentUserProfile(null);
          setCurrentUserLikes([]);
          toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos del usuario desde localStorage." });
        }
      } else {
        setCurrentUserProfile(null);
        setCurrentUserLikes([]);
      }

      try {
        const storedOtherUsers = localStorage.getItem(OTHER_USERS_KEY);
        if (storedOtherUsers) {
          let usersFromStorage: UserProfile[] = JSON.parse(storedOtherUsers);
          
          usersFromStorage = usersFromStorage.map(storedUser => {
            const correspondingInitialUser = initialOtherUsers.find(initialUser => initialUser.id === storedUser.id);
            if (correspondingInitialUser) {
              return {
                ...storedUser,
                hasLikedCurrentUser: !!correspondingInitialUser.hasLikedCurrentUser,
                // Ensure gallery arrays from initialOtherUsers are preferred if they exist
                freeGalleryUrls: correspondingInitialUser.freeGalleryUrls || storedUser.freeGalleryUrls || [],
                premiumGalleryUrls: correspondingInitialUser.premiumGalleryUrls || storedUser.premiumGalleryUrls || [],
              };
            }
             // Ensure gallery arrays are initialized for users not in initialOtherUsers
            return {
              ...storedUser,
              freeGalleryUrls: storedUser.freeGalleryUrls || [],
              premiumGalleryUrls: storedUser.premiumGalleryUrls || [],
            };
          });
          
          initialOtherUsers.forEach(initialDemoUser => {
            if (!usersFromStorage.find(storedUser => storedUser.id === initialDemoUser.id)) {
              usersFromStorage.push({ // Ensure galleries are initialized for new demo users
                ...initialDemoUser,
                freeGalleryUrls: initialDemoUser.freeGalleryUrls || [],
                premiumGalleryUrls: initialDemoUser.premiumGalleryUrls || [],
              });
            }
          });

          setOtherUsers(usersFromStorage);
          localStorage.setItem(OTHER_USERS_KEY, JSON.stringify(usersFromStorage));
        } else {
          const initialUsersWithGalleries = initialOtherUsers.map(u => ({
            ...u,
            freeGalleryUrls: u.freeGalleryUrls || [],
            premiumGalleryUrls: u.premiumGalleryUrls || [],
          }));
          localStorage.setItem(OTHER_USERS_KEY, JSON.stringify(initialUsersWithGalleries));
          setOtherUsers(initialUsersWithGalleries);
        }
      } catch (error) {
        console.error("Failed to load/sync other users from localStorage:", error);
        const initialUsersWithGalleries = initialOtherUsers.map(u => ({
            ...u,
            freeGalleryUrls: u.freeGalleryUrls || [],
            premiumGalleryUrls: u.premiumGalleryUrls || [],
          }));
        localStorage.setItem(OTHER_USERS_KEY, JSON.stringify(initialUsersWithGalleries)); 
        setOtherUsers(initialUsersWithGalleries);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar otros perfiles. Se restauraron los valores predeterminados." });
      } finally {
        setIsProfileLoading(false);
      }
    }
  }, [isClient, firebaseUser, isAuthLoading, signOutUser, toast]);

  const saveCurrentUserProfile = useCallback((profile: UserProfile) => {
    if (!firebaseUser) {
      console.error("Cannot save profile: no Firebase user authenticated.");
      toast({ variant: "destructive", title: "Error", description: "No estás autenticado para guardar el perfil." });
      return;
    }
    
    const profileWithFirebaseId: UserProfile = {
      ...profile,
      id: firebaseUser.uid, 
      createdAt: profile.createdAt || new Date().toISOString(),
      freeGalleryUrls: profile.freeGalleryUrls || [], // Ensure array exists
      premiumGalleryUrls: profile.premiumGalleryUrls || [], // Ensure array exists
    };
    
    setCurrentUserProfile(profileWithFirebaseId);

    if (isClient) {
      const storableProfile = { ...profileWithFirebaseId };
      
      if (isDataUri(storableProfile.photoUrl)) storableProfile.photoUrl = ""; 
      if (isDataUri(storableProfile.enhancedPhotoUrl)) storableProfile.enhancedPhotoUrl = "";
      
      // Handle freeGalleryUrls for localStorage: filter out Data URIs
      if (storableProfile.freeGalleryUrls) {
        storableProfile.freeGalleryUrls = storableProfile.freeGalleryUrls.filter(url => !isDataUri(url));
      }
      // Similarly for premiumGalleryUrls if they were editable by user (not currently)
      if (storableProfile.premiumGalleryUrls) {
        storableProfile.premiumGalleryUrls = storableProfile.premiumGalleryUrls.filter(url => !isDataUri(url));
      }
      
      const userProfileKey = `${BASE_CURRENT_USER_KEY}${firebaseUser.uid}`;
      try {
        localStorage.setItem(userProfileKey, JSON.stringify(storableProfile));
      } catch (error) {
        console.error("Error saving currentUserProfile to localStorage:", error);
        toast({ variant: "destructive", title: "Error de Almacenamiento", description: "No se pudo guardar el perfil localmente. Es posible que el almacenamiento esté lleno." });
      }
    }
  }, [isClient, firebaseUser, toast]);
  
  const addOtherUser = useCallback((profile: UserProfile) => {
    setOtherUsers(prev => {
      const newUsers = [...prev, {
        ...profile, 
        createdAt: profile.createdAt || new Date().toISOString(),
        freeGalleryUrls: profile.freeGalleryUrls || [],
        premiumGalleryUrls: profile.premiumGalleryUrls || [],
      }];
      if (isClient) {
        try {
          localStorage.setItem(OTHER_USERS_KEY, JSON.stringify(newUsers));
        } catch (error) {
          console.error("Error saving otherUsers to localStorage:", error);
          toast({ variant: "destructive", title: "Error de Almacenamiento", description: "No se pudieron guardar los otros perfiles." });
        }
      }
      return newUsers;
    });
  }, [isClient, toast]);

  const addCurrentUserLike = useCallback((toUserId: string) => {
    if (!firebaseUser) {
      console.error("Cannot add like: no Firebase user authenticated.");
      return;
    }
    const newLike: UserLike = {
      toUserId,
      timestamp: new Date().toISOString(),
    };
    setCurrentUserLikes(prevLikes => {
      const updatedLikes = [...prevLikes.filter(like => like.toUserId !== toUserId), newLike]; 
      if (isClient) {
        const userLikesKey = `${BASE_USER_LIKES_KEY}${firebaseUser.uid}`;
        try {
          localStorage.setItem(userLikesKey, JSON.stringify(updatedLikes));
        } catch (error) {
          console.error("Error saving currentUserLikes to localStorage:", error);
           toast({ variant: "destructive", title: "Error de Almacenamiento", description: "No se pudo guardar el 'Me gusta'." });
        }
      }
      return updatedLikes;
    });
  }, [isClient, firebaseUser, toast]);

  const hasCurrentUserLiked = useCallback((toUserId: string): boolean => {
    return currentUserLikes.some(like => like.toUserId === toUserId);
  }, [currentUserLikes]);

  return { 
    currentUserProfile, 
    otherUsers, 
    isLoading: isAuthLoading || (firebaseUser && isProfileLoading),
    saveCurrentUserProfile, 
    addOtherUser,
    currentUserLikes,
    addCurrentUserLike,
    hasCurrentUserLiked,
  };
}


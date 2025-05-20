
"use client";

import Link from 'next/link';
import { AppLogo } from './app-logo';
import { Button } from '@/components/ui/button';
import { Home, UserCircle2, LogOut, LogIn, HeartHandshake, User } from 'lucide-react'; // Añadido HeartHandshake
import { useUserData } from '@/hooks/use-user-data';
import { useAuth } from '@/context/auth-context'; // Import useAuth
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';


export default function AppHeader() {
  const { currentUser: firebaseUser, isLoading: isAuthLoading, signInWithGoogle, signOutUser } = useAuth();
  const { currentUserProfile } = useUserData(); // Get profile data
  const router = useRouter();

  const handleLogout = async () => {
    await signOutUser();
    router.push('/'); // Redirect to home after logout
  };

  const handleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
      // UserData hook will pick up the new firebaseUser and load/allow creation of profile
      // If no profile exists, HomePage will show ProfileForm
      // If profile exists, HomePage will redirect to /matches
      router.push('/'); // Go to home page to trigger profile check/creation or redirect
    }
  };
  
  const getInitials = (name: string | undefined | null) => {
    if (!name) return "LV"; // LOVERS
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const displayName = currentUserProfile?.name || firebaseUser?.displayName;
  const displayPhotoUrl = currentUserProfile?.enhancedPhotoUrl || currentUserProfile?.photoUrl || firebaseUser?.photoURL;
  const displayAge = currentUserProfile?.age;
  const displayGender = currentUserProfile?.gender;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={firebaseUser && currentUserProfile ? "/matches" : "/"} className="flex items-center gap-2" aria-label="Página de inicio de LOVERS">
          <AppLogo />
          <span className="text-xl font-bold text-primary">LOVERS</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4"> {/* Ajustado gap para móviles */}
          {isAuthLoading ? (
             <Skeleton className="h-10 w-24" />
          ) : firebaseUser ? (
            <>
              {currentUserProfile && ( // Only show links if profile exists
                <>
                  <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                    <Link href="/matches">
                      <span className="inline-flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        Coincidencias
                      </span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                    <Link href="/likes-received">
                      <span className="inline-flex items-center">
                        <HeartHandshake className="mr-2 h-4 w-4" />
                        Les Gustas
                      </span>
                    </Link>
                  </Button>
                  {/* Iconos para móvil/pantallas pequeñas */}
                  <Button variant="ghost" size="icon" asChild className="sm:hidden">
                     <Link href="/matches"aria-label="Coincidencias">
                        <Home className="h-5 w-5" />
                    </Link>
                  </Button>
                   <Button variant="ghost" size="icon" asChild className="sm:hidden">
                     <Link href="/likes-received" aria-label="Les Gustas">
                        <HeartHandshake className="h-5 w-5" />
                    </Link>
                  </Button>
                </>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={displayPhotoUrl || undefined} alt={displayName || "Usuario"} data-ai-hint="profile avatar" />
                      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {currentUserProfile ? (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{displayName}</p>
                          {displayAge && displayGender && (
                            <p className="text-xs leading-none text-muted-foreground">
                              {displayAge} años, {displayGender}
                            </p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile/edit">
                          <span className="inline-flex items-center">
                            <UserCircle2 className="mr-2 h-4 w-4" />
                            Editar Perfil
                          </span>
                        </Link>
                      </DropdownMenuItem>
                       {/* Enlaces para móvil dentro del dropdown si es necesario o si se simplifica arriba */}
                       <DropdownMenuItem asChild className="sm:hidden">
                        <Link href="/matches">
                            <span className="inline-flex items-center">
                                <Home className="mr-2 h-4 w-4" />
                                Coincidencias
                            </span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="sm:hidden">
                        <Link href="/likes-received">
                            <span className="inline-flex items-center">
                                <HeartHandshake className="mr-2 h-4 w-4" />
                                Les Gustas
                            </span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                     <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{firebaseUser.displayName || "Usuario"}</p>
                           <p className="text-xs leading-none text-muted-foreground">
                              Completa tu perfil
                            </p>
                        </div>
                      </DropdownMenuLabel>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={handleLogin}>
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión con Google
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}

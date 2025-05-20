
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { useUserData } from "@/hooks/use-user-data";
import type { UserProfile, Gender, GenderPreference, AgeRangeString } from "@/lib/types";
import { GENDER_OPTIONS, GENDER_PREFERENCE_OPTIONS, AGE_RANGE_OPTIONS, MIN_AGE, MAX_AGE } from "@/lib/constants";
import { enhanceProfilePhotoAction, suggestProfileTagsAction } from "@/app/profile/actions";
import { useState, ChangeEvent, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, UploadCloud, TagsIcon, ImagePlus, XCircle } from "lucide-react";

const MAX_FREE_GALLERY_IMAGES = 3;

const profileFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(50, "El nombre debe tener 50 caracteres o menos."),
  age: z.coerce.number().int().min(MIN_AGE, `Debes tener al menos ${MIN_AGE} años.`).max(MAX_AGE, `La edad debe ser ${MAX_AGE} o menos.`),
  gender: z.enum(GENDER_OPTIONS as [Gender, ...Gender[]], { required_error: "Por favor, selecciona tu género." }),
  photoFile: z.custom<FileList>().refine(fileList => fileList && fileList.length > 0, "Se requiere una foto de perfil.").optional(),
  interests: z.string().max(500, "Los intereses deben tener 500 caracteres o menos.").optional(),
  preferences: z.object({
    genderPreference: z.enum(GENDER_PREFERENCE_OPTIONS as [GenderPreference, ...GenderPreference[]], { required_error: "Por favor, selecciona tu preferencia de género." }),
    ageRange: z.enum(AGE_RANGE_OPTIONS as [AgeRangeString, ...AgeRangeString[]], { required_error: "Por favor, selecciona un rango de edad." }),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  isEditing?: boolean;
}

export default function ProfileForm({ isEditing = false }: ProfileFormProps) {
  const { currentUser: firebaseUser } = useAuth();
  const { currentUserProfile, saveCurrentUserProfile } = useUserData();
  const router = useRouter();
  const { toast } = useToast();

  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUserProfile?.photoUrl || null);
  const [enhancedPhotoPreview, setEnhancedPhotoPreview] = useState<string | null>(currentUserProfile?.enhancedPhotoUrl || null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>(currentUserProfile?.tags || []);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isProcessingTags, setIsProcessingTags] = useState(false);
  const [currentPhotoFile, setCurrentPhotoFile] = useState<File | null>(null);

  const [freeGalleryPreviews, setFreeGalleryPreviews] = useState<string[]>([]);
  const freeGalleryInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUserProfile?.name || firebaseUser?.displayName || "",
      age: currentUserProfile?.age || MIN_AGE,
      gender: currentUserProfile?.gender,
      interests: currentUserProfile?.interests || "",
      preferences: {
        genderPreference: currentUserProfile?.preferences?.genderPreference,
        ageRange: currentUserProfile?.preferences?.ageRange,
      },
    },
  });
  
  useEffect(() => {
    if (isEditing && currentUserProfile) {
      form.reset({
        name: currentUserProfile.name,
        age: currentUserProfile.age,
        gender: currentUserProfile.gender,
        interests: currentUserProfile.interests || "",
        preferences: {
          genderPreference: currentUserProfile.preferences.genderPreference,
          ageRange: currentUserProfile.preferences.ageRange,
        },
      });
      setPhotoPreview(currentUserProfile.photoUrl);
      setEnhancedPhotoPreview(currentUserProfile.enhancedPhotoUrl || null);
      setSuggestedTags(currentUserProfile.tags || []);
      setFreeGalleryPreviews(currentUserProfile.freeGalleryUrls || []);
    } else if (!isEditing && firebaseUser && !currentUserProfile) {
      form.reset({
        name: firebaseUser.displayName || "",
        age: MIN_AGE,
        gender: undefined,
        interests: "",
        preferences: {
          genderPreference: undefined,
          ageRange: undefined,
        },
      });
      setPhotoPreview(null);
      setEnhancedPhotoPreview(null);
      setSuggestedTags([]);
      setFreeGalleryPreviews([]);
    }
  }, [currentUserProfile, form, isEditing, firebaseUser]);


  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setEnhancedPhotoPreview(null); 
        form.setValue('photoFile', event.target.files as FileList, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhancePhoto = async () => {
    if (!photoPreview) {
      toast({ title: "No se ha seleccionado ninguna foto", description: "Por favor, selecciona una foto primero.", variant: "destructive" });
      return;
    }
    setIsProcessingPhoto(true);
    const result = await enhanceProfilePhotoAction({ photoDataUri: photoPreview });
    setIsProcessingPhoto(false);
    if (result.enhancedPhotoDataUri) {
      setEnhancedPhotoPreview(result.enhancedPhotoDataUri);
      toast({ title: "¡Foto Mejorada!", description: "Tu foto ha sido mejorada por IA." });
    } else {
      toast({ title: "Mejora Fallida", description: result.error, variant: "destructive" });
    }
  };

  const handleSuggestTags = async () => {
    const interests = form.getValues("interests");
    if (!interests) {
      toast({ title: "No se proporcionaron intereses", description: "Por favor, escribe algo sobre tus intereses.", variant: "destructive" });
      return;
    }
    setIsProcessingTags(true);
    const result = await suggestProfileTagsAction({ interests });
    setIsProcessingTags(false);
    if (result.tags) {
      setSuggestedTags(result.tags);
      toast({ title: "¡Etiquetas Sugeridas!", description: "La IA ha sugerido algunas etiquetas para tu perfil." });
    } else {
      toast({ title: "Sugerencia de Etiquetas Fallida", description: result.error, variant: "destructive" });
    }
  };

  const handleFreeGalleryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews: string[] = [];
      const filesToProcess = Array.from(files).slice(0, MAX_FREE_GALLERY_IMAGES - freeGalleryPreviews.length);

      if (freeGalleryPreviews.length + filesToProcess.length > MAX_FREE_GALLERY_IMAGES) {
        toast({
          title: "Límite de Imágenes Alcanzado",
          description: `Puedes subir un máximo de ${MAX_FREE_GALLERY_IMAGES} imágenes a tu galería gratuita.`,
          variant: "destructive",
        });
      }
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === filesToProcess.length) {
            setFreeGalleryPreviews(prev => [...prev, ...newPreviews].slice(0, MAX_FREE_GALLERY_IMAGES));
          }
        };
        reader.readAsDataURL(file);
      });
    }
     // Reset file input para permitir volver a seleccionar los mismos archivos si es necesario
    if (freeGalleryInputRef.current) {
      freeGalleryInputRef.current.value = "";
    }
  };

  const removeFreeGalleryImage = (indexToRemove: number) => {
    setFreeGalleryPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!firebaseUser) {
      toast({ title: "Error de Autenticación", description: "Debes iniciar sesión para guardar tu perfil.", variant: "destructive" });
      return;
    }

    if (!isEditing && (!currentPhotoFile && !photoPreview)) {
       toast({ title: "Foto de Perfil Requerida", description: "Por favor, sube una foto de perfil.", variant: "destructive" });
       form.setError("photoFile", { type: "manual", message: "Se requiere una foto de perfil." });
       return;
    }
    
    let finalPhotoUrl = currentUserProfile?.photoUrl || photoPreview!;
    let finalEnhancedPhotoUrl = currentUserProfile?.enhancedPhotoUrl || enhancedPhotoPreview;

    if (currentPhotoFile) { 
        finalPhotoUrl = photoPreview!; 
        finalEnhancedPhotoUrl = enhancedPhotoPreview; 
    }

    const userProfileData: UserProfile = {
      id: firebaseUser.uid,
      name: data.name,
      age: data.age,
      gender: data.gender,
      photoUrl: finalPhotoUrl,
      enhancedPhotoUrl: finalEnhancedPhotoUrl || undefined,
      interests: data.interests,
      tags: suggestedTags,
      preferences: data.preferences,
      createdAt: currentUserProfile?.createdAt || new Date().toISOString(),
      freeGalleryUrls: freeGalleryPreviews, // Incluir las nuevas URLs de la galería
      premiumGalleryUrls: currentUserProfile?.premiumGalleryUrls || [], // Mantener las premium existentes
    };

    saveCurrentUserProfile(userProfileData);
    toast({ title: isEditing ? "¡Perfil Actualizado!" : "¡Perfil Creado!", description: "Tu información ha sido guardada." });
    router.push("/matches");
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-primary">{isEditing ? "Edita Tu Perfil" : "Crea Tu Perfil"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu Nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Tu Edad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu género" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="photoFile"
              render={({ fieldState }) => ( 
                <FormItem>
                  <FormLabel>Foto de Perfil</FormLabel>
                  <FormControl>
                     <div className="flex flex-col items-center space-y-4">
                        <label htmlFor="photo-upload" className="w-full cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center hover:border-primary transition-colors">
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                            <span className="text-primary font-medium">Haz clic para subir una foto</span>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF hasta 5MB</p>
                        </label>
                        <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </div>
                  </FormControl>
                  {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                  {!photoPreview && !isEditing && <FormMessage>Se requiere una foto de perfil para perfiles nuevos.</FormMessage>}
                </FormItem>
              )}
            />
            
            {(photoPreview || enhancedPhotoPreview) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {photoPreview && (
                  <div className="space-y-2 text-center">
                    <FormLabel>Tu Foto</FormLabel>
                    <Image src={photoPreview} alt="Vista previa del perfil" width={200} height={200} className="rounded-lg object-cover mx-auto border" data-ai-hint="profile photo" />
                     <Button type="button" onClick={handleEnhancePhoto} disabled={isProcessingPhoto || !photoPreview} className="w-full md:w-auto">
                      {isProcessingPhoto ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Mejorar con IA
                    </Button>
                  </div>
                )}
                {enhancedPhotoPreview && (
                  <div className="space-y-2 text-center">
                    <FormLabel>Foto Mejorada por IA</FormLabel>
                    <Image src={enhancedPhotoPreview} alt="Vista previa del perfil mejorada" width={200} height={200} className="rounded-lg object-cover mx-auto border" data-ai-hint="enhanced portrait" />
                  </div>
                )}
              </div>
            )}

            {/* Free Gallery Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">Tu Galería Gratuita</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormItem>
                  <FormLabel htmlFor="free-gallery-upload">Añadir fotos a tu galería gratuita (máx. {MAX_FREE_GALLERY_IMAGES})</FormLabel>
                  
                  {/* Styled clickable area - this is a label that triggers the hidden input */}
                  <label 
                    htmlFor="free-gallery-upload" 
                    className={`block w-full cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center hover:border-primary transition-colors ${freeGalleryPreviews.length >= MAX_FREE_GALLERY_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <span className="text-primary font-medium">Seleccionar Imágenes</span>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG hasta 5MB cada una</p>
                  </label>
                  
                  {/* The actual file input, hidden. FormControl wraps this single Input. */}
                  <FormControl> 
                    <Input 
                      id="free-gallery-upload" 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleFreeGalleryChange} 
                      className="hidden"
                      ref={freeGalleryInputRef}
                      disabled={freeGalleryPreviews.length >= MAX_FREE_GALLERY_IMAGES}
                    />
                  </FormControl>
                  <FormDescription>
                    {freeGalleryPreviews.length} de {MAX_FREE_GALLERY_IMAGES} imágenes añadidas.
                  </FormDescription>
                </FormItem>

                {freeGalleryPreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {freeGalleryPreviews.map((previewUrl, index) => (
                      <div key={index} className="relative group aspect-square">
                        <Image src={previewUrl} alt={`Vista previa galería ${index + 1}`} fill sizes="150px" className="rounded-md object-cover border" data-ai-hint="gallery preview"/>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFreeGalleryImage(index)}
                          aria-label="Eliminar imagen de galería"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                 <p className="text-xs text-muted-foreground italic">
                    Nota: Las imágenes nuevas añadidas a la galería solo se guardarán para la sesión actual en este prototipo.
                  </p>
              </CardContent>
            </Card>


            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intereses / Sobre Mí</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Cuéntanos sobre tus hobbies, pasiones, etc." {...field} rows={4} />
                  </FormControl>
                  <FormDescription>Esto ayuda a la IA a sugerir etiquetas relevantes para tu perfil.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
                <Button type="button" onClick={handleSuggestTags} disabled={isProcessingTags || !form.watch("interests")} className="w-full md:w-auto">
                {isProcessingTags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TagsIcon className="mr-2 h-4 w-4" />}
                Sugerir Etiquetas con IA
                </Button>
                {suggestedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {suggestedTags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
                )}
            </div>


            <Card className="bg-accent/20">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Qué Estás Buscando</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="preferences.genderPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoy buscando...</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona preferencia de género" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENDER_PREFERENCE_OPTIONS.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferences.ageRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rango de Edad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona rango de edad preferido" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AGE_RANGE_OPTIONS.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Button type="submit" className="w-full text-lg py-6" disabled={isProcessingPhoto || isProcessingTags || !firebaseUser}>
              {isProcessingPhoto || isProcessingTags ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {isEditing ? "Guardar Cambios" : "Crear Perfil y Encontrar Coincidencias"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


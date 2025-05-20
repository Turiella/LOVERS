
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useUserData } from '@/hooks/use-user-data';
import type { UserProfile, ChatMessage } from '@/lib/types';
import { Loader2, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import Image from 'next/image'; // No se está usando directamente, pero AvatarImage sí.
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '@/lib/firebase'; // Importar instancia de Firestore
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  doc, // Necesario para la referencia a la colección de mensajes
  Timestamp // Para el tipado
} from 'firebase/firestore';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser: firebaseUser, isLoading: isAuthLoading } = useAuth();
  const { currentUserProfile, otherUsers, isLoading: isProfileLoading } = useUserData();

  const [chatPartner, setChatPartner] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = typeof params.chatId === 'string' ? params.chatId : '';

  useEffect(() => {
    if (!isAuthLoading && !isProfileLoading && firebaseUser && db) { // Verificar si db está disponible
      if (!currentUserProfile) {
        router.replace('/');
        return;
      }

      if (chatId) {
        const ids = chatId.split('_');
        const partnerId = ids.find(id => id !== firebaseUser.uid);

        if (partnerId) {
          const foundPartner = otherUsers.find(user => user.id === partnerId);
          setChatPartner(foundPartner || null);
          
          // Suscribirse a los mensajes de Firestore
          const messagesColRef = collection(db, 'chats', chatId, 'messages');
          const q = query(messagesColRef, orderBy('timestamp', 'asc'));

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages: ChatMessage[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              fetchedMessages.push({ 
                id: doc.id, 
                senderId: data.senderId,
                text: data.text,
                timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(), // Convertir Timestamp de Firestore
              });
            });
            setMessages(fetchedMessages);
          }, (error) => {
            console.error("Error al obtener mensajes:", error);
            // Aquí podrías mostrar un toast o mensaje de error al usuario
          });

          setIsLoading(false);
          return () => unsubscribe(); // Limpiar la suscripción al desmontar

        } else {
          setChatPartner(null);
          setIsLoading(false);
        }
      }
    } else if (!isAuthLoading && !firebaseUser) {
      router.replace('/');
      setIsLoading(false);
    } else if (!db && firebaseUser) { // Si db no está disponible pero el usuario sí
        console.error("Firestore no está disponible. Revisa la configuración de Firebase.");
        setIsLoading(false);
        // Podrías mostrar un error aquí
    }
  }, [chatId, firebaseUser, currentUserProfile, otherUsers, isAuthLoading, isProfileLoading, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !firebaseUser || !db || !chatId) return;

    const messagesColRef = collection(db, 'chats', chatId, 'messages');
    try {
      await addDoc(messagesColRef, {
        senderId: firebaseUser.uid,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      // Mostrar un toast o mensaje de error
    }
  };
  
  const getInitials = (name: string | undefined | null) => {
    if (!name) return "??";
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  if (isLoading || isAuthLoading || (firebaseUser && isProfileLoading && !chatPartner && chatId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando chat...</p>
      </div>
    );
  }

  if (!chatPartner || !firebaseUser || !currentUserProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
        <MessageSquare className="h-20 w-20 text-muted-foreground mb-4" />
        <p className="text-xl text-foreground font-semibold mb-2">Chat no encontrado</p>
        <p className="text-muted-foreground mb-6 max-w-md">
          No se pudo encontrar al usuario del chat, el ID del chat es inválido, o no estás autenticado.
        </p>
        <Button onClick={() => router.push('/matches')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Coincidencias
        </Button>
      </div>
    );
  }

  if (!db) { // Mensaje si Firestore no está disponible
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
        <MessageSquare className="h-20 w-20 text-destructive mb-4" />
        <p className="text-xl text-foreground font-semibold mb-2">Error de Conexión</p>
        <p className="text-muted-foreground mb-6 max-w-md">
          No se pudo conectar con el servicio de chat (Firestore). Por favor, verifica la configuración de Firebase y que Firestore esté habilitado.
        </p>
         <Button onClick={() => router.push('/matches')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Coincidencias
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 flex flex-col h-[calc(100vh-8rem)]">
      <Card className="shadow-xl overflow-hidden flex flex-col flex-grow">
        <CardHeader className="relative items-center text-center border-b pb-3 bg-card"> {/* Reducido pb-4 a pb-3 */}
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="absolute top-3 left-3 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver</span>
          </Button>
          <div className="flex flex-col items-center pt-3 md:pt-2"> {/* Reducido pt-8 md:pt-4 a pt-3 md:pt-2 */}
            <Avatar className="h-12 w-12 mb-1 border-2 border-primary"> {/* Reducido h-20 w-20 a h-12 w-12, mb-2 a mb-1, border-4 a border-2 */}
                <AvatarImage src={chatPartner.enhancedPhotoUrl || chatPartner.photoUrl} alt={chatPartner.name} data-ai-hint="profile avatar"/>
                <AvatarFallback>{getInitials(chatPartner.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg font-semibold text-foreground">Chat con {chatPartner.name}</CardTitle> {/* Reducido text-2xl a text-lg, font-bold a font-semibold */}
            <CardDescription className="text-xs text-muted-foreground"> {/* Reducido a text-xs */}
              Estás chateando con {chatPartner.name}.
            </CardDescription>
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-grow p-4 bg-background" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === firebaseUser.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] p-3 rounded-xl shadow ${
                    msg.senderId === firebaseUser.uid 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                      msg.senderId === firebaseUser.uid 
                      ? 'text-primary-foreground/70 text-right' 
                      : 'text-muted-foreground/70 text-left'
                    }`}
                  >
                    {msg.timestamp ? format(new Date(msg.timestamp), 'p', { locale: es }) : 'Enviando...'}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-card">
          {/* Ya no es necesario el aviso de chat no implementado
           <p className="text-xs text-center text-muted-foreground mb-2 italic px-4 py-1 bg-muted/30 rounded-md">
              La funcionalidad de chat en tiempo real no está implementada. Los mensajes solo son visibles en tu sesión.
            </p> 
          */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Escribe un mensaje..." 
              className="flex-grow"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!db} // Deshabilitar si db no está disponible
            />
            <Button type="submit" disabled={!db || newMessage.trim() === ""}>
                <Send className="mr-2 h-4 w-4"/>
                Enviar
            </Button>
          </form>
        </div>
    </Card>
  </div>
  );
}


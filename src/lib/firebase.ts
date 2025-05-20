
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore'; // Importar Firestore

// Imprime la API key directamente para depuración
console.log('Valor de NEXT_PUBLIC_FIREBASE_API_KEY en firebase.ts:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Imprime toda la configuración para ayudar a depurar
console.log('Configuración de Firebase que se está utilizando en firebase.ts:', firebaseConfig);

let app: FirebaseApp | undefined;
let authInstance: Auth | null = null;
let googleAuthProviderInstance: GoogleAuthProvider | null = null;
let firestoreInstance: Firestore | null = null; // Variable para Firestore
let firebaseInitializationError: string | null = null;

if (!firebaseConfig.apiKey) {
  const errorMessage = 'ERROR CRÍTICO: ¡Falta la clave API de Firebase (apiKey)! ' +
    'Por favor, revisa tu archivo .env y asegúrate de que la variable NEXT_PUBLIC_FIREBASE_API_KEY ' +
    'esté configurada correctamente con tu clave API válida de Firebase. ' +
    'Después de verificar o añadir la clave, DEBES REINICIAR tu servidor de desarrollo.';
  console.error(errorMessage);
  firebaseInitializationError = errorMessage;
} else {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase App SDK inicializada.');
    } else {
      app = getApps()[0];
      console.log('Firebase App SDK ya estaba inicializada.');
    }
    
    authInstance = getAuth(app);
    googleAuthProviderInstance = new GoogleAuthProvider();
    firestoreInstance = getFirestore(app); // Inicializar Firestore
    console.log('Firebase Auth, Google Provider y Firestore instanciados correctamente.');

  } catch (error: any) {
    console.error("Error durante la inicialización de Firebase, la obtención de Auth, GoogleAuthProvider o Firestore:", error);
    
    let specificMessage = `Error de Firebase: ${error.message || error.toString()}.`;
    if (error.code === 'auth/configuration-not-found') {
        specificMessage = 'Error de Firebase (auth/configuration-not-found): No se encontró la configuración de autenticación para el proyecto. ';
    } else if (error.code === 'failed-precondition' && error.message.includes('firestore')) {
        specificMessage = 'Error de Firestore (failed-precondition): Es posible que Firestore no esté habilitado en tu proyecto de Firebase o que haya un problema con su configuración. ';
    }
    
    firebaseInitializationError = `${specificMessage} Por favor, verifica tu configuración en el archivo .env (apiKey, authDomain, projectId) ` +
    'y asegúrate de que Firebase Authentication y Firestore Database estén HABILITADOS en la Consola de Firebase para el projectId especificado, ' +
    'y que todos los valores coincidan con los de tu proyecto. Recuerda REINICIAR el servidor de desarrollo después de cualquier cambio en .env.';
    
    app = undefined; 
    authInstance = null;
    googleAuthProviderInstance = null;
    firestoreInstance = null; // Asegurar que firestore es null en caso de error
  }
}

export { app, authInstance as auth, googleAuthProviderInstance as googleProvider, firestoreInstance as db, firebaseInitializationError };

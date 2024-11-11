import { v4 as uuidv4 } from 'uuid';

// Interface pour un utilisateur simulé
interface User {
    uid: string;
    email?: string;
    password?: string;
    displayName?: string;
    emailVerified: boolean;
}

// Classe pour simuler l'authentification Firebase
export default class MockedFireAuth {
    private users: Map<string, User> = new Map();

    constructor() {
        // Initialiser avec un utilisateur par défaut (facultatif)
        const defaultUser: User = {
            uid: 'mock-user-uid',
            email: 'test@example.com',
            emailVerified: true,
            password: 'password123',
            displayName: 'Test User',
        };
        this.users.set(defaultUser.uid, defaultUser);
    }

    // Méthode pour simuler la vérification du token d'identification
    async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
        const user = this.users.get(idToken);
        if (!user) {
            throw new Error('Token invalide');
        }

        // Simuler le décodage du token et renvoyer les informations du token
        return {
            uid: user.uid,
            email: user.email || '',
            email_verified: user.emailVerified,
            display_name: user.displayName || '',
            iss: 'https://securetoken.google.com/mock-project-id',
            aud: 'mock-project-id',
            exp: Math.floor(Date.now() / 1000) + 3600, // Expiration dans 1 heure
            iat: Math.floor(Date.now() / 1000),
            auth_time: Math.floor(Date.now() / 1000),
        };
    }

    // Méthode pour simuler la création d'un utilisateur
    async createUser(email: string, password: string): Promise<User> {
        const uid = uuidv4();  // Générer un UID unique
        const newUser: User = {
            uid,
            email,
            password,
            emailVerified: false,
        };
        this.users.set(uid, newUser);
        return newUser;
    }

    // Méthode pour simuler la connexion d'un utilisateur (en validant le mot de passe)
    async signInWithEmailAndPassword(email: string, password: string): Promise<User> {
        const user = [...this.users.values()].find(
            (user) => user.email === email && user.password === password
        );

        if (!user) {
            throw new Error('Email ou mot de passe invalide');
        }

        return user;
    }

    // Méthode pour simuler la connexion via un provider (par exemple Google)
    async signInWithProvider(provider: string): Promise<User> {
        if (provider === 'google') {
            // Simuler un login via Google
            const googleUser: User = {
                uid: uuidv4(),
                email: 'googleuser@example.com',
                emailVerified: true,
                displayName: 'Google User',
            };
            this.users.set(googleUser.uid, googleUser);
            return googleUser;
        }
        throw new Error('Provider non pris en charge');
    }
}

// Interface pour le DecodedIdToken
export interface DecodedIdToken {
    uid: string;
    email: string;
    email_verified: boolean;
    display_name: string;
    iss: string;
    aud: string;
    exp: number;
    iat: number;
    auth_time: number;
}

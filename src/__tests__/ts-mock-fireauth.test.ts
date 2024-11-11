import MockedFireAuth, { DecodedIdToken } from "../fireauth/mockedFireauth";

describe('MockFirebaseAuth', () => {
    let auth: MockedFireAuth;

    // Before each test, create a new instance of MockFirebaseAuth
    beforeEach(() => {
        auth = new MockedFireAuth();
    });

    // Test for user creation
    test('should create a new user', async () => {
        const user = await auth.createUser('newuser@example.com', 'securepassword');

        // Ensure the user has the expected properties
        expect(user).toHaveProperty('uid');
        expect(user.email).toBe('newuser@example.com');
        expect(user.emailVerified).toBe(false);
        expect(user.password).toBe('securepassword');
    });

    // Test for signing in with email and password
    test('should sign in with valid email and password', async () => {
        const user = await auth.createUser('signinuser@example.com', 'securepassword');

        // Simulate a sign-in
        const loggedInUser = await auth.signInWithEmailAndPassword('signinuser@example.com', 'securepassword');

        // Check if the logged-in user matches the created user
        expect(loggedInUser.uid).toBe(user.uid);
        expect(loggedInUser.email).toBe('signinuser@example.com');
    });

    // Test for signing in with invalid credentials
    test('should throw error for invalid email or password', async () => {
        await auth.createUser('invaliduser@example.com', 'validpassword');

        // Try to sign in with wrong credentials
        await expect(auth.signInWithEmailAndPassword('invaliduser@example.com', 'wrongpassword'))
            .rejects
            .toThrow('Email ou mot de passe invalide');
    });

    // Test for token verification
    test('should verify a valid token', async () => {
        const user = await auth.createUser('tokenuser@example.com', 'password123');

        // Simulate verifying a token (here, we use the uid as the token)
        const decodedToken: DecodedIdToken = await auth.verifyIdToken(user.uid);

        // Ensure the decoded token contains the expected values
        expect(decodedToken.uid).toBe(user.uid);
        expect(decodedToken.email).toBe('tokenuser@example.com');
        expect(decodedToken.email_verified).toBe(false);
        expect(decodedToken.display_name).toBe('');
    });

    // Test for invalid token verification
    test('should throw error for invalid token', async () => {
        await expect(auth.verifyIdToken('invalid-token'))
            .rejects
            .toThrow('Token invalide');
    });

    // Test for sign-in with a provider (e.g., Google)
    test('should sign in with a provider (Google)', async () => {
        const googleUser = await auth.signInWithProvider('google');

        // Ensure the Google user was created and has the expected properties
        expect(googleUser).toHaveProperty('uid');
        expect(googleUser.email).toBe('googleuser@example.com');
        expect(googleUser.emailVerified).toBe(true);
        expect(googleUser.displayName).toBe('Google User');
    });

    // Test for unsupported provider
    test('should throw error for unsupported provider', async () => {
        await expect(auth.signInWithProvider('facebook'))
            .rejects
            .toThrow('Provider non pris en charge');
    });
});

// oidc.ts
import { UserManager, WebStorageStateStore, User } from "oidc-client-ts";
import { goto } from "$app/navigation";
import { isAuthenticated, user } from "./store.js";
import { browser } from "$app/environment";
import { env } from '$env/dynamic/public';

let userManager: UserManager | null = null;

/**
 * Initializes the OIDC UserManager and loads the user from storage.
 * This function combines the setup of OIDC configuration and retrieves the current user session
 * from local storage to restore the authentication state when the app initializes.
 */
async function authorize(): Promise<User|null> {
    if (!browser) return null; // Ensure this runs only in the browser environment

    const root = env.PUBLIC_URL || 'http://localhost:5173';
    const authority = env.PUBLIC_OIDC_URL || "http://id.loc";
    const clientID = env.PUBLIC_OIDC_CLIENT_ID || "284984992713474140";

    // Ensure environment variables are set correctly
    if (!authority || !clientID) {
        console.error("Missing required OIDC configuration. Please check environment variables.");
        return null;
    }

    // Configure the OIDC UserManager with necessary URLs and settings
    const config = {
        redirect_uri: `${root}/auth/oidc/callback`,
        post_logout_redirect_uri: authority,
        silent_redirect_uri: `${root}/auth/oidc/refresh`,  // URL used for silent token renewal
        authority,
        client_id: clientID,
        response_type: "code",  // Authorization Code Flow
        scope: "openid profile email",
        userStore: new WebStorageStateStore({ store: window.localStorage }), // Store the user in localStorage
        automaticSilentRenew: true,  // Automatically attempt silent token renewal
    };

    userManager = new UserManager(config);

    // Listen to events when a user is loaded
    userManager.events.addUserLoaded((loadedUser: User) => {
        console.log('User loaded:', loadedUser);
        user.set(loadedUser);  // Update the Svelte store with the loaded user
        isAuthenticated.set(true);  // Mark the user as authenticated
    });

    // Listen to events when the user is unloaded (e.g., after logout)
    userManager.events.addUserUnloaded(() => {
        console.log('User unloaded');
        user.set(null);  // Clear the user from the Svelte store
        isAuthenticated.set(false);  // Mark the user as unauthenticated
    });

    // Handle errors during silent renew
    userManager.events.addSilentRenewError((err) => {
        console.error('Silent renew error', err);
    });

    // Handle access token expiration and trigger silent renew
    userManager.events.addAccessTokenExpired(() => {
        console.log('Access token expired, attempting silent renew');
        silentLogin();  // Attempt to renew the token silently
    });

    // Load the user from local storage after initializing UserManager
    return await loadUserFromStorage();
}
/**
 * Checks whether the stored user’s token has expired based on the current time and the token’s expiration timestamp.
 * @param expiresAt - The token's expiration timestamp in seconds.
 * @returns {boolean} - Returns true if the token is expired, false if still valid.
 */
function isTokenExpired(expiresAt: number | undefined): boolean {
    if (!expiresAt) return true; // Treat as expired if no expiration information is available
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    return currentTime >= expiresAt; // Token is expired if current time is greater than or equal to expiresAt
}

/**
 * Clears the user authentication state when no valid user or token is found.
 */
function clearUserState(): void {
    user.set(null); // Clear the user store
    isAuthenticated.set(false); // Mark the user as unauthenticated
}

/**
 * Attempts to load the user from local storage if the user has previously logged in.
 * This ensures the authentication state persists after a page refresh.
 */
async function loadUserFromStorage(): Promise<User|null> {
    if (!userManager || !browser) return null;

    try {
        // Get the stored user from the UserManager
        const storedUser = await userManager.getUser();

        if (!storedUser) {
            console.log('No user found in storage.');
            clearUserState();
            return null;
        }

        // Check if the token is expired
        if (isTokenExpired(storedUser.expires_at)) {
            console.log('Stored token is expired.');
            clearUserState();
            return null;
        }

        console.log('User loaded from storage and token is valid:', storedUser);
        user.set(storedUser); // Update the Svelte store with the valid user
        isAuthenticated.set(true); // Mark the user as authenticated

        return storedUser; // Return the loaded user for further processing
    } catch (error) {
        console.error('Error loading user from storage:', error);
        clearUserState(); // Fallback to a cleared state if an error occurs
    }

    return null; // Return null if no valid user is found
}
/**
 * Helper function to execute OIDC actions with centralized error handling.
 */
async function executeWithErrorHandling<T>(action: () => Promise<T>): Promise<T | undefined> {
    try {
        return await action();
    } catch (error) {
        console.error('OIDC action failed', error);
        return undefined;
    }
}

/**
 * Initiates the login process using OIDC, redirecting the user to the OIDC provider.
 */
async function login(): Promise<void> {
    if (!userManager) return;
    console.log('Initiating login');
    await executeWithErrorHandling(() => userManager!.signinRedirect());
}

/**
 * Logs out the user by redirecting to the OIDC provider's logout endpoint.
 */
async function logout(): Promise<void> {
    if (!userManager) return;
    console.log('Initiating logout');
    await executeWithErrorHandling(() => userManager!.signoutRedirect());
}

/**
 * Handles the callback after the user is redirected back from the OIDC provider post-login.
 */
async function handleCallback(): Promise<void> {
    if (!userManager) return;
    await executeWithErrorHandling(async () => {
        await userManager!.signinRedirectCallback();
        goto("/");  // Redirect to the home page after login
    });
}

/**
 * Handles the callback after the silent token renewal process.
 * This is called within an invisible iframe to refresh the access token without user interaction.
 */
async function handleSilentCallback(): Promise<void> {
    if (!userManager) return;
    await executeWithErrorHandling(async () => {
        await userManager!.signinSilentCallback();  // Handle the silent renew response
        goto("/");  // Redirect after successful silent renew (if needed)
    });
}

/**
 * Retrieves the currently authenticated user from the OIDC client.
 */
async function getUser(): Promise<User | null> {
    if (!userManager) return null;
    return await executeWithErrorHandling(() => userManager!.getUser()) || null;
}

/**
 * Initiates silent login (silent renew) to refresh the access token without user interaction.
 * This process happens inside an invisible iframe using the `silent_redirect_uri`.
 */
async function silentLogin(): Promise<void> {
    if (!userManager) return;
    await executeWithErrorHandling(() => userManager!.signinSilent());
}

export { authorize, login, logout, getUser, handleCallback, handleSilentCallback };

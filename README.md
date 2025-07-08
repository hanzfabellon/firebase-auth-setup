# Setting Up Firebase Authentication in a Web App (React + Vite + Tailwind CSS + Shadcn)

A step-by-step guide to building a modern web application with user authentication.

✅ **Prerequisites**

Before you begin, ensure you have the following installed and configured:

-   Node.js (v18 or newer)
-   npm (comes with Node.js)
-   A Firebase project set up in the Firebase Console.

---

**1. 🚀 Create Your Vite + React Project**

First, scaffold a new Vite project using the React + TypeScript template.

```bash
# Create the project
npm create vite@latest sample-app -- --template react-ts

# Navigate into the project directory
cd sample-app

# Install dependencies
npm install
```

**2. 💨 Install & Configure Tailwind CSS**

Follow the official Tailwind CSS documentation for Vite to get it set up.

-   👉 **Follow Steps 2 through 5 of the official guide:** [Tailwind CSS Docs: Using Vite](https://tailwindcss.com/docs/guides/vite)

**3. ✨ Initialize shadcn/ui**

Next, add shadcn/ui to your project for beautiful, accessible components.

-   👉 **Follow Steps 3 through 7 of the official installation guide:** [shadcn/ui Docs: Vite](https://ui.shadcn.com/docs/installation/vite)

**4. ⚙️ Configure Path Aliases (Important!)**

To keep our import statements clean (e.g., `import ... from "@/components/Header"`), we need to tell Vite and TypeScript what the `@` symbol means.

**a. Update `tsconfig.json`:**
Add the `baseUrl` and `paths` properties to your `compilerOptions`.

```json
// tsconfig.json
{
  "compilerOptions": {
    // ... other options
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  // ... rest of the file
}
```

**b. Update `vite.config.ts`:**
Install the `path` package and configure the alias in your Vite config.

```bash
npm install -D @types/node
```

Now, update the file:

```typescript
// vite.config.ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**5. 🔥 Add Firebase to Your Project**

Install the Firebase SDK and create a configuration file.

```bash
npm install firebase
```

### ⚠️ Security Disclaimer: Protect Your Firebase Keys

**NEVER embed your API keys directly in your source code or commit them to a public repository.** Doing so exposes them to the public, which can lead to your Firebase project being abused by others, potentially resulting in high bills and security breaches.

We will use **Environment Variables** to keep your keys secure. These variables are stored in a local file that is **ignored by Git**, so they never leave your machine.

**a. Create a `.env.local` file**
In the root directory of your project (the same level as `package.json`), create a new file named `.env.local`.

**b. Add Your Firebase Keys to `.env.local`**
Go to your Firebase project settings, find your web app, and copy the configuration values. Add them to your `.env.local` file, making sure to prefix each one with `VITE_`. This is required by Vite to expose them to your app.

```ini
# .env.local

# Replace with your REAL Firebase configuration values
VITE_FIREBASE_API_KEY="Apikey."
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:..."
```

**c. Add `.env.local` to `.gitignore`**
Open your `.gitignore` file and add `.env.local` to the end. This prevents your secret keys from ever being committed to Git.

```gitignore
# .gitignore

# ... other ignores

# Local environment variables
.env.local
```

**d. Create the Firebase Initialization File**
Now, create a new file at `src/firebase.ts` and use the environment variables to safely initialize Firebase.

```typescript
// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the services you need
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**6. 🪝 Create a Custom Authentication Hook**

This hook will manage the user's authentication state across your application. Create a new directory and file at `src/hooks/use-auth.tsx`.

*(This code remains the same as your original)*

```tsx
// src/hooks/use-auth.tsx
import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  type User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "@/firebase";

// ... (rest of the hook code is perfect)
interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  const value = { user, loading, loginWithGoogle, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

**7. 🧱 Add Required UI Components**

Use the `shadcn-ui` CLI to add the components we'll need. We'll use `npx`, which is the standard `npm` command for running packages.

```bash
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add button
```
Then install the icon library:
```bash
npm install lucide-react
```

**8. 🎨 Build the User Interface**

Now let's assemble the UI using the components and hooks we've created.

**a. Create the Header Component (`src/components/Header.tsx`)**
*(This code remains the same)*

**b. Update the Main App Component (`src/App.tsx`)**
*(This code remains the same)*

**9. ✅ Run the Application**

You're all set! Restart your development server to load the new environment variables.

```bash
# Press Ctrl+C if it's already running, then:
npm run dev
```

Your app should now be running, featuring a header with a "Login with Google" button. Once you log in, it will display your user information, all while keeping your API keys secure
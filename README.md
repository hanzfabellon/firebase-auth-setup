# Guide to Firebase Auth in React (Vite + Tailwind CSS + Shadcn)

Build a modern, secure web application with user authentication from scratch. This step-by-step guide covers project setup, UI, and secure Firebase integration.

### ✅ Prerequisites

Before you begin, ensure you have the following installed and configured:

*   **Node.js**: `v18` or newer
*   **npm**: Comes bundled with Node.js
*   **Firebase Project**: A project created in the [Firebase Console](https://console.firebase.google.com/) with the "Authentication" service enabled (and Google provider turned on).

---

### 1. 🚀 Create Your Vite + React Project

First, scaffold a new Vite project using the React + TypeScript template.

```bash
# Create the project in a folder named "sample-app"
npm create vite@latest sample-app -- --template react-ts

# Navigate into the project directory
cd sample-app

# Install dependencies
npm install
```

### 2. 💨 Install & Configure Tailwind CSS

Follow the official Tailwind CSS documentation to add it to your Vite project. The official guide is the best source as it's always up-to-date.

*   👉 **Follow Steps 2 through 5 of the official guide:** [Install Tailwind CSS with Vite](https://tailwindcss.com/docs/guides/vite)

After following the guide, your `tailwind.config.js` will be set up, and you'll have imported the Tailwind directives into your main CSS file (e.g., `src/index.css`).

### 3. ✨ Initialize shadcn/ui

Add `shadcn/ui` for a library of beautiful, accessible, and unstyled components.

*   👉 **Follow Steps 3 through 7 of the official installation guide:** [shadcn/ui Docs: Vite](https://ui.shadcn.com/docs/installation/vite)

This process will create a `components.json` file and set up the necessary utilities for you to add components.

### 4. ⚙️ Configure Path Aliases (Important!)

To keep our import statements clean (e.g., `import ... from "@/components/Header"` instead of `../../components/Header`), we'll configure path aliases.

#### a. Update `tsconfig.json`

Add the `baseUrl` and `paths` properties to your `compilerOptions`.

```json:tsconfig.json
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

#### b. Update `vite.config.ts`

First, install the `path` type definitions for Node.js.

```bash
npm install -D @types/node
```

Now, update `vite.config.ts` to resolve the `@` alias.

```typescript:vite.config.ts
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

### 5. 🔥 Add Firebase to Your Project

Install the Firebase SDK and create a secure configuration file.

```bash
npm install firebase
```

> #### ⚠️ Security First: Protect Your Firebase Keys
>
> **NEVER** commit your API keys or other secrets directly into your source code or a public repository like GitHub. We will use **Environment Variables** with Vite to keep your keys secure. These variables are stored in a local `.env.local` file, which is ignored by Git, so they never leave your development machine.

#### a. Create a `.env.local` file

In the **root** of your project (the same level as `package.json`), create a new file named `.env.local`.

#### b. Add Your Firebase Keys to `.env.local`

Go to your Firebase project settings, find your web app, and copy the configuration values. Add them to your `.env.local` file, **prefixing each key with `VITE_`**. This prefix is required by Vite to expose the variables to your client-side code.

```ini:.env.local
# Replace with your REAL Firebase configuration values
VITE_FIREBASE_API_KEY="AIzaSy...Your...Key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef1234567890"
```

> #### ℹ️ How Your `apiKey` Stays Secure
>
> While the `apiKey` is visible in your site's deployed code, it's not a secret password. It only identifies your Firebase project. You can further secure it by:
>
> 1.  **Firebase Auth Authorized Domains**: In the Firebase Console, you can restrict which domains can use your auth services. You can set that only requests from your deployed site and firebase(e.g., `your-app.vercel.app` and `firebaseapp.com`) will be allowed. You can set this in the firebase console, Authentication on the side bar, Settings, and Authorized Domains.
> 2.  **Firestore Security Rules**: You must write rules to control who can read or write data. For example: `allow read, write: if request.auth != null;` ensures only logged-in users can access data.
> 3.  **Google Cloud API Key Restrictions**: You can restrict your API key in the Google Cloud Console to only accept requests from your domain's HTTP referer. This can be located in the sidebar, APIs and Services, then Credentials, then click the three dots, and click edit API key.

#### c. Add `.env.local` to `.gitignore`

This is a critical step. Open your `.gitignore` file and add the following line to prevent your secret keys from ever being committed to Git.

```gitignore:.gitignore
# Local environment variables
.env.local
```

#### d. Create the Firebase Initialization File

Create a file at `src/firebase.ts`. This file will safely initialize Firebase using your environment variables and serve as a central export point for all Firebase services.

```typescript:src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration using environment variables
// See: https://firebase.google.com/docs/web/learn-more#config-object
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

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 6. 🪝 Create a Custom Authentication Hook

This hook will use React Context to provide the user's authentication state to any component in our app. Create a new directory and file at `src/hooks/use-auth.tsx`.

```tsx:src/hooks/use-auth.tsx
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

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to user auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Unsubscribe on cleanup
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      // Pro-tip: Show a toast notification to the user here
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

// Create the custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

### 7. 🧱 Add Required UI Components

Use the `shadcn-ui` CLI to add the components we'll need for our header.

```bash
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add button
```

Then, install `lucide-react` for icons, which these components often depend on.

```bash
npm install lucide-react
```

### 8. 🎨 Build the User Interface

Now let's assemble the UI using our new hook and components.

#### a. Create the Header Component

Create a new file at `src/components/Header.tsx`. This component will display either a "Login" button or the user's avatar with a dropdown menu.

```tsx:src/components/Header.tsx
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut } from "lucide-react";

export function Header() {
  const { user, loginWithGoogle, logout } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <h1 className="text-xl font-bold">My App</h1>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? "User"} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={loginWithGoogle}>
            <LogIn className="mr-2 h-4 w-4" /> Login with Google
          </Button>
        )}
      </div>
    </header>
  );
}
```

#### b. Update the Main App Component

Modify `src/App.tsx` to use the `Header` and display a welcome message.

```tsx:src/App.tsx
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Firebase Authentication Demo
          </h2>
          {user ? (
            <p className="text-muted-foreground mt-2">
              Welcome back, {user.displayName}! You are now logged in.
            </p>
          ) : (
            <p className="text-muted-foreground mt-2">
              Please log in to continue.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
```

#### c. Wrap the App with the `AuthProvider`

This is a crucial final step. Open `src/main.tsx` and wrap your `<App />` component with the `<AuthProvider>` to make the authentication context available everywhere.

```tsx:src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // Ensure your Tailwind CSS is imported
import { AuthProvider } from './hooks/use-auth.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
```

### 9. ✅ Run the Application

You're all set! Restart your development server to ensure it loads the new environment variables from `.env.local`.

```bash
# Press Ctrl+C in your terminal if the server is running, then:
npm run dev
```

Visit `http://localhost:5173` in your browser. You should see a header with a "Login with Google" button. After logging in, it will display your avatar and name, all while keeping your API keys secure.

---
---


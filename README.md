# Guide: React + Vite + Firebase + shadcn/ui

A step-by-step guide to building a modern web application with user authentication.

### ✅ Prerequisites

Before you begin, ensure you have the following installed and configured:

- **Node.js** (v18 or newer)
- **npm** & **pnpm**
- A **Firebase** project set up in the Firebase Console.

---

### 1. 🚀 Create Your Vite + React Project

First, scaffold a new Vite project using the React + TypeScript template.

```bash
# Create the project
npm create vite@latest sample-app -- --template react-ts

# Navigate into the project directory
cd sample-app

# Install dependencies
npm install
```

### 2. 💨 Install & Configure Tailwind CSS

Follow the official Tailwind CSS documentation for Vite to get it set up.

> 👉 **Follow Steps 2 through 5** of the official guide:
> **[Tailwind CSS Docs: Using Vite](https://tailwindcss.com/docs/installation/using-vite)**

### 3. ✨ Initialize shadcn/ui

Next, add `shadcn/ui` to your project for beautiful, accessible components.

> 👉 **Follow Steps 3 through 7** of the official installation guide:
> **[shadcn/ui Docs: Vite](https://ui.shadcn.com/docs/installation/vite)**

### 4. 🔥 Add Firebase to Your Project

Install the Firebase SDK and create a configuration file.

```bash
npm install firebase
```

Now, create a new file at `src/firebase.ts` and add your Firebase configuration.

> ⚠️ **Important:** Go to your Firebase project settings, find your web app, and copy the configuration object. Replace the placeholder below with your **real** keys and IDs.

```tsx
// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your REAL Firebase configuration
const firebaseConfig = {
  // REPLACE THIS WITH YOUR KEYS AND IDs
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the services
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 5. 🪝 Create a Custom Authentication Hook

This hook will manage the user's authentication state across your application. Create a new directory and file at `src/hooks/use-auth.tsx`.

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

### 6. 🧱 Add Required UI Components

Use the `shadcn-ui` CLI to add the components we'll need for the header and buttons.

```bash
pnpm dlx shadcn-ui@latest add avatar
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add button
pnpm install lucide-react
```

### 7. 🎨 Build the User Interface

Now let's assemble the UI using the components and hooks we've created.

#### a. Create the Header Component

Create a new file at `src/components/Header.tsx`. This component will display the app title and the login/logout controls.

```tsx
// src/components/Header.tsx
import { Chrome } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">IdeaBoard</h1>
        <div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? "User Avatar"} />
                  <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={loginWithGoogle}>
              <Chrome className="mr-2 h-4 w-4" /> Login with Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
```

#### b. Update the Main App Component

Replace the entire content of `src/App.tsx` to wrap the application in the `AuthProvider` and render the main layout, including the `Header`.

```tsx
// src/App.tsx
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

function PageContent() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center p-4">
        <h2 className="text-2xl font-bold mb-2">Welcome to IdeaBoard!</h2>
        <p className="text-muted-foreground">Please log in using the button in the header to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <img
        src={user.photoURL ?? undefined}
        alt={user.displayName ?? "User Avatar"}
        className="w-24 h-24 rounded-full mb-4 ring-2 ring-offset-2 ring-primary"
      />
      <h2 className="text-3xl font-bold mb-2">Welcome, {user.displayName}!</h2>
      <p className="mb-4 text-green-500">You are successfully logged in.</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full py-4 flex items-center justify-center gap-2 border-t">
      <span>Made by hZ</span>
      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center hover:text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mx-1">
          <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
        </svg>
        <span className="sr-only">GitHub</span>
      </a>
    </footer>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <PageContent />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
```

### 8. ✅ Run the Application

You're all set! Start the development server to see your application in action.

```bash
npm run dev
```

Your app should now be running, featuring a header with a "Login with Google" button. Once you log in, it will display your user information.
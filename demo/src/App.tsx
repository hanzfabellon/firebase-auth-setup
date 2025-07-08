import { Header } from "@/components/header";
import { useAuth } from "@/hooks/use-auth";
import { AuthProvider } from './hooks/use-auth.tsx';
function App() {
  const { user } = useAuth();

  return (
    <>
      <div className="min-h-screen flex flex-col justify-between">
        <div>
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
        <footer className="w-full py-6 border-t text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <div>
            the name of the firebase app is <b>your-app-name</b>, this will be the URL you will see on the authentication page, don't worry!
          </div>
          <div className="flex items-center gap-2">
            Made by Hanz Fabellon
            <a href="https://github.com/hanzfabellon" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="inline-flex align-middle">
              <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.11.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}

export default function AppWithProvider() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
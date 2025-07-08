# React + Firebase Auth Starter (Vite, Tailwind, Shadcn)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Powered by: Firebase](https://img.shields.io/badge/Powered%20by-Firebase-orange.svg)](https://firebase.google.com/)
[![Built with: React](https://img.shields.io/badge/Built%20with-React-61DAFB.svg)](https://react.dev/)
[![Styled with: Shadcn](https://img.shields.io/badge/Styled%20with-shadcn-black.svg)](https://ui.shadcn.com/)

Build a web application with user authentication through Firebase.

**[➡️ View the Live Demo](https://hanzfabellon.github.io/sample-auth)**

**[➡️ Demo repo](https://github.com/hanzfabellon/sample-auth)**

**[➡️ Guide from scratch](https://github.com/hanzfabellon/firebase-auth-setup/blob/main/README-detailed.md)**

### ✅ Prerequisites

Before you begin, ensure you have the following installed and configured:

*   **Node.js**: `v18` or newer
*   **pnpm**: Package managers
*   **Firebase Project**: A project created in the [Firebase Console](https://console.firebase.google.com/) with the "Authentication" service enabled (and Google provider turned on).

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hanzfabellon/firebase-auth-setup.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd firebase-auth-setup
    ```

3.  **Install the dependencies:**
    ```bash
    pnpm install
    ```

4.  **Set up your environment variables:**
    *   Create a new file in the root of the project named `.env.local`.
    *   Copy the contents of the example below into your new file.
    *   Go to your Firebase project settings, find your web app's configuration, and replace the placeholder values with your **actual** Firebase credentials.

    ```ini:.env.local
    #
    # ⚠️ IMPORTANT: Replace these with your own Firebase project keys!
    #
    # Get these from your Firebase project console:
    # Project Settings > General > Your apps > Web app > SDK setup and configuration
    #
    VITE_FIREBASE_API_KEY="YOUR_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    VITE_FIREBASE_PROJECT_ID="your-project-id"
    VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
    VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
    VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef1234567890"
    ```
> #### ⚠️ How Your `apiKey` Stays Secure
>
> While the `apiKey` is visible in your site's deployed code, it's not a secret password. It only identifies your Firebase project. You can further secure it by:
>
> 1.  **Firebase Auth Authorized Domains**: In the Firebase Console, you can restrict which domains can use your auth services. You can set that only requests from your deployed site and firebase (e.g., `your-app.vercel.app` and `firebaseapp.com`) will be allowed. You can set this in the firebase console, Authentication on the side bar, Settings, and Authorized Domains.
> 2.  **Firestore Security Rules**: You can write rules to control who can read or write data. For example: `allow read, write: if request.auth != null;` ensures only logged-in users can access data.
> 3.  **Google Cloud API Key Restrictions**: You can restrict your API key in the Google Cloud Console to only accept requests from your domain's HTTP referer. This can be located in the sidebar, APIs and Services, then Credentials, then click the three dots, and click edit API key.

5.  **Enable Google Sign-In in Firebase:**
    *   Go to your Firebase Console.
    *   Navigate to **Authentication** > **Sign-in method**.
    *   Click on **Google** from the list of providers and enable it.

6.  **Run the development server:**
    ```bash
    pnpm run dev
    ```

Your application should now be running on `http://localhost:5173`.

---

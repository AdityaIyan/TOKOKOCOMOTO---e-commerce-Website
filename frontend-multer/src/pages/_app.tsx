import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

function AppContent({ Component, pageProps }: AppProps) {
  return (
    <div className={`min-h-screen bg-white text-black ${inter.className}`}>
      <Navbar />
      <main>
        <Component {...pageProps} />
      </main>
    </div>
  );
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <AppContent {...props} />
    </AuthProvider>
  );
}

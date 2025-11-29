import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface MainLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideNav?: boolean;
}

export function MainLayout({ children, hideHeader, hideNav }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {!hideHeader && <Header />}
      <main className={`${!hideNav ? "pb-20" : ""}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}

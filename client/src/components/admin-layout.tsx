import { ReactNode } from "react";
import AdminNavigation from "./admin-navigation";

interface AdminLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  backPath?: string;
  title?: string;
}

export default function AdminLayout({ children, showBackButton, backPath, title }: AdminLayoutProps) {
  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      <AdminNavigation showBackButton={showBackButton} backPath={backPath} title={title} />
      <div className="pt-20 pb-20">
        {children}
      </div>
    </div>
  );
}
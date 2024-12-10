import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";

export default function Navigation() {
  const { user, logout } = useUser();

  if (!user) return null;

  return (
    <nav className="border-b">
      <div className="container py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center text-lg font-semibold">
            <Home className="mr-2 h-5 w-5" />
            EduClassroom
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <a className="text-sm font-medium hover:text-primary">Dashboard</a>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {user.name} ({user.role})
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}

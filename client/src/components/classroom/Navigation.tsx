import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useState } from "react";
import type { Notification } from "@/hooks/use-notifications";

export default function Navigation() {
  const { user, logout } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  if (!user) return null;

  const clearNotifications = () => setNotifications([]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  return (
    <nav className="border-b">
      <div className="container py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center text-lg font-semibold">
            <Home className="mr-2 h-5 w-5" />
            EduClassroom
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <NotificationBell
            notifications={notifications}
            onClear={clearNotifications}
          />
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

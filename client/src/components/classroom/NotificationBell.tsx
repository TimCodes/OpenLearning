import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Notification } from "@/hooks/use-notifications";

interface NotificationBellProps {
  notifications: Notification[];
  onClear: () => void;
}

export default function NotificationBell({ notifications, onClear }: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No new notifications
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg text-sm",
                    notification.type === "grade"
                      ? "bg-green-50 border border-green-100"
                      : notification.type === "assignment"
                      ? "bg-blue-50 border border-blue-100"
                      : "bg-orange-50 border border-orange-100"
                  )}
                >
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

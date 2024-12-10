import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useNotifications } from "@/hooks/use-notifications";
import { useCourse } from "@/hooks/use-courses";
import { useToast } from "@/hooks/use-toast";

const announcementSchema = z.object({
  message: z.string().min(1, "Announcement message is required"),
});

interface AnnouncementDialogProps {
  courseId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AnnouncementDialog({
  courseId,
  open,
  onOpenChange,
}: AnnouncementDialogProps) {
  const { course } = useCourse(courseId);
  const { sendNotification } = useNotifications(courseId);
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (course) {
      try {
        sendNotification({
          type: "announcement",
          title: `New Announcement in ${course.name}`,
          message: data.message,
        });
        
        toast({
          title: "Success",
          description: "Announcement sent successfully",
        });
        
        form.reset();
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to send announcement:', error);
        toast({
          title: "Error",
          description: "Failed to send announcement",
          variant: "destructive",
        });
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your announcement here..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                Send Announcement
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

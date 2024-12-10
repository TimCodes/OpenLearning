import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Define a custom schema for the form that handles date transformation
const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().transform(val => {
    if (!val) return null;
    const date = new Date(val);
    // Validate the date is valid
    if (isNaN(date.getTime())) return null;
    return date;
  }),
  points: z.number().min(0, "Points must be a positive number"),
});

type FormData = z.infer<typeof createAssignmentSchema>;

interface CreateAssignmentDialogProps {
  courseId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAssignmentDialog({
  courseId,
  open,
  onOpenChange,
}: CreateAssignmentDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      points: 100,
    },
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/courses/${courseId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          // Send the date as an ISO string to the server
          dueDate: data.dueDate instanceof Date ? data.dueDate.toISOString() : null,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create assignment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/assignments`] });
      onOpenChange(false);
      form.reset();
      toast({
        title: "Assignment created",
        description: "Your new assignment has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create assignment',
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new assignment</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to create a new assignment.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local"
                      {...field}
                      value={value || ''}
                      onChange={(e) => onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                className="bg-primary hover:bg-primary/90"
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                    Creating...
                  </div>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

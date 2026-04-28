"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  defaultValues: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultValues.name,
      phone: defaultValues.phone ?? "",
    },
  });

  const { mutate, isPending } = useMutation(
    trpc.profile.updateProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.profile.getProfile.queryKey() });
        toast.success("Profile updated");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile");
      },
    }),
  );

  const onSubmit = (values: ProfileFormValues) => {
    mutate({
      name: values.name,
      phone: values.phone || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Email</FormLabel>
          <Input value={defaultValues.email} disabled className="opacity-60" />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed.
          </p>
        </FormItem>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending || !form.formState.isDirty}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}

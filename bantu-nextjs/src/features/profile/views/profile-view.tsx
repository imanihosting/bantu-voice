"use client";

import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { AvatarUpload } from "@/features/profile/components/avatar-upload";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { AddressForm } from "@/features/profile/components/address-form";

export function ProfileView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: profile } = useSuspenseQuery(
    trpc.profile.getProfile.queryOptions(),
  );

  const handleAvatarChange = () => {
    queryClient.invalidateQueries({ queryKey: trpc.profile.getProfile.queryKey() });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <PageHeader title="Profile" className="lg:hidden" />
      <div className="mx-auto max-w-2xl space-y-6 p-4 lg:p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal information and preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your photo, name, and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AvatarUpload
              currentImage={profile.image}
              name={profile.name}
              onUploaded={handleAvatarChange}
            />
            <Separator />
            <ProfileForm
              defaultValues={{
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>
              Your billing and correspondence address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressForm
              defaultValues={{
                street: profile.street,
                city: profile.city,
                state: profile.state,
                postalCode: profile.postalCode,
                country: profile.country,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

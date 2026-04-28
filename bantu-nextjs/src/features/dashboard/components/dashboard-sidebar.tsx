"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  type LucideIcon,
  Home,
  LayoutGrid,
  AudioLines,
  BookOpen,
  Mic,
  Volume2,
  Settings,
  Headphones,
  LogOut,
  ChevronsUpDown,
  User,
  Shield,
  Users,
  BarChart3,
  Server,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VoiceCreateDialog } from "@/features/voices/components/voice-create-dialog";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  onClick?: () => void;
};

interface NavSectionProps {
  label?: string;
  items: MenuItem[];
  pathname: string;
};

function NavSection({ label, items, pathname }: NavSectionProps) {
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[13px] uppercase text-muted-foreground">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!!item.url}
                isActive={
                  item.url
                    ? item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url)
                    : false
                }
                onClick={item.onClick}
                tooltip={item.title}
                className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium border border-transparent data-[active=true]:border-border data-[active=true]:shadow-[0px_1px_1px_0px_rgba(44,54,53,0.03),inset_0px_0px_0px_2px_white]"
              >
                {item.url ? (
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <>
                    <item.icon />
                    <span>{item.title}</span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const mainMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Text to Speech",
      url: "/text-to-speech",
      icon: AudioLines,
    },
    {
      title: "Speech to Text",
      url: "/speech-to-text",
      icon: Mic,
    },
    {
      title: "Explore Voices",
      url: "/voices",
      icon: LayoutGrid,
    },
    {
      title: "Voice Cloning",
      icon: Volume2,
      onClick: () => setVoiceDialogOpen(true),
    },
  ];

  const isAdmin =
    (session?.user as Record<string, unknown> | undefined)?.role === "admin";

  const adminMenuItems: MenuItem[] = [
    {
      title: "Admin Dashboard",
      url: "/admin",
      icon: Shield,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "System",
      url: "/admin/system",
      icon: Server,
    },
  ];

  const secondaryMenuItems: MenuItem[] = [
    {
      title: "API Docs",
      url: "/docs",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Support",
      url: "mailto:business@codewithantonio.com",
      icon: Headphones,
    },
  ];

  return (
    <>
    <VoiceCreateDialog
      open={voiceDialogOpen}
      onOpenChange={setVoiceDialogOpen}
    />
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-col gap-4 pt-4">
        <div className="flex items-center gap-2 pl-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
          <Image
            src="/taurai_top_logo.svg"
            alt="TaurAI"
            width={120}
            height={38}
            className="invert group-data-[collapsible=icon]:hidden dark:invert-0"
            priority
          />
          <Image
            src="/logo.svg"
            alt="TaurAI"
            width={24}
            height={24}
            className="hidden rounded-sm group-data-[collapsible=icon]:block"
          />
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <div className="border-b border-dashed border-border" />
      <SidebarContent>
        <NavSection items={mainMenuItems} pathname={pathname} />
        {isAdmin && (
          <NavSection
            label="Admin"
            items={adminMenuItems}
            pathname={pathname}
          />
        )}
        <NavSection
          items={secondaryMenuItems}
          pathname={pathname}
        />
      </SidebarContent>
      <div className="border-b border-dashed border-border" />
      <SidebarFooter className="gap-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip={session?.user?.name ?? "Account"}
                  className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium"
                >
                  <Avatar size="sm">
                    {session?.user?.image && (
                      <AvatarImage src="/api/profile/avatar" alt={session.user.name} />
                    )}
                    <AvatarFallback className="text-[10px]" suppressHydrationWarning>
                      {session?.user?.name ? getInitials(session.user.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate group-data-[collapsible=icon]:hidden">
                    {session?.user?.name ?? "Account"}
                  </span>
                  <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={async () => {
                    await authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.push("/sign-in");
                        },
                      },
                    });
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    </>
  );
}

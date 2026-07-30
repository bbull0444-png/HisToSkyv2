import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  ClipboardList,
  User,
  FileQuestion,
  FileCheck2,
  Users,
  Settings,
  MessageSquareHeart,
  FolderKanban,
  FileBarChart,
  LogOut,
  ScrollText,
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/AuthContext";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const studentNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Materi", url: "/materi", icon: BookOpen },
  { title: "Pretest", url: "/pretest", icon: FileQuestion },
  { title: "Posttest", url: "/posttest", icon: FileCheck2 },
  { title: "Nilai", url: "/nilai", icon: LineChart },
  { title: "Profil", url: "/profil", icon: User },
];

const teacherNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },

  { title: "Kelola Materi", url: "/kelola-materi", icon: FolderKanban },

  { title: "Kelola Kelompok", url: "/kelola-kelompok", icon: Users },

  { title: "Kelola Pretest", url: "/kelola-pretest", icon: FileQuestion },

  { title: "Kelola Posttest", url: "/kelola-posttest", icon: FileCheck2 },

  { title: "Refleksi Siswa", url: "/refleksi", icon: MessageSquareHeart },

  { title: "Data Siswa", url: "/data-siswa", icon: Users },

  { title: "Rekap Nilai", url: "/rekap-nilai", icon: FileBarChart },

  { title: "Laporan Penelitian", url: "/laporan", icon: ScrollText },

  { title: "Pengaturan", url: "/pengaturan", icon: Settings },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const items = user?.role === "guru" ? teacherNav : studentNav;

  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">HisToSky</span>
            <span className="text-xs text-muted-foreground">
              {user?.role === "guru" ? "Panel Guru" : "Panel Siswa"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-2">
          <div className="mb-2 rounded-lg border bg-sidebar-accent/40 p-2 text-xs">
            <div className="font-medium">{user?.name}</div>
            <div className="text-muted-foreground">@{user?.username}</div>
          </div>
          <SidebarMenuButton onClick={logout} className="w-full">
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

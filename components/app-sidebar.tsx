"use client"

import type * as React from "react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, History, ChevronUp, Plus, Settings, Home } from "lucide-react"
import { SearchForm } from "@/components/search-form" // Assuming SearchForm is in components/search-form.tsx

interface UserInfo {
  id: string
  money: string
  isDemo?: boolean
}

interface Project {
  id: string
  name: string
  icon: React.ElementType
}

interface AppSidebarProps {
  userInfo: UserInfo | null
  selectedProject: string | null
  setSelectedProject: (projectId: string | null) => void
  projects: Project[]
  handleLogout: () => void
}

export function AppSidebar({ userInfo, selectedProject, setSelectedProject, projects, handleLogout }: AppSidebarProps) {
  const router = useRouter()
  const { toggleSidebar } = useSidebar() // useSidebar is now safe to call here

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center space-x-2">
            <img src="/nobody-logo.png" alt="Nobody Logo" className="h-8 w-8 rounded-full" />
            <span className="text-lg font-bold text-sidebar-foreground">NobodySMS</span>
          </div>
          <SidebarTrigger className="md:hidden" />
        </div>
        <SearchForm className="mx-2" /> {/* Use the separate SearchForm component */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <a href="/dashboard">
                    <Home />
                    <span>仪表盘</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <History />
                    <span>历史记录</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Settings />
                    <span>设置</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>项目</SidebarGroupLabel>
          <SidebarGroupAction title="添加新项目">
            <Plus /> <span className="sr-only">添加新项目</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    onClick={() => setSelectedProject(project.id)}
                    isActive={selectedProject === project.id}
                  >
                    <project.icon />
                    <span>{project.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User /> {userInfo?.id || "加载中..."}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <span>个人资料</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/billing")}>
                  <span>账单</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

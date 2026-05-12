"use client";

import { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone,
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { 
  CRMPageContainer, 
  CRMPageHeader, 
  CRMMetricsGrid, 
  MetricCard, 
  CRMCard,
  DataTable,
  CRMTableHeader,
  CRMTableBody,
  CRMTableRow,
  CRMTableCell,
  CRMTableHeaderCell,
  CRMToolbar,
  CRMStatusBadge,
  ActivityTimeline,
  CRMPageSection
} from "@/shared/components/crm";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/shared/ui/dropdown-menu";
import { useEmployees } from "@/shared/hooks/use-hrm";
import { Progress } from "@/shared/ui/progress";
import { toast } from "sonner";
import { PageLoadingState } from "@/shared/components/page-states";

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: hrmData, isLoading: loading } = useEmployees();
  
  const employees = hrmData?.employees || [];
  const employeeStats = hrmData?.stats || [];
  const employeeActivities = hrmData?.recentActivities || [];

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <PageLoadingState label="Loading employee records..." />;
  }

  const handleAddEmployee = () => {
    toast.info("Add Employee", {
      description: "Opening employee onboarding workflow...",
    });
  };

  return (
    <CRMPageContainer>
      <CRMPageHeader
        title="Employee Directory"
        subtitle="Manage your workforce, monitor performance, and track department growth."
        badge="HR Management"
        icon={Users}
        actions={[
          {
            label: "Export CSV",
            onClick: () => toast.success("Exporting employee data..."),
            variant: "outline",
          },
          {
            label: "Add Employee",
            icon: UserPlus,
            onClick: handleAddEmployee,
            variant: "default",
          },
        ]}
      />

      {/* Stats Grid */}
      <CRMMetricsGrid>
        {employeeStats.map((stat, i) => (
          <MetricCard
            key={i}
            {...stat}
            delay={i * 0.1}
          />
        ))}
      </CRMMetricsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Table Area */}
        <div className="lg:col-span-3 space-y-6">
          <CRMToolbar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search employees by name or department..."
            onFilterClick={() => toast.info("Filters coming soon")}
          />

          <DataTable>
            <CRMTableHeader>
              <CRMTableRow>
                <CRMTableHeaderCell>Employee</CRMTableHeaderCell>
                <CRMTableHeaderCell>Department</CRMTableHeaderCell>
                <CRMTableHeaderCell>Status</CRMTableHeaderCell>
                <CRMTableHeaderCell>Performance</CRMTableHeaderCell>
                <CRMTableHeaderCell className="text-right">Actions</CRMTableHeaderCell>
              </CRMTableRow>
            </CRMTableHeader>
            <CRMTableBody>
              {filteredEmployees.map((emp) => (
                <CRMTableRow key={emp.id} className="cursor-default">
                  <CRMTableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={emp.avatar} alt={emp.name} />
                        <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-sm tracking-tight">{emp.name}</div>
                        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{emp.role}</div>
                      </div>
                    </div>
                  </CRMTableCell>
                  <CRMTableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{emp.department}</span>
                      <span className="text-[10px] text-muted-foreground">{emp.email}</span>
                    </div>
                  </CRMTableCell>
                  <CRMTableCell>
                    <CRMStatusBadge tone={emp.status === 'active' ? 'success' : 'warning'}>
                      {emp.status}
                    </CRMStatusBadge>
                  </CRMTableCell>
                  <CRMTableCell>
                    <div className="w-32 space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-muted-foreground">{emp.performance}%</span>
                        <span className="text-emerald-500">Target Hit</span>
                      </div>
                      <Progress value={emp.performance} className="h-1.5" />
                    </div>
                  </CRMTableCell>
                  <CRMTableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Performance Review</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-500">Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CRMTableCell>
                </CRMTableRow>
              ))}
            </CRMTableBody>
          </DataTable>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <CRMPageSection title="Recent Activity">
            <CRMCard className="p-6">
              <ActivityTimeline items={employeeActivities} />
              <Button variant="ghost" className="w-full mt-6 text-[10px] font-bold uppercase tracking-widest text-primary h-9">
                View All Activity
              </Button>
            </CRMCard>
          </CRMPageSection>

          <CRMPageSection title="Performance Overview">
            <CRMCard className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Dept</div>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-lg font-bold tracking-tight">Sales Team</h4>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Average Performance: 96%</p>
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">+5 more</span>
                </div>
              </div>
              <Button className="w-full h-9 bg-primary/10 hover:bg-primary/20 text-primary border-none text-xs font-bold">
                Analytics Report
              </Button>
            </CRMCard>
          </CRMPageSection>
        </div>
      </div>
    </CRMPageContainer>
  );
}













"use client";

import { useState } from "react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  UserCog, 
  Plus,
  Settings,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Lock,
  Activity
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
  CRMPageSection,
  PermissionToggle
} from "@/shared/components/crm";
import { Button } from "@/shared/ui/button";
import { useRoles } from "@/shared/hooks/use-hrm";
import { PageLoadingState } from "@/shared/components/page-states";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/shared/ui/sheet";
import { toast } from "sonner";
import { Checkbox } from "@/shared/ui/checkbox";

export default function RoleManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: roleData, isLoading: loading } = useRoles();
  
  const roles = roleData?.roles || [];
  const roleStats = roleData?.stats || [];
  const securityLogs = roleData?.securityLogs || [];
  const permissionModules = roleData?.permissionModules || [];

  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <PageLoadingState label="Loading role intelligence engine..." />;
  }

  const handleRoleClick = (role: any) => {
    setSelectedRole(role);
    setIsSheetOpen(true);
  };

  const handleCreateRole = () => {
    toast.success("New Role", {
      description: "Redirecting to Role Creation Wizard...",
    });
  };

  return (
    <CRMPageContainer>
      <CRMPageHeader
        title="Role Management"
        subtitle="Define granular permissions and security policies for your enterprise."
        badge="Security & Access"
        icon={Shield}
        actions={[
          {
            label: "Audit Logs",
            icon: Activity,
            onClick: () => toast.info("Opening system audit logs..."),
            variant: "outline",
          },
          {
            label: "Create Role",
            icon: Plus,
            onClick: handleCreateRole,
            variant: "default",
          },
        ]}
      />

      {/* Stats Grid */}
      <CRMMetricsGrid>
        {roleStats.map((stat, i) => (
          <MetricCard
            key={i}
            {...stat}
            delay={i * 0.1}
          />
        ))}
      </CRMMetricsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Roles Table */}
        <div className="lg:col-span-2 space-y-6">
          <CRMToolbar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search roles by name..."
          />

          <DataTable>
            <CRMTableHeader>
              <CRMTableRow>
                <CRMTableHeaderCell>Role Name</CRMTableHeaderCell>
                <CRMTableHeaderCell>Users</CRMTableHeaderCell>
                <CRMTableHeaderCell>Permissions</CRMTableHeaderCell>
                <CRMTableHeaderCell>Status</CRMTableHeaderCell>
                <CRMTableHeaderCell className="text-right">Actions</CRMTableHeaderCell>
              </CRMTableRow>
            </CRMTableHeader>
            <CRMTableBody>
              {filteredRoles.map((role) => (
                <CRMTableRow 
                  key={role.id} 
                  onClick={() => handleRoleClick(role)}
                  className="cursor-pointer"
                >
                  <CRMTableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted/50 rounded-lg">
                        <Shield className="w-4 h-4 text-primary" />
                      </div>
                      <div className="font-bold text-sm tracking-tight">{role.name}</div>
                    </div>
                  </CRMTableCell>
                  <CRMTableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold">{role.membersCount}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Members</span>
                    </div>
                  </CRMTableCell>
                  <CRMTableCell>
                    <div className="flex items-center gap-1.5 text-emerald-500">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{role.permissionsCount} Active</span>
                    </div>
                  </CRMTableCell>
                  <CRMTableCell>
                    <CRMStatusBadge tone="success">
                      {role.status}
                    </CRMStatusBadge>
                  </CRMTableCell>
                  <CRMTableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CRMTableCell>
                </CRMTableRow>
              ))}
            </CRMTableBody>
          </DataTable>

          {/* Permission Matrix Preview */}
          <CRMPageSection title="Quick Permission Matrix" subtitle="Global overview of module access by role.">
            <CRMCard noPadding>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Module</th>
                      {filteredRoles.slice(0, 3).map(role => (
                        <th key={role.id} className="p-4 text-[10px] font-bold uppercase tracking-widest text-center">{role.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissionModules.slice(0, 4).map((module: any) => (
                      <tr key={module.id} className="border-b border-border/50 h-12">
                        <td className="p-4 text-xs font-bold tracking-tight">{module.name}</td>
                        {filteredRoles.slice(0, 3).map(role => (
                          <td key={role.id} className="p-4 text-center">
                            <div className="flex justify-center">
                              {Math.random() > 0.3 ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground/30" />
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CRMCard>
          </CRMPageSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <CRMPageSection title="Security Logs">
            <CRMCard className="p-6">
              <ActivityTimeline items={securityLogs} />
              <Button variant="outline" className="w-full mt-8 text-xs font-bold uppercase tracking-wider h-10">
                View Security Audit
              </Button>
            </CRMCard>
          </CRMPageSection>

          <CRMCard className="p-6 bg-rose-500/[0.02] border-rose-500/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold tracking-tight">Security Alert</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              System detected 2 roles with overlapping high-level permissions. We recommend auditing the &quot;Super Admin&quot; and &quot;Admin&quot; roles.
            </p>
            <Button variant="ghost" className="w-full text-rose-500 hover:bg-rose-500/10 h-9 font-bold text-xs uppercase tracking-widest">
              Review Conflicts
            </Button>
          </CRMCard>
        </div>
      </div>

      {/* Role Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold tracking-tight">{selectedRole?.name}</SheetTitle>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role Settings</span>
                  <CRMStatusBadge tone="success" className="text-[9px]">Active</CRMStatusBadge>
                </div>
              </div>
            </div>
            <SheetDescription className="text-sm leading-relaxed">
              {selectedRole?.description}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-8 pb-10">
            {permissionModules.map((module: any) => (
              <div key={module.id} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    {module.name}
                  </h4>
                  <Button variant="link" className="h-auto p-0 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Select All
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-1 border border-border/50 rounded-xl overflow-hidden bg-muted/10">
                  {module.permissions.map((perm: string) => (
                    <PermissionToggle
                      key={`${module.id}-${perm}`}
                      id={`${module.id}-${perm}`}
                      label={perm.charAt(0).toUpperCase() + perm.slice(1)}
                      description={`Grant ${perm} access to ${module.name}`}
                      checked={Math.random() > 0.4}
                      onCheckedChange={() => {}}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 bg-background pt-4 border-t border-border flex gap-3">
            <Button className="flex-1 font-bold h-11" onClick={() => setIsSheetOpen(false)}>
              Save Permissions
            </Button>
            <Button variant="outline" className="flex-1 font-bold h-11" onClick={() => setIsSheetOpen(false)}>
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </CRMPageContainer>
  );
}













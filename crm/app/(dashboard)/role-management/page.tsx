"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Plus,
  Edit2,
  Trash2,
  Users as UsersIcon
} from "lucide-react";
import { 
  CRMPageContainer, 
  CRMPageHeader, 
  CRMMetricsGrid, 
  MetricCard, 
  DataTable,
  CRMTableHeader,
  CRMTableBody,
  CRMTableRow,
  CRMTableCell,
  CRMTableHeaderCell,
  CRMToolbar,
  CRMStatusBadge
} from "@/shared/components/crm";
import { Button } from "@/shared/ui/button";
import { PageLoadingState } from "@/shared/components/page-states";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FormModal } from "@/shared/components/form-modal";
import { RoleForm } from "@/features/forms/RoleForm";

export default function RoleManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const searchParams = useSearchParams();

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error("Failed to load users", { description: data.message });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      const timer = setTimeout(() => {
        setIsAddModalOpen(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const filteredUsers = users.filter((u) => {
    const nameStr = u.displayName || u.name || "";
    const emailStr = u.email || "";
    return nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
           emailStr.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreateRole = () => {
    setIsAddModalOpen(true);
  };

  if (loading) {
    return <PageLoadingState label="Loading users and roles..." />;
  }

  return (
    <CRMPageContainer>
      <CRMPageHeader
        title="User & Role Management"
        subtitle="Manage users, assign roles, and control access permissions."
        badge="Security & Access"
        icon={UsersIcon}
        actions={[
          {
            label: "Create User",
            icon: Plus,
            onClick: handleCreateRole,
            variant: "default",
          },
        ]}
      />

      <CRMMetricsGrid>
        <MetricCard title="Total Users" value={users.length} icon={UsersIcon} trend="up" delay={0} />
        <MetricCard title="Active Roles" value={5} icon={ShieldCheck} delay={0.1} />
        <MetricCard title="Security Alerts" value={0} icon={ShieldAlert} trend="neutral" delay={0.2} />
      </CRMMetricsGrid>

      <div className="space-y-6">
        <CRMToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search users by name or email..."
        />

        <DataTable>
          <CRMTableHeader>
            <CRMTableRow>
              <CRMTableHeaderCell>User</CRMTableHeaderCell>
              <CRMTableHeaderCell>Email</CRMTableHeaderCell>
              <CRMTableHeaderCell>Role</CRMTableHeaderCell>
              <CRMTableHeaderCell>Status</CRMTableHeaderCell>
              <CRMTableHeaderCell className="text-right">Actions</CRMTableHeaderCell>
            </CRMTableRow>
          </CRMTableHeader>
          <CRMTableBody>
            {filteredUsers.map((user) => (
              <CRMTableRow key={user.id}>
                <CRMTableCell>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-sm tracking-tight">{user.displayName || user.name}</div>
                  </div>
                </CRMTableCell>
                <CRMTableCell>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </CRMTableCell>
                <CRMTableCell>
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{user.role}</span>
                  </div>
                </CRMTableCell>
                <CRMTableCell>
                  <CRMStatusBadge tone={user.status === "ACTIVE" ? "success" : "neutral"}>
                    {user.status}
                  </CRMStatusBadge>
                </CRMTableCell>
                <CRMTableCell className="text-right">
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
      </div>

      <FormModal
        title="Create User"
        description="Provision a new user account."
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        size="md"
      >
        <RoleForm 
          onSuccess={() => { setIsAddModalOpen(false); fetchUsers(); }} 
          onCancel={() => setIsAddModalOpen(false)} 
        />
      </FormModal>
    </CRMPageContainer>
  );
}

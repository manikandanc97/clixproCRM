"use client";

import { useState } from "react";
import { Search, Plus, Pencil, Trash2, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { 
  DataTable,
  CRMTableHeader,
  CRMTableBody,
  CRMTableRow,
  CRMTableCell,
  CRMTableHeaderCell,
} from "@/shared/components/crm";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";
import { RoleManagementSkeleton } from "../RoleManagementSkeleton";
import { Badge } from "@/shared/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/features/auth/components/auth-provider";
import { Checkbox } from "@/shared/ui/checkbox";
import client from "@/shared/lib/api/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { navLibrary, roleMenuConfig } from "@/shared/lib/auth/rbac/menu-config";

interface RolePermission {
  module: string;
  hasAccess: boolean;
}

interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  isActive: boolean;
  color: string | null;
  permissions: RolePermission[];
  _count?: { users: number; permissions: number };
}

const usedTitles = new Set<string>();
Object.values(roleMenuConfig).forEach(navGroups => {
  navGroups.forEach(group => {
    group.items.forEach(item => {
      usedTitles.add(item.title);
    });
  });
});

const MODULES = [
  ...Object.values(navLibrary)
    .filter(nav => usedTitles.has(nav.title))
    .map(nav => nav.title),
  "Help Center"
];

export function RoleList() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300) || "";
  
  // Permissions editing state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTargetRole, setEditTargetRole] = useState<Role | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [newRoleName, setNewRoleName] = useState("");

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTargetRole, setRenameTargetRole] = useState<Role | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetRole, setDeleteTargetRole] = useState<Role | null>(null);
  
  const { user } = useAuth();
  const currentUserRole = user?.role?.toUpperCase() || "EMPLOYEE";
  const canEditAnyRole = currentUserRole === "SUPER ADMIN" || currentUserRole === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await client.get("/crm/roles");
      return res.data;
    }
  });

  // Save permissions mutation
  const saveMutation = useMutation({
    mutationFn: async ({ id, isNew, name }: { id: string; isNew: boolean, name?: string }) => {
      const url = isNew ? `/crm/roles` : `/crm/roles/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const payload: { permissions: string[]; name?: string; description?: string } = { permissions: editPermissions };
      if (isNew) {
        payload.name = name;
        payload.description = "";
      }

      const res = await client.request({
        url,
        method,
        data: payload
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Role saved successfully");
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditDialogOpen(false);
      setEditTargetRole(null);
      setCreateDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await client.put(`/crm/roles/${id}`, { name });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Role renamed successfully");
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setRenameDialogOpen(false);
      setRenameTargetRole(null);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.delete(`/crm/roles/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteDialogOpen(false);
      setDeleteTargetRole(null);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  if (isLoading) return <RoleManagementSkeleton />;

  const roles: Role[] = Array.isArray(data) ? data : (data?.roles || data?.data || []);
  const filteredRoles = roles.filter((r) => {
    return r?.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  const handleEditClick = (role: Role) => {
    setEditTargetRole(role);
    const isSystemAdmin = role.name.toUpperCase() === "ADMIN" || role.name.toUpperCase() === "SUPER ADMIN";
    
    if (isSystemAdmin) {
      setEditPermissions([...MODULES]);
    } else {
      const initialPerms: string[] = [];
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach((rp) => {
          if (rp.hasAccess && rp.module) {
            initialPerms.push(rp.module);
          }
        });
      }
      setEditPermissions(initialPerms);
    }
    setEditDialogOpen(true);
  };

  const handleCreateClick = () => {
    setNewRoleName("");
    setEditPermissions([]);
    setCreateDialogOpen(true);
  };

  const handleRenameClick = (role: Role) => {
    setRenameTargetRole(role);
    setRenameValue(role.name);
    setRenameDialogOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setDeleteTargetRole(role);
    setDeleteDialogOpen(true);
  };

  const handleToggle = (module: string, checked: boolean) => {
    setEditPermissions((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, module]));
      } else {
        return prev.filter((m: string) => m !== module);
      }
    });
  };

  const getModuleBadges = (role: Role) => {
    const isSystemAdmin = role.name.toUpperCase() === "ADMIN" || role.name.toUpperCase() === "SUPER ADMIN";
    if (isSystemAdmin && (!role.permissions || role.permissions.length === 0)) {
      return MODULES;
    }
    if (!role.permissions) return [];
    return Array.from(new Set(role.permissions.filter((rp) => rp.hasAccess && MODULES.includes(rp.module)).map((rp) => rp.module).filter(Boolean))) as string[];
  };

  const renderInlinePermissionsEditor = (roleName?: string) => {
    const isSystemAdmin = roleName ? (roleName.toUpperCase() === "ADMIN" || roleName.toUpperCase() === "SUPER ADMIN") : false;
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-3 gap-x-4 py-2 max-h-[300px] overflow-y-auto w-full">
        {MODULES.map(module => (
          <label key={module} className={`flex items-center gap-2 text-sm text-foreground ${isSystemAdmin ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-muted/50'} p-1.5 rounded-md transition-colors`}>
            <Checkbox 
              className="w-4 h-4"
              checked={isSystemAdmin ? true : editPermissions.includes(module)}
              onCheckedChange={(c) => !isSystemAdmin && handleToggle(module, !!c)}
              disabled={isSystemAdmin}
            />
            {module}
          </label>
        ))}
      </div>
    );
  };

  const isSystemAdminRole = editTargetRole ? (editTargetRole.name.toUpperCase() === "ADMIN" || editTargetRole.name.toUpperCase() === "SUPER ADMIN") : false;
  
  let hasEditChanges = false;
  if (editTargetRole && !isSystemAdminRole) {
    const initialPerms = editTargetRole.permissions?.filter(rp => rp.hasAccess).map(rp => rp.module) || [];
    if (initialPerms.length !== editPermissions.length) {
      hasEditChanges = true;
    } else {
      hasEditChanges = editPermissions.some(p => !initialPerms.includes(p));
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search roles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("pl-9", searchQuery && "pr-9")}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canEditAnyRole && (
              <Button onClick={handleCreateClick}>
                <Plus className="mr-2 h-4 w-4" /> Add Role
              </Button>
            )}
          </div>
        </div>

        <div className="border rounded-lg bg-card">
          <DataTable>
            <CRMTableHeader>
              <CRMTableRow>
                <CRMTableHeaderCell className="w-[22%]">Role Name</CRMTableHeaderCell>
                <CRMTableHeaderCell className="w-[55%]">Permissions</CRMTableHeaderCell>
                <CRMTableHeaderCell className="w-[10%]">Status</CRMTableHeaderCell>
                <CRMTableHeaderCell className="w-[13%] text-right">Actions</CRMTableHeaderCell>
              </CRMTableRow>
            </CRMTableHeader>
            <CRMTableBody>
              {filteredRoles.length === 0 ? (
                <CRMTableRow>
                  <CRMTableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No roles found
                  </CRMTableCell>
                </CRMTableRow>
              ) : (
                filteredRoles.map((role) => {
                  const isSuperAdminTarget = role.name.toUpperCase() === "SUPER ADMIN";
                  const canEditThisRole = canEditAnyRole && !(currentUserRole === "ADMIN" && isSuperAdminTarget);
                  const canDeleteThisRole = canEditThisRole && !role.isSystem;
                  const roleIsActive = role.isSystem ? true : role.isActive;
                  const modules = getModuleBadges(role);

                  return (
                    <CRMTableRow key={role.id}>
                      <CRMTableCell className="align-top pt-4">
                        <div className="flex items-center gap-2 font-medium">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: role.color || '#3b82f6' }} />
                          <span>{role.name}</span>
                          {role.isSystem && (
                            <Badge variant="secondary" className="ml-1 text-[9px] uppercase tracking-wider py-0 px-1">System</Badge>
                          )}
                        </div>
                      </CRMTableCell>
                      <CRMTableCell className="align-top pt-4">
                        <div className="flex flex-wrap gap-1.5">
                          {modules.length === 0 ? (
                            <span className="text-sm text-muted-foreground">No permissions assigned</span>
                          ) : (
                            <>
                              {modules.slice(0, 4).map(m => (
                                <Badge key={m} variant="secondary" className="font-normal text-xs bg-muted/50 text-muted-foreground hover:bg-muted">
                                  {m}
                                </Badge>
                              ))}
                              {modules.length > 4 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="font-normal text-xs border-dashed text-muted-foreground cursor-help">
                                        +{modules.length - 4} More
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-[200px] leading-relaxed">
                                        {modules.slice(4).join(', ')}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </>
                          )}
                        </div>
                      </CRMTableCell>
                      <CRMTableCell className="align-top pt-4">
                        <Badge variant={roleIsActive ? "default" : "destructive"} className="font-normal">
                          {roleIsActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </CRMTableCell>
                      <CRMTableCell className="align-top pt-4 text-right">
                        {canEditThisRole ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => handleEditClick(role)}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1.5" />
                              Edit
                            </Button>
                            {!role.isSystem && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleRenameClick(role)}
                                  title="Rename Role"
                                >
                                  <Pencil className="h-4 w-4 text-blue-500" />
                                </Button>
                                {canDeleteThisRole && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteClick(role)}
                                    title="Delete Role"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Restricted</span>
                        )}
                      </CRMTableCell>
                    </CRMTableRow>
                  );
                })
              )}
            </CRMTableBody>
          </DataTable>
        </div>
      </div>

      {/* ── Create Role Dialog ─────────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Create New Role
            </DialogTitle>
            <DialogDescription>
              Define a new role and its module access permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role Name</label>
              <Input 
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. Sales Manager"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Permissions</label>
              <div className="border rounded-md p-4 bg-muted/20">
                {renderInlinePermissionsEditor()}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newRoleName.trim()) {
                  toast.error("Role name is required");
                  return;
                }
                saveMutation.mutate({ id: "new", isNew: true, name: newRoleName });
              }}
              disabled={saveMutation.isPending || !newRoleName.trim()}
            >
              {saveMutation.isPending ? "Creating…" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Role Dialog ─────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Edit Permissions: {editTargetRole?.name}
            </DialogTitle>
            <DialogDescription>
              Modify the module access permissions for this role.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 border rounded-md p-4 mt-2 bg-muted/20">
            {renderInlinePermissionsEditor(editTargetRole?.name)}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editTargetRole) {
                  saveMutation.mutate({ id: editTargetRole.id, isNew: false });
                }
              }}
              disabled={saveMutation.isPending || isSystemAdminRole || !hasEditChanges}
            >
              {saveMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Rename Dialog ─────────────────────────────────────── */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Rename Role
            </DialogTitle>
            <DialogDescription>
              Enter a new name for <span className="font-semibold text-foreground">{renameTargetRole?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Role name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && renameValue.trim() && renameTargetRole) {
                  renameMutation.mutate({ id: renameTargetRole.id, name: renameValue.trim() });
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              disabled={renameMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!renameValue.trim()) {
                  toast.error("Role name cannot be empty");
                  return;
                }
                renameMutation.mutate({ id: renameTargetRole!.id, name: renameValue.trim() });
              }}
              disabled={renameMutation.isPending || !renameValue.trim()}
            >
              {renameMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ──────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Role
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{deleteTargetRole?.name}</span>?
              {" "}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-1 px-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            Roles assigned to users cannot be deleted.
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTargetRole && deleteMutation.mutate(deleteTargetRole.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

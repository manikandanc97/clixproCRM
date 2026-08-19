"use client";

import { useEffect, useState } from "react";
import {
  ScrollText,
  Search,
  RefreshCw,
  Building2,
  Clock,
  Eye,
  X,
  Download,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";
import {
  fetchPlatformAuditLogs,
  PlatformAuditLog,
} from "@/shared/lib/api/super-admin.api";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import {
  CRMPageContainer,
  CRMPageHeader,
  CRMMetricsGrid,
  CRMMetricCard,
  CRMToolbar,
} from "@/shared/components/crm";
import { EmptyState } from "@/shared/components/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export default function SuperAdminAuditLogsPage() {
  const [logs, setLogs] = useState<PlatformAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<PlatformAuditLog | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await fetchPlatformAuditLogs({
        search: search || undefined,
        module: moduleFilter || undefined,
      });
      setLogs(res.logs);
    } catch (err: any) {
      toast.error("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    setCurrentPage(1);
  }, [moduleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const exportCSV = () => {
    if (logs.length === 0) {
      toast.error("No logs to export.");
      return;
    }
    const headers = ["ID", "Action", "Module", "Actor", "Actor Email", "Organization", "Timestamp"];
    const rows = logs.map((l) => [
      l.id,
      l.action,
      l.module,
      `"${l.actor}"`,
      l.actorEmail || "",
      `"${l.organizationName}"`,
      l.createdAt,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `clixpro_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit logs exported.");
  };

  const modules = Array.from(new Set(logs.map((l) => l.module).filter(Boolean)));

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.module.toLowerCase().includes(q) ||
      l.actor.toLowerCase().includes(q) ||
      (l.actorEmail && l.actorEmail.toLowerCase().includes(q)) ||
      l.organizationName.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <CRMPageContainer>
      {/* 1. Standard CRM Page Header */}
      <CRMPageHeader
        title="Platform Audit Logs"
        subtitle="Immutable cross-tenant audit trail, security events, authentication records, and administrative mutations."
        icon={ScrollText}
        badge="Security & Compliance"
        actions={[
          {
            label: "Export CSV",
            icon: Download,
            onClick: exportCSV,
            variant: "outline",
          },
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: loadLogs,
            variant: "outline",
          },
        ]}
      />

      {/* 2. Standard CRM KPI Metrics Grid */}
      <div className="shrink-0">
        <CRMMetricsGrid cols={3}>
          <CRMMetricCard
            title="Recorded Events"
            value={logs.length}
            change="Tamper-Evident Trail"
            trend="neutral"
            icon={ScrollText}
            color="blue"
            loading={loading}
          />
          <CRMMetricCard
            title="Active Modules"
            value={modules.length || 1}
            change="Cross-System Audit"
            trend="up"
            icon={Activity}
            color="purple"
            loading={loading}
          />
          <CRMMetricCard
            title="Security Compliance"
            value="100%"
            change="Zero Breaches Detected"
            trend="up"
            icon={Shield}
            color="emerald"
            loading={loading}
          />
        </CRMMetricsGrid>
      </div>

      {/* 3. Standard CRM Toolbar & Filter Controls */}
      <CRMToolbar
        searchQuery={search}
        setSearchQuery={setSearch}
        placeholder="Search by action, module, or user email..."
      >
        <div className="flex items-center gap-2">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </CRMToolbar>

      {/* 4. Standard CRM Data Table */}
      <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="h-12 px-6 py-4">Action</th>
                <th className="h-12 px-6 py-4">Module</th>
                <th className="h-12 px-6 py-4">Organization</th>
                <th className="h-12 px-6 py-4">Actor</th>
                <th className="h-12 px-6 py-4">Timestamp</th>
                <th className="h-12 px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse h-16">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-muted rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-muted rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-muted rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                    <td className="px-6 py-4"><div className="h-3.5 w-20 bg-muted rounded" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-14 bg-muted rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="group h-16 hover:bg-muted/[0.03] transition-colors">
                    {/* Action */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-xs text-foreground font-mono bg-muted/50 px-2 py-1 rounded-md border border-border">
                        {log.action}
                      </span>
                    </td>

                    {/* Module */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border text-xs font-bold text-foreground">
                        {log.module}
                      </span>
                    </td>

                    {/* Organization */}
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-bold">{log.organizationName}</span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="px-6 py-4 text-xs">
                      <div>
                        <p className="font-bold text-foreground">{log.actor}</p>
                        {log.actorEmail && (
                          <p className="text-[11px] text-muted-foreground">{log.actorEmail}</p>
                        )}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => setSelectedLog(log)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs rounded-lg gap-1.5 hover:bg-muted font-semibold"
                      >
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                        <span>View</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 border-0">
                    <EmptyState
                      icon={ScrollText}
                      title="No audit logs found"
                      description="No recorded audit activities match the selected search query or module."
                      className="border-none bg-transparent shadow-none p-8 min-h-[220px]"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 bg-card border border-border rounded-xl p-4 shadow-sm flex-shrink-0">
          <div className="text-sm text-muted-foreground font-medium w-full md:w-auto text-center md:text-left">
            Showing <span className="font-bold text-foreground">{(currentPage - 1) * rowsPerPage + 1}</span>–<span className="font-bold text-foreground">{Math.min(currentPage * rowsPerPage, filteredLogs.length)}</span> of <span className="font-bold text-foreground">{new Intl.NumberFormat().format(filteredLogs.length)}</span> Logs
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Rows per page:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 font-semibold">
                    {rowsPerPage} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[4rem]">
                  {[10, 25, 50, 100].map(size => (
                    <DropdownMenuItem key={size} onClick={() => { setRowsPerPage(size); setCurrentPage(1); }} className="font-medium text-sm cursor-pointer hover:bg-muted">
                      {size}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center justify-center px-4 text-sm font-semibold text-foreground min-w-[5rem]">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-emerald-600" />
                <span>Audit Log Details</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-muted/40 border border-border/40">
                <div>
                  <span className="text-muted-foreground font-semibold">Action:</span>
                  <p className="font-bold text-foreground mt-0.5 font-mono">{selectedLog.action}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Module:</span>
                  <p className="font-bold text-emerald-600 mt-0.5">{selectedLog.module}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Actor:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedLog.actor} {selectedLog.actorEmail ? `(${selectedLog.actorEmail})` : ""}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Organization:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedLog.organizationName}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Timestamp:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Target User:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedLog.targetUser || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Raw Payload Details:
                </span>
                <pre className="p-3 rounded-xl bg-black/90 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56 border border-border/40">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </CRMPageContainer>
  );
}

import { 
  ToolbarSkeleton, 
  TableSkeleton 
} from "@/shared/components/skeletons";

export function RoleManagementSkeleton() {
  return (
    <div className="space-y-6">
      <ToolbarSkeleton />
      <TableSkeleton rows={5} cols={4} />
    </div>
  );
}

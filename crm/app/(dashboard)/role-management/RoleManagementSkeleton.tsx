import { CRMPageContainer } from "@/shared/components/crm";
import { 
  PageHeaderSkeleton, 
  ToolbarSkeleton, 
  TableSkeleton 
} from "@/shared/components/skeletons";

export function RoleManagementSkeleton() {
  return (
    <CRMPageContainer>
      <PageHeaderSkeleton />
      <div className="space-y-6 mt-6">
        <ToolbarSkeleton />
        <TableSkeleton rows={5} cols={4} />
      </div>
    </CRMPageContainer>
  );
}

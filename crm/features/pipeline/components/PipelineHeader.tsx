import { Plus, Download, Filter, Layers } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PipelineMetricType } from "@/shared/types/pipeline";
import { PageHeader } from "@/shared/components/PageHeader";
import PipelineAnalytics from "./PipelineAnalytics";

interface PipelineHeaderProps {
  stats: PipelineMetricType[];
}

const PipelineHeader = ({ stats }: PipelineHeaderProps) => {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Sales Pipeline"
        subtitle={`Visualizing ${stats.find(s => s.title === "Active Deals")?.value || "your"} active deals across the sales funnel.`}
        icon={Layers}
        badge="Funnel"
        actions={[
          {
            label: "Filter",
            icon: Filter,
            onClick: () => {},
            variant: "outline"
          },
          {
            label: "Export",
            icon: Download,
            onClick: () => {},
            variant: "outline"
          },
          {
            label: "Add New Deal",
            icon: Plus,
            onClick: () => {},
            variant: "default"
          }
        ]}
      >
        <div className="flex bg-muted p-1 rounded-xl border border-border mr-4">
           <Button variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold text-muted-foreground bg-card shadow-sm">Kanban</Button>
           <Button variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold text-muted-foreground">List View</Button>
        </div>
      </PageHeader>

      <PipelineAnalytics stats={stats} />
    </div>
  );
};

export default PipelineHeader;


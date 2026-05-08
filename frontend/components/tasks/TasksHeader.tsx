import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const TasksHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Task Management</h1>
        <p className="text-slate-500 mt-1">Keep track of your team&apos;s activities and deadlines.</p>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Button variant="outline" size="default" className="flex-1 md:flex-none">
          <Download />
          Export
        </Button>
        <Button size="lg" className="flex-1 md:flex-none">
          <Plus />
          Create Task
        </Button>
      </div>
    </div>
  );
};

export default TasksHeader;

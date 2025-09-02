
import { Cloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SyncButton = () => {
  return (
    <Badge variant="outline" className="flex items-center space-x-1">
      <Cloud className="h-3 w-3 text-green-500" />
      <span className="text-xs">En línea</span>
    </Badge>
  );
};

export default SyncButton;

import { Copy, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfigPanelProps {
  terraformConfig: string;
}

export function ConfigPanel({ terraformConfig }: ConfigPanelProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(terraformConfig);
  };

  return (
    <Card className="self-start">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generated Terraform Config</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon">
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-[calc(100vh-200px)]">
          <code>{terraformConfig}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
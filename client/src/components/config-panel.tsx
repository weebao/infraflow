import { Copy, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@stianlarsen/border-beam";

interface ConfigPanelProps {
  terraformConfig: string;
}

export function ConfigPanel({ terraformConfig }: ConfigPanelProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(terraformConfig);
  };

  return (
    <Card className="bg-card/10 backdrop-filter backdrop-blur-sm relative self-start">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generated Terraform Config</CardTitle>
        <Button size="icon">
          <Play className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {terraformConfig ? (
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-[calc(100vh-200px)]">
            <code>{terraformConfig}</code>
          </pre>
        ) : null}
      </CardContent>
      <BorderBeam size={200} duration={5} colorFrom="#7b42bc" colorTo="#a067da" />
    </Card>
  );
}
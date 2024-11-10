import React, { useState, useEffect } from "react";

import { Copy, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@stianlarsen/border-beam";
import { useProvider } from "@/context/provider-context";
import { useModuleContext } from "@/context/module-context";

export function ConfigPanel() {
  const { provider } = useProvider();
  const { modules } = useModuleContext();
  const [tfCode, setTfCode] = useState<string>("");

  useEffect(() => {
    const fetchCode = async () => {
      if (provider && modules.length > 0) {
        console.log("fetching", provider, modules);
        const code = await fetch("http://localhost:8000/generate-files", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            provider,
            modules,
          }),
        }).then((res) => res.text());
        setTfCode(code);
      }
    };
    fetchCode();
  }, [provider, modules])

  const handleCopy = () => {
    navigator.clipboard.writeText(tfCode);
  };

  return (
    <Card className="bg-card/75 backdrop-filter backdrop-blur-sm relative self-start">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generated Terraform Config</CardTitle>
      </CardHeader>
      <CardContent>
        {tfCode ? (
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-[calc(100vh-200px)]">
            <code>{tfCode}</code>
          </pre>
        ) : null}
      </CardContent>
      <BorderBeam size={100} duration={5} colorFrom="#7b42bc" colorTo="#a067da" />
    </Card>
  );
}
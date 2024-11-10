import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { InfoIcon, XIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { BorderBeam } from "@stianlarsen/border-beam";
import { useModuleContext } from "@/context/module-context";

interface InfoPanelProps {
  infoOpen: boolean;
  selectedNode: any;
  setInfoOpen: (open: boolean) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ infoOpen, selectedNode, setInfoOpen }) => {
  const { setModules } = useModuleContext();

  const handleChange = (key: string, value: any, type: string) => {
    console.log(key, value, type);
    if (!selectedNode || !selectedNode.data) return;

    setModules((modules) =>
      modules.map((module) => {
        if (module.name !== selectedNode.data.name) return module;

        console.log(module);

        // Check if argument already exists in module.args
        const argExists = module.args.some((arg: string) => arg.startsWith(key));

        // Define new argument based on type
        let newArg = "";
        if (type === "boolean") {
          newArg = value ? key : "";
        } else {
          newArg = `${key} ${value}`;
        }

        // Construct new arguments array
        const newArgs = argExists
          ? module.args.map((arg: string) => {
              const [argKey] = arg.split(" ");
              return argKey === key ? newArg : arg;
            })
          : [...module.args, newArg];

        return {
          ...module,
          args: newArgs.filter(Boolean), // Remove empty strings
        };
      })
    );
  };

  return (
    <Card
      className={`bg-card/75 backdrop-filter backdrop-blur-sm relative mt-2 w-[350px] transition-transform duration-300 ${
        infoOpen ? "translate-x-0" : "translate-x-[200%]"
      }`}
    >
      <CardHeader>
        <CardTitle className="text-xl">{String(selectedNode?.data.name)}</CardTitle>
        <XIcon className="absolute top-4 right-4 h-4 w-4 cursor-pointer" onClick={() => setInfoOpen(false)} />
      </CardHeader>
      <CardContent>
        <ReactMarkdown className="prose text-primary" remarkPlugins={[gfm]} children={String(selectedNode?.data.info)} />
        <div className="mt-4">
          {selectedNode?.data.args?.map(({ name, type, key }: any) => (
            <div key={key} className={`mb-4 flex ${type === "boolean" ? "items-center" : "flex-col"}`}>
              <Label className={`flex  items-center text-md font-medium mb-1`} htmlFor={key}>
                <InfoIcon className="inline-block w-4 h-4 mr-2" />
                <span>{name}</span>
              </Label>
              {type === "boolean" ? (
                <Checkbox id={key} className="ml-2 inline-block" onCheckedChange={(checked) => handleChange(key, checked, type)} />
              ) : (
                <Input id={key} type="text" onChange={(e) => handleChange(key, e.target.value, type)} />
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <BorderBeam size={300} duration={5} colorFrom="#0ea5e9" colorTo="#bae6fd" />
    </Card>
  );
};

export default InfoPanel;

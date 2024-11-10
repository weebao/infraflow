import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { XIcon } from "lucide-react";
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
  const { setModuleName, setArgs } = useModuleContext();

  const handleChange = (key: string, value: any) => {
    setModuleName(selectedNode?.data.name);
    setArgs((prevArgs: any) => ({ ...prevArgs, [key]: value }));
  }


  return (
    <Card
      className={`bg-card/10 backdrop-filter backdrop-blur-sm relative mt-2 w-[350px] transition-transform duration-300 ${
        infoOpen ? "translate-x-0" : "translate-x-[200%]"
      }`}
    >
      <CardHeader>
        <CardTitle className="text-xl">{String(selectedNode?.data.name)}</CardTitle>
        <XIcon className="absolute top-4 right-4 h-4 w-4 cursor-pointer" onClick={() => setInfoOpen(false)} />
      </CardHeader>
      <CardContent>
        <ReactMarkdown className="prose text-white" remarkPlugins={[gfm]} children={String(selectedNode?.data.info)} />
        <div className="mt-4">
          {console.log(selectedNode?.data)}
          {selectedNode?.data.args?.map(({name, type, key}: any) =>
            (
              <div key={key} className="mb-4">
                <Label className="inline-block text-md font-medium" htmlFor="terms">{name}</Label>
                {type === "boolean" ? (
                  <Checkbox
                    id="terms"
                    className="ml-2 inline-block"
                    onCheckedChange={(checked) => handleChange(key, checked)}
                  />
                ) : (
                  <Input
                    id="terms"
                    type="text"
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                )}
              </div>
            )
          )}
        </div>
      </CardContent>
      <BorderBeam size={300} duration={5} colorFrom="#0ea5e9" colorTo="#bae6fd" />
    </Card>
  );
};

export default InfoPanel;

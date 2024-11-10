import { Search, ChevronDown, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { services, tools } from "@/app/data/menu";

interface MenuProps {
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
  deleteNode: () => void;
  clearNode: () => void;
}

export function Menu({ selectedProvider, setSelectedProvider, deleteNode, clearNode }: MenuProps) {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, service: any) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("name", service.name);
    event.dataTransfer.setData("info", service.info);
    event.dataTransfer.setData("children", JSON.stringify(service.children));
  };

  return (
    <aside className="w-64 h-full border-r bg-background p-4 flex flex-col gap-4">
      {/* <Input type="search" placeholder="Search services..." className="w-full" /> */}
      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
        <SelectTrigger>
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="aws">AWS</SelectItem>
          <SelectItem value="azure">Azure</SelectItem>
          <SelectItem value="gcp">GCP</SelectItem>
        </SelectContent>
      </Select>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {/* {services[selectedProvider]?.map((serviceCategory: any) => (
            <Collapsible key={serviceCategory.category}>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
                {serviceCategory.category}
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                {serviceCategory.items.map((service: any) => (
                  <div
                    key={service.name}
                    draggable
                    onDragStart={(e) => handleDragStart(e, service)}
                    className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted cursor-move"
                  >
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="h-4 w-4" />
                      </HoverCardTrigger>
                      <HoverCardContent side="right" className="w-80 bg-background/80 backdrop-blur-sm border-none shadow-lg">
                        <div className="space-y-2">
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.info}</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {service.name}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))} */}
          {
            tools.map((tool: any) => (
              <div
                key={tool.name}
                draggable
                onDragStart={(e) => handleDragStart(e, tool)}
                className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted cursor-move"
              >
                {tool.name}
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Info className="h-4 w-4 cursor-pointer" />
                  </HoverCardTrigger>
                  <HoverCardContent side="right" className="w-80 bg-background/80 backdrop-blur-sm border-none shadow-lg">
                    <div className="space-y-2">
                      <h4 className="font-medium">{tool.name}</h4>
                      <ReactMarkdown className="prose text-sm text-muted-foreground" children={tool.info} />
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            ))
          }
        </div>
      </ScrollArea>

      <div className="sticky bottom-10 flex gap-2">
        <Button onClick={clearNode} className="flex-1 bg-sky-500 hover:bg-sky-700 font-semibold text-white">Clear</Button>
        <Button onClick={deleteNode} className="flex-1 bg-sky-500 hover:bg-sky-700 font-semibold text-whit">Delete</Button>
      </div>
    </aside>
  );
}

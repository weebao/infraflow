import React, { useState } from "react";
import { Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Ensure Input is correctly imported
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tools } from "@/app/data/menu";

interface MenuProps {
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
  deleteNode: () => void;
  clearNode: () => void;
}

export function Menu({ selectedProvider, setSelectedProvider, deleteNode, clearNode }: MenuProps) {
  const [isDragging, setIsDragging] = useState<string | null>(null);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, service: any) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("name", service.name);
    event.dataTransfer.setData("info", service.info);
    event.dataTransfer.setData("children", JSON.stringify(service.children));
    setIsDragging(service.name);
  };

  const handleClearNode = async () => {
    try {
      const response = await fetch('/api/clear-node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      clearNode();
    } catch (error) {
      console.error('Failed to clear node:', error);
    }
  };

  const handleDeleteNode = async () => {
    try {
      const response = await fetch('/api/delete-node', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      deleteNode();
    } catch (error) {
      console.error('Failed to delete node:', error);
    }
  };

  return (
    <aside className="w-64 h-full border-r bg-background p-4 flex flex-col gap-4">
      <Input type="search" placeholder="Search services..." className="w-full" />

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
          {tools.map((tool: any) => (
            <div
              key={tool.name}
              draggable
              onDragStart={(e) => handleDragStart(e, tool)}
              className={`flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted cursor-grab active:cursor-grabbing transition-all ${isDragging === tool.name ? "pl-4" : ""}`}
              onDragEnd={() => setIsDragging(null)}
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
          ))}
        </div>
      </ScrollArea>

      <div className="sticky bottom-10 flex gap-2">
        <Button onClick={handleClearNode} className="flex-1 bg-sky-600 hover:bg-sky-700 font-semibold text-white">
          Clear
        </Button>
        <Button onClick={handleDeleteNode} className="flex-1 bg-sky-600 hover:bg-sky-700 font-semibold text-white">
          Delete
        </Button>
      </div>
    </aside>
  );
}

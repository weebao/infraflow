"use client";

import React, { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { useReactFlow, Handle, Position, NodeProps, Node, Edge } from "@xyflow/react";
import { useProvider } from "@/context/provider-context";
import { BaseNode } from "@/components/base-node";
import { InfoIcon, PanelTopOpenIcon } from "lucide-react";

type GroupNodeData = Node<{
  name: string;
  info: string;
  children: any;
  isSuggestion: boolean;
  provider: string;
  toggleInfoPanel: () => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}>;

export function GroupNode({ id, data, selected }: NodeProps<GroupNodeData>) {
  const { provider, setProvider } = useProvider();
  const [show, setShow] = useState<boolean>(false);
  const [height, setHeight] = useState<number | undefined>();

  const removeChildren = () => {
    data.setNodes((nds) => nds.filter((nd) => nd.parentId !== id));
  }

  const addChildren = (provider: string) => {
    // Clear all children nodes and edges
    removeChildren();
    // Add new children that fits the selected provider
    const nodes = data.children[provider].map((child: any, index: number) => ({
      id: nanoid(),
      type: "ServiceNode",
      position: {
        x: 20,
        y: 80 * (index) + 60,
      },
      data: {
        name: child.name,
        info: child.info,
        toggleInfoPanel: data.toggleInfoPanel,
      },
      parentId: id,
    }));
    data.setNodes((nds) => nds.concat(nodes));
  };

  const toggleShow = () => {
    if (show) {
      setHeight(undefined);
      removeChildren();
    } else {
      setHeight(80 * (data.children[provider].length + 1));
      addChildren(provider);
    }
    setShow(!show);
  };

  useEffect(() => {
    if (show) {
      addChildren(provider)
    }
  }, [provider]);

  return (
    <BaseNode
      id={id}
      selected={selected}
      style={{
        height,
        minWidth: 300,
      }}
    >
      <>
        {data.name}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <PanelTopOpenIcon className="w-4 h-4 hover:text-sky-500 cursor-pointer" onClick={toggleShow} />
          <InfoIcon className="w-4 h-4 hover:text-sky-500 cursor-pointer" onClick={data.toggleInfoPanel} />
        </div>
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </>
    </BaseNode>
  );
}

GroupNode.displayName = "GroupNode";

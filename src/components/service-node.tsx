"use client";

import React, { useState, useRef } from "react";
import { useReactFlow, Handle, Position, NodeProps, Node } from "@xyflow/react";
import { BaseNode } from "@/components/base-node";
import { InfoIcon } from "lucide-react";

type ServiceNodeData = Node<{
  name: string;
  info: string;
  isSuggestion: boolean;
  toggleInfoPanel: () => void;
}>;

export function ServiceNode({ id, data, selected, parentId }: NodeProps<ServiceNodeData>) {
  return (
    <BaseNode
      id={id}
      selected={selected}
    >
      <>
        {data.name}
        <InfoIcon className="absolute w-3 h-3 top-2 right-2 hover:text-sky-500 cursor-pointer" onClick={data.toggleInfoPanel} />
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </>
    </BaseNode>
  );
}

ServiceNode.displayName = "ServiceNode";

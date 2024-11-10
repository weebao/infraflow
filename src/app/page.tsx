"use client";

import React, { useCallback, useState, useRef } from "react";
import {
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Controls,
  Connection,
  ReactFlowProvider,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  ReactFlow,
} from "@xyflow/react";
import { XIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { Menu } from "@/components/menu";
import { ServiceNode } from "@/components/service-node";
import { AnimatedSvgEdge } from "@/components/animated-svg-edge";
import { ConfigPanel } from "@/components/config-panel";
import { nanoid } from "nanoid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const defaultEdges = [
  {
    id: "1->2",
    source: "1",
    target: "2",
    type: "animatedSvgEdge",
    data: {
      duration: 2,
      shape: "package",
      path: "smoothstep",
    },
  } satisfies AnimatedSvgEdge,
];

const edgeTypes = {
  animatedSvgEdge: AnimatedSvgEdge,
};

const nodeTypes = {
  ServiceNode: ServiceNode,
};

const Home: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("aws");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [infoOpen, setInfoOpen] = useState<boolean>(false);

  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, type: "animatedSvgEdge", animated: true }, eds)), []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const name = event.dataTransfer.getData("name");
      const info = event.dataTransfer.getData("info");

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: nanoid(),
        type: "ServiceNode",
        position,
        data: {
          name,
          info,
          toggleInfoPanel: (id: string) => {
            if (selectedNode?.id === id) {
              setInfoOpen(!infoOpen);
            } else {
              setInfoOpen(true);
            }
          }
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition]
  );

  const selectNode = (e: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const deleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node !== selectedNode));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
      setSelectedNode(null);
    }
  };

  const clearNode = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  };

  return (
    <div className="flex h-full flex-grow">
      <Menu selectedProvider={selectedProvider} setSelectedProvider={setSelectedProvider} deleteNode={deleteNode} clearNode={clearNode} />
      <div className="h-full flex-grow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={edgeTypes}
          defaultEdges={defaultEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={selectNode}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          elementsSelectable
        >
          <Background />
        </ReactFlow>
      </div>
      <div className="fixed top-0 right-0 m-4">
        <ConfigPanel terraformConfig="" />
        <Card className={`relative mt-2 w-[350px] transition-transform duration-300 ${infoOpen ? 'translate-x-0' : 'translate-x-[200%]'}`}>
          <CardHeader>
            <CardTitle className="text-xl">{String(selectedNode?.data.name)}</CardTitle>
            <XIcon className="absolute top-4 right-4 h-4 w-4 cursor-pointer" onClick={() => setInfoOpen(false)} />
          </CardHeader>
          <CardContent>
            <ReactMarkdown className="prose text-white" remarkPlugins={[gfm]} children={String(selectedNode?.data.info)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;

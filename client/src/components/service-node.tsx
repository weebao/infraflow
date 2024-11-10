// "use client";

// import React from "react";
// import { Handle, Position, NodeProps, Node } from "@xyflow/react";
// import { BaseNode } from "@/components/base-node";
// import { InfoIcon } from "lucide-react";

// // Import AWS icons from react-icons/si
// import { 
//   SiAwslambda, 
//   SiAmazonrds, 
//   SiAmazonec2, 
//   SiAmazoniam, 
//   SiAmazons3, 
//   SiAmazonroute53, 
//   SiAmazoncloudwatch, 
//   SiAmazondynamodb,
//   SiAmazon // Default AWS icon
// } from "react-icons/si";

// // Import GCP icons from react-icons/si
// // import { 
// //   SiGooglecloud, 
// //   SiGooglefunctions, 
// //   SiGooglestorage, 
// //   SiGooglebigquery, 
// //   SiGoogleiam, 
// //   SiGoogleappengine,
// //   SiGooglemonitoring,
// //   SiGooglesql
// // } from "react-icons/si";

// // Import Azure icons from azure-react-icons
// import { 
//   AzVirtualMachine, 
//   AzFunctions, 
//   AzStorageBlob, 
//   CosmosDBcolor, 
//   AzKeyVault, 
//   AzAppService,
//   AzMonitor,
//   AzSQLDatabase,
//   Azure // Default Azure icon
// } from "azure-react-icons";

// /**
//  * Define the type for Service Node Data
//  */
// type ServiceNodeData = Node<{
//   name: string;
//   provider: "AWS" | "Azure" | "GCP";
//   info: string;
//   isSuggestion: boolean;
//   toggleInfoPanel: () => void;
// }>;

// /**
//  * Mapping of AWS service names to their corresponding icon components
//  */
// const awsServiceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
//   EC2: SiAmazonec2,
//   Lambda: SiAwslambda,
//   S3: SiAmazons3,
//   "Route 53": SiAmazonroute53,
//   CloudFront: SiAmazoncloudwatch,
//   DynamoDB: SiAmazondynamodb,
//   IAM: SiAmazoniam,
//   RDS: SiAmazonrds,
// };

// /**
//  * Mapping of Azure service names to their corresponding icon components
//  */
// const azureServiceIcons: Record<string, React.ComponentType> = {
//   VM: AzVirtualMachine,
//   Functions: AzFunctions,
//   "Blob Storage": AzStorageBlob,
//   CosmosDB: CosmosDBcolor,
//   "Azure IAM": AzKeyVault,
//   "App Services": AzAppService,
//   Monitor: AzMonitor,
//   SQL: AzSQLDatabase,
// };

// /**
//  * Mapping of GCP service names to their corresponding icon components
//  */
// // const gcpServiceIcons: Record<string, React.ComponentType> = {
// //   ComputeEngine: SiGooglecloud,
// //   Functions: SiGooglefunctions,
// //   "Cloud Storage": SiGooglestorage,
// //   BigQuery: SiGooglebigquery,
// //   "GCP IAM": SiGoogleiam,
// //   "App Engine": SiGoogleappengine,
// //   Monitoring: SiGooglemonitoring,
// //   SQL: SiGooglesql,
// // };

// /**
//  * Combined Service Icons mapping based on provider
//  */
// const serviceIcons: Record<string, Record<string, React.ComponentType>> = {
//   AWS: awsServiceIcons,
//   Azure: azureServiceIcons,
//   // GCP: gcpServiceIcons,
// };

// /**
//  * Default Icons for each provider
//  */
// const defaultIcons: Record<string, React.ComponentType> = {
//   AWS: SiAmazon,
//   Azure: Azure,
//   // GCP: SiGooglecloud,
// };

// /**
//  * CloudServiceNode Component
//  * Handles AWS, Azure, and GCP service nodes based on the provider prop
//  */
// export function CloudServiceNode({ id, data, selected }: NodeProps<ServiceNodeData>) {
//   const { provider, name, toggleInfoPanel } = data;

//   // Select the appropriate icon based on provider and service name
//   const IconComponent = serviceIcons[provider]?.[name] || defaultIcons[provider];

//   return (
//     <BaseNode id={id} selected={selected}>
//       <>
//         {/* Display the service icon if it exists */}
//         {IconComponent && <IconComponent className="w-6 h-6 mr-2" />}
//         {name}
//         <InfoIcon 
//           className="absolute w-3 h-3 top-2 right-2 hover:text-sky-500 cursor-pointer" 
//           onClick={toggleInfoPanel} 
//         />
//         <Handle type="source" position={Position.Right} />
//         <Handle type="target" position={Position.Left} />
//       </>
//     </BaseNode>
//   );
// }

// CloudServiceNode.displayName = "CloudServiceNode";


"use client";

import React from "react";
import { useReactFlow, Handle, Position, NodeProps, Node } from "@xyflow/react";
import { BaseNode } from "@/components/base-node";
import { InfoIcon } from "lucide-react";

// Import AWS icons from react-icons/si
import { SiAwslambda , SiAmazonrds, SiAmazonec2, SiAmazoniam, SiAmazons3, SiAmazonroute53, SiAmazoncloudwatch , SiAmazondynamodb } from "react-icons/si";

// Map each service name to the corresponding icon component
const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  EC2: SiAmazonec2,
  Lambda: SiAwslambda,
  S3: SiAmazons3,
  "Route 53": SiAmazonroute53,
  CloudFront: SiAmazoncloudwatch ,
  DynamoDB: SiAmazondynamodb,
  IAM: SiAmazoniam,
  RDS: SiAmazonrds,
};

type ServiceNodeData = Node<{
  name: string;
  info: string;
  isSuggestion: boolean;
  toggleInfoPanel: () => void;
  args: any;
}>;

export function ServiceNode({ id, data, selected, parentId }: NodeProps<ServiceNodeData>) {
  // Select the appropriate icon based on data.name
  const IconComponent = serviceIcons[data.name] || SiAmazonec2

  return (
    <BaseNode id={id} selected={selected}>
      <>
        {/* Display the service icon if it exists */}
        <div className="flex items-center">
          {IconComponent && <IconComponent className="w-6 h-6 mr-2" />}
          {data.name}
        </div>
        <InfoIcon className="absolute w-3 h-3 top-2 right-2 hover:text-sky-500 cursor-pointer" onClick={data.toggleInfoPanel} />
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </>
    </BaseNode>
  );
}

ServiceNode.displayName = "ServiceNode";
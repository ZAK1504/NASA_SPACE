import React from "react";
import ScientificWorkspaceLayout from "../../components/layout/ScientificWorkspaceLayout";
import { DiscoveryLab } from "../DiscoveryLab";

export const DiscoveryLabWorkspace: React.FC = () => {
  return (
    <ScientificWorkspaceLayout
      title="Discovery Lab"
      categoryTag="03 · RESEARCH WORKSTATION"
      defaultChapter="labs"
      workspaceType="labs"
      activeTool="discovery"
    >
      <div className="w-full h-full flex-1">
        <DiscoveryLab />
      </div>
    </ScientificWorkspaceLayout>
  );
};

export default DiscoveryLabWorkspace;
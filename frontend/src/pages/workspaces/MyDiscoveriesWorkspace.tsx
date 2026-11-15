import React from "react";
import ScientificWorkspaceLayout from "../../components/layout/ScientificWorkspaceLayout";
import { MyDiscoveries } from "../MyDiscoveries";

export const MyDiscoveriesWorkspace: React.FC = () => {
  return (
    <ScientificWorkspaceLayout
      title="My Discoveries Journal"
      categoryTag="03 · RESEARCH WORKSTATION"
      defaultChapter="labs"
      workspaceType="labs"
      activeTool="discoveries"
    >
      <div className="w-full h-full flex-1">
        <MyDiscoveries />
      </div>
    </ScientificWorkspaceLayout>
  );
};

export default MyDiscoveriesWorkspace;
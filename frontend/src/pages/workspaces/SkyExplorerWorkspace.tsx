import React from "react";
import ScientificWorkspaceLayout from "../../components/layout/ScientificWorkspaceLayout";
import { ExploreSky } from "../ExploreSky";

export const SkyExplorerWorkspace: React.FC = () => {
  return (
    <ScientificWorkspaceLayout
      title="All-Sky Explorer"
      categoryTag="01 · ALL-SKY SURVEY"
      defaultChapter="explorer"
      workspaceType="explorer"
      activeTool="sky"
    >
      <div className="w-full h-full flex-1">
        <ExploreSky />
      </div>
    </ScientificWorkspaceLayout>
  );
};

export default SkyExplorerWorkspace;
import React from "react";
import ScientificWorkspaceLayout from "../../components/layout/ScientificWorkspaceLayout";
import { SpectralExplorer } from "../SpectralExplorer";

export const SpectralExplorerWorkspace: React.FC = () => {
  return (
    <ScientificWorkspaceLayout
      title="Spectral Explorer"
      categoryTag="01 · ALL-SKY SURVEY"
      defaultChapter="explorer"
      workspaceType="explorer"
      activeTool="spectral"
    >
      <div className="w-full h-full flex-1">
        <SpectralExplorer />
      </div>
    </ScientificWorkspaceLayout>
  );
};

export default SpectralExplorerWorkspace;
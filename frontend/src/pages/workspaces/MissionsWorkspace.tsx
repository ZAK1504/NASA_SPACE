import React from "react";
import ScientificWorkspaceLayout from "../../components/layout/ScientificWorkspaceLayout";
import { Missions } from "../Missions";

export const MissionsWorkspace: React.FC = () => {
  return (
    <ScientificWorkspaceLayout
      title="Guided Science Missions"
      categoryTag="04 · OBSERVATORY MISSIONS"
      defaultChapter="mission"
      workspaceType="mission"
    >
      <div className="w-full h-full flex-1">
        <Missions />
      </div>
    </ScientificWorkspaceLayout>
  );
};

export default MissionsWorkspace;
import React from "react";
import ScientificWorkspaceLayout from "../../components/layout/ScientificWorkspaceLayout";
import { LightCurves } from "../LightCurves";

export const LightCurvesWorkspace: React.FC = () => {
  return (
    <ScientificWorkspaceLayout
      title="Photometric Light Curves"
      categoryTag="03 · RESEARCH WORKSTATION"
      defaultChapter="labs"
      workspaceType="labs"
      activeTool="light-curves"
    >
      <div className="w-full h-full flex-1">
        <LightCurves />
      </div>
    </ScientificWorkspaceLayout>
  );
};

export default LightCurvesWorkspace;
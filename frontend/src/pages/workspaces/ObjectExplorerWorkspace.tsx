import React from "react";
import { useParams } from "react-router-dom";
import ScientificWorkspaceLayout from "../../components/layout/ScientificWorkspaceLayout";
import { ObjectExplorer } from "../ObjectExplorer";
import { ObjectDetail } from "../ObjectDetail";

export const ObjectExplorerWorkspace: React.FC = () => {
  const params = useParams<{ objectId?: string }>();
  const objectId = params.objectId;

  return (
    <ScientificWorkspaceLayout
      title={objectId ? `Target Detail: ${objectId}` : "Target Explorer"}
      categoryTag="01 · ALL-SKY SURVEY"
      defaultChapter="explorer"
      workspaceType="explorer"
      activeTool="object"
    >
      <div className="w-full h-full flex-1">
        {objectId ? <ObjectDetail /> : <ObjectExplorer />}
      </div>
    </ScientificWorkspaceLayout>
  );
};

export default ObjectExplorerWorkspace;
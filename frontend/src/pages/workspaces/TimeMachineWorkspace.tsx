import React from "react";
import ScientificWorkspaceLayout from "../../components/layout/ScientificWorkspaceLayout";
import { TimeMachine } from "../TimeMachine";

export const TimeMachineWorkspace: React.FC = () => {
  return (
    <ScientificWorkspaceLayout
      title="SPHEREx Time Machine"
      categoryTag="02 · VARIABLE SKY"
      defaultChapter="time-machine"
      workspaceType="time-machine"
    >
      <div className="w-full h-full flex-1">
        <TimeMachine />
      </div>
    </ScientificWorkspaceLayout>
  );
};

export default TimeMachineWorkspace;
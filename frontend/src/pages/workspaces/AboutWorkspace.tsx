import React from "react";
import ScientificWorkspaceLayout from "../../components/layout/ScientificWorkspaceLayout";
import { About } from "../About";

export const AboutWorkspace: React.FC = () => {
  return (
    <ScientificWorkspaceLayout
      title="About SPHEREx"
      categoryTag="MISSION ARCHITECTURE & ATTRIBUTION"
      defaultChapter="home"
    >
      <div className="w-full h-full flex-1 overflow-y-auto">
        <About />
      </div>
    </ScientificWorkspaceLayout>
  );
};

export default AboutWorkspace;

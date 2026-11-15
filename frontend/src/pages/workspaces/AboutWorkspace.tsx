import React from "react";
import ScientificWorkspaceLayout from "../../components/layout/ScientificWorkspaceLayout";
import About from "../About";
import { useLocation } from "react-router-dom";

export const AboutWorkspace: React.FC = () => {
  const location = useLocation();
  const originChapter = location.state?.originChapter || "mission";

  return (
    <ScientificWorkspaceLayout
      title="Behind the Horizon"
      categoryTag="METEOR RIZZLERS · CREATORS & MISSION"
      defaultChapter={originChapter}
    >
      <div className="w-full h-full flex-1">
        <About defaultReturnChapter={originChapter} />
      </div>
    </ScientificWorkspaceLayout>
  );
};

export default AboutWorkspace;

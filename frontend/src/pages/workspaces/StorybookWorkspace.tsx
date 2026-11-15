import React from "react";
import CosmicChronicle from "../../components/storybook/CosmicChronicle";
import { useLocation } from "react-router-dom";

export const StorybookWorkspace: React.FC = () => {
  const location = useLocation();
  const originChapter = location.state?.originChapter || "about";

  return <CosmicChronicle defaultReturnChapter={originChapter} />;
};

export default StorybookWorkspace;

import React from "react";
import Pic from "./Pic";

interface BackdropProps {
  activeSection?: string;
}

/** One shared persistent cosmic environment behind every section, with section-dependent atmospheric evolution. */
export const Backdrop: React.FC<BackdropProps> = ({ activeSection = "home" }) => {
  return (
    <div className="backdrop" data-section={activeSection} aria-hidden="true">
      <div className="bd-neb">
        <Pic kind="nebula" seed={11} w={640} h={360} alt="" />
      </div>
      <i className="bd-glow" />
      <i className="bd-atmosphere" />
      <i className="bd-shade" />
    </div>
  );
};

export default Backdrop;

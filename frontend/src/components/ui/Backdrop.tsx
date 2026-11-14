import React from "react";
import Pic from "./Pic";

/** One shared deep-space backdrop behind every page, so the whole site reads as a single continuous scene. */
export const Backdrop: React.FC = () => {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="bd-neb">
        <Pic kind="nebula" seed={11} w={640} h={360} alt="" />
      </div>
      <i className="bd-glow" />
      <i className="bd-shade" />
    </div>
  );
};

export default Backdrop;

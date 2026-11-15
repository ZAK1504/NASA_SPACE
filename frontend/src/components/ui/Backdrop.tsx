import React from 'react';
import Pic from './Pic';
import { CHAPTER_ENVS } from '../../lib/chapterAtmosphere';

interface BackdropProps {
  activeSection?: string;
}

/** One shared persistent cosmic environment behind every section, with section-dependent atmospheric evolution. */
export const Backdrop: React.FC<BackdropProps> = ({ activeSection = 'home' }) => {
  const env = CHAPTER_ENVS[activeSection] || CHAPTER_ENVS.home;
  return (
    <div className="backdrop" data-section={activeSection} aria-hidden="true">
      <div className="bd-neb" style={{ opacity: env.nebulaOpacity }}>
        <Pic kind="nebula" seed={11} w={640} h={360} alt="" />
      </div>
      <i className="bd-glow" />
      <i className="bd-atmosphere" style={{ background: env.ambientColor, opacity: 0.6 }} />
      <i className="bd-shade" />
    </div>
  );
};

export default Backdrop;

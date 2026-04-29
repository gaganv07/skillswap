import React from 'react';
import logo from '../assets/skillswap-logo.png';

function BrandLogo({ compact = false }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-3' : 'flex-col gap-3 text-center'}`}>
      <img
        src={logo}
        alt="SkillSwap Connect logo"
        className={compact ? 'h-12 w-12 rounded-xl object-cover' : 'h-24 w-24 rounded-2xl object-cover shadow-sm'}
      />
      <div>
        <div className={`font-semibold text-slate-900 ${compact ? 'text-lg' : 'text-2xl'}`}>SkillSwap Connect</div>
        <div className="text-sm text-slate-500">Learn what you need. Teach what you know.</div>
      </div>
    </div>
  );
}

export default BrandLogo;

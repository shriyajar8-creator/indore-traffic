import React from 'react';
import { ConstructionProject, RoadSegment } from '../../types';
import { Construction, Plus, Building2, Clock } from 'lucide-react';

interface ConstructionTabProps {
  constructions: ConstructionProject[];
  roads: RoadSegment[];
}

export const ConstructionTab: React.FC<ConstructionTabProps> = ({ constructions, roads }) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Construction className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Infrastructure & Metro Construction Portal</h2>
            <p className="text-xs text-slate-400">Public Works Department (PWD) & Indore Development Authority (IDA) Work Zones</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-bold uppercase">ACTIVE PROJECTS</span>
          <span className="text-xl font-black text-orange-400 font-sans">{constructions.filter(c => c.status === 'ACTIVE').length} Projects</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {constructions.map((c) => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 shadow-lg">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-500/30">
                  {c.status}
                </span>
                <h3 className="font-bold text-sm text-white mt-1">{c.projectName}</h3>
                <p className="text-xs text-slate-400">Contractor: {c.contractorDepartment}</p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                +{c.expectedDelayMinutes} min delay
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Affected Corridor</span>
                <span className="font-bold text-white">{c.roadName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Lanes Obstructed</span>
                <span className="font-bold text-white">{c.affectedLanes} Lanes</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Start Date</span>
                <span className="font-mono text-slate-300">{c.startDate.slice(0, 10)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Expected Completion</span>
                <span className="font-mono text-slate-300">{c.expectedEndDate.slice(0, 10)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

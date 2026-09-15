import React from 'react';
import { TrafficKpis } from '../types';
import { AlertTriangle, Flame, Gauge, Octagon, Construction, Activity, Siren, Users } from 'lucide-react';

interface KpiSectionProps {
  kpis: TrafficKpis;
}

export const KpiCardsSection: React.FC<KpiSectionProps> = ({ kpis }) => {
  const cards = [
    {
      title: 'ACTIVE INCIDENTS',
      value: kpis.activeIncidents,
      unit: 'Incidents',
      change: '+2 from peak',
      color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      icon: AlertTriangle
    },
    {
      title: 'CONGESTED ROADS',
      value: kpis.congestedRoads,
      unit: 'Corridors >60%',
      change: '+14% vs avg',
      color: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
      icon: Flame
    },
    {
      title: 'AVERAGE CITY SPEED',
      value: `${kpis.averageCitySpeed} km/h`,
      unit: 'Citywide Velocity',
      change: '-18% peak drag',
      color: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
      icon: Gauge
    },
    {
      title: 'ROADS CLOSED',
      value: kpis.roadsClosed,
      unit: 'Active Diversions',
      change: 'Authority Enforced',
      color: 'border-red-500/30 text-red-400 bg-red-500/10',
      icon: Octagon
    },
    {
      title: 'ACTIVE CONSTRUCTION',
      value: kpis.activeConstruction,
      unit: 'Work Zones',
      change: 'Metro / Flyover',
      color: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
      icon: Construction
    },
    {
      title: 'AVERAGE CONGESTION',
      value: `${kpis.averageCongestionPercentage}%`,
      unit: 'Network Saturation',
      change: '+21% worsening',
      color: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
      icon: Activity
    },
    {
      title: 'EMERGENCY INCIDENTS',
      value: kpis.emergencyIncidents,
      unit: 'Critical 108 Priority',
      change: 'Immediate Dispatch',
      color: 'border-red-600/40 text-red-500 bg-red-600/10',
      icon: Siren
    },
    {
      title: 'AFFECTED USERS',
      value: kpis.affectedUsers.toLocaleString(),
      unit: 'Active Commuters',
      change: 'Realtime Impacted',
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      icon: Users
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 p-3 bg-[#0F172A] border-b border-slate-800">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div 
            key={i} 
            className={`p-2.5 rounded-xl border ${c.color} flex flex-col justify-between transition-all hover:scale-[1.02] shadow-lg`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-wider">
              <span>{c.title}</span>
              <Icon className="w-3.5 h-3.5 opacity-80" />
            </div>
            <div className="my-1">
              <span className="text-xl font-black font-sans tracking-tight text-white">{c.value}</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span className="truncate">{c.unit}</span>
              <span className="text-slate-300 font-medium">{c.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

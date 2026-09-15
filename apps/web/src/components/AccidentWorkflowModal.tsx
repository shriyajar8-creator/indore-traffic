import React from 'react';
import { Incident, ReroutePlan } from '../types';
import { ShieldAlert, CheckCircle2, Clock, Siren, Bell, MapPin, ArrowRight } from 'lucide-react';

interface TimelineProps {
  incident: Incident | null;
  plan: ReroutePlan | null;
  onClose: () => void;
}

export const AccidentWorkflowModal: React.FC<TimelineProps> = ({ incident, plan, onClose }) => {
  if (!incident) return null;

  const timelineSteps = [
    {
      time: '10:32:04',
      title: 'Accident Detected',
      desc: 'Multi-vehicle collision reported on AB Road near Vijay Nagar Square. 3 lanes obstructed.',
      status: 'completed',
      icon: Siren,
      color: 'text-red-400 bg-red-500/10 border-red-500/30'
    },
    {
      time: '10:32:17',
      title: 'Traffic Impact Calculated',
      desc: 'Sensor grid detected speed drop to 18 km/h (+21% congestion spike on corridor).',
      status: 'completed',
      icon: ShieldAlert,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      time: '10:32:31',
      title: 'Alternate Route Generated',
      desc: 'Routing engine computed 3 alternate corridors. Route C (Eastern Bypass) recommended (Save 11 min).',
      status: 'completed',
      icon: MapPin,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    },
    {
      time: '10:33:02',
      title: 'Authority Approved Reroute',
      desc: 'Director Mehta approved dynamic road closure & traffic diversion order.',
      status: plan?.status === 'APPROVED' ? 'completed' : 'pending',
      icon: CheckCircle2,
      color: plan?.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-slate-500 bg-slate-800 border-slate-700'
    },
    {
      time: '10:33:05',
      title: 'Civilians Notified via WebSocket',
      desc: 'Instant push alert broadcasted to 8,421 commuters heading towards AB Road.',
      status: plan?.status === 'APPROVED' ? 'completed' : 'pending',
      icon: Bell,
      color: plan?.status === 'APPROVED' ? 'text-purple-400 bg-purple-500/10 border-purple-500/30' : 'text-slate-500 bg-slate-800 border-slate-700'
    },
    {
      time: '10:33:10',
      title: 'Routes Recalculated',
      desc: 'Civilian mobile apps automatically rerouted commuters away from AB Road.',
      status: plan?.status === 'APPROVED' ? 'completed' : 'pending',
      icon: Clock,
      color: plan?.status === 'APPROVED' ? 'text-teal-400 bg-teal-500/10 border-teal-500/30' : 'text-slate-500 bg-slate-800 border-slate-700'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Accident Command-and-Response Loop Timeline</h2>
              <p className="text-xs text-slate-400">SIH Key Innovation: Realtime Interventions & Response Tracking</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-slate-800">
            Close Modal
          </button>
        </div>

        {/* Timeline Items */}
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800">
          {timelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative flex items-start space-x-4 pl-8">
                <div className={`absolute left-0 w-8 h-8 rounded-full border flex items-center justify-center ${step.color} shadow-lg z-10`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-xs text-white">{step.title}</h4>
                    <span className="text-[10px] font-mono text-blue-400">{step.time}</span>
                  </div>
                  <p className="text-xs text-slate-300">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-5 rounded-lg">
            Return to Command Center
          </button>
        </div>
      </div>
    </div>
  );
};

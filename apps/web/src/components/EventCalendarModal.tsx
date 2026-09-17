import React, { useState } from 'react';
import { Calendar, Plus, MapPin, AlertCircle, Sparkles, X } from 'lucide-react';

export interface TrafficEvent {
  id: string;
  title: string;
  eventType: 'FESTIVAL' | 'EXAM' | 'RALLY' | 'MATCH' | 'CONCERT';
  locationName: string;
  eventDate: string;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  expectedSurgePercentage: number;
}

interface EventCalendarProps {
  events: TrafficEvent[];
  onAddEvent: (event: TrafficEvent) => void;
  onClose?: () => void;
}

export const EventCalendarModal: React.FC<EventCalendarProps> = ({ events, onAddEvent, onClose }) => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<TrafficEvent['eventType']>('RALLY');
  const [locationName, setLocationName] = useState('Rajwada City Center');
  const [eventDate, setEventDate] = useState('2026-09-18');
  const [impactLevel, setImpactLevel] = useState<TrafficEvent['impactLevel']>('HIGH');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent({
      id: `evt-${Date.now()}`,
      title,
      eventType,
      locationName,
      eventDate,
      impactLevel,
      expectedSurgePercentage: impactLevel === 'CRITICAL' ? 45 : impactLevel === 'HIGH' ? 30 : 15
    });
    setTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
            City Event Awareness Calendar ({events.length} Active Events)
          </h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-1 px-3 rounded-lg flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ADD EVENT</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 text-[10px]">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., MPPSC State Exam 2026"
                className="w-full bg-slate-900 border border-slate-700 text-white p-1.5 rounded focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px]">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white p-1.5 rounded focus:outline-none"
              >
                <option value="RALLY">Public Rally</option>
                <option value="EXAM">State Exam</option>
                <option value="FESTIVAL">Festival Procession</option>
                <option value="MATCH">Cricket Match (Holkar)</option>
                <option value="CONCERT">Concert / Expo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 text-[10px]">Location</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white p-1.5 rounded focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px]">Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white p-1.5 rounded focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px]">Impact Level</label>
              <select
                value={impactLevel}
                onChange={(e) => setImpactLevel(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white p-1.5 rounded focus:outline-none"
              >
                <option value="CRITICAL">Critical (+45% surge)</option>
                <option value="HIGH">High (+30% surge)</option>
                <option value="MODERATE">Moderate (+15% surge)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1 bg-slate-800 text-slate-300 rounded">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1 bg-amber-600 text-white font-bold rounded">
              Save Event
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
        {events.map(evt => {
          let badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
          if (evt.impactLevel === 'CRITICAL') badgeColor = 'bg-red-500/20 text-red-400 border-red-500/30 font-bold';
          return (
            <div key={evt.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border ${badgeColor}`}>
                    {evt.impactLevel} • {evt.eventType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{evt.eventDate}</span>
                </div>
                <h4 className="font-bold text-white text-xs">{evt.title}</h4>
                <p className="text-[10px] text-blue-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {evt.locationName}
                </p>
              </div>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                +{evt.expectedSurgePercentage}% surge
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

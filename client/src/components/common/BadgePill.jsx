import React from 'react';
import { Award, BookOpen, Droplets, Trash2, CheckCircle, Zap } from 'lucide-react';

const iconMap = {
  Award,
  BookOpen,
  Droplets,
  Trash2,
  CheckCircle,
  Zap,
};

export const BadgeIcon = ({ iconName, className = "w-5 h-5 text-emerald-600" }) => {
  const IconComponent = iconMap[iconName] || Award;
  return <IconComponent className={className} />;
};

export const BadgePill = ({ badge, earned = true, size = 'md' }) => {
  return (
    <div
      title={badge.description}
      className={`inline-flex items-center gap-2 rounded-xl border transition ${
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm'
      } ${
        earned
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm'
          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
      }`}
    >
      <div className={`rounded-lg p-1 ${earned ? 'bg-emerald-100' : 'bg-slate-200'}`}>
        <BadgeIcon
          iconName={badge.icon}
          className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${
            earned ? 'text-emerald-700' : 'text-slate-400'
          }`}
        />
      </div>
      <div>
        <p className="font-bold leading-tight">{badge.name}</p>
        {size !== 'sm' && badge.category && (
          <p className="text-[10px] text-slate-500 uppercase font-semibold">{badge.category}</p>
        )}
      </div>
    </div>
  );
};

export default BadgePill;

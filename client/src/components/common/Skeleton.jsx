import React from 'react';
import { Inbox } from 'lucide-react';

export const Skeleton = ({ className = 'h-4 w-full bg-slate-200 rounded' }) => {
  return <div className={`animate-pulse ${className}`} />;
};

export const CardSkeleton = () => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-6 w-32 bg-slate-200 rounded-md" />
        <div className="h-6 w-16 bg-slate-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-4 w-5/6 bg-slate-200 rounded" />
      </div>
      <div className="pt-4 flex justify-between items-center border-t border-slate-100">
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-8 w-24 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
};

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data matching your criteria.',
  action,
}) => {
  return (
    <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 my-4 flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">{description}</p>
      {action && action}
    </div>
  );
};

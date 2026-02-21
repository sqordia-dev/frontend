import { useState } from 'react';
import { X } from 'lucide-react';
import { cmsService } from '../../../lib/cms-service';

interface CmsScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  versionId: string;
  versionNumber: number;
}

export function CmsScheduleDialog({
  isOpen,
  onClose,
  versionId,
  versionNumber,
}: CmsScheduleDialogProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!date || !time) return;

    setIsScheduling(true);
    try {
      const publishAt = new Date(`${date}T${time}`).toISOString();
      await cmsService.scheduleVersion(versionId, { publishAt });
      onClose();
    } catch (error) {
      console.error('Failed to schedule:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white shadow-xl rounded-lg overflow-hidden border border-zinc-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h1 className="text-xl font-bold text-zinc-900">Schedule Publication</h1>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <p className="text-sm text-zinc-600">
              Set a date and time for Version {versionNumber} to go live automatically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Date
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-[#FF6B00] text-lg">
                      calendar_today
                    </span>
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all outline-none"
                  />
                </div>
              </div>

              {/* Time Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Time
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-[#FF6B00] text-lg">
                      schedule
                    </span>
                  </div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Timezone Indicator */}
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-xs text-zinc-400">public</span>
              <span className="text-xs text-zinc-500">
                All times are in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </span>
            </div>

            {/* Summary Box */}
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#FF6B00]">description</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                    Publication Summary
                  </p>
                  <p className="text-sm font-medium text-zinc-700">
                    Publishing: Draft v{versionNumber}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-200 text-zinc-700">
                  Draft
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 bg-zinc-50/50 gap-3 border-t border-zinc-100">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSchedule}
              disabled={!date || !time || isScheduling}
              className="px-5 py-2 text-sm font-semibold bg-[#FF6B00] hover:bg-orange-600 text-white rounded-lg shadow-sm shadow-orange-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScheduling ? 'Scheduling...' : 'Schedule Publication'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

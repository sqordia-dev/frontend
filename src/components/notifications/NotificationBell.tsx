import { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnreadCount } from '../../contexts/NotificationContext';
import NotificationCenter from './NotificationCenter';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useUnreadCount();

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 shadow-sm"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
              {/* Pulse ring for new notifications */}
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

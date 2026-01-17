import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ScrollButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollBottom = scrollTop + windowHeight;

      // Show button when scrolled down more than 300px
      setIsVisible(scrollTop > 300);

      // Check if near bottom (within 100px)
      setIsAtBottom(documentHeight - scrollBottom < 100);
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility(); // Initial check

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col gap-3 safe-bottom safe-right"
      style={{ 
        bottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom)))',
        right: 'max(1rem, calc(1rem + env(safe-area-inset-right)))'
      }}
    >
      <button
        onClick={isAtBottom ? scrollToTop : scrollToBottom}
        className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center overflow-hidden min-h-[44px] min-w-[44px]"
        style={{
          backgroundColor: '#FF6B00',
          boxShadow: '0 8px 24px rgba(255, 107, 0, 0.4)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#E55F00';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 107, 0, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FF6B00';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 0, 0.4)';
        }}
        aria-label={isAtBottom ? 'Scroll to top' : 'Scroll to bottom'}
      >
        {/* Shine effect */}
        <div 
          className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          }}
        />
        
        {/* Icon */}
        <div className="relative z-10 text-white transition-transform duration-300 group-hover:scale-110">
          {isAtBottom ? (
            <ChevronUp size={24} strokeWidth={2.5} />
          ) : (
            <ChevronDown size={24} strokeWidth={2.5} />
          )}
        </div>

        {/* Pulse animation */}
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: '#FF6B00' }}
        />
      </button>
    </div>
  );
}


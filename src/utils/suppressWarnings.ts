/**
 * Suppress known warnings from third-party libraries
 * These warnings are harmless and come from libraries that haven't updated yet
 * 
 * Note: Browser deprecation notices (like DOMNodeInserted) cannot be suppressed via JavaScript.
 * These are shown by the browser itself and are safe to ignore.
 */

export function suppressKnownWarnings() {
  if (import.meta.env.MODE === 'development') {
    // Suppress react-quill findDOMNode warnings
    const originalWarn = console.warn;
    console.warn = function(...args: any[]) {
      // Convert all arguments to string for checking
      const fullMessage = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      // Suppress findDOMNode deprecation warning from react-quill
      // React's warning format includes "findDOMNode" and "deprecated"
      // Also check for ReactQuill in the stack trace
      if (
        fullMessage.includes('findDOMNode') && 
        (fullMessage.includes('deprecated') || 
         fullMessage.includes('ReactQuill') || 
         fullMessage.includes('react-quill') ||
         fullMessage.includes('will be removed'))
      ) {
        return; // Suppress this warning
      }
      
      // Also check individual arguments for ReactQuill stack traces
      const hasReactQuill = args.some(arg => {
        const str = String(arg);
        return str.includes('ReactQuill') || str.includes('react-quill');
      });
      
      const hasFindDOMNode = args.some(arg => {
        const str = String(arg);
        return str.includes('findDOMNode');
      });
      
      // If both are present, suppress (ReactQuill using findDOMNode)
      if (hasFindDOMNode && hasReactQuill) {
        return;
      }
      
      // Call original warn with original arguments
      originalWarn.apply(console, args);
    };

    // Suppress console.error for known library issues
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Check all arguments
      const shouldSuppress = args.some((arg) => {
        if (typeof arg === 'string') {
          // Suppress DOMNodeInserted-related errors (if logged as errors)
          if (
            arg.includes('DOMNodeInserted') || 
            arg.includes('mutation event') ||
            (arg.includes('Deprecation') && arg.includes('DOMNodeInserted'))
          ) {
            return true;
          }
        }
        return false;
      });
      
      if (shouldSuppress) {
        return;
      }
      
      originalError.apply(console, args);
    };
  }
}

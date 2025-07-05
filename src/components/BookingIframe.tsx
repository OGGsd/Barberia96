import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Phone, Wifi, WifiOff, Shield } from 'lucide-react';
import { businessConfig } from '../config/business';

interface BookingIframeProps {
  bookingUrl: string;
  serviceName: string;
  onClose: () => void;
}

const BookingIframe: React.FC<BookingIframeProps> = ({ bookingUrl, serviceName, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Prevent body scroll when iframe modal is open
    document.body.classList.add('iframe-modal-open');
    
    // iOS Safari specific: Prevent zoom on input focus
    const viewport = document.querySelector('meta[name=viewport]');
    const originalContent = viewport?.getAttribute('content');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
    
    // Set a timeout to detect if iframe fails to load (iOS Safari compatibility)
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
    }, 15000); // 15 second timeout for iOS

    // Calculate and set proper heights
    const updateHeights = () => {
      const vh = window.innerHeight;
      const headerHeight = 48; // Minimal header height
      const availableHeight = vh - headerHeight;
      
      if (containerRef.current) {
        containerRef.current.style.height = `${availableHeight}px`;
        containerRef.current.style.maxHeight = `${availableHeight}px`;
      }
      
      if (iframeRef.current) {
        iframeRef.current.style.height = `${availableHeight}px`;
        iframeRef.current.style.minHeight = `${availableHeight}px`;
      }
    };

    // Initial height calculation
    updateHeights();

    // Update heights on resize (orientation change, keyboard show/hide)
    const handleResize = () => {
      setTimeout(updateHeights, 100); // Small delay for iOS keyboard
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      document.body.classList.remove('iframe-modal-open');
      
      // Restore original viewport
      if (viewport && originalContent) {
        viewport.setAttribute('content', originalContent);
      }
      
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }

      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isLoading]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // Ensure iframe takes full available height after load
    if (iframeRef.current && containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      iframeRef.current.style.height = `${containerHeight}px`;
      iframeRef.current.style.minHeight = `${containerHeight}px`;
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
  };

  const handleFallbackBooking = () => {
    // iOS Safari compatible external link opening
    try {
      // Method 1: Try window.open with specific parameters for iOS
      const newWindow = window.open(
        bookingUrl, 
        '_blank', 
        'noopener,noreferrer,width=375,height=667,scrollbars=yes,resizable=yes'
      );
      
      // Method 2: If popup blocked (common in iOS), use location
      setTimeout(() => {
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = bookingUrl;
        }
      }, 100);
    } catch (error) {
      // Fallback: Direct navigation for VKWebView/TWA
      window.location.href = bookingUrl;
    }
    onClose();
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    
    // Reload iframe with cache busting for iOS
    if (iframeRef.current) {
      const url = new URL(bookingUrl);
      url.searchParams.set('_t', Date.now().toString());
      iframeRef.current.src = url.toString();
    }
  };

  // Handle postMessage for dynamic height and iOS compatibility
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from booking system domain
      if (!event.origin.includes(new URL(bookingUrl).hostname)) return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Handle navigation events for iOS
        if (data?.type === 'navigation' && data?.url) {
          console.log('Iframe navigation detected:', data.url);
        }
        
        // Handle completion events
        if (data?.type === 'booking_complete') {
          console.log('Booking completed successfully');
          // Could trigger success callback here
        }
      } catch (error) {
        console.log('Error parsing postMessage:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [bookingUrl]);

  // iOS Safari specific touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent iOS Safari from interfering with iframe touch events
    e.stopPropagation();
  };

  // Animation variants
  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 50
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: 50,
      transition: {
        duration: 0.3
      }
    }
  };

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: 0.1
      }
    }
  };

  const loadingVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="iframe-modal fixed inset-0 bg-black bg-opacity-50 flex flex-col"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ 
          zIndex: 2147483647,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          // Apple/iOS specific positioning
          WebkitTransform: 'translate3d(0, 0, 0)',
          transform: 'translate3d(0, 0, 0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          willChange: 'transform, opacity',
          // Force above all Apple system UI
          WebkitAppearance: 'none',
          appearance: 'none',
          // Ensure modal captures all touch events on Apple devices
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          pointerEvents: 'auto'
        }}
      >
        {/* Minimized Header with enhanced animation */}
        <motion.div 
          className="iframe-modal-header bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4 py-2 flex items-center justify-between shadow-lg relative h-12 flex-shrink-0"
          variants={headerVariants}
          style={{ 
            zIndex: 2147483646,
            // Apple/iOS specific header positioning
            WebkitTransform: 'translate3d(0, 0, 0)',
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
            isolation: 'isolate',
            position: 'relative',
            pointerEvents: 'auto'
          }}
        >
          <div className="flex items-center min-w-0 flex-1">
            <motion.img 
              src={businessConfig.logo} 
              alt="Logo" 
              className="w-6 h-6 mr-2 rounded-full bg-white p-0.5 flex-shrink-0"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            />
            <div className="min-w-0 flex-1">
              <motion.h2 
                className="font-bold text-xs truncate"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Secure Booking
              </motion.h2>
              <motion.p 
                className="text-xs opacity-90 flex items-center truncate"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 0.9 }}
                transition={{ delay: 0.3 }}
              >
                <Shield size={10} className="mr-1 flex-shrink-0" />
                <span className="truncate">{serviceName}</span>
              </motion.p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            {/* Animated Online/Offline indicator */}
            <motion.div 
              className="flex items-center"
              animate={{
                scale: isOnline ? [1, 1.2, 1] : 1,
                opacity: isOnline ? [1, 0.7, 1] : 0.5
              }}
              transition={{
                duration: 2,
                repeat: isOnline ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {isOnline ? (
                <Wifi size={14} className="text-green-300" />
              ) : (
                <WifiOff size={14} className="text-red-300" />
              )}
            </motion.div>
            <motion.button
              onClick={onClose}
              className="p-1.5 hover:bg-black hover:bg-opacity-20 rounded-full transition-colors flex-shrink-0"
              aria-label="Close booking"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <X size={18} />
            </motion.button>
          </div>
        </motion.div>

        {/* Full-Screen Content Area with enhanced animations */}
        <motion.div 
          ref={containerRef}
          className="iframe-container flex-1 relative bg-white overflow-hidden"
          onTouchStart={handleTouchStart}
          style={{ 
            height: 'calc(100vh - 48px)',
            maxHeight: 'calc(100vh - 48px)',
            minHeight: 'calc(100vh - 48px)',
            zIndex: 2147483645,
            // Apple/iOS specific container positioning
            WebkitTransform: 'translate3d(0, 0, 0)',
            transform: 'translate3d(0, 0, 0)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
            isolation: 'isolate',
            // Prevent Apple Safari scrolling issues
            WebkitOverflowScrolling: 'touch',
            overflow: 'hidden',
            position: 'relative',
            pointerEvents: 'auto'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {/* Loading State with enhanced animation */}
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-white z-10"
                variants={loadingVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="text-center px-4">
                  <motion.div 
                    className="w-10 h-10 border-b-2 border-gray-900 rounded-full mx-auto mb-3"
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <motion.p 
                    className="text-gray-600 text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Loading secure booking...
                  </motion.p>
                  <motion.p 
                    className="text-gray-400 text-xs mt-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Connecting to booking system
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Offline State with enhanced animation */}
          <AnimatePresence>
            {!isOnline && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-white z-20 p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="text-center max-w-sm">
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <WifiOff size={40} className="text-gray-400 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    No Internet Connection
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Check your internet connection and try again.
                  </p>
                  <div className="space-y-3">
                    <motion.button
                      onClick={handleRetry}
                      className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                      disabled={!isOnline}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Try Again
                    </motion.button>
                    <div className="flex items-center justify-center text-gray-600 text-sm">
                      <Phone size={16} className="mr-2" />
                      <span>Call: {businessConfig.phone}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State with enhanced animation */}
          <AnimatePresence>
            {hasError && isOnline && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-white z-10 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="text-center max-w-sm">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Could Not Load Booking
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    This may be due to browser security settings or temporary issues with the booking system. 
                    Try again or open the booking in your browser.
                  </p>
                  <div className="space-y-3">
                    <motion.button
                      onClick={handleRetry}
                      className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Try Again
                    </motion.button>
                    <motion.button
                      onClick={handleFallbackBooking}
                      className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Open in Browser
                    </motion.button>
                    <div className="flex items-center justify-center text-gray-600 text-sm">
                      <Phone size={16} className="mr-2" />
                      <span>Or call: {businessConfig.phone}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full-Screen Iframe with fade-in animation */}
          {isOnline && (
            <motion.iframe
              ref={iframeRef}
              src={bookingUrl}
              className="w-full border-0 bg-white block"
              style={{ 
                height: '100%',
                minHeight: '100%',
                maxHeight: '100%',
                zIndex: 2147483644,
                // iOS Safari optimizations
                WebkitOverflowScrolling: 'touch',
                overflow: 'auto',
                // Apple/iOS specific iframe positioning
                WebkitTransform: 'translate3d(0, 0, 0)',
                transform: 'translate3d(0, 0, 0)',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                willChange: 'transform, contents',
                // Force iframe above Apple system UI
                WebkitPerspective: '1000px',
                perspective: '1000px',
                // Prevent Apple Safari touch interference
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation',
                // Force iframe to capture touch events
                pointerEvents: 'auto',
                // Ensure iframe renders properly on Apple devices
                WebkitAppearance: 'none',
                appearance: 'none',
                position: 'relative'
              }}
              // Enhanced security sandbox for iOS compatibility
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
              scrolling="auto"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={`Secure booking - ${serviceName}`}
              loading="lazy"
              // iOS Safari specific attributes
              allow="payment; geolocation"
              referrerPolicy="strict-origin-when-cross-origin"
              // Accessibility
              aria-label={`Booking form for ${serviceName}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoading ? 0 : 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingIframe;
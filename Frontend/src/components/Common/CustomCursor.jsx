import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor({ cursorText }) {
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 35, stiffness: 350, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Add class for disabling default cursor on desktop
    document.documentElement.classList.add('custom-cursor-active');

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  const hasText = !!cursorText;

  return (
    <motion.div
      className="hidden lg:flex fixed top-0 left-0 rounded-full pointer-events-none z-50 items-center justify-center mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: '-50%',
        translateY: '-50%',
        width: hasText ? 80 : 20,
        height: hasText ? 80 : 20,
        backgroundColor: hasText ? 'rgba(216, 47, 47, 0.95)' : 'var(--accent-color)',
        border: hasText ? 'none' : '1px solid var(--accent-color)',
        transition: 'width 0.2s ease-out, height 0.2s ease-out, background-color 0.2s ease-out',
      }}
    >
      {hasText && (
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[9px] uppercase font-extrabold tracking-widest text-white text-center select-none font-mono"
        >
          {cursorText}
        </motion.span>
      )}
    </motion.div>
  );
}

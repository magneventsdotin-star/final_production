import React from 'react';

// A mock motion object that returns standard HTML elements
export const motion = new Proxy({}, {
  get: (target, prop) => {
    // Return a functional component that renders the element directly
    const MotionMock = React.forwardRef(({ 
      initial, animate, transition, variants, whileHover, whileTap, 
      whileInView, viewport, exit, layout, layoutId, onAnimationStart, 
      onAnimationComplete, style, ...props 
    }, ref) => {
      const Element = prop;
      // We pass through safe props and ignore framer-motion specific ones
      return React.createElement(Element, { ref, style, ...props });
    });
    MotionMock.displayName = `motion(${prop})`;
    return MotionMock;
  }
});

// AnimatePresence just renders its children immediately without exit animations
export const AnimatePresence = ({ children }) => <>{children}</>;

// useInView always returns true so components mount their "visible" state instantly
export const useInView = () => true;

// Mock animate function to trigger onUpdate immediately and return a dummy controls object
export const animate = (from, to, options) => {
  if (options && typeof options.onUpdate === 'function') {
    options.onUpdate(to);
  }
  return { stop: () => {} };
};

export const useAnimation = () => ({ start: () => {}, stop: () => {} });
export const useScroll = () => ({ scrollYProgress: { onChange: () => {}, get: () => 0 } });
export const useTransform = () => 0;
export const useSpring = () => 0;
export const useIsPresent = () => true;
export const LayoutGroup = ({ children }) => <>{children}</>;
export const LazyMotion = ({ children }) => <>{children}</>;
export const domAnimation = {};
export const domMax = {};

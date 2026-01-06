import React, { useState, useEffect, useRef } from "react";
import { X, Mail, Linkedin, Instagram, Play, Plus, Trash2, Edit, Edit2, Lock, LogOut, Save } from "lucide-react";

// ============================================
// COLOR PALETTE & THEME
// ============================================
const colors = {
  charcoal: "#1C1C1C",
  coral: "#FC7753",
  cream: "#EFE8DD",
};

// ============================================
// RIVE EYE ANIMATION (Base64 encoded eyeball.riv)
// ============================================
const RIVE_EYE_BASE64 = "UklWRQcA84ByxAGmAeoEzATyBLYE5wSYBOwB7ASSB6UB6QTLAa0E8QTmBKoE7gOnAesE6ATKBOUExwQASAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAABcAkQTLAQ5CbGFuayBTY3JpcHQgMpIHAQCRBMsBDkJsYW5rIFNjcmlwdCAxkgcBALMDrQQFRXllVk0ArwOtBAVsb29rWACvA60EBWxvb2tZAK8DrQQFYmxpbmsAtQO2BAAECEluc3RhbmNlALoDqgQAALoDqgQBALoDqgQCAAHEAQAHAAD6QwgAAPpD7gMU7AEAxwQABAhBcnRib2FyZAACBQANAMB5Qw4AwFZDAL8DygQNzAQCAAAAAgUBAL8DygQOzAQCAAEAAwUCDQAAgL4OAACAPgAEBQMNAACAPg4AAIC+FAAAkUIVAACRQgASBRUlU3f8/wAWBRYqAABKwiIAAEpCABMFBiYcHBz/ABMFBiYcHBz/JwAAgD8AKgUDXAoAAwUAEGZmZj8NAADIQQ4AAFdDABAFCiABAAUFCwAjBQsYAAB6QxksAaXCUwCAEUMABQULGAAA+kMAIwULGAAAekMZAAClQlLbD0nAUwCAEUMAEgUXJRwcHP8AFgUYKgAAADUhAACWuiIAAPpDIwAAlroAEwURJt3o7/8AEwURJr/R5v8nAACAPwCkAwUA5QQB5gQB5wQB6AQB6QQB6gQB6wQB7AQB8QQB8gQBABgFAy8AAGRCABQFAwAYBQovAACoQTEBABQFCgAcAB83CkJsaW5rIGlkbGUAGTMNABo1GAAeRAFGAAB6QwAeQxREAUYAAHpDABo1GQAeRAFGLAGlwgAeQxREAUYsAaXCAB83DGRvdWJsZSBibGluawAZMw0AGjUYAB5DBEQBRgAAekMAHkMLRAJFGUYLAHpDAB5DDUQCRRlGCwB6QwAeQxBEAUYAAHpDAB5DE0QCRRlGCwB6QwAeQxVEAkUZRgsAekMAHkMaRAFGAAB6QwAaNRkAHkMERAFGLAGlwgAeQwtEAkUZRtT+okIAHkMNRAJFGUbU/qJCAB5DEEQBRiwBpcIAHkMTRAJFGUbU/qJCAB5DFUQCRRlG1P6iQgAeQxpEAUYsAaXCAB83BUJsaW5rABkzDQAaNRgAHkQBRgAAekMAHkMLRAJFGUYLAHpDAB5DDUQCRRlGCwB6QwAeQxpEAUYAAHpDABo1GQAeRAFGLAGlwgAeQwtEAkUZRtT+okIAHkMNRAJFGUbU/qJCAB5DGkQBRiwBpcIAHzcITG9va0Rvd24AGTMBABo1DgAeRAFGAGCTQwAfNwpMb29rQ2VudGVyABkzAQAaNQ4AHkQBRgDAVkMAHzcGTG9va1VwABkzAQAaNQ4AHkQBRgDABkMAHzcJTG9va1JpZ2h0ABkzAQAaNQ0AHkQBRgAAzUMAHzcLTG9va0NlbnRlclgAGTMBABo1DQAeRAFGAMB5QwAfNwlMb29rIExlZnQAGTMBABo1DQAeRAFGAAC0QgA1Nw9TdGF0ZSBNYWNoaW5lIDEAOooBC0RvdWJsZUJsaW5rADqKAQVCbGluawA4igEFTG9va1mMAQAA4EEAOIoBBUxvb2tYjAEAAOBBADmKAQ9Ib3Jpem9udGFsIExvb2sATJgEAqcBAwBLpQEIAEulAQemAQAASEIAS6UBBqYBAADIQgA/AEGXAQAAQAA+ADmKAQ1WZXJ0aWNhbCBMb29rAD4AQAA/AEGXAQMATJgEAqcBAgBLpQEDAEulAQSmAQAASEIAS6UBBaYBAADIQgA5igEFQmxpbmsAPgBBlwEDAESbAQEAQZcBBABEmwEAAEAAPwA9lQECAD2VAQEA";

// ============================================
// RIVE EYE TRACKING SYSTEM
// ============================================
// Rive setup:
// - State Machine: "State Machine 1"
// - Inputs: LookX (Number, 0-100, 50=center), LookY (Number, 0-100, 50=center), Blink (Trigger)
// 
// trackingMode="track": follows mouse across whole window
// trackingMode="idle": random wandering + blinking (used in navbar)

// Utility functions
const lerp = (current, target, speed) => current + (target - current) * speed;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Global eye state manager
const eyeStateManager = {
  currentLookX: 50,
  currentLookY: 50,
  targetLookX: 50,
  targetLookY: 50,
  idleTargetX: 50,
  idleTargetY: 50,
  nextIdleChange: 0,
  mouseX: -1,
  mouseY: -1,
  isMouseOnPage: false,
  isMobile: typeof window !== 'undefined' && window.innerWidth <= 768,
  instances: [],
  isRunning: false,
  blinkTimeoutId: null,
  mouseListenerAdded: false,
  animFrameId: null,
  
  EASING_SPEED: 0.15,
  IDLE_EASING_SPEED: 0.08,
  DEADZONE: 1.5,
  
  registerInstance(instance) {
    this.instances.push(instance);
    if (!this.isRunning) {
      this.startAnimation();
    }
  },
  
  unregisterInstance(instance) {
    this.instances = this.instances.filter(i => i !== instance);
    if (this.instances.length === 0) {
      this.stopAnimation();
    }
  },
  
  stopAnimation() {
    this.isRunning = false;
    if (this.blinkTimeoutId) {
      clearTimeout(this.blinkTimeoutId);
      this.blinkTimeoutId = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  },
  
  scheduleNextBlink() {
    if (!this.isRunning) return;
    const delay = 3000 + Math.random() * 4000;
    this.blinkTimeoutId = setTimeout(() => {
      // 20% chance of double blink
      const useDoubleBlink = Math.random() < 0.2;
      this.instances.forEach(instance => {
        if (instance.inputs) {
          const doubleBlink = instance.inputs.DoubleBlink || instance.inputs.doubleBlink;
          const blink = instance.inputs.Blink || instance.inputs.blink;
          if (useDoubleBlink && doubleBlink) {
            doubleBlink.fire();
          } else if (blink) {
            blink.fire();
          }
        }
      });
      if (this.isRunning) {
        this.scheduleNextBlink();
      }
    }, delay);
  },
  
  getRandomIdleTarget() {
    return {
      x: 20 + Math.random() * 60,
      y: 25 + Math.random() * 50
    };
  },
  
  getMouseLookTarget(canvasRef) {
    if (!canvasRef?.current) {
      return { x: 50, y: 50 };
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;
    
    const deltaX = this.mouseX - eyeCenterX;
    const deltaY = this.mouseY - eyeCenterY;
    
    // Sensitivity: how many pixels from eye center = full look (0 or 100)
    // 200px away = full look in that direction
    const maxDistance = 200;
    
    const x = clamp(50 + (deltaX / maxDistance) * 50, 0, 100);
    const y = clamp(50 + (deltaY / maxDistance) * 50, 0, 100);
    
    return { x, y };
  },
  
  update() {
    if (!this.isRunning) return;
    
    const now = Date.now();
    const shouldTrackMouse = !this.isMobile && this.isMouseOnPage && this.mouseX >= 0;
    
    if (shouldTrackMouse && this.instances.length > 0) {
      // Use first instance's canvas for reference
      const firstCanvas = this.instances[0]?.canvasRef;
      const target = this.getMouseLookTarget(firstCanvas);
      this.targetLookX = target.x;
      this.targetLookY = target.y;
    } else {
      // Idle wandering
      if (now > this.nextIdleChange) {
        const newTarget = this.getRandomIdleTarget();
        this.idleTargetX = newTarget.x;
        this.idleTargetY = newTarget.y;
        this.nextIdleChange = now + 1000 + Math.random() * 2000;
      }
      this.targetLookX = this.idleTargetX;
      this.targetLookY = this.idleTargetY;
    }
    
    // Smooth interpolation with deadzone
    const dx = this.targetLookX - this.currentLookX;
    const dy = this.targetLookY - this.currentLookY;
    const speed = shouldTrackMouse ? this.EASING_SPEED : this.IDLE_EASING_SPEED;
    
    if (Math.abs(dx) > this.DEADZONE) {
      this.currentLookX = lerp(this.currentLookX, this.targetLookX, speed);
    }
    if (Math.abs(dy) > this.DEADZONE) {
      this.currentLookY = lerp(this.currentLookY, this.targetLookY, speed);
    }
    
    // Apply to all instances
    this.instances.forEach(instance => {
      if (instance.inputs) {
        let lookX, lookY;
        
        // Only track mouse if instance allows it AND mouse tracking is active
        if (shouldTrackMouse && instance.trackMouse && instance.canvasRef?.current) {
          // Per-eye calculation when tracking mouse
          const rect = instance.canvasRef.current.getBoundingClientRect();
          const eyeCenterX = rect.left + rect.width / 2;
          const eyeCenterY = rect.top + rect.height / 2;
          
          const deltaX = this.mouseX - eyeCenterX;
          const deltaY = this.mouseY - eyeCenterY;
          
          // 200px from eye center = full look in that direction
          const maxDistance = 200;
          
          lookX = clamp(50 + (deltaX / maxDistance) * 50, 0, 100);
          lookY = clamp(50 + (deltaY / maxDistance) * 50, 0, 100);
        } else {
          // Use shared idle values
          lookX = this.currentLookX;
          lookY = this.currentLookY;
        }
        
        // Handle both LookX/lookX naming conventions
        const lookXInput = instance.inputs.LookX || instance.inputs.lookX;
        const lookYInput = instance.inputs.LookY || instance.inputs.lookY;
        if (lookXInput) lookXInput.value = lookX;
        // Invert Y axis: Rive has LookUp=100, LookDown=0, but screen Y is opposite
        if (lookYInput) lookYInput.value = 100 - lookY;
      }
    });
    
    this.animFrameId = requestAnimationFrame(() => this.update());
  },
  
  startAnimation() {
    this.isRunning = true;
    this.update();
    this.scheduleNextBlink();
    
    if (!this.mouseListenerAdded) {
      const handlePointerMove = (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.isMouseOnPage = true;
      };
      
      const handleMouseLeave = () => {
        this.isMouseOnPage = false;
        // Return to center when mouse leaves
        this.targetLookX = 50;
        this.targetLookY = 50;
      };
      
      const handleMouseEnter = () => {
        this.isMouseOnPage = true;
      };
      
      window.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseenter', handleMouseEnter);
      window.addEventListener('blur', handleMouseLeave);
      window.addEventListener('focus', handleMouseEnter);
      
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
      });
      
      this.mouseListenerAdded = true;
    }
  }
};

// Nav bar eye component (smaller, idle mode by default)
function RiveEye({ size = 60 }) {
  const canvasRef = useRef(null);
  const riveRef = useRef(null);
  const instanceRef = useRef({ canvasRef, inputs: null, trackMouse: false });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    instanceRef.current.canvasRef = canvasRef;
    instanceRef.current.trackMouse = false; // Nav eye only does idle animation
    let isMounted = true;

    const initRive = async () => {
      if (!window.rive) {
        try {
          await new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="rive-app/canvas"]')) {
              const check = setInterval(() => {
                if (window.rive) { clearInterval(check); resolve(); }
              }, 50);
              return;
            }
            const script = document.createElement("script");
            script.src = "https://unpkg.com/@rive-app/canvas@2.21.6";
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        } catch (e) {
          if (isMounted) setHasError(true);
          return;
        }
      }

      if (!canvasRef.current || !window.rive || !isMounted) return;

      try {
        const binaryString = atob(RIVE_EYE_BASE64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const r = new window.rive.Rive({
          buffer: bytes.buffer,
          canvas: canvasRef.current,
          autoplay: true,
          stateMachines: "State Machine 1",
          onLoad: () => {
            if (!isMounted) return;
            setIsLoaded(true);
            r.resizeDrawingSurfaceToCanvas();
            
            const inputs = r.stateMachineInputs("State Machine 1");
            const inputMap = {};
            if (inputs) {
              inputs.forEach(input => { inputMap[input.name] = input; });
            }
            instanceRef.current.inputs = inputMap;
            eyeStateManager.registerInstance(instanceRef.current);
          },
          onLoadError: () => {
            if (isMounted) setHasError(true);
          },
        });

        riveRef.current = r;
      } catch (err) {
        if (isMounted) setHasError(true);
      }
    };

    initRive();

    return () => {
      isMounted = false;
      eyeStateManager.unregisterInstance(instanceRef.current);
      if (riveRef.current) {
        riveRef.current.cleanup();
      }
    };
  }, []);

  if (hasError) {
    return <EyeLogo size={size * 2} />;
  }

  const containerHeight = size * 0.6;
  const containerWidth = size * 1.2;
  const eyeWidth = size * 2;
  const eyeHeight = size;
  
  return (
    <div style={{ 
      position: "relative", 
      width: containerWidth, 
      height: containerHeight,
      overflow: "visible",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      {!isLoaded && (
        <div style={{ 
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
          <EyeLogo size={eyeWidth * 0.5} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={eyeWidth}
        height={eyeHeight}
        style={{
          position: "absolute",
          width: eyeWidth,
          height: eyeHeight,
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

// Large hero eye component
function RiveEyeLarge({ size = 180 }) {
  const canvasRef = useRef(null);
  const riveRef = useRef(null);
  const instanceRef = useRef({ canvasRef, inputs: null, trackMouse: true });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    instanceRef.current.canvasRef = canvasRef;
    instanceRef.current.trackMouse = true; // Hero eye tracks mouse
    let isMounted = true;

    const initRive = async () => {
      if (!window.rive) {
        try {
          await new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="rive-app/canvas"]')) {
              const check = setInterval(() => {
                if (window.rive) { clearInterval(check); resolve(); }
              }, 50);
              return;
            }
            const script = document.createElement("script");
            script.src = "https://unpkg.com/@rive-app/canvas@2.21.6";
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        } catch (e) {
          if (isMounted) setHasError(true);
          return;
        }
      }

      if (!canvasRef.current || !window.rive || !isMounted) return;

      try {
        const binaryString = atob(RIVE_EYE_BASE64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const r = new window.rive.Rive({
          buffer: bytes.buffer,
          canvas: canvasRef.current,
          autoplay: true,
          stateMachines: "State Machine 1",
          onLoad: () => {
            if (!isMounted) return;
            setIsLoaded(true);
            r.resizeDrawingSurfaceToCanvas();
            
            const inputs = r.stateMachineInputs("State Machine 1");
            const inputMap = {};
            if (inputs) {
              inputs.forEach(input => { inputMap[input.name] = input; });
            }
            instanceRef.current.inputs = inputMap;
            eyeStateManager.registerInstance(instanceRef.current);
          },
          onLoadError: () => {
            if (isMounted) setHasError(true);
          },
        });

        riveRef.current = r;
      } catch (err) {
        if (isMounted) setHasError(true);
      }
    };

    initRive();

    return () => {
      isMounted = false;
      eyeStateManager.unregisterInstance(instanceRef.current);
      if (riveRef.current) {
        riveRef.current.cleanup();
      }
    };
  }, []);

  if (hasError) {
    return <EyeLogoLarge size={size * 2} />;
  }

  const containerHeight = size * 0.5;
  const containerWidth = size * 1.0;
  const eyeWidth = size * 2;
  const eyeHeight = size;

  return (
    <div style={{ 
      position: "relative", 
      width: containerWidth, 
      height: containerHeight, 
      background: "transparent",
      overflow: "visible",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      {!isLoaded && (
        <div style={{ 
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
          <EyeLogoLarge size={eyeWidth * 0.5} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={eyeWidth}
        height={eyeHeight}
        style={{
          position: "absolute",
          width: eyeWidth,
          height: eyeHeight,
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.5s ease",
          background: "transparent",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

// Fallback SVG eye logo (small version)

const portfolioData = {
  name: "ZACH FOSTER",
  tagline: "Animator & Motion Designer",
  email: "zachfosteraz@gmail.com",
  linkedin: "https://www.linkedin.com/in/quikdraw/",
  instagram: "https://www.instagram.com/quikdrawz/",
  demoReelUrl: "https://www.youtube.com/embed/m1Cwt0VQ0ZU",
  about: {
    bio: "I'm Zach Foster, an animator and motion designer passionate about bringing ideas to life through movement. With a focus on storytelling and visual impact, I create animations that captivate and communicate.",
    photoUrl: "data:image/jpeg;base64,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",
  },
};

// Admin password (change this!)
const ADMIN_PASSWORD = "quikdraw2024";

// Default animations (used if no saved data)
const defaultAnimations = [
  {
    id: 1,
    title: "Digital Dreams",
    year: "2024",
    thumbnail: "https://images.unsplash.com/photo-1740174459682-4dd3f72e2512?w=800&h=800&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "A vibrant exploration of motion graphics showcasing fluid transitions and dynamic typography. This piece combines retro aesthetics with modern animation techniques.",
    duration: "2:30",
    aspectRatio: "square",
  },
  {
    id: 2,
    title: "Chromatic Flow",
    year: "2024",
    thumbnail: "https://images.unsplash.com/photo-1766430414516-95fc5903b234?w=800&h=450&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "An abstract journey through color and form, exploring the intersection of organic movement and geometric precision.",
    duration: "1:45",
    aspectRatio: "widescreen",
  },
  {
    id: 3,
    title: "Geometric Symphony",
    year: "2023",
    thumbnail: "https://images.unsplash.com/photo-1666302707255-13651d539be5?w=450&h=800&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "A 3D animated piece celebrating the beauty of geometric forms in motion. Shapes dance in perfect harmony with a carefully curated soundscape.",
    duration: "3:15",
    aspectRatio: "vertical",
  },
  {
    id: 4,
    title: "Digital Essence",
    year: "2023",
    thumbnail: "https://images.unsplash.com/photo-1633743252577-ccb68cbdb6ed?w=800&h=800&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "A meditation on the digital age through abstract visual storytelling. Combining particle systems, fluid simulations, and hand-drawn elements.",
    duration: "2:00",
    aspectRatio: "square",
  },
  {
    id: 5,
    title: "Pattern Language",
    year: "2023",
    thumbnail: "https://images.unsplash.com/photo-1759267190465-d9d815815b76?w=800&h=450&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Inspired by mid-century design principles, this animation explores repetition and pattern as a visual language.",
    duration: "1:30",
    aspectRatio: "widescreen",
  },
  {
    id: 6,
    title: "Neon Nights",
    year: "2022",
    thumbnail: "https://images.unsplash.com/photo-1642537389593-cf3f195905d1?w=450&h=800&fit=crop",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "A nostalgic tribute to retro-futurism, blending neon aesthetics with smooth, flowing animations.",
    duration: "2:45",
    aspectRatio: "vertical",
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Extract YouTube video ID from various URL formats
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Get YouTube embed URL
function getYouTubeEmbedUrl(url, autoplay = false) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?${autoplay ? 'autoplay=1&mute=1&' : ''}rel=0&modestbranding=1`;
}

// Get YouTube thumbnail
function getYouTubeThumbnail(url) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// ============================================
// INTERACTIVE WAVY BACKGROUND
// ============================================
function WavyBackground() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const touchPointsRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleClick = (e) => {
      if (touchPointsRef.current.length > 5) {
        touchPointsRef.current.shift();
      }
      touchPointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        strength: 1,
        time: Date.now(),
      });
    };

    const handleTouch = (e) => {
      if (e.touches && e.touches[0]) {
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };
    
    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        // Only add ripple on tap, not while scrolling
        if (touchPointsRef.current.length > 5) {
          touchPointsRef.current.shift();
        }
        touchPointsRef.current.push({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          strength: 0.5, // Reduced strength on mobile
          time: Date.now(),
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("resize", updateCanvasSize);

    const getWaveY = (x, baseY, time, waveIndex, width, height) => {
      let y = baseY;
      y += Math.sin(x * 0.003 + time * 0.4 + waveIndex * 0.5) * 50;
      y += Math.sin(x * 0.002 - time * 0.3 + waveIndex * 0.3) * 40;
      y += Math.sin(x * 0.004 + time * 0.5 + waveIndex * 0.7) * 30;
      y += Math.sin(x * 0.0015 + time * 0.6 + waveIndex * 0.2) * 25;
      y += Math.cos(x * 0.0035 - time * 0.45 + waveIndex * 0.8) * 20;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mdx = x - mx;
      const mdy = baseY - my;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 100) {
        // Small, subtle, feathered influence
        const mouseInfluence = Math.exp(-mdist * 0.02) * 15;
        y += mouseInfluence * Math.sin(mdist * 0.04);
      }

      touchPointsRef.current.forEach((point) => {
        const dx = x - point.x;
        const dy = baseY - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const age = (Date.now() - point.time) / 1000;
        const maxRadius = 400;
        if (dist < maxRadius) {
          const ripple =
            Math.sin(dist * 0.05 - age * 8) *
            point.strength *
            Math.exp(-dist * 0.008) *
            Math.exp(-age * 0.8);
          y += ripple * 80;
        }
      });

      touchPointsRef.current = touchPointsRef.current.filter((point) => {
        return Date.now() - point.time < 3000;
      });

      return y;
    };

    const generateWaves = (time) => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.fillStyle = colors.charcoal;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = colors.cream;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const numWaves = 12;
      const spacing = height / (numWaves - 1);

      for (let i = -1; i < numWaves + 1; i++) {
        const baseY = spacing * i;
        ctx.beginPath();
        ctx.globalAlpha = 0.6;
        const step = 4;
        for (let x = 0; x <= width; x += step) {
          const y = getWaveY(x, baseY, time, i, width, height);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };

    let time = 0;
    const animate = () => {
      time += 0.018;
      generateWaves(time);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}

// ============================================
// SVG ICONS
// ============================================
function EyeLogo({ size = 48, color = colors.coral, secondaryColor = colors.cream }) {
  return (
  <svg width={size} height={size * 0.5} viewBox="0 0 120 60" fill="none">
    <path d="M10 30 Q 60 -5, 110 30 Q 60 65, 10 30" stroke={secondaryColor} strokeWidth="2.5" fill="none" />
    <path d="M25 30 Q 60 8, 95 30 Q 60 52, 25 30" stroke={secondaryColor} strokeWidth="1.5" fill="none" />
    <circle cx="60" cy="30" r="12" stroke={secondaryColor} strokeWidth="2" fill="none" />
    <circle cx="60" cy="30" r="6" fill={color} />
  </svg>
  );
}

function EyeLogoLarge({ size = 200 }) {
  return (
  <svg width={size} height={size * 0.5} viewBox="0 0 200 100" fill="none">
    <path d="M5 50 Q 100 -15, 195 50 Q 100 115, 5 50" stroke={colors.cream} strokeWidth="2" fill="none" />
    <path d="M20 50 Q 100 5, 180 50 Q 100 95, 20 50" stroke={colors.cream} strokeWidth="1.5" fill="none" />
    <path d="M35 50 Q 100 18, 165 50 Q 100 82, 35 50" stroke={colors.cream} strokeWidth="1" fill="none" />
    <circle cx="100" cy="50" r="22" stroke={colors.cream} strokeWidth="2" fill="none" />
    <circle cx="100" cy="50" r="16" stroke={colors.cream} strokeWidth="1" fill="none" />
    <circle cx="100" cy="50" r="10" fill={colors.coral} />
    <circle cx="104" cy="46" r="3" fill={colors.cream} opacity="0.6" />
  </svg>
  );
}

const PersonIcon = ({ size = 32, color = colors.cream }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="28" r="18" fill={color} />
    <path d="M20 95 Q 20 58, 50 52 Q 80 58, 80 95" fill={color} />
  </svg>
);

// ============================================
// DECORATIVE ELEMENTS
// ============================================
const ConcentricArcs = ({ size = 150, color = colors.cream }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 150 90" fill="none">
    {[...Array(8)].map((_, i) => (
      <path
        key={i}
        d={`M ${10 + i * 8} 90 Q 75 ${10 + i * 8}, ${140 - i * 8} 90`}
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity={0.3 + i * 0.08}
      />
    ))}
  </svg>
);

const GeometricBorder = ({ width = 200, color = colors.coral }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", width: width + 24, justifyContent: "center" }}>
    <div style={{ width: "8px", height: "8px", backgroundColor: color, flexShrink: 0 }} />
    <div style={{ width: width, height: "2px", backgroundColor: color }} />
    <div style={{ width: "8px", height: "8px", backgroundColor: color, flexShrink: 0 }} />
  </div>
);

// Social Box with hover effect
function SocialBox({ href, icon, label, external = false, copyText = null }) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleClick = (e) => {
    if (copyText) {
      e.preventDefault();
      navigator.clipboard.writeText(copyText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        // Fallback or silent fail if clipboard access denied
        console.log("Clipboard access denied");
      });
    }
  };
  
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        position: "relative",
      }}
    >
      {/* Keyframe animations */}
      <style>
        {`
          @keyframes subtleWiggleSocial {
            0% { opacity: 0; margin-top: 0px; }
            30% { opacity: 1; margin-top: 8px; }
            50% { margin-top: 6px; }
            70% { margin-top: 7px; }
            100% { opacity: 1; margin-top: 6px; }
          }
          @keyframes fadeOutCopiedSocial {
            0% { opacity: 1; }
            75% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes sparkLeftSocial {
            0% { transform: translateX(0) rotate(0deg) scaleX(1); opacity: 1; }
            100% { transform: translateX(-14px) rotate(-20deg) scaleX(0.5); opacity: 0; }
          }
          @keyframes sparkRightSocial {
            0% { transform: translateX(0) rotate(0deg) scaleX(1); opacity: 1; }
            100% { transform: translateX(14px) rotate(20deg) scaleX(0.5); opacity: 0; }
          }
          @keyframes sparkDownLeftSocial {
            0% { transform: translate(0, 0) rotate(0deg) scaleX(1); opacity: 1; }
            100% { transform: translate(-10px, 10px) rotate(-25deg) scaleX(0.5); opacity: 0; }
          }
          @keyframes sparkDownRightSocial {
            0% { transform: translate(0, 0) rotate(0deg) scaleX(1); opacity: 1; }
            100% { transform: translate(10px, 10px) rotate(25deg) scaleX(0.5); opacity: 0; }
          }
        `}
      </style>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={handleClick}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
          color: isHovered ? colors.cream : colors.coral,
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            background: isHovered 
              ? "linear-gradient(135deg, rgba(252, 119, 83, 0.4) 0%, rgba(252, 119, 83, 0.2) 100%)"
              : "linear-gradient(135deg, rgba(28, 28, 28, 0.4) 0%, rgba(28, 28, 28, 0.2) 100%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${isHovered ? "rgba(239, 232, 221, 0.4)" : "rgba(252, 119, 83, 0.3)"}`,
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "all 0.3s ease",
          }}
        >
          {React.cloneElement(icon, { 
            color: isHovered ? colors.cream : colors.coral,
            style: { transition: "all 0.3s ease" }
          })}
        </div>
        <span style={{ 
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", 
          fontSize: "12px", 
          letterSpacing: "2px",
          transition: "color 0.3s ease",
        }}>
          {label}
        </span>
      </a>
      
      {/* Animated COPIED! popup */}
      {copied && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "subtleWiggleSocial 0.3s ease-out forwards, fadeOutCopiedSocial 2.5s ease-in-out forwards",
          }}
        >
          {/* Left spark */}
          <div
            style={{
              position: "absolute",
              left: "-4px",
              top: "50%",
              marginTop: "-1px",
              width: "10px",
              height: "2px",
              backgroundColor: colors.coral,
              borderRadius: "2px",
              animation: "sparkLeftSocial 0.5s ease-out forwards",
            }}
          />
          {/* Right spark */}
          <div
            style={{
              position: "absolute",
              right: "-4px",
              top: "50%",
              marginTop: "-1px",
              width: "10px",
              height: "2px",
              backgroundColor: colors.coral,
              borderRadius: "2px",
              animation: "sparkRightSocial 0.5s ease-out forwards",
            }}
          />
          {/* Bottom left spark */}
          <div
            style={{
              position: "absolute",
              left: "10%",
              bottom: "-4px",
              width: "10px",
              height: "2px",
              backgroundColor: colors.coral,
              borderRadius: "2px",
              animation: "sparkDownLeftSocial 0.6s ease-out forwards",
              animationDelay: "0.08s",
            }}
          />
          {/* Bottom right spark */}
          <div
            style={{
              position: "absolute",
              right: "10%",
              bottom: "-4px",
              width: "10px",
              height: "2px",
              backgroundColor: colors.coral,
              borderRadius: "2px",
              animation: "sparkDownRightSocial 0.6s ease-out forwards",
              animationDelay: "0.08s",
            }}
          />
          <span 
            style={{ 
              fontSize: "12px", 
              letterSpacing: "2px", 
              color: colors.coral,
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            COPIED!
          </span>
        </div>
      )}
    </div>
  );
}

// Contact Button with hover effect
function ContactButton({ inverted = false }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Glass effect colors
  const bgGradient = inverted 
    ? (isHovered 
        ? "linear-gradient(135deg, rgba(28, 28, 28, 0.5) 0%, rgba(28, 28, 28, 0.3) 100%)"
        : "linear-gradient(135deg, rgba(252, 119, 83, 0.7) 0%, rgba(252, 119, 83, 0.5) 100%)")
    : (isHovered ? colors.cream : colors.coral);
  const textColor = inverted
    ? (isHovered ? colors.cream : colors.charcoal)
    : (isHovered ? colors.coral : colors.charcoal);
  
  return (
    <a
      href={`mailto:${portfolioData.email}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: bgGradient,
        backdropFilter: inverted ? "blur(16px)" : "none",
        WebkitBackdropFilter: inverted ? "blur(16px)" : "none",
        boxShadow: inverted ? "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)" : "none",
        border: inverted ? "1px solid rgba(252, 119, 83, 0.3)" : "none",
        color: textColor,
        padding: "12px 24px",
        textDecoration: "none",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontWeight: "bold",
        fontSize: "14px",
        letterSpacing: "1px",
        transition: "all 0.3s ease",
        borderRadius: inverted ? "8px" : "0",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Mail size={18} color={textColor} style={{ transition: "all 0.3s ease" }} />
      CONTACT ME
    </a>
  );
}

// Lock Icon with hover effect
function LockIcon() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        display: "flex", 
        alignItems: "center",
        opacity: isHovered ? 1 : 0.5,
        transition: "opacity 0.2s",
      }}
    >
      <Lock size={16} color={isHovered ? colors.coral : colors.cream} style={{ transition: "color 0.2s" }} />
    </div>
  );
}

// Scroll Indicator
function ScrollIndicator({ hidden = false }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (isDragging) return; // Don't update while dragging
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDragging]);

  // Handle drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!trackRef.current) return;
      const trackRect = trackRef.current.getBoundingClientRect();
      const relativeY = e.clientY - trackRect.top;
      const progress = Math.min(Math.max(relativeY / trackRect.height, 0), 1);
      
      setScrollProgress(progress);
      
      // Scroll the page
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: progress * docHeight });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsHovered(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const trackHeight = 150;
  const diamondPosition = scrollProgress * (trackHeight - 10);
  
  // Hide on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleTrackClick = (e) => {
    if (!trackRef.current) return;
    const trackRect = trackRef.current.getBoundingClientRect();
    const relativeY = e.clientY - trackRect.top;
    const progress = Math.min(Math.max(relativeY / trackRect.height, 0), 1);
    
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: progress * docHeight, behavior: "smooth" });
  };

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: "30px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
        transition: "opacity 0.3s ease",
      }}
    >
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: colors.coral }} />
      <div 
        ref={trackRef}
        onClick={handleTrackClick}
        style={{ 
          width: "20px", 
          height: `${trackHeight}px`, 
          display: "flex",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <div style={{ width: "2px", height: "100%", backgroundColor: colors.coral, position: "relative" }}>
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => !isDragging && setIsHovered(false)}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            style={{
              position: "absolute",
              top: `${diamondPosition}px`,
              left: "50%",
              transform: `translateX(-50%) rotate(45deg) scale(${isHovered || isDragging ? 1.4 : 1})`,
              width: "10px",
              height: "10px",
              backgroundColor: colors.coral,
              transition: isDragging ? "none" : "top 0.1s ease-out, transform 0.15s ease",
              cursor: isDragging ? "grabbing" : "grab",
              boxShadow: isHovered || isDragging ? `0 0 8px ${colors.coral}` : "none",
            }}
          />
        </div>
      </div>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: colors.coral }} />
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

// Fixed Footer
function Footer({ onAdminClick, isAdmin }) {
  const [emailCopied, setEmailCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleEmailClick = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(portfolioData.email).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    }).catch(() => {
      // Fallback or silent fail if clipboard access denied
      console.log("Clipboard access denied");
    });
  };
  
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.charcoal,
        borderTop: `3px solid ${colors.coral}`,
        padding: isMobile ? "12px 16px" : "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Keyframe animations for copied effect */}
      <style>
        {`
          @keyframes subtleWiggle {
            0% { opacity: 0; margin-top: -3px; }
            30% { opacity: 1; margin-top: 5px; }
            50% { margin-top: 3px; }
            70% { margin-top: 4.5px; }
            100% { opacity: 1; margin-top: 4px; }
          }
          @keyframes fadeOutCopied {
            0% { opacity: 1; }
            75% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes sparkLeft {
            0% { transform: translateX(0) rotate(0deg) scaleX(1); opacity: 1; }
            100% { transform: translateX(-14px) rotate(-20deg) scaleX(0.5); opacity: 0; }
          }
          @keyframes sparkRight {
            0% { transform: translateX(0) rotate(0deg) scaleX(1); opacity: 1; }
            100% { transform: translateX(14px) rotate(20deg) scaleX(0.5); opacity: 0; }
          }
          @keyframes sparkDownLeft {
            0% { transform: translate(0, 0) rotate(0deg) scaleX(1); opacity: 1; }
            100% { transform: translate(-10px, 10px) rotate(-25deg) scaleX(0.5); opacity: 0; }
          }
          @keyframes sparkDownRight {
            0% { transform: translate(0, 0) rotate(0deg) scaleX(1); opacity: 1; }
            100% { transform: translate(10px, 10px) rotate(25deg) scaleX(0.5); opacity: 0; }
          }
        `}
      </style>
      
      {/* Left side: Copyright + Lock */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "16px" }}>
        <p style={{ color: colors.cream, fontSize: isMobile ? "11px" : "14px", margin: 0, letterSpacing: "1px" }}>
          © 2024 Zach Foster. All rights reserved.
        </p>
        <button
          onClick={onAdminClick}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            transition: "opacity 0.2s",
          }}
          title={isAdmin ? "Exit Admin" : "Admin Login"}
        >
          {isAdmin ? (
            <LogOut size={16} color={colors.coral} />
          ) : (
            <LockIcon />
          )}
        </button>
      </div>
      
      {/* Right side: Social icons */}
      <div style={{ display: "flex", gap: isMobile ? "24px" : "40px", alignItems: "center" }}>
        {/* Email button with copy feedback */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button
            onClick={handleEmailClick}
            style={{ 
              background: "none",
              border: "none",
              color: colors.cream, 
              transition: "color 0.2s", 
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.coral)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.cream)}
            title="Copy Email"
          >
            <Mail size={24} />
          </button>
          {emailCopied && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "subtleWiggle 0.3s ease-out forwards, fadeOutCopied 2.5s ease-in-out forwards",
              }}
            >
              {/* Left spark */}
              <div
                style={{
                  position: "absolute",
                  left: "-4px",
                  top: "50%",
                  marginTop: "-1px",
                  width: "10px",
                  height: "2px",
                  backgroundColor: colors.coral,
                  borderRadius: "2px",
                  animation: "sparkLeft 0.5s ease-out forwards",
                }}
              />
              {/* Right spark */}
              <div
                style={{
                  position: "absolute",
                  right: "-4px",
                  top: "50%",
                  marginTop: "-1px",
                  width: "10px",
                  height: "2px",
                  backgroundColor: colors.coral,
                  borderRadius: "2px",
                  animation: "sparkRight 0.5s ease-out forwards",
                }}
              />
              {/* Bottom left spark */}
              <div
                style={{
                  position: "absolute",
                  left: "10%",
                  bottom: "-4px",
                  width: "10px",
                  height: "2px",
                  backgroundColor: colors.coral,
                  borderRadius: "2px",
                  animation: "sparkDownLeft 0.6s ease-out forwards",
                  animationDelay: "0.08s",
                }}
              />
              {/* Bottom right spark */}
              <div
                style={{
                  position: "absolute",
                  right: "10%",
                  bottom: "-4px",
                  width: "10px",
                  height: "2px",
                  backgroundColor: colors.coral,
                  borderRadius: "2px",
                  animation: "sparkDownRight 0.6s ease-out forwards",
                  animationDelay: "0.08s",
                }}
              />
              <span 
                style={{ 
                  fontSize: "10px", 
                  letterSpacing: "1px", 
                  color: colors.coral,
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                COPIED!
              </span>
            </div>
          )}
        </div>
        <a
          href={portfolioData.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.cream, transition: "color 0.2s", padding: "8px" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = colors.coral)}
          onMouseLeave={(e) => (e.currentTarget.style.color = colors.cream)}
          title="LinkedIn"
        >
          <Linkedin size={24} />
        </a>
        <a
          href={portfolioData.instagram}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.cream, transition: "color 0.2s", padding: "8px" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = colors.coral)}
          onMouseLeave={(e) => (e.currentTarget.style.color = colors.cream)}
          title="Instagram"
        >
          <Instagram size={24} />
        </a>
      </div>
    </footer>
  );
}

// Navigation
function Navigation({ currentPage, setCurrentPage, showNavEye = false, showNavName = false, onEyeClick }) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: `${colors.charcoal}ee`,
        backdropFilter: "blur(10px)",
        borderBottom: `2px solid ${colors.coral}`,
        padding: "8px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100,
        minHeight: "50px",
      }}
    >
      {/* Left container - fixed width for balance */}
      <div style={{ width: "80px", flexShrink: 0, display: "flex", alignItems: "center" }}>
        <button
          onClick={() => {
            if (onEyeClick) onEyeClick();
            setCurrentPage("home");
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0",
            margin: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: showNavEye ? 1 : 0,
            transform: showNavEye ? "scale(1)" : "scale(0.8)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
            pointerEvents: showNavEye ? "auto" : "none",
          }}
          title="Back to Top"
        >
          <RiveEye size={55} />
        </button>
      </div>
      
      {/* Name in center - thick chunky font - CLICKABLE */}
      <div
        onClick={() => {
          if (onEyeClick) onEyeClick();
          setCurrentPage("home");
        }}
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: showNavName ? 1 : 0,
          transform: showNavName ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
          overflow: "hidden",
          cursor: showNavName ? "pointer" : "default",
          pointerEvents: showNavName ? "auto" : "none",
        }}
      >
        {/* Load Notable font */}
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Notable&display=swap');`}
        </style>
        <span
          style={{
            fontFamily: "'Notable', sans-serif",
            fontSize: "clamp(20px, 5vw, 32px)", // Responsive font size
            fontWeight: "400",
            color: colors.coral,
            letterSpacing: "clamp(1px, 0.5vw, 2px)", // Responsive letter spacing
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          ZACH FOSTER
        </span>
      </div>
      
      {/* Right container - fixed width for balance */}
      <div style={{ width: "80px", flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
        <AboutMeButton currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    </nav>
  );
}

// About Me Button with speech bubble
function AboutMeButton({ currentPage, setCurrentPage }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showInitialBubble, setShowInitialBubble] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
  
  const isOnAboutPage = currentPage === "about";
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    // Only show timed bubble on desktop
    if (isMobile) return;
    
    let innerTimer;
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      innerTimer = setTimeout(() => {
        setShowInitialBubble(false);
        setIsFadingOut(false);
      }, 500);
    }, 10000);
    return () => {
      clearTimeout(timer);
      if (innerTimer) clearTimeout(innerTimer);
    };
  }, [isMobile]);
  
  const showBubble = !isMobile && (isHovered || showInitialBubble) && !isOnAboutPage;
  
  return (
    <div 
      style={{ 
        position: "relative", 
        flexShrink: 0,
        opacity: isOnAboutPage ? 0 : 1,
        pointerEvents: isOnAboutPage ? "none" : "auto",
        transition: "opacity 0.3s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Keyframe animations */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
          @keyframes slideInBounce {
            0% { transform: translateY(-50%) translateX(20px); opacity: 0; }
            60% { transform: translateY(-50%) translateX(-5px); opacity: 1; }
            80% { transform: translateY(-50%) translateX(2px); }
            100% { transform: translateY(-50%) translateX(0); opacity: 1; }
          }
          @keyframes slideOutFade {
            0% { transform: translateY(-50%) translateX(0); opacity: 1; }
            100% { transform: translateY(-50%) translateX(15px); opacity: 0; }
          }
        `}
      </style>
      
      {/* Speech bubble - desktop only */}
      {showBubble && (
        <div
          style={{
            position: "absolute",
            right: "calc(100% + 10px)",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: colors.coral,
            padding: "8px 16px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            animation: isFadingOut 
              ? "slideOutFade 0.5s ease-in forwards" 
              : "slideInBounce 0.5s ease-out forwards",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue', Impact, 'Arial Black', sans-serif",
              fontSize: "22px",
              fontWeight: "400",
              color: colors.charcoal,
              letterSpacing: "2px",
            }}
          >
            ABOUT ME
          </span>
          {/* Speech bubble arrow pointing right */}
          <div
            style={{
              position: "absolute",
              right: "-8px",
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderLeft: `8px solid ${colors.coral}`,
            }}
          />
        </div>
      )}
      
      <button
        onClick={() => setCurrentPage("about")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          transition: "transform 0.2s ease",
          transform: isHovered ? "scale(1.15)" : "scale(1)",
        }}
        title="About Me"
      >
        <PersonIcon size={36} color={isHovered ? colors.cream : colors.coral} />
      </button>
      
      {/* Mobile label beneath icon */}
      {isMobile && !isOnAboutPage && (
        <span
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "8px",
            fontWeight: "bold",
            color: colors.cream,
            letterSpacing: "1px",
            marginTop: "2px",
          }}
        >
          ABOUT
        </span>
      )}
    </div>
  );
}

// Animation Card with Video Hover Preview
function AnimationCard({ animation, onClick, lightMode = false, isAdmin = false, onEdit, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getAspectRatio = () => {
    switch (animation.aspectRatio) {
      case "vertical": return "9/16";
      case "widescreen": return "16/9";
      default: return "1/1";
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Delay video load slightly for better UX
    hoverTimeoutRef.current = setTimeout(() => {
      setShowVideo(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowVideo(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const embedUrl = getYouTubeEmbedUrl(animation.youtubeUrl, true);
  const thumbnailUrl = animation.thumbnail || getYouTubeThumbnail(animation.youtubeUrl);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: "pointer",
        transform: isHovered ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.3s ease",
        position: "relative",
      }}
    >
      {/* Admin controls */}
      {isAdmin && (
        <div style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          zIndex: 10,
          display: "flex",
          gap: "8px",
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(animation); }}
            style={{
              backgroundColor: colors.coral,
              border: "none",
              padding: "8px",
              cursor: "pointer",
            }}
          >
            <Edit size={16} color={colors.cream} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(animation.id); }}
            style={{
              backgroundColor: colors.charcoal,
              border: `1px solid ${colors.coral}`,
              padding: "8px",
              cursor: "pointer",
            }}
          >
            <Trash2 size={16} color={colors.coral} />
          </button>
        </div>
      )}

      <div
        onClick={onClick}
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: colors.charcoal,
          aspectRatio: getAspectRatio(),
          border: `2px solid ${colors.coral}`,
        }}
      >
        {/* Thumbnail */}
        <img
          src={thumbnailUrl}
          alt={animation.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.5s ease",
            opacity: showVideo ? 0 : 1,
          }}
        />

        {/* Video preview on hover */}
        {showVideo && embedUrl && (
          <iframe
            src={embedUrl}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
              pointerEvents: "none",
            }}
            allow="autoplay; muted"
            title={animation.title}
          />
        )}

        {/* Play button overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: showVideo ? "transparent" : `${colors.charcoal}44`,
            opacity: isHovered && !showVideo ? 1 : (showVideo ? 0 : 0.8),
            transition: "opacity 0.3s ease",
          }}
        >
          {!showVideo && (
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: `${colors.coral}dd`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Play size={28} color={colors.cream} fill={colors.cream} style={{ marginLeft: "4px" }} />
            </div>
          )}
        </div>

        {/* Hover gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to top, ${colors.charcoal}cc, transparent)`,
            opacity: isHovered && !showVideo ? 1 : 0,
            transition: "opacity 0.3s ease",
            display: "flex",
            alignItems: "flex-end",
            padding: "16px",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              color: colors.coral,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            VIEW PROJECT
          </span>
        </div>
      </div>

      <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "16px",
            fontWeight: "bold",
            color: lightMode ? colors.charcoal : colors.cream,
            margin: 0,
            letterSpacing: "1px",
          }}
        >
          {animation.title.toUpperCase()}
        </h3>
        <span
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            color: colors.coral,
            fontSize: "14px",
          }}
        >
          {animation.year}
        </span>
      </div>
    </div>
  );
}

// Animation Modal with embedded video
function AnimationModal({ isOpen, onClose, animation }) {
  const [closeHovered, setCloseHovered] = useState(false);
  
  if (!isOpen || !animation) return null;

  const embedUrl = getYouTubeEmbedUrl(animation.youtubeUrl);

  // Starburst component
  const Starburst = ({ size = 24, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={colors.coral} style={style}>
      <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
    </svg>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: `${colors.charcoal}ee`,
          zIndex: 200,
        }}
      />
      
      {/* Modal wrapper - for positioning starbursts */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "800px",
          zIndex: 201,
        }}
      >
        {/* Starbursts at corners of this wrapper */}
        <Starburst size={70} style={{ position: "absolute", top: "-35px", right: "-35px", zIndex: 5 }} />
        <Starburst size={45} style={{ position: "absolute", top: "20px", right: "-25px", opacity: 0.7, zIndex: 5 }} />
        <Starburst size={32} style={{ position: "absolute", top: "-22px", right: "25px", opacity: 0.5, zIndex: 5 }} />
        
        <Starburst size={65} style={{ position: "absolute", bottom: "-32px", left: "-32px", zIndex: 5 }} />
        <Starburst size={40} style={{ position: "absolute", bottom: "18px", left: "-22px", opacity: 0.7, zIndex: 5 }} />

        {/* Actual modal box */}
        <div
          style={{
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: colors.cream,
            overflow: "hidden",
          }}
        >
          {/* Close button - diamond shape, cream bg with dark gray X */}
          <button
            onClick={onClose}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              backgroundColor: closeHovered ? colors.charcoal : colors.cream,
              border: `2px solid ${colors.charcoal}`,
              width: "32px",
              height: "32px",
              cursor: "pointer",
              zIndex: 10,
              transform: "rotate(45deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s ease",
            }}
          >
            <X 
              size={16} 
              color={closeHovered ? colors.coral : colors.charcoal} 
              style={{ transform: "rotate(-45deg)", transition: "color 0.2s ease" }} 
            />
          </button>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Load Bebas Neue font */}
            <style>
              {`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}
            </style>
            
            {/* Embedded YouTube video with coral border */}
            {embedUrl && (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  marginBottom: "16px",
                  backgroundColor: colors.charcoal,
                  border: `3px solid ${colors.coral}`,
                  flexShrink: 0,
                }}
              >
                <iframe
                  src={embedUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={animation.title}
                />
              </div>
            )}

            {/* Title row with duration and year */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
              <h2
                style={{
                  fontFamily: "'Bebas Neue', Impact, 'Arial Black', sans-serif",
                  fontSize: "32px",
                  fontWeight: "400",
                  color: colors.charcoal,
                  margin: 0,
                  letterSpacing: "2px",
                }}
              >
                {animation.title.toUpperCase()}
              </h2>
              
              <div
                style={{
                  backgroundColor: colors.coral,
                  padding: "2px 10px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    color: colors.charcoal,
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {animation.duration}
                </span>
              </div>
              
              <span
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  color: colors.coral,
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginLeft: "auto",
                }}
              >
                {animation.year}
              </span>
            </div>

            {/* Scrollable description area */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                minHeight: 0,
                maxHeight: "120px",
              }}
            >
              <p
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  color: colors.charcoal,
                  fontSize: "16px",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {animation.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// ADMIN PANEL
// ============================================

// Login Modal
function AdminLogin({ onLogin, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={handleClose} 
        style={{ 
          position: "fixed", 
          inset: 0, 
          backgroundColor: `${colors.charcoal}99`, 
          zIndex: 300,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }} 
      />
      
      {/* Modal */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: isVisible ? "50%" : "60%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(28, 28, 28, 0.7)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          padding: "48px",
          borderRadius: "16px",
          border: `1px solid rgba(252, 119, 83, 0.4)`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
          zIndex: 301,
          minWidth: "340px",
          opacity: isVisible ? 1 : 0,
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Lock icon decoration */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <Lock size={40} color={colors.coral} />
        </div>
        
        <h2 style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "32px",
          fontWeight: "bold",
          color: colors.coral,
          marginBottom: "32px",
          textAlign: "center",
          letterSpacing: "4px",
        }}>
          ADMIN LOGIN
        </h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            style={{
              width: "100%",
              padding: "14px 16px",
              marginBottom: "20px",
              border: `2px solid ${error ? "#ff4444" : colors.coral}`,
              borderRadius: "8px",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: "16px",
              backgroundColor: colors.cream,
              color: colors.charcoal,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease",
            }}
          />
          
          <button
            type="submit"
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: buttonHovered ? colors.cream : colors.coral,
              color: buttonHovered ? colors.coral : colors.charcoal,
              border: "none",
              borderRadius: "8px",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "16px",
              letterSpacing: "2px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            LOGIN
          </button>
        </form>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            opacity: 0.7,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
        >
          <X size={24} color={colors.cream} />
        </button>
        
        {/* Error message */}
        {error && (
          <p style={{
            textAlign: "center",
            color: "#ff6b6b",
            marginTop: "16px",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "14px",
          }}>
            Incorrect password
          </p>
        )}
      </div>
    </>
  );
}

// Add/Edit Animation Modal
function AnimationEditor({ animation, onSave, onClose }) {
  const [formData, setFormData] = useState(animation || {
    title: "",
    year: new Date().getFullYear().toString(),
    youtubeUrl: "",
    thumbnail: "",
    description: "",
    duration: "",
    aspectRatio: "widescreen",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: animation?.id || Date.now(),
    });
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    border: `2px solid ${colors.charcoal}`,
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: "14px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "4px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontWeight: "bold",
    fontSize: "12px",
    color: colors.charcoal,
    letterSpacing: "1px",
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: `${colors.charcoal}99`, zIndex: 300 }} />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(239, 232, 221, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          padding: "40px",
          borderRadius: "16px",
          border: `1px solid rgba(252, 119, 83, 0.4)`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
          zIndex: 301,
          width: "90%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "24px",
          fontWeight: "bold",
          color: colors.charcoal,
          marginBottom: "24px",
        }}>
          {animation ? "EDIT ANIMATION" : "ADD ANIMATION"}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>TITLE</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>YOUTUBE URL</label>
          <input
            type="url"
            value={formData.youtubeUrl}
            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            required
            style={inputStyle}
          />

          <label style={labelStyle}>THUMBNAIL URL (optional - uses YouTube thumbnail if empty)</label>
          <input
            type="url"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            placeholder="https://..."
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>YEAR</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>DURATION</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="2:30"
                required
                style={inputStyle}
              />
            </div>
          </div>

          <label style={labelStyle}>ASPECT RATIO</label>
          <select
            value={formData.aspectRatio}
            onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="widescreen">Widescreen (16:9)</option>
            <option value="square">Square (1:1)</option>
            <option value="vertical">Vertical (9:16)</option>
          </select>

          <label style={labelStyle}>DESCRIPTION</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: colors.coral,
              color: colors.charcoal,
              border: "none",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Save size={18} />
            {animation ? "UPDATE" : "ADD"} ANIMATION
          </button>
        </form>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={20} color={colors.charcoal} />
        </button>
      </div>
    </>
  );
}

// Admin Add Button
function AddAnimationButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%",
        aspectRatio: "16/9",
        border: `3px dashed ${isHovered ? colors.coral : colors.charcoal}`,
        backgroundColor: isHovered ? `${colors.coral}22` : "transparent",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        transition: "all 0.3s ease",
      }}
    >
      <Plus size={48} color={isHovered ? colors.coral : colors.charcoal} />
      <span style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontWeight: "bold",
        fontSize: "14px",
        color: isHovered ? colors.coral : colors.charcoal,
        letterSpacing: "2px",
      }}>
        ADD NEW ANIMATION
      </span>
    </button>
  );
}

// Hero Section
function HeroSection({ isAdmin, demoReelUrl, onEditDemoReel, onResetDemoReel }) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
  const displayDemoReelUrl = demoReelUrl || portfolioData.demoReelUrl;
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      style={{
        minHeight: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: isMobile ? "20px 16px 40px" : "40px 24px 60px",
        position: "relative",
        zIndex: 1,
        textAlign: "center",
      }}
    >
      {/* Load Notable font for title */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Notable&display=swap');`}
      </style>

      <div 
        id="hero-eye"
        style={{ 
          margin: isMobile ? "10px 0 5px 0" : "20px 0 10px 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <RiveEyeLarge size={isMobile ? 180 : 300} />
      </div>

      <div
        id="hero-name"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "0",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Feathered shadow background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "110%",
            height: "120%",
            backgroundColor: colors.charcoal,
            borderRadius: "80px",
            opacity: 0.5,
            filter: "blur(25px)",
            zIndex: -1,
          }}
        />
        <h1
          style={{
            fontFamily: "'Notable', sans-serif",
            fontSize: "clamp(65px, 14vw, 115px)",
            fontWeight: "400",
            color: colors.coral,
            margin: 0,
            letterSpacing: "4px",
            textAlign: "center",
            lineHeight: 0.9,
          }}
        >
          ZACH
        </h1>
        <h1
          style={{
            fontFamily: "'Notable', sans-serif",
            fontSize: "clamp(75px, 16vw, 140px)",
            fontWeight: "400",
            color: colors.coral,
            margin: 0,
            letterSpacing: "4px",
            textAlign: "center",
            lineHeight: 0.9,
          }}
        >
          FOSTER
        </h1>
      </div>

      {/* Starburst decoration under FOSTER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "750px",
          margin: "12px 0",
          gap: "0",
          padding: "0 24px",
        }}
      >
        {/* Left starburst */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill={colors.cream} style={{ flexShrink: 0 }}>
          <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
        </svg>
        {/* Line */}
        <div style={{ flex: 1, height: "2px", backgroundColor: colors.cream }} />
        {/* Right starburst */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill={colors.cream} style={{ flexShrink: 0 }}>
          <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
        </svg>
      </div>

      {/* Subtitle with soft shadow background */}
      <div
        style={{
          position: "relative",
          marginBottom: "25px",
        }}
      >
        {/* Feathered shadow background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "110%",
            height: "200%",
            backgroundColor: colors.charcoal,
            borderRadius: "50px",
            opacity: 0.5,
            filter: "blur(15px)",
            zIndex: -1,
          }}
        />
        <p
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "18px",
            color: colors.cream,
            letterSpacing: "6px",
            margin: 0,
            textAlign: "center",
            position: "relative",
          }}
        >
          {portfolioData.tagline.toUpperCase()}
        </p>
      </div>

      {/* Demo Reel Section - Mid-Century Modern Style */}
      <div
        style={{
          width: "100%",
          maxWidth: "750px",
          marginTop: "35px",
          position: "relative",
        }}
      >
        {/* Decorative background shapes */}
        <div style={{
          position: "absolute",
          top: "-15px",
          left: "-15px",
          width: "30px",
          height: "30px",
          border: `3px solid ${colors.coral}`,
          transform: "rotate(45deg)",
        }} />
        <div style={{
          position: "absolute",
          top: "-15px",
          right: "-15px",
          width: "30px",
          height: "30px",
          border: `3px solid ${colors.coral}`,
          transform: "rotate(45deg)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-15px",
          left: "-15px",
          width: "30px",
          height: "30px",
          border: `3px solid ${colors.coral}`,
          transform: "rotate(45deg)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-15px",
          right: "-15px",
          width: "30px",
          height: "30px",
          border: `3px solid ${colors.coral}`,
          transform: "rotate(45deg)",
        }} />

        {/* Main container */}
        <div style={{
          position: "relative",
          backgroundColor: colors.charcoal,
          border: `3px solid ${colors.coral}`,
        }}>
          {/* Header bar with starburst pattern */}
          <div
            style={{
              backgroundColor: colors.coral,
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Left decorative element - lines */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "40px", height: "2px", backgroundColor: colors.charcoal }} />
              <div style={{ width: "8px", height: "8px", backgroundColor: colors.charcoal, transform: "rotate(45deg)" }} />
              <div style={{ width: "20px", height: "2px", backgroundColor: colors.charcoal }} />
            </div>

            {/* Title */}
            <h2
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: "18px",
                fontWeight: "bold",
                color: colors.charcoal,
                margin: 0,
                letterSpacing: "6px",
              }}
            >
              DEMO REEL
            </h2>

            {/* Right decorative element - lines */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "20px", height: "2px", backgroundColor: colors.charcoal }} />
              <div style={{ width: "8px", height: "8px", backgroundColor: colors.charcoal, transform: "rotate(45deg)" }} />
              <div style={{ width: "40px", height: "2px", backgroundColor: colors.charcoal }} />
            </div>
          </div>

          {/* Video container with inner border */}
          <div style={{ 
            padding: "10px",
            backgroundColor: colors.charcoal,
          }}>
            <div style={{
              position: "relative",
              border: `2px solid ${colors.cream}`,
            }}>
              {/* Corner accents inside video frame */}
              <div style={{ position: "absolute", top: "-1px", left: "-1px", width: "20px", height: "20px", borderTop: `3px solid ${colors.coral}`, borderLeft: `3px solid ${colors.coral}`, zIndex: 2 }} />
              <div style={{ position: "absolute", top: "-1px", right: "-1px", width: "20px", height: "20px", borderTop: `3px solid ${colors.coral}`, borderRight: `3px solid ${colors.coral}`, zIndex: 2 }} />
              <div style={{ position: "absolute", bottom: "-1px", left: "-1px", width: "20px", height: "20px", borderBottom: `3px solid ${colors.coral}`, borderLeft: `3px solid ${colors.coral}`, zIndex: 2 }} />
              <div style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "20px", height: "20px", borderBottom: `3px solid ${colors.coral}`, borderRight: `3px solid ${colors.coral}`, zIndex: 2 }} />

              <div style={{ aspectRatio: "16/9", backgroundColor: colors.charcoal, position: "relative" }}>
                <iframe
                  width="100%"
                  height="100%"
                  src={displayDemoReelUrl}
                  title="Demo Reel"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ display: "block" }}
                />
                {/* Admin edit buttons for demo reel */}
                {isAdmin && (
                  <div style={{ 
                    position: "absolute", 
                    bottom: "10px", 
                    right: "10px", 
                    display: "flex", 
                    gap: "8px",
                    zIndex: 10,
                  }}>
                    <button
                      onClick={onEditDemoReel}
                      style={{
                        backgroundColor: colors.coral,
                        color: colors.charcoal,
                        border: "none",
                        borderRadius: "4px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Edit size={14} /> Edit URL
                    </button>
                    {demoReelUrl && (
                      <button
                        onClick={onResetDemoReel}
                        style={{
                          backgroundColor: colors.charcoal,
                          color: colors.cream,
                          border: `1px solid ${colors.cream}`,
                          borderRadius: "4px",
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom decorative bar with starburst */}
          <div style={{
            backgroundColor: colors.charcoal,
            padding: "8px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            borderTop: `2px solid ${colors.coral}`,
          }}>
            {/* Left line */}
            <div style={{ flex: 1, height: "2px", backgroundColor: colors.coral }} />
            
            {/* Starburst SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill={colors.coral}>
              <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
            </svg>
            
            {/* Right line */}
            <div style={{ flex: 1, height: "2px", backgroundColor: colors.coral }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: "30px", opacity: 0.4 }}>
        <ConcentricArcs size={150} />
      </div>
    </section>
  );
}

// Portfolio Grid Section
function PortfolioSection({ animations, onCardClick, isAdmin, onAddClick, onEditClick, onDeleteClick }) {
  // Responsive column count
  const [columnCount, setColumnCount] = useState(3);
  
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth <= 500) {
        setColumnCount(1);
      } else if (window.innerWidth <= 900) {
        setColumnCount(2);
      } else {
        setColumnCount(3);
      }
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return (
    <section style={{ padding: "80px 24px 140px", backgroundColor: colors.cream, position: "relative", zIndex: 1 }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", backgroundColor: colors.coral }} />
      
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <GeometricBorder width={150} color={colors.charcoal} />
        </div>
        
        <h2
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "clamp(24px, 5vw, 32px)",
            fontWeight: "bold",
            color: colors.charcoal,
            marginBottom: "20px",
            letterSpacing: "4px",
            textAlign: "center",
          }}
        >
          ANIMATION WORK
        </h2>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "60px" }}>
          <GeometricBorder width={150} color={colors.charcoal} />
        </div>

        <div style={{ columnCount: columnCount, columnGap: "24px" }}>
          {isAdmin && (
            <div style={{ breakInside: "avoid", marginBottom: "24px" }}>
              <AddAnimationButton onClick={onAddClick} />
            </div>
          )}
          {animations.map((animation) => (
            <div key={animation.id} style={{ breakInside: "avoid", marginBottom: "24px" }}>
              <AnimationCard
                animation={animation}
                onClick={() => onCardClick(animation)}
                lightMode={true}
                isAdmin={isAdmin}
                onEdit={onEditClick}
                onDelete={onDeleteClick}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// About Page
function AboutPage({ isAdmin, photoUrl, onEditPhoto, onResetPhoto, bio, onEditBio, onResetBio }) {
  const displayPhotoUrl = photoUrl || portfolioData.about.photoUrl;
  const displayBio = bio || portfolioData.about.bio;
  
  return (
    <div
      style={{
        minHeight: "auto", // Let content determine height
        paddingTop: "15px",
        paddingBottom: "100px", // Room for scrolling past footer
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <section style={{ padding: "15px 24px", maxWidth: "1000px", margin: "0 auto", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", boxSizing: "border-box", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
          <GeometricBorder width={Math.min(200, window.innerWidth - 80)} />
        </div>

        <h1
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "clamp(28px, 6vw, 38px)", // Responsive title
            fontWeight: "bold",
            color: colors.coral,
            marginBottom: "15px",
            marginTop: "0",
            letterSpacing: "4px",
            textAlign: "center",
            width: "100%",
          }}
        >
          ABOUT ME
        </h1>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
          <GeometricBorder width={Math.min(200, window.innerWidth - 80)} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
            alignItems: "center",
            padding: "0 10px",
            width: "100%",
          }}
        >
          <div style={{ position: "relative", maxWidth: "350px", margin: "0 auto" }}>
            <div style={{ position: "absolute", top: "-10px", left: "-10px", width: "30px", height: "30px", borderTop: `3px solid ${colors.coral}`, borderLeft: `3px solid ${colors.coral}` }} />
            <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "30px", height: "30px", borderTop: `3px solid ${colors.coral}`, borderRight: `3px solid ${colors.coral}` }} />
            <div style={{ position: "absolute", bottom: "-10px", left: "-10px", width: "30px", height: "30px", borderBottom: `3px solid ${colors.coral}`, borderLeft: `3px solid ${colors.coral}` }} />
            <div style={{ position: "absolute", bottom: "-10px", right: "-10px", width: "30px", height: "30px", borderBottom: `3px solid ${colors.coral}`, borderRight: `3px solid ${colors.coral}` }} />
            
            <div style={{ aspectRatio: "1/1", border: `2px solid ${colors.cream}`, overflow: "hidden", position: "relative" }}>
              <img
                src={displayPhotoUrl}
                alt="Zach Foster"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Admin edit buttons for photo */}
              {isAdmin && (
                <div style={{ 
                  position: "absolute", 
                  bottom: "10px", 
                  right: "10px", 
                  display: "flex", 
                  gap: "8px" 
                }}>
                  <button
                    onClick={onEditPhoto}
                    style={{
                      backgroundColor: colors.coral,
                      color: colors.charcoal,
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  {photoUrl && (
                    <button
                      onClick={onResetPhoto}
                      style={{
                        backgroundColor: colors.charcoal,
                        color: colors.cream,
                        border: `1px solid ${colors.cream}`,
                        borderRadius: "4px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mid-century styled content box */}
          <div style={{ position: "relative" }}>
            {/* Main content container - glass effect */}
            <div
              style={{
                position: "relative",
                background: "linear-gradient(135deg, rgba(28, 28, 28, 0.5) 0%, rgba(28, 28, 28, 0.35) 100%)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                border: `1px solid rgba(252, 119, 83, 0.3)`,
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                padding: "30px",
              }}
            >
              {/* Decorative corner accents - coral for glass effect */}
              <div style={{ position: "absolute", top: "10px", left: "10px", width: "30px", height: "30px", borderTop: `2px solid ${colors.coral}`, borderLeft: `2px solid ${colors.coral}`, opacity: 0.7 }} />
              <div style={{ position: "absolute", top: "10px", right: "10px", width: "30px", height: "30px", borderTop: `2px solid ${colors.coral}`, borderRight: `2px solid ${colors.coral}`, opacity: 0.7 }} />
              <div style={{ position: "absolute", bottom: "10px", left: "10px", width: "30px", height: "30px", borderBottom: `2px solid ${colors.coral}`, borderLeft: `2px solid ${colors.coral}`, opacity: 0.7 }} />
              <div style={{ position: "absolute", bottom: "10px", right: "10px", width: "30px", height: "30px", borderBottom: `2px solid ${colors.coral}`, borderRight: `2px solid ${colors.coral}`, opacity: 0.7 }} />
              
              {/* Horizontal accent lines */}
              <div style={{ position: "absolute", top: "24px", left: "50px", right: "50px", height: "1px", backgroundColor: colors.coral, opacity: 0.6 }} />
              <div style={{ position: "absolute", bottom: "24px", left: "50px", right: "50px", height: "1px", backgroundColor: colors.coral, opacity: 0.6 }} />
              
              {/* Small decorative diamonds */}
              <div style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "8px", height: "8px", backgroundColor: colors.coral }} />
              <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "8px", height: "8px", backgroundColor: colors.coral }} />

              <h2
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: "26px",
                  fontWeight: "bold",
                  color: colors.cream,
                  marginBottom: "16px",
                  letterSpacing: "2px",
                  textAlign: "center",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {portfolioData.name}
              </h2>
              
              {/* Decorative divider under name */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "2px", backgroundColor: colors.coral }} />
                <div style={{ width: "6px", height: "6px", backgroundColor: colors.coral, transform: "rotate(45deg)" }} />
                <div style={{ width: "40px", height: "2px", backgroundColor: colors.coral }} />
              </div>
              
              <div style={{ position: "relative" }}>
                <p
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: colors.cream,
                    lineHeight: 1.7,
                    marginBottom: "20px",
                    textAlign: "center",
                    textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                >
                  {displayBio}
                </p>
                {/* Admin edit buttons for bio */}
                {isAdmin && (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}>
                    <button
                      onClick={onEditBio}
                      style={{
                        backgroundColor: colors.coral,
                        color: colors.charcoal,
                        border: "none",
                        borderRadius: "4px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Edit2 size={12} /> Edit Bio
                    </button>
                    {bio && (
                      <button
                        onClick={onResetBio}
                        style={{
                          backgroundColor: colors.charcoal,
                          color: colors.cream,
                          border: `1px solid ${colors.coral}`,
                          borderRadius: "4px",
                          padding: "6px 12px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "bold",
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "8px" }}>
                <ContactButton inverted />
              </div>
            </div>
          </div>
        </div>

        {/* GET IN TOUCH Section */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          justifyContent: "center", 
          alignItems: "center",
          marginTop: "40px",
          paddingBottom: "20px",
          width: "100%",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <h3
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: "clamp(22px, 5vw, 28px)",
                fontWeight: "bold",
                color: colors.coral,
                marginBottom: "20px",
                letterSpacing: "6px",
                textAlign: "center",
              }}
            >
              GET IN TOUCH
            </h3>

            <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap", width: "100%" }}>
              <SocialBox href="#" icon={<Mail size={24} />} label="EMAIL" copyText={portfolioData.email} />
              <SocialBox href={portfolioData.linkedin} icon={<Linkedin size={24} />} label="LINKEDIN" external />
              <SocialBox href={portfolioData.instagram} icon={<Instagram size={24} />} label="INSTAGRAM" external />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Home Page
function HomePage({ animations, isAdmin, onAddClick, onEditClick, onDeleteClick, demoReelUrl, onEditDemoReel, onResetDemoReel }) {
  const [selectedAnimation, setSelectedAnimation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (animation) => {
    setSelectedAnimation(animation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAnimation(null), 300);
  };

  return (
    <>
      <HeroSection 
        isAdmin={isAdmin}
        demoReelUrl={demoReelUrl}
        onEditDemoReel={onEditDemoReel}
        onResetDemoReel={onResetDemoReel}
      />
      <PortfolioSection
        animations={animations}
        onCardClick={handleCardClick}
        isAdmin={isAdmin}
        onAddClick={onAddClick}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
      />
      <AnimationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        animation={selectedAnimation}
      />
    </>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [fadeIn, setFadeIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingAnimation, setEditingAnimation] = useState(null);
  const [animations, setAnimations] = useState(defaultAnimations);
  const [showNavEye, setShowNavEye] = useState(false);
  const [showNavName, setShowNavName] = useState(false);
  
  // Custom photo and demo reel URLs (admin-editable)
  const [customPhotoUrl, setCustomPhotoUrl] = useState(null);
  const [customDemoReelUrl, setCustomDemoReelUrl] = useState(null);
  const [customBio, setCustomBio] = useState(null);

  // Track hero eye and name visibility for nav toggle
  useEffect(() => {
    const handleScroll = () => {
      const heroEye = document.getElementById("hero-eye");
      const heroName = document.getElementById("hero-name");
      
      if (currentPage === "home") {
        if (heroEye) {
          const rect = heroEye.getBoundingClientRect();
          const isHeroEyeVisible = rect.bottom > 0 && rect.top < window.innerHeight;
          setShowNavEye(!isHeroEyeVisible);
        }
        if (heroName) {
          const rect = heroName.getBoundingClientRect();
          // Show nav name sooner - when hero name top goes above 120px from viewport top
          const isHeroNameVisible = rect.top > 120;
          setShowNavName(!isHeroNameVisible);
        }
      } else if (currentPage === "about") {
        // Always show nav eye and name on about page
        setShowNavEye(true);
        setShowNavName(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage]);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load saved animations from localStorage on mount
  useEffect(() => {
    setFadeIn(true);
    try {
      const saved = localStorage.getItem("portfolio-animations");
      if (saved) {
        setAnimations(JSON.parse(saved));
      }
      // Load custom photo URL
      const savedPhoto = localStorage.getItem("portfolio-photo-url");
      if (savedPhoto) {
        setCustomPhotoUrl(savedPhoto);
      }
      // Load custom demo reel URL
      const savedDemoReel = localStorage.getItem("portfolio-demoreel-url");
      if (savedDemoReel) {
        setCustomDemoReelUrl(savedDemoReel);
      }
      // Load custom bio
      const savedBio = localStorage.getItem("portfolio-bio");
      if (savedBio) {
        setCustomBio(savedBio);
      }
    } catch (e) {
      console.log("localStorage not available, using defaults");
    }
  }, []);

  // Save animations to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("portfolio-animations", JSON.stringify(animations));
    } catch (e) {
      console.log("Could not save to localStorage");
    }
  }, [animations]);

  // Save custom photo URL to localStorage
  useEffect(() => {
    try {
      if (customPhotoUrl) {
        localStorage.setItem("portfolio-photo-url", customPhotoUrl);
      }
    } catch (e) {
      console.log("Could not save photo URL to localStorage");
    }
  }, [customPhotoUrl]);

  // Save custom demo reel URL to localStorage
  useEffect(() => {
    try {
      if (customDemoReelUrl) {
        localStorage.setItem("portfolio-demoreel-url", customDemoReelUrl);
      }
    } catch (e) {
      console.log("Could not save demo reel URL to localStorage");
    }
  }, [customDemoReelUrl]);

  // Save custom bio to localStorage
  useEffect(() => {
    try {
      if (customBio) {
        localStorage.setItem("portfolio-bio", customBio);
      }
    } catch (e) {
      console.log("Could not save bio to localStorage");
    }
  }, [customBio]);

  // Handlers for editing photo and demo reel
  const handleEditPhoto = () => {
    const newUrl = window.prompt("Enter new photo URL:", customPhotoUrl || portfolioData.about.photoUrl);
    if (newUrl !== null && newUrl.trim() !== "") {
      setCustomPhotoUrl(newUrl.trim());
    }
  };

  const handleResetPhoto = () => {
    if (window.confirm("Reset to default photo?")) {
      setCustomPhotoUrl(null);
      try {
        localStorage.removeItem("portfolio-photo-url");
      } catch (e) {}
    }
  };

  const handleEditDemoReel = () => {
    const newUrl = window.prompt("Enter new YouTube embed URL:\n(Format: https://www.youtube.com/embed/VIDEO_ID)", customDemoReelUrl || portfolioData.demoReelUrl);
    if (newUrl !== null && newUrl.trim() !== "") {
      setCustomDemoReelUrl(newUrl.trim());
    }
  };

  const handleResetDemoReel = () => {
    if (window.confirm("Reset to default demo reel?")) {
      setCustomDemoReelUrl(null);
      try {
        localStorage.removeItem("portfolio-demoreel-url");
      } catch (e) {}
    }
  };

  const handleEditBio = () => {
    const newBio = window.prompt("Enter new bio text:", customBio || portfolioData.about.bio);
    if (newBio !== null && newBio.trim() !== "") {
      setCustomBio(newBio.trim());
    }
  };

  const handleResetBio = () => {
    if (window.confirm("Reset to default bio?")) {
      setCustomBio(null);
      try {
        localStorage.removeItem("portfolio-bio");
      } catch (e) {}
    }
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogin = () => {
    setIsAdmin(true);
    setShowLogin(false);
  };

  const handleAddClick = () => {
    setEditingAnimation(null);
    setShowEditor(true);
  };

  const handleEditClick = (animation) => {
    setEditingAnimation(animation);
    setShowEditor(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this animation?")) {
      setAnimations(animations.filter(a => a.id !== id));
    }
  };

  const handleSaveAnimation = (animation) => {
    if (editingAnimation) {
      setAnimations(animations.map(a => a.id === animation.id ? animation : a));
    } else {
      setAnimations([animation, ...animations]);
    }
    setShowEditor(false);
    setEditingAnimation(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.charcoal,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        opacity: fadeIn ? 1 : 0,
        transition: "opacity 0.6s ease",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <WavyBackground />
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        showNavEye={showNavEye}
        showNavName={showNavName}
        onEyeClick={scrollToTop}
      />
      <ScrollIndicator hidden={currentPage === "about"} />

      {/* Admin indicator bar */}
      {isAdmin && (
        <div
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            backgroundColor: colors.coral,
            padding: "8px 24px",
            zIndex: 99,
            textAlign: "center",
          }}
        >
          <span style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: "bold",
            fontSize: "12px",
            color: colors.charcoal,
            letterSpacing: "2px",
          }}>
            ADMIN MODE — Click the lock icon to exit
          </span>
        </div>
      )}

      <main style={{ 
        paddingTop: isAdmin ? "100px" : "64px", 
        paddingBottom: currentPage === "about" ? "0px" : "80px", 
        position: "relative", 
        zIndex: 1 
      }}>
        {currentPage === "home" ? (
          <HomePage
            animations={animations}
            isAdmin={isAdmin}
            onAddClick={handleAddClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            demoReelUrl={customDemoReelUrl}
            onEditDemoReel={handleEditDemoReel}
            onResetDemoReel={handleResetDemoReel}
          />
        ) : (
          <AboutPage 
            isAdmin={isAdmin}
            photoUrl={customPhotoUrl}
            onEditPhoto={handleEditPhoto}
            onResetPhoto={handleResetPhoto}
            bio={customBio}
            onEditBio={handleEditBio}
            onResetBio={handleResetBio}
          />
        )}
      </main>

      <Footer onAdminClick={handleAdminClick} isAdmin={isAdmin} />

      {/* Admin Modals */}
      {showLogin && (
        <AdminLogin onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}
      {showEditor && (
        <AnimationEditor
          animation={editingAnimation}
          onSave={handleSaveAnimation}
          onClose={() => { setShowEditor(false); setEditingAnimation(null); }}
        />
      )}
    </div>
  );
}

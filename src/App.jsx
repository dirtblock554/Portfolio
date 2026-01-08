import React, { useState, useEffect, useRef } from "react";
import { X, Mail, Linkedin, Instagram, Play, Plus, Trash2, Edit, Edit2, Lock, LogOut, Save } from "lucide-react";
import { subscribeToSettings, subscribeToAnimations, saveSettings, saveAnimations } from "./firebase";

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
    photoUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAAAAAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCADhAZADASIAAhEBAxEB/8QAHAAAAQUBAQEAAAAAAAAAAAAABAIDBQYHAAEI/8QATRAAAQMCBAIGBgUJBQcDBQAAAQACAwQRBQYSITFBBxMiUWFxFDKBkaGxI0JywdEVM1Jic4KSouEWNDU2QwglU2OTwvAkJkRVZHSi8f/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AzOJl/WB2TwlAFmi1kuUC1xxQrg7jb2IHXRtNyRuV42AhpPJKgNgEULOGyAJpLdkTE7UCSmZm2JtdKp2k7DggJ8ikve2PivZCWN2J80J2pD2ggd60PvxICS2ME8ElrSCbC6cgcWv3vug9FM22wNxunIob7m4A5IqFlxfeyeEYtayCJnbZ1mBP0sYabkEp2emcCSASnKSMi+oHyQK0g37kzIA11wDdEVDdA2v5pETNZuUDEcRJvYoyNuy6xbew4pmQOab72QEtaEPNYNsd1zHvLedl65hIuNwgjJQS626kKMO0AWJPevHQ3cBbipCkpy3feyBuWO8RUc+OzTsRZT/Vgg7lRtbA7W4hADHHqsXXJ5bo8UxcwXukTkjay5lSHC5NkPPNc3v7kAsspY4339qHNTY35p2QdaSeXig5IjfbggKa4OFgnCwAX7+aj436Rsd0QJi9pBGyD2R4buNimPSHjhwSwb7O3XrYu/e/JA7SOL377+KnqR4AsAoamjIcABspWGzLboD2nmAli29whWuJCca7yQOSAaTqACEMW9wBdPSPtYWBXgNtha6BERLSBzPJHRvDRYjbvQ7YCbBgJcTsALkq+5OyvSwyU9TmHUHPeNMDgQGjkX+fcUFcocJrsQaDSUkskZOnXazb+fBSzcj4q+nkdpha5nFlyT8rfFafXYvRYTEOvY9kQ9XSy4HuTOFZywWuqBDFVBj3bASNLbnuQY5PlzFoG6m0csvKzRYj3pGAsDMR14lRzCGMi7DHq38dwt49No3Tup5S3V3FA4tlyCqY+SlDWvdve1wUELQ55paOZsD6Z0NMANLGwhn3qxQZtwiujMDpzC54sBKNIPt4LOccpopYX0VSwU9dCLx39V4HcfuUDTVHpFBolb24iWP+4oL1SE4HmF8lMG7nVYHZ7TxstSoJo6ilZNEQWPFwsBwueWTCi4ucepeQwnkO5aZ0bYnJUw1FM91wwB49pQXsAckFi9I2tw+eB4BbIwtIPiEWx1wveIsUFeyrLqwqOnftNTfQyN7iNlMFgIIIBB4quYk44JjorRf0SpsycDkeTlZWkOaHNIIIuCgzTNfRLgmNSTT0xloaqTcuiPZPsWYYn0C4zG4+gV1LIz9ckE7+S+l3jdNO5oPkDMHQhmWEF8k9I9ouSWvJPlwWfVOSa+nxBlLOLPcQNl9zYu5pjk1i4svmrpOxiClxKZ1Np68AtFuIQY9mCjpcPqTSUp1uZs95PEqcydmd2DUQiqYXS02v1mHtM/EKs1RMk7nE3JNySpPCKfr8PdYGwcQR3oNKoM2YRXkRtqDE93BsrdPx4KchaLXFrnmCsQkjdE4NHfYGynMExDEMPkElLK5zLbxu3afYg1cMbbdouvdIsbN+KrOFZvpal4hrmejTE2ud2H28lZY3texr2ODmHgQbgoFC1thZcbEEEbJLyWtvsmWkjc28kHr4ml/h3XS2kC4G3tTeoHjsU1MbDZAsytuW3ugauQ6wWb9+6SST6vFLYwWN+KBUR2PEeFk5dLaOySWeBsgWGWvukkWTliTuCgdmIsbc+5Apn1W8eKHE2sDbiAmJiXboB26b6t2lNNjbJxPkjkgAkJ1OBRsjNLfFIAAvsHIHtBNrDdMxt0i9vJFxRmQaSQUH//2Q==",
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
  
  // Flag to prevent saving on initial load
  const [dataLoaded, setDataLoaded] = useState(false);

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

  // Subscribe to Firebase data on mount
  useEffect(() => {
    setFadeIn(true);
    
    console.log("Initializing Firebase subscriptions...");
    
    // Subscribe to settings (photo, demo reel, bio)
    const unsubSettings = subscribeToSettings((data) => {
      console.log("Settings received from Firebase:", data);
      if (data) {
        if (data.photoUrl) setCustomPhotoUrl(data.photoUrl);
        if (data.demoReelUrl) setCustomDemoReelUrl(data.demoReelUrl);
        if (data.bio) setCustomBio(data.bio);
      }
    });
    
    // Subscribe to animations
    const unsubAnimations = subscribeToAnimations((data) => {
      console.log("Animations received from Firebase:", data);
      if (data && Array.isArray(data)) {
        setAnimations(data);
      }
    });
    
    // Mark data as loaded after a delay to prevent initial save
    const timer = setTimeout(() => {
      console.log("Data loaded flag set to true - saves will now work");
      setDataLoaded(true);
    }, 2000);
    
    return () => {
      unsubSettings();
      unsubAnimations();
      clearTimeout(timer);
    };
  }, []);

  // Save animations to Firebase when they change
  useEffect(() => {
    if (dataLoaded) {
      console.log("Saving animations to Firebase...");
      saveAnimations(animations);
    }
  }, [animations, dataLoaded]);

  // Save settings to Firebase when they change
  useEffect(() => {
    if (dataLoaded) {
      console.log("Saving settings to Firebase...");
      saveSettings({
        photoUrl: customPhotoUrl,
        demoReelUrl: customDemoReelUrl,
        bio: customBio,
      });
    }
  }, [customPhotoUrl, customDemoReelUrl, customBio, dataLoaded]);

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

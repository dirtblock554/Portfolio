import React, { useState, useEffect, useRef } from "react";
import { X, Mail, Linkedin, Instagram, Play, Plus, Trash2, Edit, Edit2, Lock, LogOut, Save } from "lucide-react";
import {
  subscribeToSettings,
  subscribeToAnimations,
  saveSettings,
  saveAnimations,
  subscribeToAchievements,
  subscribeToGalleries,
  saveAchievements,
  saveGallery,
  uploadEntryImage,
  deleteEntryImage,
  signInAdmin,
  signOutAdmin,
  subscribeToAdminState,
} from "./firebase";

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
    const delay = 2000 + Math.random() * 2500;
    this.blinkTimeoutId = setTimeout(() => {
      const useDoubleBlink = Math.random() < 0.25;
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
      const firstCanvas = this.instances[0]?.canvasRef;
      const target = this.getMouseLookTarget(firstCanvas);
      this.targetLookX = target.x;
      this.targetLookY = target.y;
    } else {
      if (now > this.nextIdleChange) {
        const newTarget = this.getRandomIdleTarget();
        this.idleTargetX = newTarget.x;
        this.idleTargetY = newTarget.y;
        this.nextIdleChange = now + 1000 + Math.random() * 2000;
      }
      this.targetLookX = this.idleTargetX;
      this.targetLookY = this.idleTargetY;
    }

    const dx = this.targetLookX - this.currentLookX;
    const dy = this.targetLookY - this.currentLookY;
    const speed = shouldTrackMouse ? this.EASING_SPEED : this.IDLE_EASING_SPEED;

    if (Math.abs(dx) > this.DEADZONE) {
      this.currentLookX = lerp(this.currentLookX, this.targetLookX, speed);
    }
    if (Math.abs(dy) > this.DEADZONE) {
      this.currentLookY = lerp(this.currentLookY, this.targetLookY, speed);
    }

    this.instances.forEach(instance => {
      if (instance.inputs) {
        let lookX, lookY;

        if (shouldTrackMouse && instance.trackMouse && instance.canvasRef?.current) {
          const rect = instance.canvasRef.current.getBoundingClientRect();
          const eyeCenterX = rect.left + rect.width / 2;
          const eyeCenterY = rect.top + rect.height / 2;

          const deltaX = this.mouseX - eyeCenterX;
          const deltaY = this.mouseY - eyeCenterY;

          const maxDistance = 200;

          lookX = clamp(50 + (deltaX / maxDistance) * 50, 0, 100);
          lookY = clamp(50 + (deltaY / maxDistance) * 50, 0, 100);
        } else {
          lookX = this.currentLookX;
          lookY = this.currentLookY;
        }

        const lookXInput = instance.inputs.LookX || instance.inputs.lookX;
        const lookYInput = instance.inputs.LookY || instance.inputs.lookY;
        if (lookXInput) lookXInput.value = lookX;
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

// Nav bar eye component
function RiveEye({ size = 60 }) {
  const canvasRef = useRef(null);
  const riveRef = useRef(null);
  const instanceRef = useRef({ canvasRef, inputs: null, trackMouse: false });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    instanceRef.current.canvasRef = canvasRef;
    instanceRef.current.trackMouse = false;
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
          // The canvas is centred on its container, but the eye sits slightly
          // high within the Rive artboard, so it reads as riding above the
          // name beside it. 4px down corrects the artwork, not the layout —
          // hence the nudge here rather than on the container, which would
          // also drag the correctly-centred SVG fallback off its line.
          transform: "translate(-50%, calc(-50% + 4px))",
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
    instanceRef.current.trackMouse = true;
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

const portfolioData = {
  name: "ZACH FOSTER",
  tagline: "Animator & Motion Designer",
  email: "zachfosteraz@gmail.com",
  linkedin: "https://www.linkedin.com/in/quikdraw/",
  instagram: "https://www.instagram.com/quikdrawz/",
  demoReelUrl: "https://www.youtube.com/embed/m1Cwt0VQ0ZU",
  about: {
    bio: "I'm Zach Foster, an animator and motion designer passionate about bringing ideas to life through movement. With a focus on storytelling and visual impact, I create animations that captivate and communicate.",
    photoUrl: "/Self portrait.png",
  },
};

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

// Downscale and re-encode an image in the browser before it is uploaded. A
// photo straight off a camera is often 4-8MB, which is far more than a web
// page ever displays -- shrinking it first cuts storage, bandwidth and page
// load time by roughly an order of magnitude with no visible difference.
const MAX_IMAGE_EDGE = 1600;
const IMAGE_QUALITY = 0.85;

async function compressImage(file) {
  // Redrawing an animated GIF to a canvas would flatten it to one frame.
  if (file.type === "image/gif") return file;

  try {
    // createImageBitmap applies EXIF orientation, so phone photos don't come
    // out rotated the way a raw canvas draw would leave them.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    // WebP keeps transparency (which matters for concept art and logos) and
    // compresses better than JPEG. A browser that can't encode WebP silently
    // hands back PNG instead, so fall back to JPEG in that case.
    let blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY));
    if (!blob || blob.type !== "image/webp") {
      blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", IMAGE_QUALITY));
    }

    // Re-encoding can enlarge an already-optimised file; keep whichever is smaller.
    if (!blob || blob.size >= file.size) return file;

    const extension = blob.type === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.${extension}`, { type: blob.type });
  } catch (error) {
    console.error("Image compression failed, uploading the original:", error);
    return file;
  }
}

function getYouTubeId(url) {
  if (!url) return null;
  // Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getYouTubeEmbedUrl(url, autoplay = false) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?${autoplay ? 'autoplay=1&mute=1&' : ''}rel=0&modestbranding=1`;
}

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
        if (touchPointsRef.current.length > 5) {
          touchPointsRef.current.shift();
        }
        touchPointsRef.current.push({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          strength: 0.5,
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
// Stand-in for the Rive eye while it loads, and permanently if it fails to.
// Drawn to match it: a solid cream almond with a coral-outlined iris.
function EyeLogo({ size = 48, color = colors.coral, secondaryColor = colors.cream, irisColor = colors.charcoal }) {
  return (
  <svg width={size} height={size * 0.5} viewBox="0 0 120 60" fill="none">
    <path d="M10 30 Q 60 -5, 110 30 Q 60 65, 10 30 Z" fill={secondaryColor} />
    <circle cx="60" cy="30" r="13" fill={irisColor} stroke={color} strokeWidth="4" />
  </svg>
  );
}

// Play control drawn as the site's eye motif: the logo's almond silhouette in
// coral, a cream iris, and the play triangle standing in for the pupil.
// `size` is the width; the almond is 3:2, matching the logo's proportions.
function PlayEye({ size = 60 }) {
  return (
    <svg width={size} height={size * (40 / 60)} viewBox="0 0 60 40" fill="none" style={{ display: "block" }}>
      <path d="M2 20 Q 30 -3, 58 20 Q 30 43, 2 20" fill={colors.coral} />
      <circle cx="30" cy="20" r="12" fill={colors.cream} />
      <polygon points="27,14.5 27,25.5 36,20" fill={colors.coral} />
    </svg>
  );
}

// Same mark as EyeLogo at hero scale, with the proportions carried across.
function EyeLogoLarge({ size = 200 }) {
  return (
  <svg width={size} height={size * 0.5} viewBox="0 0 200 100" fill="none">
    <path d="M5 50 Q 100 -15, 195 50 Q 100 115, 5 50 Z" fill={colors.cream} />
    <circle cx="100" cy="50" r="25" fill={colors.charcoal} stroke={colors.coral} strokeWidth="8" />
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
          <div style={{ position: "absolute", left: "-4px", top: "50%", marginTop: "-1px", width: "10px", height: "2px", backgroundColor: colors.coral, borderRadius: "2px", animation: "sparkLeftSocial 0.5s ease-out forwards" }} />
          <div style={{ position: "absolute", right: "-4px", top: "50%", marginTop: "-1px", width: "10px", height: "2px", backgroundColor: colors.coral, borderRadius: "2px", animation: "sparkRightSocial 0.5s ease-out forwards" }} />
          <div style={{ position: "absolute", left: "10%", bottom: "-4px", width: "10px", height: "2px", backgroundColor: colors.coral, borderRadius: "2px", animation: "sparkDownLeftSocial 0.6s ease-out forwards", animationDelay: "0.08s" }} />
          <div style={{ position: "absolute", right: "10%", bottom: "-4px", width: "10px", height: "2px", backgroundColor: colors.coral, borderRadius: "2px", animation: "sparkDownRightSocial 0.6s ease-out forwards", animationDelay: "0.08s" }} />
          <span style={{ fontSize: "12px", letterSpacing: "2px", color: colors.coral, fontWeight: "bold", whiteSpace: "nowrap" }}>COPIED!</span>
        </div>
      )}
    </div>
  );
}

// Contact Button with hover effect
function ContactButton({ inverted = false }) {
  const [isHovered, setIsHovered] = useState(false);

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
      if (isDragging) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDragging]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!trackRef.current) return;
      const trackRect = trackRef.current.getBoundingClientRect();
      const relativeY = e.clientY - trackRect.top;
      const progress = Math.min(Math.max(relativeY / trackRect.height, 0), 1);

      setScrollProgress(progress);

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

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleTrackClick = (e) => {
    if (!trackRef.current) return;
    const trackRect = trackRef.current.getBoundingClientRect();
    const relativeY = e.clientY - trackRect.top;
    const progress = Math.min(Math.max(relativeY / trackRect.height, 0), 1);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: progress * docHeight, behavior: "smooth" });
  };

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

// Fixed Footer - Updated copyright to 2026
function Footer({ onAdminClick, isAdmin }) {
  const [emailCopied, setEmailCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide footer on scroll-down, reveal on scroll-up - mobile only, to keep focus on artwork
  useEffect(() => {
    if (!isMobile) {
      setHidden(false);
      return;
    }

    lastScrollY.current = window.scrollY;
    let accumulated = 0;
    const TOGGLE_THRESHOLD = 40;

    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const diff = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // Reset the accumulator whenever the scroll direction reverses,
      // so a brief change of direction doesn't carry over stale momentum.
      if ((diff > 0 && accumulated < 0) || (diff < 0 && accumulated > 0)) {
        accumulated = 0;
      }
      accumulated += diff;

      if (accumulated > TOGGLE_THRESHOLD && currentScrollY > 150) {
        setHidden(true);
        accumulated = 0;
      } else if (accumulated < -TOGGLE_THRESHOLD || currentScrollY <= 150) {
        setHidden(false);
        accumulated = 0;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const handleEmailClick = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(portfolioData.email).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    }).catch(() => {
      console.log("Clipboard access denied");
    });
  };

  return (
    <>
    {/* Always-on strip covering the home-indicator safe area, independent of the footer's hide/show animation */}
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "env(safe-area-inset-bottom)",
        backgroundColor: colors.charcoal,
        zIndex: 99,
      }}
    />
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.charcoal,
        borderTop: `3px solid ${colors.coral}`,
        paddingTop: isMobile ? "12px" : "20px",
        paddingBottom: `calc(${isMobile ? 12 : 20}px + env(safe-area-inset-bottom))`,
        paddingLeft: isMobile ? "16px" : "32px",
        paddingRight: isMobile ? "16px" : "32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        transform: isMobile && hidden ? "translateY(100%)" : "translateY(0)",
        transition: "transform 0.3s ease",
      }}
    >
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

      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "16px" }}>
        <p style={{ color: colors.cream, fontSize: isMobile ? "11px" : "14px", margin: 0, letterSpacing: "1px" }}>
          © 2026 Zach Foster. All rights reserved.
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

      <div style={{ display: "flex", gap: isMobile ? "24px" : "40px", alignItems: "center" }}>
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
              <div style={{ position: "absolute", left: "-4px", top: "50%", marginTop: "-1px", width: "10px", height: "2px", backgroundColor: colors.coral, borderRadius: "2px", animation: "sparkLeft 0.5s ease-out forwards" }} />
              <div style={{ position: "absolute", right: "-4px", top: "50%", marginTop: "-1px", width: "10px", height: "2px", backgroundColor: colors.coral, borderRadius: "2px", animation: "sparkRight 0.5s ease-out forwards" }} />
              <div style={{ position: "absolute", left: "10%", bottom: "-4px", width: "10px", height: "2px", backgroundColor: colors.coral, borderRadius: "2px", animation: "sparkDownLeft 0.6s ease-out forwards", animationDelay: "0.08s" }} />
              <div style={{ position: "absolute", right: "10%", bottom: "-4px", width: "10px", height: "2px", backgroundColor: colors.coral, borderRadius: "2px", animation: "sparkDownRight 0.6s ease-out forwards", animationDelay: "0.08s" }} />
              <span style={{ fontSize: "10px", letterSpacing: "1px", color: colors.coral, fontWeight: "bold", whiteSpace: "nowrap" }}>COPIED!</span>
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
    </>
  );
}

// Navigation - Fixed mobile alignment
function Navigation({ currentPage, setCurrentPage, showNavEye = false, showNavName = false, onEyeClick, onOpenWorkMenu }) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
  // When the About Me bubble expands it occupies the space to the icon's left,
  // so the work-menu hamburger slides aside and returns when it closes.
  const [aboutBubbleVisible, setAboutBubbleVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Both side columns share a width so the centred name lands on the true
  // centre of the screen. 80px is what the right column's WORK + ABOUT
  // controls actually measure, and it's enough for the eye at its mobile size.
  const sideWidth = isMobile ? "80px" : "100px";

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
        // Phones need the side margin back as usable width — at 24px the
        // three columns couldn't fit and the name was cut off.
        padding: isMobile ? "8px 12px" : "8px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100,
        minHeight: "50px",
      }}
    >
      {/* Left container */}
      <div style={{ width: sideWidth, flexShrink: 0, display: "flex", alignItems: "center" }}>
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
          {/* The Rive build only occupies size x 1.2 of layout and paints
              wider than that, so the column constrains it far less than the
              SVG fallback (which is a full size x 2 wide) suggests. 48 keeps
              the eye close to its original weight while the fallback's 96px
              still sits inside the centre column's slack. */}
          <RiveEye size={isMobile ? 48 : 55} />
        </button>
      </div>

      {/* Name in center - FIXED: Added marginTop for mobile alignment */}
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
          // No nudge: the nav centres its columns, so anything added here only
          // knocks the name out of line with the eye.
        }}
      >
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Notable&display=swap');`}
        </style>
        <span
          style={{
            fontFamily: "'Notable', sans-serif",
            fontSize: "clamp(20px, 5vw, 32px)",
            fontWeight: "400",
            color: colors.coral,
            letterSpacing: "clamp(1px, 0.5vw, 2px)",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          ZACH FOSTER
        </span>
      </div>

      {/* Right container */}
      {/* On phones the two stacks are bottom-aligned so WORK and ABOUT sit on
          one line; centring them left the labels 8px apart, since the icons
          above them are different heights. */}
      <div style={{ width: sideWidth, flexShrink: 0, display: "flex", justifyContent: "flex-end", alignItems: isMobile ? "flex-end" : "center", gap: isMobile ? "6px" : "10px" }}>
        <WorkMenuButton
          onClick={onOpenWorkMenu}
          shifted={aboutBubbleVisible}
          isMobile={isMobile}
        />
        <AboutMeButton
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onBubbleChange={setAboutBubbleVisible}
        />
      </div>
    </nav>
  );
}

// Work menu hamburger that lives beside the About Me control. Slides aside
// while the About Me bubble is out so the bubble never covers it.
function WorkMenuButton({ onClick, shifted, isMobile }) {
  const [isHovered, setIsHovered] = useState(false);

  const showBubble = !isMobile && isHovered;
  const barStyle = {
    width: "22px",
    height: "3px",
    backgroundColor: isHovered ? colors.cream : colors.coral,
    transition: "background-color 0.2s ease",
  };

  return (
    <div
      style={{
        position: "relative",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: shifted ? "translateX(-158px)" : "translateX(0)",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
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
            animation: "slideInBounce 0.5s ease-out forwards",
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
            MY WORK
          </span>
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
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open portfolio menu"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px 4px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          transition: "transform 0.2s ease",
          transform: isHovered ? "scale(1.15)" : "scale(1)",
        }}
      >
        <div style={barStyle} />
        <div style={barStyle} />
        <div style={barStyle} />
      </button>

      {isMobile && (
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
          WORK
        </span>
      )}
    </div>
  );
}

// About Me Button with speech bubble
function AboutMeButton({ currentPage, setCurrentPage, onBubbleChange }) {
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

  // Let the nav know when the bubble is out so neighbouring controls can
  // slide clear of it.
  useEffect(() => {
    if (onBubbleChange) onBubbleChange(showBubble);
  }, [showBubble, onBubbleChange]);

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
        {/* The glyph fills almost its whole box, so its size is its drawn
            height. The WORK hamburger beside it stands 19px tall (three 3px
            bars, two 5px gaps), so 22 matches it instead of towering over it. */}
        <PersonIcon size={isMobile ? 22 : 36} color={isHovered ? colors.cream : colors.coral} />
      </button>

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
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Phones have no hover, so the desktop scrim sat over every
            // thumbnail permanently and dulled the artwork. Drop it there and
            // let the eye carry its own contrast with a soft shadow.
            backgroundColor: showVideo || isMobile ? "transparent" : `${colors.charcoal}44`,
            opacity: showVideo ? 0 : (isMobile || isHovered ? 1 : 0.8),
            transition: "opacity 0.3s ease",
          }}
        >
          {!showVideo && (
            <div style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.45))", display: "flex" }}>
              <PlayEye size={isMobile ? 60 : 88} />
            </div>
          )}
        </div>

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

      <div style={{ marginTop: isMobile ? "8px" : "12px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
        <h3
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: isMobile ? "12px" : "16px",
            fontWeight: "bold",
            color: lightMode ? colors.charcoal : colors.cream,
            margin: 0,
            letterSpacing: isMobile ? "0.5px" : "1px",
            // Long titles would otherwise wrap to three lines in a half-width card
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {animation.title.toUpperCase()}
        </h3>
        <span
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            color: colors.coral,
            fontSize: isMobile ? "11px" : "14px",
            flexShrink: 0,
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

  const Starburst = ({ size = 24, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={colors.coral} style={style}>
      <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
    </svg>
  );

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: `${colors.charcoal}ee`,
          zIndex: 200,
        }}
      />

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
        <Starburst size={70} style={{ position: "absolute", top: "-35px", right: "-35px", zIndex: 5 }} />
        <Starburst size={45} style={{ position: "absolute", top: "20px", right: "-25px", opacity: 0.7, zIndex: 5 }} />
        <Starburst size={32} style={{ position: "absolute", top: "-22px", right: "25px", opacity: 0.5, zIndex: 5 }} />

        <Starburst size={65} style={{ position: "absolute", bottom: "-32px", left: "-32px", zIndex: 5 }} />
        <Starburst size={40} style={{ position: "absolute", bottom: "18px", left: "-22px", opacity: 0.7, zIndex: 5 }} />

        <div
          style={{
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: colors.cream,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
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
            <style>
              {`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}
            </style>

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

            <div>
              <p
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  color: colors.charcoal,
                  fontSize: "clamp(15px, 3.5vw, 17px)",
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

function AdminLogin({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  // On success the auth listener in App flips admin mode on and unmounts this
  // dialog, so there's nothing to do here but report failure.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");

    const result = await signInAdmin(email.trim(), password);

    if (!result.ok) {
      setError(result.message);
      setPassword("");
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="username"
            autoFocus
            style={{
              width: "100%",
              padding: "14px 16px",
              marginBottom: "12px",
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

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
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
            disabled={submitting}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: buttonHovered && !submitting ? colors.cream : colors.coral,
              color: buttonHovered && !submitting ? colors.coral : colors.charcoal,
              border: "none",
              borderRadius: "8px",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "16px",
              letterSpacing: "2px",
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.6 : 1,
              transition: "all 0.3s ease",
            }}
          >
            {submitting ? "SIGNING IN…" : "LOGIN"}
          </button>
        </form>

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

        {error && (
          <p style={{
            textAlign: "center",
            color: "#ff6b6b",
            marginTop: "16px",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "14px",
          }}>
            {error}
          </p>
        )}
      </div>
    </>
  );
}

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

          <label style={labelStyle}>THUMBNAIL URL (optional)</label>
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

// ============================================
// SIDE PANELS (Behind the Scenes / Achievements)
// ============================================

const ACHIEVEMENT_CATEGORIES = ["Award", "Achievement", "Experience", "Commission"];

// Photo upload + optional video-link picker, shared by every entry editor.
// Uploads go straight to Firebase Storage under entry-media/<collection>/<entryId>/
// so admins attach real photos instead of hosting images elsewhere and
// pasting a URL. `onUploadingChange` lets the parent form disable Save while
// an upload is still in flight.
function MediaUploader({ media, onChange, collection, entryId, onUploadingChange }) {
  const [uploadingCount, setUploadingCount] = useState(0);
  const [videoUrlDraft, setVideoUrlDraft] = useState("");
  const fileInputRef = useRef(null);

  const reportUploading = (delta) => {
    setUploadingCount((prev) => {
      const next = prev + delta;
      onUploadingChange?.(next > 0);
      return next;
    });
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow picking the same file again later
    if (files.length === 0) return;

    reportUploading(files.length);
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const optimised = await compressImage(file);
        const result = await uploadEntryImage(collection, entryId, optimised);
        reportUploading(-1);
        if (!result.ok) {
          window.alert(`Couldn't upload ${file.name}.\n\n${result.message}`);
          return null;
        }
        return { type: "image", url: result.url, path: result.path };
      })
    );

    const successful = uploaded.filter(Boolean);
    if (successful.length > 0) {
      onChange([...media, ...successful]);
    }
  };

  const handleAddVideo = () => {
    const url = videoUrlDraft.trim();
    if (!url) return;
    if (!getYouTubeId(url)) {
      window.alert("That doesn't look like a YouTube URL.");
      return;
    }
    onChange([...media, { type: "video", url }]);
    setVideoUrlDraft("");
  };

  const handleRemove = (index) => {
    const item = media[index];
    if (item.type === "image" && item.path) {
      deleteEntryImage(item.path);
    }
    onChange(media.filter((_, i) => i !== index));
  };

  const tileStyle = {
    position: "relative",
    width: "80px",
    height: "80px",
    flexShrink: 0,
    border: `2px solid ${colors.charcoal}`,
    backgroundColor: colors.charcoal,
    overflow: "hidden",
  };

  const removeButtonStyle = {
    position: "absolute",
    top: "2px",
    right: "2px",
    width: "20px",
    height: "20px",
    backgroundColor: colors.charcoal,
    border: `1px solid ${colors.coral}`,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
        {media.map((item, index) => (
          <div key={index} style={tileStyle}>
            {item.type === "image" ? (
              <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <img
                src={getYouTubeThumbnail(item.url)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.7 }}
              />
            )}
            {item.type === "video" && (
              <Play
                size={18}
                color={colors.cream}
                fill={colors.cream}
                style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}
              />
            )}
            <button type="button" onClick={() => handleRemove(index)} style={removeButtonStyle} aria-label="Remove">
              <X size={12} color={colors.coral} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            ...tileStyle,
            border: `2px dashed ${colors.charcoal}`,
            backgroundColor: "transparent",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <Plus size={20} color={colors.charcoal} />
          <span style={{ fontSize: "9px", fontWeight: "bold", color: colors.charcoal, letterSpacing: "1px" }}>PHOTOS</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
          style={{ display: "none" }}
        />
      </div>

      {uploadingCount > 0 && (
        <p style={{ fontSize: "12px", color: colors.coral, fontWeight: "bold", margin: "0 0 10px 0" }}>
          Uploading {uploadingCount} photo{uploadingCount > 1 ? "s" : ""}...
        </p>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="url"
          value={videoUrlDraft}
          onChange={(e) => setVideoUrlDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddVideo(); } }}
          placeholder="Paste a YouTube URL to add a video"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: `2px solid ${colors.charcoal}`,
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "13px",
            boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={handleAddVideo}
          style={{
            padding: "0 16px",
            backgroundColor: colors.charcoal,
            color: colors.cream,
            border: "none",
            fontWeight: "bold",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          ADD
        </button>
      </div>
    </div>
  );
}

// Full-detail "article" popup shared by achievements and every gallery
// category — scrollable, showing the complete description and every photo
// or video attached to the entry.
function EntryDetailModal({ entry, onClose, showCategory }) {
  const [closeHovered, setCloseHovered] = useState(false);

  if (!entry) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, backgroundColor: `${colors.charcoal}ee`, zIndex: 200 }}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "760px",
          zIndex: 201,
        }}
      >
        <div
          style={{
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: colors.cream,
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
            aria-label="Close"
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

          <div style={{ padding: "32px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px", flexWrap: "wrap" }}>
              {showCategory && entry.category && (
                <span
                  style={{
                    backgroundColor: colors.coral,
                    color: colors.charcoal,
                    fontSize: "11px",
                    fontWeight: "bold",
                    letterSpacing: "2px",
                    padding: "4px 10px",
                    textTransform: "uppercase",
                  }}
                >
                  {entry.category}
                </span>
              )}
              <h2
                style={{
                  fontFamily: "'Bebas Neue', Impact, 'Arial Black', sans-serif",
                  fontSize: "28px",
                  fontWeight: "400",
                  color: colors.charcoal,
                  margin: 0,
                  letterSpacing: "2px",
                }}
              >
                {entry.title.toUpperCase()}
              </h2>
              {entry.year && (
                <span
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    color: colors.coral,
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginLeft: "auto",
                  }}
                >
                  {entry.year}
                </span>
              )}
            </div>

            {entry.description && (
              <p
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  color: colors.charcoal,
                  fontSize: "clamp(15px, 3.5vw, 17px)",
                  lineHeight: 1.7,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {entry.description}
              </p>
            )}

            {entry.media?.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  marginTop: entry.description ? "24px" : 0,
                }}
              >
                {entry.media.map((item, index) =>
                  item.type === "video" ? (
                    <div
                      key={index}
                      style={{ width: "100%", aspectRatio: "16/9", backgroundColor: colors.charcoal, border: `3px solid ${colors.coral}`, flexShrink: 0 }}
                    >
                      <iframe
                        src={getYouTubeEmbedUrl(item.url)}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`${entry.title} video ${index + 1}`}
                      />
                    </div>
                  ) : (
                    <img
                      key={index}
                      src={item.url}
                      alt={`${entry.title} ${index + 1}`}
                      style={{ width: "100%", display: "block", border: `2px solid ${colors.charcoal}`, boxSizing: "border-box" }}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Compact clickable preview for the achievements list — click opens the full
// EntryDetailModal with the complete description and all attached photos.
function AchievementCard({ entry, isAdmin, onEdit, onDelete, onClick }) {
  const photoCount = entry.media?.filter((m) => m.type === "image").length || 0;
  const thumbnail = entry.media?.[0];

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        border: `2px solid ${colors.charcoal}`,
        backgroundColor: colors.cream,
        padding: "20px 24px",
        textAlign: "left",
        width: "100%",
        maxWidth: "760px",
        margin: "0 auto",
        boxSizing: "border-box",
        cursor: "pointer",
        display: "flex",
        gap: "16px",
        alignItems: "center",
      }}
    >
      <div style={{ position: "absolute", top: "-2px", left: "-2px", width: "18px", height: "18px", borderTop: `3px solid ${colors.coral}`, borderLeft: `3px solid ${colors.coral}` }} />
      <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "18px", height: "18px", borderTop: `3px solid ${colors.coral}`, borderRight: `3px solid ${colors.coral}` }} />
      <div style={{ position: "absolute", bottom: "-2px", left: "-2px", width: "18px", height: "18px", borderBottom: `3px solid ${colors.coral}`, borderLeft: `3px solid ${colors.coral}` }} />
      <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderBottom: `3px solid ${colors.coral}`, borderRight: `3px solid ${colors.coral}` }} />

      {isAdmin && (
        <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "8px", zIndex: 5 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
            style={{ backgroundColor: colors.coral, border: "none", padding: "8px", cursor: "pointer" }}
          >
            <Edit size={14} color={colors.cream} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
            style={{ backgroundColor: colors.charcoal, border: `1px solid ${colors.coral}`, padding: "8px", cursor: "pointer" }}
          >
            <Trash2 size={14} color={colors.coral} />
          </button>
        </div>
      )}

      {thumbnail && (
        <div style={{ position: "relative", width: "64px", height: "64px", flexShrink: 0, border: `2px solid ${colors.coral}`, overflow: "hidden" }}>
          <img
            src={thumbnail.type === "image" ? thumbnail.url : getYouTubeThumbnail(thumbnail.url)}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {photoCount > 1 && (
            <span
              style={{
                position: "absolute",
                bottom: "2px",
                right: "2px",
                backgroundColor: `${colors.charcoal}dd`,
                color: colors.cream,
                fontSize: "10px",
                fontWeight: "bold",
                padding: "1px 5px",
              }}
            >
              +{photoCount - 1}
            </span>
          )}
        </div>
      )}

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px", flexWrap: "wrap" }}>
          {entry.category && (
            <span
              style={{
                backgroundColor: colors.coral,
                color: colors.charcoal,
                fontSize: "10px",
                fontWeight: "bold",
                letterSpacing: "2px",
                padding: "3px 8px",
                textTransform: "uppercase",
              }}
            >
              {entry.category}
            </span>
          )}
          {entry.year && (
            <span style={{ color: colors.coral, fontSize: "13px", fontWeight: "bold", marginLeft: "auto" }}>
              {entry.year}
            </span>
          )}
        </div>

        <h3
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "17px",
            fontWeight: "bold",
            color: colors.charcoal,
            margin: "0 0 4px 0",
            letterSpacing: "1px",
          }}
        >
          {entry.title}
        </h3>

        <p
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "14px",
            color: colors.charcoal,
            opacity: 0.75,
            lineHeight: 1.5,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {entry.description}
        </p>
      </div>
    </div>
  );
}

// Modal form for adding/editing side-panel entries. `variant` decides which
// optional fields show: achievements get a category, process gets media URLs.
function AchievementEditor({ entry, onSave, onClose }) {
  // The id is generated immediately (not at submit) so photo uploads have a
  // stable Storage path to land in from the moment the form opens, whether
  // this ends up being a new entry or an edit.
  const [formData, setFormData] = useState(
    () =>
      entry || {
        id: Date.now(),
        title: "",
        year: new Date().getFullYear().toString(),
        category: ACHIEVEMENT_CATEGORIES[0],
        description: "",
        media: [],
      }
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    border: `2px solid ${colors.charcoal}`,
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: "14px",
    boxSizing: "border-box",
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

  const heading = entry ? "EDIT ACHIEVEMENT" : "ADD ACHIEVEMENT";

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
          {heading}
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

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>CATEGORY</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {ACHIEVEMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>YEAR</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <label style={labelStyle}>DESCRIPTION</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            required
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <label style={labelStyle}>PHOTOS / VIDEO</label>
          <MediaUploader
            media={formData.media || []}
            onChange={(media) => setFormData({ ...formData, media })}
            collection="achievements"
            entryId={formData.id}
            onUploadingChange={setIsUploading}
          />

          <button
            type="submit"
            disabled={isUploading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: isUploading ? `${colors.coral}88` : colors.coral,
              color: colors.charcoal,
              border: "none",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: isUploading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Save size={18} />
            {isUploading ? "UPLOADING..." : entry ? "UPDATE ENTRY" : "ADD ENTRY"}
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

// Stacked list of entries with admin controls and an empty state
function SidePanel({ entries, isAdmin, onAdd, onEdit, onDelete, onCardClick, emptyLabel }) {
  const [addHovered, setAddHovered] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
      {isAdmin && (
        <button
          onClick={onAdd}
          onMouseEnter={() => setAddHovered(true)}
          onMouseLeave={() => setAddHovered(false)}
          style={{
            width: "100%",
            maxWidth: "760px",
            padding: "20px",
            border: `3px dashed ${addHovered ? colors.coral : colors.charcoal}`,
            backgroundColor: addHovered ? `${colors.coral}22` : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            boxSizing: "border-box",
          }}
        >
          <Plus size={24} color={addHovered ? colors.coral : colors.charcoal} />
          <span style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: "bold",
            fontSize: "13px",
            color: addHovered ? colors.coral : colors.charcoal,
            letterSpacing: "2px",
          }}>
            ADD ENTRY
          </span>
        </button>
      )}

      {entries.length === 0 && !isAdmin && (
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{ width: "8px", height: "8px", backgroundColor: colors.coral, transform: "rotate(45deg)" }} />
          </div>
          <p style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "14px",
            color: colors.charcoal,
            opacity: 0.55,
            letterSpacing: "3px",
            margin: 0,
          }}>
            {emptyLabel}
          </p>
        </div>
      )}

      {entries.map((entry) => (
        <AchievementCard
          key={entry.id}
          entry={entry}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={() => onCardClick(entry)}
        />
      ))}
    </div>
  );
}

// Centered glass hamburger under the hero tagline — opens the category menu.
function HeroWorkMenuButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const barStyle = {
    width: "26px",
    height: "3px",
    backgroundColor: isHovered ? colors.cream : colors.coral,
    transition: "background-color 0.25s ease",
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Open portfolio menu"
      style={{
        marginTop: "22px",
        padding: "12px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
        cursor: "pointer",
        background: isHovered
          ? "linear-gradient(135deg, rgba(252, 119, 83, 0.35) 0%, rgba(252, 119, 83, 0.15) 100%)"
          : "linear-gradient(135deg, rgba(28, 28, 28, 0.4) 0%, rgba(28, 28, 28, 0.2) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${isHovered ? "rgba(239, 232, 221, 0.4)" : "rgba(252, 119, 83, 0.3)"}`,
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        transition: "all 0.25s ease",
        transform: isHovered ? "scale(1.08)" : "scale(1)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={barStyle} />
      <div style={barStyle} />
      <div style={barStyle} />
    </button>
  );
}

// ============================================
// CATEGORY MENU (opened from hero + nav hamburgers)
// ============================================
function CategoryMenu({ open, onClose, onSelect, activeIndex }) {
  const [visible, setVisible] = useState(false);
  const activeItemRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Escape closes, and focus moves to the current category so a keyboard
  // user immediately knows where they are in the list.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const focusTimer = setTimeout(() => activeItemRef.current?.focus(), 100);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: `${colors.charcoal}cc`,
          zIndex: 300,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Portfolio categories"
        className="work-menu-panel"
        style={{
          position: "fixed",
          left: "50%",
          top: visible ? "50%" : "54%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(28, 28, 28, 0.7)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          padding: "40px 56px",
          borderRadius: "16px",
          border: `1px solid rgba(252, 119, 83, 0.4)`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
          zIndex: 301,
          maxHeight: "85vh",
          overflowY: "auto",
          opacity: visible ? 1 : 0,
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          textAlign: "center",
        }}
      >
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
            .work-menu-item:focus-visible {
              outline: 2px solid ${colors.coral};
              outline-offset: 4px;
              border-radius: 2px;
            }
            @media (prefers-reduced-motion: reduce) {
              .work-menu-panel { transition: opacity 0.15s ease !important; top: 50% !important; }
            }
          `}
        </style>

        <p
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "12px",
            fontWeight: "bold",
            color: colors.coral,
            letterSpacing: "5px",
            margin: "0 0 8px 0",
          }}
        >
          MY WORK
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
          <div style={{ width: "36px", height: "2px", backgroundColor: colors.coral }} />
          <div style={{ width: "6px", height: "6px", backgroundColor: colors.coral, transform: "rotate(45deg)" }} />
          <div style={{ width: "36px", height: "2px", backgroundColor: colors.coral }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {SHOWCASE_PANELS.map((panel, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={panel.key}
                ref={isActive ? activeItemRef : undefined}
                className="work-menu-item"
                onClick={() => onSelect(index)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 12px",
                  fontFamily: "'Bebas Neue', Impact, 'Arial Black', sans-serif",
                  fontSize: "clamp(26px, 4.5vw, 32px)",
                  fontWeight: "400",
                  letterSpacing: "3px",
                  color: isActive ? colors.coral : colors.cream,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  transition: "color 0.2s ease, transform 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.coral;
                  e.currentTarget.style.transform = "scale(1.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isActive ? colors.coral : colors.cream;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {isActive && <span style={{ width: "7px", height: "7px", backgroundColor: colors.coral, transform: "rotate(45deg)", flexShrink: 0 }} />}
                {panel.title}
                {isActive && <span style={{ width: "7px", height: "7px", backgroundColor: colors.coral, transform: "rotate(45deg)", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          aria-label="Close menu"
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            opacity: 0.7,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
        >
          <X size={22} color={colors.cream} />
        </button>
      </div>
    </>
  );
}

// Hero Section
function HeroSection({ isAdmin, demoReelUrl, onEditDemoReel, onResetDemoReel, onOpenWorkMenu }) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);
  // Below roughly 600px of viewport the intro, the cue and the fixed footer
  // cannot all fit, and forcing a screenful makes them overlap. Short screens
  // fall back to ordinary flow: no forced height, no cue.
  const [hasRoomForCue, setHasRoomForCue] = useState(
    typeof window === 'undefined' || window.innerHeight >= 600
  );
  const displayDemoReelUrl = demoReelUrl || portfolioData.demoReelUrl;

  // The intro fills the screen on every size and the reel starts below the
  // fold, so it fades in on first sight regardless of device.
  const [showArrow, setShowArrow] = useState(false);
  const [reelVisible, setReelVisible] = useState(false);
  const reelRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setHasRoomForCue(window.innerHeight >= 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // The cue fades in shortly after load, hides once the visitor scrolls, and
  // re-arms if they return to the top and linger — a gentle reminder rather
  // than a one-shot invitation.
  useEffect(() => {
    let reappearTimer = null;
    const atTop = () => window.scrollY <= 24;

    const scheduleReappear = (delay) => {
      clearTimeout(reappearTimer);
      reappearTimer = setTimeout(() => {
        if (atTop()) setShowArrow(true);
      }, delay);
    };

    const handleScroll = () => {
      if (atTop()) {
        // Back at the top: linger for a bit and the cue returns.
        scheduleReappear(5000);
      } else {
        clearTimeout(reappearTimer);
        setShowArrow(false);
      }
    };

    // Initial appearance reads as an invitation rather than part of the title.
    scheduleReappear(700);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(reappearTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Reveal the reel the first time it comes into view, then stop watching.
  useEffect(() => {
    const target = reelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReelVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const handleArrowClick = () => {
    setShowArrow(false);
    reelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Notable&display=swap');

        /* A true screenful, less whatever sits above it (the fixed nav's
           clearance on <main> plus this section's own top padding) — otherwise
           the intro runs past the bottom of the screen and takes the scroll
           cue with it. dvh is what makes this correct on iOS, where 100vh
           counts the space behind the browser chrome; vh is the fallback. */
        .hero-viewport {
          min-height: calc(100vh - var(--hero-offset, 84px));
          min-height: calc(100dvh - var(--hero-offset, 84px));
        }

        @keyframes heroArrowBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        .hero-arrow-bob { animation: heroArrowBob 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-arrow-bob { animation: none; }
        }`}
      </style>

      <div
        className={hasRoomForCue ? "hero-viewport" : undefined}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          // A full screenful on every size, centred, with room at the bottom
          // for the scroll cue. The offset matches <main>'s nav clearance
          // (which grows in admin mode) plus this section's own top padding
          // (which differs between mobile and desktop).
          // Phones spread the composition across the screenful so the slack
          // becomes breathing room between the eye, name, tagline and menu
          // rather than a void underneath them. Element sizes are untouched.
          // That also makes the gap to the reel roughly constant instead of
          // growing with screen height. Desktop stays centred.
          justifyContent: isMobile && hasRoomForCue ? "space-between" : "center",
          position: "relative",
          // Phones get a smaller reserve. At 150 the composition was pinned
          // near the top of the screen (22px above it, 162px below) and all
          // that slack read as dead space between the intro and the reel.
          // On phones this reserve is what the spread composition stops above,
          // so it has to clear the cue's whole band: 76px up from the bottom
          // plus the cue's own 46px, plus a little breathing room.
          paddingBottom: hasRoomForCue ? (isMobile ? "132px" : "150px") : "24px",
          "--hero-offset": `${(isAdmin ? 100 : 64) + (isMobile ? 20 : 40)}px`,
        }}
      >
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

      {/* Rule and tagline travel together: when the intro spreads to fill a
          tall phone screen, the slack goes around this pair, not between them. */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill={colors.cream} style={{ flexShrink: 0 }}>
          <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
        </svg>
        <div style={{ flex: 1, height: "2px", backgroundColor: colors.cream }} />
        <svg width="18" height="18" viewBox="0 0 24 24" fill={colors.cream} style={{ flexShrink: 0 }}>
          <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
        </svg>
      </div>

      <div
        style={{
          position: "relative",
          marginBottom: "25px",
        }}
      >
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

      </div>

      <HeroWorkMenuButton onClick={onOpenWorkMenu} />

        {hasRoomForCue && (
        <button
          onClick={handleArrowClick}
          aria-label="Scroll to demo reel"
          style={{
            position: "absolute",
            // Sits in the band between the composition and the fixed footer
            // (72px tall plus its own safe-area padding), which would
            // otherwise cover it.
            bottom: isMobile
              ? "calc(76px + env(safe-area-inset-bottom))"
              : "calc(88px + env(safe-area-inset-bottom))",
            left: "50%",
            transform: "translateX(-50%)",
            background: "none",
            border: "none",
            padding: isMobile ? "8px" : "12px",
            cursor: "pointer",
            opacity: showArrow ? 1 : 0,
            pointerEvents: showArrow ? "auto" : "none",
            transition: "opacity 0.8s ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg
            className="hero-arrow-bob"
            width={isMobile ? 30 : 36}
            height={isMobile ? 30 : 36}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.coral}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        )}
      </div>

      {/* Demo Reel Section */}
      <div
        ref={reelRef}
        style={{
          width: "100%",
          maxWidth: "750px",
          // Phones already carry a screenful of intro above this; the reel only
          // needs to clear the fold, not add more empty space to it.
          marginTop: isMobile ? "0px" : "35px",
          position: "relative",
          opacity: reelVisible ? 1 : 0,
          transform: reelVisible ? "translateY(0)" : "translateY(18px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <div style={{ position: "absolute", top: "-15px", left: "-15px", width: "30px", height: "30px", border: `3px solid ${colors.coral}`, transform: "rotate(45deg)" }} />
        <div style={{ position: "absolute", top: "-15px", right: "-15px", width: "30px", height: "30px", border: `3px solid ${colors.coral}`, transform: "rotate(45deg)" }} />
        <div style={{ position: "absolute", bottom: "-15px", left: "-15px", width: "30px", height: "30px", border: `3px solid ${colors.coral}`, transform: "rotate(45deg)" }} />
        <div style={{ position: "absolute", bottom: "-15px", right: "-15px", width: "30px", height: "30px", border: `3px solid ${colors.coral}`, transform: "rotate(45deg)" }} />

        <div style={{ position: "relative", backgroundColor: colors.charcoal, border: `3px solid ${colors.coral}` }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "40px", height: "2px", backgroundColor: colors.charcoal }} />
              <div style={{ width: "8px", height: "8px", backgroundColor: colors.charcoal, transform: "rotate(45deg)" }} />
              <div style={{ width: "20px", height: "2px", backgroundColor: colors.charcoal }} />
            </div>

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

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "20px", height: "2px", backgroundColor: colors.charcoal }} />
              <div style={{ width: "8px", height: "8px", backgroundColor: colors.charcoal, transform: "rotate(45deg)" }} />
              <div style={{ width: "40px", height: "2px", backgroundColor: colors.charcoal }} />
            </div>
          </div>

          <div style={{ padding: "10px", backgroundColor: colors.charcoal }}>
            <div style={{ position: "relative", border: `2px solid ${colors.cream}` }}>
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
                {isAdmin && (
                  <div style={{ position: "absolute", bottom: "10px", right: "10px", display: "flex", gap: "8px", zIndex: 10 }}>
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

          <div style={{
            backgroundColor: colors.charcoal,
            padding: "8px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            borderTop: `2px solid ${colors.coral}`,
          }}>
            <div style={{ flex: 1, height: "2px", backgroundColor: colors.coral }} />
            <svg width="24" height="24" viewBox="0 0 24 24" fill={colors.coral}>
              <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
            </svg>
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

// ============================================
// GALLERY PANELS (image/video grids for the non-animation categories)
// ============================================

// Masonry tile for a gallery entry: an image, or a YouTube video shown by its
// thumbnail with a play badge.
function GalleryCard({ entry, isAdmin, onEdit, onDelete, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const firstItem = entry.media?.[0];
  const thumbnailUrl = firstItem?.type === "image" ? firstItem.url : getYouTubeThumbnail(firstItem?.url);
  const isVideo = firstItem?.type === "video";
  const photoCount = entry.media?.filter((m) => m.type === "image").length || 0;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: "pointer",
        transform: isHovered ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.3s ease",
        position: "relative",
      }}
    >
      {isAdmin && (
        <div style={{ position: "absolute", top: "8px", right: "8px", zIndex: 10, display: "flex", gap: "8px" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
            style={{ backgroundColor: colors.coral, border: "none", padding: "8px", cursor: "pointer" }}
          >
            <Edit size={16} color={colors.cream} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
            style={{ backgroundColor: colors.charcoal, border: `1px solid ${colors.coral}`, padding: "8px", cursor: "pointer" }}
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
          border: `2px solid ${colors.coral}`,
        }}
      >
        <img
          src={thumbnailUrl}
          alt={entry.title}
          draggable={false}
          style={{
            width: "100%",
            display: "block",
            transform: isHovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
          onError={(e) => { e.target.style.display = "none"; }}
        />

        {isVideo && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: `${colors.coral}dd`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
              pointerEvents: "none",
            }}
          >
            <Play size={16} color={colors.cream} fill={colors.cream} style={{ marginLeft: "2px" }} />
          </div>
        )}

        {photoCount > 1 && (
          <span
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              backgroundColor: `${colors.charcoal}dd`,
              color: colors.cream,
              fontSize: "11px",
              fontWeight: "bold",
              padding: "2px 7px",
              pointerEvents: "none",
            }}
          >
            +{photoCount - 1}
          </span>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to top, ${colors.charcoal}cc, transparent)`,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.3s ease",
            display: "flex",
            alignItems: "flex-end",
            padding: "14px",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              color: colors.coral,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "13px",
              letterSpacing: "1px",
            }}
          >
            VIEW
          </span>
        </div>
      </div>

      <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
        <h3
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "14px",
            fontWeight: "bold",
            color: colors.charcoal,
            margin: 0,
            letterSpacing: "1px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {entry.title.toUpperCase()}
        </h3>
        {entry.year && (
          <span style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: colors.coral, fontSize: "13px", flexShrink: 0 }}>
            {entry.year}
          </span>
        )}
      </div>
    </div>
  );
}

// Modal form for adding/editing a gallery entry. Needs at least one photo or
// a video so the tile always has something to show.
function GalleryEntryEditor({ entry, category, onSave, onClose }) {
  // The id is generated immediately (not at submit) so photo uploads have a
  // stable Storage path from the moment the form opens.
  const [formData, setFormData] = useState(
    () =>
      entry || {
        id: Date.now(),
        title: "",
        year: new Date().getFullYear().toString(),
        description: "",
        media: [],
      }
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.media || formData.media.length === 0) {
      window.alert("Add at least one photo or a video so the tile has something to show.");
      return;
    }
    onSave(formData);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    border: `2px solid ${colors.charcoal}`,
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: "14px",
    boxSizing: "border-box",
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
          {entry ? "EDIT ENTRY" : "ADD ENTRY"}
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

          <label style={labelStyle}>YEAR</label>
          <input
            type="text"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>DESCRIPTION (optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <label style={labelStyle}>PHOTOS / VIDEO</label>
          <MediaUploader
            media={formData.media || []}
            onChange={(media) => setFormData({ ...formData, media })}
            collection={`galleries/${category}`}
            entryId={formData.id}
            onUploadingChange={setIsUploading}
          />

          <button
            type="submit"
            disabled={isUploading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: isUploading ? `${colors.coral}88` : colors.coral,
              color: colors.charcoal,
              border: "none",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: isUploading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Save size={18} />
            {isUploading ? "UPLOADING..." : entry ? "UPDATE ENTRY" : "ADD ENTRY"}
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

// Masonry grid for one gallery category, with admin controls and empty state.
function GalleryPanel({ entries, isAdmin, columnCount, cardGap, onAdd, onEdit, onDelete, onCardClick, emptyLabel }) {
  const [addHovered, setAddHovered] = useState(false);

  if (entries.length === 0 && !isAdmin) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <div style={{ width: "8px", height: "8px", backgroundColor: colors.coral, transform: "rotate(45deg)" }} />
        </div>
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "14px",
          color: colors.charcoal,
          opacity: 0.55,
          letterSpacing: "3px",
          margin: 0,
        }}>
          {emptyLabel}
        </p>
      </div>
    );
  }

  return (
    <div style={{ columnCount: columnCount, columnGap: cardGap }}>
      {isAdmin && (
        <div style={{ breakInside: "avoid", marginBottom: cardGap }}>
          <button
            onClick={onAdd}
            onMouseEnter={() => setAddHovered(true)}
            onMouseLeave={() => setAddHovered(false)}
            style={{
              width: "100%",
              aspectRatio: "16/9",
              border: `3px dashed ${addHovered ? colors.coral : colors.charcoal}`,
              backgroundColor: addHovered ? `${colors.coral}22` : "transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.3s ease",
            }}
          >
            <Plus size={36} color={addHovered ? colors.coral : colors.charcoal} />
            <span style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "13px",
              color: addHovered ? colors.coral : colors.charcoal,
              letterSpacing: "2px",
            }}>
              ADD ENTRY
            </span>
          </button>
        </div>
      )}
      {entries.map((entry) => (
        <div key={entry.id} style={{ breakInside: "avoid", marginBottom: cardGap }}>
          <GalleryCard
            entry={entry}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            onClick={() => onCardClick(entry)}
          />
        </div>
      ))}
    </div>
  );
}

// Portfolio Showcase Section
// A sliding carousel of category panels. Animation is the default; the others
// are reached by clicking their titles, the menus, or dragging/swiping.
const SHOWCASE_PANELS = [
  { key: "animation", title: "ANIMATION", type: "animations" },
  { key: "storyboarding", title: "STORYBOARDING", type: "gallery", emptyLabel: "STORYBOARDS COMING SOON" },
  { key: "concepts", title: "CONCEPTS", type: "gallery", emptyLabel: "CONCEPT ART COMING SOON" },
  { key: "graphicDesign", title: "GRAPHIC DESIGN", type: "gallery", emptyLabel: "GRAPHIC DESIGN COMING SOON" },
  { key: "cad3d", title: "3D & CAD", type: "gallery", emptyLabel: "3D & CAD WORK COMING SOON" },
  { key: "woodworking", title: "WOODWORKING", type: "gallery", emptyLabel: "WOODWORKING COMING SOON" },
  { key: "achievements", title: "ACHIEVEMENTS", type: "achievements" },
];

function PortfolioSection({
  animations, onCardClick, isAdmin, onAddClick, onEditClick, onDeleteClick,
  achievements, onAchievementAdd, onAchievementEdit, onAchievementDelete,
  galleries, onGalleryAdd, onGalleryEdit, onGalleryDelete,
  activeIndex, onActiveIndexChange,
}) {
  const [columnCount, setColumnCount] = useState(3);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);

  // The active panel lives in App state so the category menus can drive it too.
  const setActiveIndex = onActiveIndexChange;
  const [detailModalEntry, setDetailModalEntry] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [panelHeight, setPanelHeight] = useState(null);
  const panelRefs = useRef([]);
  const sliderRef = useRef(null);
  const dragState = useRef({ pointerId: null, startX: 0, startY: 0, dragging: false, suppressClick: false });

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      // Phones get two columns rather than one. At a single column a vertical
      // card runs taller than the screen, so only one piece is ever visible;
      // two lets the work be scanned at a glance and tapped to enlarge.
      setColumnCount(width <= 900 ? 2 : 3);
      setIsMobile(width <= 768);
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // The slider clips to the active panel's height so a short side panel does
  // not leave the section stretched to the masonry grid's full height.
  useEffect(() => {
    const node = panelRefs.current[activeIndex];
    if (!node) return;

    const measure = () => setPanelHeight(node.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeIndex]);

  // iOS Safari cancels the pointer stream the moment it decides a touch might
  // be a scroll, which kills the swipe mid-gesture. Once a drag has been
  // recognised as horizontal, block the native touch behaviour so the pointer
  // events keep flowing. React registers touch listeners as passive, so this
  // has to be a native non-passive listener.
  useEffect(() => {
    const node = sliderRef.current;
    if (!node) return;

    const onTouchMove = (e) => {
      if (dragState.current.dragging) e.preventDefault();
    };

    node.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => node.removeEventListener("touchmove", onTouchMove);
  }, []);

  // Drag/swipe between panels. The gesture only claims the pointer once it is
  // clearly horizontal, so vertical scrolling over the panels still works, and
  // a real drag suppresses the click that would otherwise open a card.
  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragState.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, dragging: false, suppressClick: false };
  };

  const handlePointerMove = (e) => {
    const s = dragState.current;
    if (s.pointerId !== e.pointerId) return;

    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;

    if (!s.dragging) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        s.dragging = true;
        setIsDragging(true);
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* no-op */ }
      } else {
        return;
      }
    }

    // Resistance at the ends: there is no panel further in that direction.
    let offset = dx;
    if ((activeIndex === 0 && dx > 0) || (activeIndex === SHOWCASE_PANELS.length - 1 && dx < 0)) {
      offset = dx * 0.3;
    }
    setDragX(offset);
  };

  const endDrag = (e) => {
    const s = dragState.current;
    if (s.pointerId !== e.pointerId) return;

    if (s.dragging) {
      s.suppressClick = true;
      setTimeout(() => { dragState.current.suppressClick = false; }, 0);

      const width = sliderRef.current?.offsetWidth || window.innerWidth;
      const threshold = Math.min(90, width * 0.18);
      const dx = e.clientX - s.startX;

      if (dx < -threshold && activeIndex < SHOWCASE_PANELS.length - 1) {
        setActiveIndex(activeIndex + 1);
      } else if (dx > threshold && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      }
    }

    s.pointerId = null;
    s.dragging = false;
    setIsDragging(false);
    setDragX(0);
  };

  const cardGap = isMobile ? "12px" : "24px";

  // Title positions relative to the active panel: 0 is centred, ±1 sit faded
  // at the edges as clickable hints, anything further is parked offscreen.
  const titleStyleFor = (index) => {
    const rel = index - activeIndex;
    const positions = { "-1": "12%", "0": "50%", "1": "88%" };
    const left = positions[rel] ?? (rel < 0 ? "-40%" : "140%");
    const isActive = rel === 0;

    return {
      position: "absolute",
      top: "50%",
      left,
      transform: `translate(-50%, -50%) scale(${isActive ? 1 : 0.6})`,
      opacity: Math.abs(rel) > 1 ? 0 : (isActive ? 1 : 0.4),
      pointerEvents: isActive || Math.abs(rel) > 1 ? "none" : "auto",
      transition: "left 0.45s ease, transform 0.45s ease, opacity 0.45s ease",
      whiteSpace: "nowrap",
      background: "none",
      border: "none",
      cursor: isActive ? "default" : "pointer",
      padding: "8px 4px",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: "clamp(19px, 5vw, 32px)",
      fontWeight: "bold",
      color: colors.charcoal,
      letterSpacing: "4px",
    };
  };

  const chevronButtonStyle = (side) => ({
    position: "absolute",
    top: "50%",
    [side]: 0,
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    padding: "10px 6px",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  });

  const Chevron = ({ flipped }) => (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.coral}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: flipped ? "scaleX(-1)" : "none", display: "block" }}
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );

  return (
    <section id="portfolio-section" style={{ padding: isMobile ? "48px 14px 100px" : "80px 24px 140px", backgroundColor: colors.cream, position: "relative", zIndex: 1, overflow: "hidden", scrollMarginTop: "66px" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", backgroundColor: colors.coral }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <GeometricBorder width={150} color={colors.charcoal} />
        </div>

        <div style={{ position: "relative", height: "56px", marginBottom: "20px" }}>
          {isMobile ? (
            // Phones don't have room for peeking side titles without them
            // colliding with the centre one, so they get edge chevrons instead.
            <>
              <span
                key={SHOWCASE_PANELS[activeIndex].key}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  whiteSpace: "nowrap",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: "clamp(19px, 5vw, 32px)",
                  fontWeight: "bold",
                  color: colors.charcoal,
                  letterSpacing: "4px",
                }}
              >
                {SHOWCASE_PANELS[activeIndex].title}
              </span>
              {activeIndex > 0 && (
                <button
                  onClick={() => setActiveIndex(activeIndex - 1)}
                  style={chevronButtonStyle("left")}
                  aria-label={`Show ${SHOWCASE_PANELS[activeIndex - 1].title.toLowerCase()}`}
                >
                  <Chevron flipped />
                </button>
              )}
              {activeIndex < SHOWCASE_PANELS.length - 1 && (
                <button
                  onClick={() => setActiveIndex(activeIndex + 1)}
                  style={chevronButtonStyle("right")}
                  aria-label={`Show ${SHOWCASE_PANELS[activeIndex + 1].title.toLowerCase()}`}
                >
                  <Chevron />
                </button>
              )}
            </>
          ) : (
            SHOWCASE_PANELS.map((panel, index) => (
              <button
                key={panel.key}
                onClick={() => setActiveIndex(index)}
                style={titleStyleFor(index)}
                aria-label={`Show ${panel.title.toLowerCase()}`}
              >
                {panel.title}
              </button>
            ))
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: isMobile ? "32px" : "60px" }}>
          <GeometricBorder width={150} color={colors.charcoal} />
        </div>

        <div
          ref={sliderRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDragStart={(e) => e.preventDefault()}
          onClickCapture={(e) => {
            if (dragState.current.suppressClick) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          style={{
            overflow: "hidden",
            touchAction: "pan-y",
            userSelect: isDragging ? "none" : "auto",
            WebkitUserSelect: isDragging ? "none" : "auto",
            height: panelHeight != null ? `${panelHeight}px` : "auto",
            transition: isDragging ? "none" : "height 0.45s ease",
            cursor: isDragging ? "grabbing" : "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              width: `${SHOWCASE_PANELS.length * 100}%`,
              transform: `translateX(calc(${-activeIndex * (100 / SHOWCASE_PANELS.length)}% + ${dragX}px))`,
              transition: isDragging ? "none" : "transform 0.45s ease",
            }}
          >
            {SHOWCASE_PANELS.map((panel, index) => (
              <div
                key={panel.key}
                style={{ width: `${100 / SHOWCASE_PANELS.length}%`, flexShrink: 0, padding: "0 2px", boxSizing: "border-box", alignSelf: "flex-start" }}
              >
                <div ref={(el) => { panelRefs.current[index] = el; }}>
                  {panel.type === "animations" && (
                    <div style={{ columnCount: columnCount, columnGap: cardGap }}>
                      {isAdmin && (
                        <div style={{ breakInside: "avoid", marginBottom: cardGap }}>
                          <AddAnimationButton onClick={onAddClick} />
                        </div>
                      )}
                      {animations.map((animation) => (
                        <div key={animation.id} style={{ breakInside: "avoid", marginBottom: cardGap }}>
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
                  )}

                  {panel.type === "gallery" && (
                    <GalleryPanel
                      entries={galleries[panel.key] || []}
                      isAdmin={isAdmin}
                      columnCount={columnCount}
                      cardGap={cardGap}
                      onAdd={() => onGalleryAdd(panel.key)}
                      onEdit={(entry) => onGalleryEdit(panel.key, entry)}
                      onDelete={(id) => onGalleryDelete(panel.key, id)}
                      onCardClick={(entry) => setDetailModalEntry(entry)}
                      emptyLabel={panel.emptyLabel}
                    />
                  )}

                  {panel.type === "achievements" && (
                    <SidePanel
                      entries={achievements}
                      isAdmin={isAdmin}
                      onAdd={onAchievementAdd}
                      onEdit={onAchievementEdit}
                      onDelete={onAchievementDelete}
                      onCardClick={(entry) => setDetailModalEntry(entry)}
                      emptyLabel="ACHIEVEMENTS COMING SOON"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EntryDetailModal
        entry={detailModalEntry}
        showCategory={SHOWCASE_PANELS[activeIndex]?.type === "achievements"}
        onClose={() => setDetailModalEntry(null)}
      />
    </section>
  );
}

// About Page
function AboutPage({ isAdmin, photoUrl, photoUploading, onEditPhoto, onResetPhoto, bio, onEditBio, onResetBio }) {
  const displayPhotoUrl = photoUrl || portfolioData.about.photoUrl;
  const displayBio = bio || portfolioData.about.bio;
  const photoInputRef = useRef(null);

  return (
    <div
      style={{
        minHeight: "auto",
        paddingTop: "15px",
        paddingBottom: "100px",
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
            fontSize: "clamp(28px, 6vw, 38px)",
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

            <div style={{ aspectRatio: "1/1", border: `2px solid ${colors.cream}`, overflow: "hidden", position: "relative", backgroundColor: colors.charcoal }}>
              <img
                src={displayPhotoUrl}
                alt="Zach Foster"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              {isAdmin && (
                <div style={{ position: "absolute", bottom: "10px", right: "10px", display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    style={{
                      backgroundColor: photoUploading ? `${colors.coral}88` : colors.coral,
                      color: colors.charcoal,
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 12px",
                      cursor: photoUploading ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Edit size={14} /> {photoUploading ? "Uploading..." : "Upload"}
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = ""; // let the same file be picked again
                      if (file) onEditPhoto(file);
                    }}
                    style={{ display: "none" }}
                  />
                  {photoUrl && (
                    <button
                      onClick={onResetPhoto}
                      disabled={photoUploading}
                      style={{
                        backgroundColor: colors.charcoal,
                        color: colors.cream,
                        border: `1px solid ${colors.cream}`,
                        borderRadius: "4px",
                        padding: "8px 12px",
                        cursor: photoUploading ? "not-allowed" : "pointer",
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

          <div style={{ position: "relative" }}>
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
              <div style={{ position: "absolute", top: "10px", left: "10px", width: "30px", height: "30px", borderTop: `2px solid ${colors.coral}`, borderLeft: `2px solid ${colors.coral}`, opacity: 0.7 }} />
              <div style={{ position: "absolute", top: "10px", right: "10px", width: "30px", height: "30px", borderTop: `2px solid ${colors.coral}`, borderRight: `2px solid ${colors.coral}`, opacity: 0.7 }} />
              <div style={{ position: "absolute", bottom: "10px", left: "10px", width: "30px", height: "30px", borderBottom: `2px solid ${colors.coral}`, borderLeft: `2px solid ${colors.coral}`, opacity: 0.7 }} />
              <div style={{ position: "absolute", bottom: "10px", right: "10px", width: "30px", height: "30px", borderBottom: `2px solid ${colors.coral}`, borderRight: `2px solid ${colors.coral}`, opacity: 0.7 }} />

              <div style={{ position: "absolute", top: "24px", left: "50px", right: "50px", height: "1px", backgroundColor: colors.coral, opacity: 0.6 }} />
              <div style={{ position: "absolute", bottom: "24px", left: "50px", right: "50px", height: "1px", backgroundColor: colors.coral, opacity: 0.6 }} />

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
                {isAdmin && (
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
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
function HomePage({
  animations, isAdmin, onAddClick, onEditClick, onDeleteClick, demoReelUrl, onEditDemoReel, onResetDemoReel,
  achievements, onAchievementAdd, onAchievementEdit, onAchievementDelete,
  galleries, onGalleryAdd, onGalleryEdit, onGalleryDelete,
  activeCategory, onActiveCategoryChange, onOpenWorkMenu,
}) {
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
        onOpenWorkMenu={onOpenWorkMenu}
      />
      <PortfolioSection
        animations={animations}
        onCardClick={handleCardClick}
        isAdmin={isAdmin}
        onAddClick={onAddClick}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        achievements={achievements}
        onAchievementAdd={onAchievementAdd}
        onAchievementEdit={onAchievementEdit}
        onAchievementDelete={onAchievementDelete}
        galleries={galleries}
        onGalleryAdd={onGalleryAdd}
        onGalleryEdit={onGalleryEdit}
        onGalleryDelete={onGalleryDelete}
        activeIndex={activeCategory}
        onActiveIndexChange={onActiveCategoryChange}
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
// MAIN APP - FIXED: No automatic saves on load
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

  const [customPhotoUrl, setCustomPhotoUrl] = useState(null);
  // Storage path of an uploaded profile photo, kept so the old file can be
  // removed when it's replaced or reset.
  const [customPhotoPath, setCustomPhotoPath] = useState(null);
  const [customDemoReelUrl, setCustomDemoReelUrl] = useState(null);
  const [customBio, setCustomBio] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Showcase content and navigation. galleries is an object keyed by category
  // (storyboarding, concepts, ...); activeCategory indexes SHOWCASE_PANELS so
  // the category menus and the carousel stay in sync.
  const [achievements, setAchievements] = useState([]);
  const [galleries, setGalleries] = useState({});
  const [achievementEditor, setAchievementEditor] = useState(null); // { entry: object|null }
  const [galleryEditor, setGalleryEditor] = useState(null); // { category, entry: object|null }
  const [activeCategory, setActiveCategory] = useState(0);
  const [workMenuOpen, setWorkMenuOpen] = useState(false);

  // Track if data has been loaded from Firebase
  const firebaseLoadedRef = useRef(false);

  // Admin mode follows Firebase Auth, not local state — closing the login
  // dialog or reloading can't grant it, and the database rules enforce the
  // same check server-side regardless of what the UI shows.
  useEffect(() => {
    const unsubAdmin = subscribeToAdminState((isAdminUser) => {
      setIsAdmin(isAdminUser);
      if (isAdminUser) setShowLogin(false);
    });

    return () => unsubAdmin();
  }, []);

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
          const isHeroNameVisible = rect.top > 120;
          setShowNavName(!isHeroNameVisible);
        }
      } else if (currentPage === "about") {
        setShowNavEye(true);
        setShowNavName(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Subscribe to Firebase data on mount - NO AUTOMATIC SAVES
  useEffect(() => {
    setFadeIn(true);
    
    console.log("Initializing Firebase subscriptions...");
    
    // Subscribe to settings
    const unsubSettings = subscribeToSettings((data) => {
      console.log("Settings received from Firebase:", data);
      if (data) {
        firebaseLoadedRef.current = true;
        if (data.photoUrl !== undefined) setCustomPhotoUrl(data.photoUrl);
        if (data.photoPath !== undefined) setCustomPhotoPath(data.photoPath);
        if (data.demoReelUrl !== undefined) setCustomDemoReelUrl(data.demoReelUrl);
        if (data.bio !== undefined) setCustomBio(data.bio);
      }
    });
    
    // Subscribe to animations
    const unsubAnimations = subscribeToAnimations((data) => {
      console.log("Animations received from Firebase:", data);
      if (data && Array.isArray(data)) {
        firebaseLoadedRef.current = true;
        setAnimations(data);
      }
    });
    
    // Subscribe to showcase content
    const unsubAchievements = subscribeToAchievements((data) => {
      if (data && Array.isArray(data)) setAchievements(data);
    });

    const unsubGalleries = subscribeToGalleries((data) => {
      if (data && typeof data === "object") setGalleries(data);
    });

    return () => {
      unsubSettings();
      unsubAnimations();
      unsubAchievements();
      unsubGalleries();
    };
  }, []);

  // === EXPLICIT SAVE FUNCTIONS (only called on user action) ===

  // The database rejects writes from anyone who isn't a signed-in admin, so a
  // failed save has to surface — otherwise the edit looks applied until reload.
  // All settings live under one node, so every save rewrites the whole object.
  // Callers pass just the fields they changed and the rest are carried over
  // from current state.
  const pushSettings = async (changes) => {
    const result = await saveSettings({
      photoUrl: customPhotoUrl,
      photoPath: customPhotoPath,
      demoReelUrl: customDemoReelUrl,
      bio: customBio,
      ...changes,
    });
    if (!result.ok) window.alert(`Couldn't save settings.\n\n${result.message}`);
    return result;
  };

  const pushAnimations = async (nextAnimations) => {
    const result = await saveAnimations(nextAnimations);
    if (!result.ok) window.alert(`Couldn't save animations.\n\n${result.message}`);
    return result;
  };

  const saveCurrentSettings = () => {
    console.log("Explicitly saving settings to Firebase...");
    pushSettings({
      photoUrl: customPhotoUrl,
      demoReelUrl: customDemoReelUrl,
      bio: customBio,
    });
  };

  const saveCurrentAnimations = () => {
    console.log("Explicitly saving animations to Firebase...");
    pushAnimations(animations);
  };

  // Handlers for editing - NOW EXPLICITLY SAVE
  const handleEditPhoto = async (file) => {
    if (!file) return;

    setPhotoUploading(true);
    const optimised = await compressImage(file);
    const result = await uploadEntryImage("about", "profile", optimised);
    setPhotoUploading(false);

    if (!result.ok) {
      window.alert(`Couldn't upload the photo.\n\n${result.message}`);
      return;
    }

    const previousPath = customPhotoPath;
    setCustomPhotoUrl(result.url);
    setCustomPhotoPath(result.path);
    const saved = await pushSettings({ photoUrl: result.url, photoPath: result.path });

    // Only bin the old file once the new one is safely recorded.
    if (saved.ok && previousPath) deleteEntryImage(previousPath);
  };

  const handleResetPhoto = async () => {
    if (window.confirm("Reset to default photo?")) {
      const previousPath = customPhotoPath;
      setCustomPhotoUrl(null);
      setCustomPhotoPath(null);
      const saved = await pushSettings({ photoUrl: null, photoPath: null });
      if (saved.ok && previousPath) deleteEntryImage(previousPath);
    }
  };

  const handleEditDemoReel = () => {
    const newUrl = window.prompt("Enter new YouTube embed URL:\n(Format: https://www.youtube.com/embed/VIDEO_ID)", customDemoReelUrl || portfolioData.demoReelUrl);
    if (newUrl !== null && newUrl.trim() !== "") {
      setCustomDemoReelUrl(newUrl.trim());
      pushSettings({ demoReelUrl: newUrl.trim() });
    }
  };

  const handleResetDemoReel = () => {
    if (window.confirm("Reset to default demo reel?")) {
      setCustomDemoReelUrl(null);
      pushSettings({ demoReelUrl: null });
    }
  };

  const handleEditBio = () => {
    const newBio = window.prompt("Enter new bio text:", customBio || portfolioData.about.bio);
    if (newBio !== null && newBio.trim() !== "") {
      setCustomBio(newBio.trim());
      pushSettings({ bio: newBio.trim() });
    }
  };

  const handleResetBio = () => {
    if (window.confirm("Reset to default bio?")) {
      setCustomBio(null);
      pushSettings({ bio: null });
    }
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      signOutAdmin();
    } else {
      setShowLogin(true);
    }
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
      const newAnimations = animations.filter(a => a.id !== id);
      setAnimations(newAnimations);
      // Explicitly save
      setTimeout(() => {
        pushAnimations(newAnimations);
      }, 100);
    }
  };

  const handleSaveAnimation = (animation) => {
    let newAnimations;
    if (editingAnimation) {
      newAnimations = animations.map(a => a.id === animation.id ? animation : a);
    } else {
      newAnimations = [animation, ...animations];
    }
    setAnimations(newAnimations);
    setShowEditor(false);
    setEditingAnimation(null);
    // Explicitly save
    setTimeout(() => {
      pushAnimations(newAnimations);
    }, 100);
  };

  // Best-effort cleanup of an entry's uploaded photos when it's deleted.
  const deleteEntryMedia = (entry) => {
    (entry.media || []).forEach((item) => {
      if (item.type === "image" && item.path) deleteEntryImage(item.path);
    });
  };

  // === ACHIEVEMENTS ===

  const pushAchievements = async (entries) => {
    const result = await saveAchievements(entries);
    if (!result.ok) window.alert(`Couldn't save achievements.\n\n${result.message}`);
    return result;
  };

  const handleAchievementAdd = () => setAchievementEditor({ entry: null });
  const handleAchievementEdit = (entry) => setAchievementEditor({ entry });

  const handleAchievementDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const removed = achievements.find(e => e.id === id);
      const newEntries = achievements.filter(e => e.id !== id);
      setAchievements(newEntries);
      if (removed) deleteEntryMedia(removed);
      setTimeout(() => {
        pushAchievements(newEntries);
      }, 100);
    }
  };

  const handleAchievementSave = (entry) => {
    const newEntries = achievementEditor.entry
      ? achievements.map(e => e.id === entry.id ? entry : e)
      : [entry, ...achievements];

    setAchievements(newEntries);
    setAchievementEditor(null);
    setTimeout(() => {
      pushAchievements(newEntries);
    }, 100);
  };

  // === GALLERY CATEGORIES (storyboarding, concepts, ...) ===

  const pushGallery = async (category, entries) => {
    const result = await saveGallery(category, entries);
    if (!result.ok) window.alert(`Couldn't save this gallery.\n\n${result.message}`);
    return result;
  };

  const handleGalleryAdd = (category) => setGalleryEditor({ category, entry: null });
  const handleGalleryEdit = (category, entry) => setGalleryEditor({ category, entry });

  const handleGalleryDelete = (category, id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const current = galleries[category] || [];
      const removed = current.find(e => e.id === id);
      const newEntries = current.filter(e => e.id !== id);
      setGalleries({ ...galleries, [category]: newEntries });
      if (removed) deleteEntryMedia(removed);
      setTimeout(() => {
        pushGallery(category, newEntries);
      }, 100);
    }
  };

  const handleGallerySave = (entry) => {
    const { category, entry: editing } = galleryEditor;
    const current = galleries[category] || [];
    const newEntries = editing
      ? current.map(e => e.id === entry.id ? entry : e)
      : [entry, ...current];

    setGalleries({ ...galleries, [category]: newEntries });
    setGalleryEditor(null);
    setTimeout(() => {
      pushGallery(category, newEntries);
    }, 100);
  };

  // === CATEGORY MENU ===

  // Selecting a category closes the menu, returns to the home page if needed,
  // scrolls to the portfolio section, and activates that category's panel.
  const handleCategorySelect = (index) => {
    setWorkMenuOpen(false);
    setActiveCategory(index);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollToPortfolio = () => {
      document.getElementById("portfolio-section")?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    };

    if (currentPage !== "home") {
      setCurrentPage("home");
      // Let the home page mount before scrolling to a node inside it.
      setTimeout(scrollToPortfolio, 80);
    } else {
      scrollToPortfolio();
    }
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
        onOpenWorkMenu={() => setWorkMenuOpen(true)}
      />
      <ScrollIndicator hidden={currentPage === "about"} />

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
            achievements={achievements}
            onAchievementAdd={handleAchievementAdd}
            onAchievementEdit={handleAchievementEdit}
            onAchievementDelete={handleAchievementDelete}
            galleries={galleries}
            onGalleryAdd={handleGalleryAdd}
            onGalleryEdit={handleGalleryEdit}
            onGalleryDelete={handleGalleryDelete}
            activeCategory={activeCategory}
            onActiveCategoryChange={setActiveCategory}
            onOpenWorkMenu={() => setWorkMenuOpen(true)}
          />
        ) : (
          <AboutPage
            isAdmin={isAdmin}
            photoUrl={customPhotoUrl}
            photoUploading={photoUploading}
            onEditPhoto={handleEditPhoto}
            onResetPhoto={handleResetPhoto}
            bio={customBio}
            onEditBio={handleEditBio}
            onResetBio={handleResetBio}
          />
        )}
      </main>

      <Footer onAdminClick={handleAdminClick} isAdmin={isAdmin} />

      {showLogin && (
        <AdminLogin onClose={() => setShowLogin(false)} />
      )}
      {showEditor && (
        <AnimationEditor
          animation={editingAnimation}
          onSave={handleSaveAnimation}
          onClose={() => { setShowEditor(false); setEditingAnimation(null); }}
        />
      )}
      {achievementEditor && (
        <AchievementEditor
          entry={achievementEditor.entry}
          onSave={handleAchievementSave}
          onClose={() => setAchievementEditor(null)}
        />
      )}
      {galleryEditor && (
        <GalleryEntryEditor
          entry={galleryEditor.entry}
          category={galleryEditor.category}
          onSave={handleGallerySave}
          onClose={() => setGalleryEditor(null)}
        />
      )}
      <CategoryMenu
        open={workMenuOpen}
        onClose={() => setWorkMenuOpen(false)}
        onSelect={handleCategorySelect}
        activeIndex={activeCategory}
      />
    </div>
  );
}

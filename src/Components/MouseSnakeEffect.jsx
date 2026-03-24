import { useEffect, useRef } from 'react';
import WebGLFluid from 'webgl-fluid';

export default function MouseSnakeEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    let cleanupMouse = () => {};
    let cancelled = false;
    const initId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        WebGLFluid(canvas, {
          IMMEDIATE: false,
          TRIGGER: 'hover',
          SIM_RESOLUTION: 128,
          DYE_RESOLUTION: 512,
          CAPTURE_RESOLUTION: 512,
          DENSITY_DISSIPATION: 0.98,
          VELOCITY_DISSIPATION: 4,
          PRESSURE: 0.8,
          PRESSURE_ITERATIONS: 20,
          CURL: 30,
          SPLAT_RADIUS: 0.04,
          SPLAT_FORCE: 9000,
          SHADING: false,
          COLORFUL: false,
          COLOR_UPDATE_SPEED: 0,
          BACK_COLOR: { r: 0, g: 0, b: 0 },
          TRANSPARENT: true,
          BLOOM: false,
        });

      let activated = false;
      const dispatchToCanvas = (type, clientX, clientY, offsetX, offsetY) => {
        const clone = new MouseEvent(type, {
          clientX,
          clientY,
          bubbles: false,
          cancelable: true,
          view: window
        });
        Object.defineProperty(clone, 'offsetX', { value: offsetX, configurable: true });
        Object.defineProperty(clone, 'offsetY', { value: offsetY, configurable: true });
        canvas.dispatchEvent(clone);
      };

      const forwardMouse = (e) => {
        if (!e.isTrusted) return;
        const rect = canvas.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        if (e.type === 'mousemove' && !activated) {
          activated = true;
          dispatchToCanvas('mousedown', e.clientX, e.clientY, offsetX, offsetY);
        }
        dispatchToCanvas(e.type, e.clientX, e.clientY, offsetX, offsetY);
      };

      window.addEventListener('mousemove', forwardMouse);
      window.addEventListener('mousedown', forwardMouse);
      cleanupMouse = () => {
        window.removeEventListener('mousemove', forwardMouse);
        window.removeEventListener('mousedown', forwardMouse);
      };
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(initId);
      cleanupMouse();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 100,
        mixBlendMode: 'difference',
        filter: 'brightness(0) invert(1)',
      }}
    />
  );
}
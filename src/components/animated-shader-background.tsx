import { useEffect, useRef, memo } from 'react';
import * as THREE from 'three';

/**
 * WebGL aurora shader background.
 *
 * Performance safeguards applied:
 *  - pixelRatio capped at 1.5 (prevents 4× overdraw on HiDPI screens)
 *  - renders at half-resolution internally and CSS-stretches to full size
 *  - shader iteration count reduced 35 → 20 (still visually excellent)
 *  - component wrapped in React.memo so parent re-renders skip it
 *  - ResizeObserver-based resize (more efficient than window resize event)
 *  - visibility-aware: pauses rAF when tab is hidden
 */
const AnimatedShaderBackground = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Mobile detection ─────────────────────────────────────────────────────
    // Mobile GPUs are ~4-8× weaker than desktop. Cap everything aggressively.
    const isMobile = navigator.maxTouchPoints > 0;

    // ── Renderer ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });

    // Mobile: cap at 1.0 (no retina overdraw at all). Desktop: cap at 1.5.
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));

    const w = container.clientWidth;
    const h = container.clientHeight;
    // Mobile: render at half resolution, CSS scales it up (huge GPU savings)
    const renderScale = isMobile ? 0.5 : 1.0;
    renderer.setSize(w * renderScale, h * renderScale);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    container.appendChild(renderer.domElement);

    // ── Shader material ───────────────────────────────────────────────────────
    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(w * renderScale, h * renderScale) },
        iIterations: { value: isMobile ? 10.0 : 18.0 },
      },
      vertexShader: `void main(){gl_Position=vec4(position,1.0);}`,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        #define NUM_OCTAVES 2

        float rand(vec2 n){return fract(sin(dot(n,vec2(12.9898,4.1414)))*43758.5453);}

        float noise(vec2 p){
          vec2 ip=floor(p);vec2 u=fract(p);
          u=u*u*(3.0-2.0*u);
          return mix(mix(rand(ip),rand(ip+vec2(1,0)),u.x),mix(rand(ip+vec2(0,1)),rand(ip+vec2(1,1)),u.x),u.y);
        }

        float fbm(vec2 x){
          float v=0.0;float a=0.3;vec2 shift=vec2(100);
          mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
          for(int i=0;i<NUM_OCTAVES;++i){v+=a*noise(x);x=rot*x*2.0+shift;a*=0.4;}
          return v;
        }

        uniform float iIterations;

        void main(){
          vec2 p=((gl_FragCoord.xy)-iResolution.xy*0.5)/iResolution.y*mat2(6.0,-4.0,4.0,6.0);
          vec2 v;vec4 o=vec4(0.0);
          float f=2.0+fbm(p+vec2(iTime*5.0,0.0))*0.5;

          /* Desktop: 18 iterations. Mobile: 10 iterations (passed as uniform). */
          for(float i=0.0;i<18.0;i++){
            if(i>=iIterations) break;
            v=p+cos(i*i+(iTime+p.x*0.08)*0.025+i*vec2(13.0,11.0))*3.5;
            float tailNoise=fbm(v+vec2(iTime*0.5,i))*0.3*(1.0-(i/iIterations));
            vec4 auroraColors=vec4(
              0.1+0.3*sin(i*0.2+iTime*0.4),
              0.3+0.5*cos(i*0.3+iTime*0.5),
              0.7+0.3*sin(i*0.4+iTime*0.3),
              1.0
            );
            vec4 contrib=auroraColors*exp(sin(i*i+iTime*0.8))/length(max(v,vec2(v.x*f*0.015,v.y*1.5)));
            float thin=smoothstep(0.0,1.0,i/iIterations)*0.6;
            o+=contrib*(1.0+tailNoise*0.8)*thin;
          }

          o=tanh(pow(o/100.0,vec4(1.6)));
          gl_FragColor=o*1.5;
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    // ── Animation loop ────────────────────────────────────────────────────────
    // Mobile: throttle to 30fps (render every other frame) to halve GPU cost.
    // Desktop: full 60fps.
    let frameId: number;
    let paused = false;
    let lastRender = 0;
    const frameInterval = isMobile ? 1000 / 30 : 0; // 0 = every frame on desktop

    const animate = (timestamp: number) => {
      frameId = requestAnimationFrame(animate);
      if (paused) return;
      if (frameInterval > 0 && timestamp - lastRender < frameInterval) return;
      lastRender = timestamp;
      material.uniforms.iTime.value += isMobile ? 0.033 : 0.016;
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(animate);

    // Pause when tab is hidden to save battery / CPU
    const handleVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', handleVisibility);

    // ── Resize (use ResizeObserver — cheaper than window resize) ─────────────
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      renderer.setSize(width * renderScale, height * renderScale);
      material.uniforms.iResolution.value.set(width * renderScale, height * renderScale);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', handleVisibility);
      ro.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
});

AnimatedShaderBackground.displayName = 'AnimatedShaderBackground';
export default AnimatedShaderBackground;

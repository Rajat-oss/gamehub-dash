import { useEffect } from 'react';
import Lenis from 'lenis';
import { motionValue } from 'framer-motion';

// Shared smoothed scroll position — updated by Lenis every RAF tick.
// Consumed by LandingPage navbar transforms via useTransform().
export const lenisScrollY = motionValue(0);

let lenisInstance: Lenis | null = null;

export function SmoothScroll({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenisInstance = lenis;

        // Update the shared motionValue — this propagates to framer-motion transforms
        // without triggering any React re-renders or DOM events.
        // NOTE: The spurious `window.dispatchEvent(new Event('scroll'))` was removed —
        // it was retriggerering every scroll listener 60× per second for no benefit.
        lenis.on('scroll', ({ scroll }: { scroll: number }) => {
            lenisScrollY.set(scroll);
        });

        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisInstance = null;
        };
    }, []);

    return <>{children}</>;
}

/** Programmatically scroll to an element via Lenis */
export function scrollTo(target: string | HTMLElement, offset = 0) {
    lenisInstance?.scrollTo(target, { offset });
}

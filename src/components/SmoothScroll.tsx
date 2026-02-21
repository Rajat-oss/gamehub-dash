import { useEffect } from 'react';
import Lenis from 'lenis';
import { motionValue } from 'framer-motion';

// Smoothed scroll position updated every RAF tick by Lenis
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

        // Update lenisScrollY with Lenis's smoothed position every RAF tick
        lenis.on('scroll', ({ scroll }: { scroll: number }) => {
            lenisScrollY.set(scroll);
            window.dispatchEvent(new Event('scroll'));
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

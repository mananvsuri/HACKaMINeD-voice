import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [ringPosition, setRingPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const checkHoverState = (e) => {
            const target = e.target;
            const isClickable =
                target.tagName.toLowerCase() === 'button' ||
                target.tagName.toLowerCase() === 'a' ||
                target.closest('button') ||
                target.closest('a') ||
                window.getComputedStyle(target).cursor === 'pointer';

            setIsHovering(!!isClickable);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', checkHoverState);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', checkHoverState);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Smooth trailing effect for the ring using rAF
    useEffect(() => {
        let animationFrameId;

        const renderLoop = () => {
            setRingPosition(prev => {
                // Easing calculation (speed of the follow effect)
                const easing = 0.25;
                const dx = mousePosition.x - prev.x;
                const dy = mousePosition.y - prev.y;
                return {
                    x: prev.x + dx * easing,
                    y: prev.y + dy * easing
                };
            });
            animationFrameId = requestAnimationFrame(renderLoop);
        };

        animationFrameId = requestAnimationFrame(renderLoop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [mousePosition]);

    // Don't render cursor on mobile devices where hovering isn't a thing
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
        return null;
    }

    return (
        <div style={{ pointerEvents: 'none', zIndex: 99999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
            {/* The Main Dot */}
            <div
                style={{
                    position: 'absolute',
                    top: mousePosition.y,
                    left: mousePosition.x,
                    width: '8px',
                    height: '8px',
                    backgroundColor: isHovering ? 'var(--secondary)' : 'var(--primary)',
                    borderRadius: '50%',
                    transform: `translate(-50%, -50%) scale(${isClicking ? 0.7 : 1})`,
                    transition: 'background-color 0.2s, transform 0.1s',
                }}
            />

            {/* The Trailing Ring */}
            <div
                style={{
                    position: 'absolute',
                    top: ringPosition.y,
                    left: ringPosition.x,
                    width: isHovering ? '48px' : '32px',
                    height: isHovering ? '48px' : '32px',
                    border: `1.5px solid ${isHovering ? 'rgba(14, 165, 233, 0.4)' : 'rgba(37, 99, 235, 0.4)'}`,
                    backgroundColor: isHovering ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                    borderRadius: '50%',
                    transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`,
                    transition: 'width 0.2s, height 0.2s, background-color 0.2s, border-color 0.2s, transform 0.1s',
                }}
            />
        </div>
    );
}

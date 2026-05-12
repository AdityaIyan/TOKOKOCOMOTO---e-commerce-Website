import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

export const SwipeButton = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(0);
    const [unlocked, setUnlocked] = useState(false);
    const [startY, setStartY] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    
    const containerHeight = 200;
    const handleHeight = 70;
    const maxPos = containerHeight - handleHeight;

    // We also support page overscroll
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (unlocked) return;
            // Check if we are at the bottom of the page
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                if (e.deltaY > 0) {
                    // Scrolling down at the bottom
                    let newPos = position + e.deltaY * 0.5;
                    if (newPos >= maxPos) {
                        newPos = maxPos;
                        setUnlocked(true);
                        router.push('/products');
                    }
                    setPosition(newPos);
                }
            }
        };

        const handleScroll = () => {
            // Reset position if we scroll up away from bottom
            if ((window.innerHeight + window.scrollY) < document.body.offsetHeight - 50 && !isDragging) {
                setPosition(0);
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [position, unlocked, isDragging, maxPos, router]);

    const updatePosition = (clientY: number) => {
        if (unlocked || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let newPos = clientY - rect.top - (handleHeight / 2);
        
        if (newPos < 0) newPos = 0;
        if (newPos >= maxPos) {
            newPos = maxPos;
            setUnlocked(true);
            router.push('/products');
        }
        setPosition(newPos);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        updatePosition(e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        updatePosition(e.touches[0].clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        updatePosition(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        // prevent page scrolling while dragging the button
        if (e.cancelable) e.preventDefault(); 
        updatePosition(e.touches[0].clientY);
    };

    const handleEnd = () => {
        setIsDragging(false);
        if (!unlocked) {
            // Spring back if not unlocked
            setPosition(0);
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, unlocked]);

    // Calculate opacity based on position (fades out as it goes down)
    const opacity = Math.max(0.2, 1 - (position / maxPos));

    return (
        <div className="flex flex-col items-center justify-center my-12">
            <div className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-6 animate-pulse">
                {unlocked ? "Opening Shop..." : "Swipe / Scroll Down To Explore Shop"}
            </div>
            
            <div 
                ref={containerRef}
                className="relative w-24 bg-transparent select-none touch-none flex justify-center"
                style={{ height: `${containerHeight}px`, opacity: opacity }}
            >
                {/* Handle */}
                <div 
                    className={`absolute left-1 right-1 flex items-center justify-center cursor-pointer transition-transform ${isDragging ? 'scale-95' : ''} ${!isDragging && !unlocked ? 'transition-all duration-300' : ''}`}
                    style={{ 
                        height: `${handleHeight}px`,
                        transform: `translateY(${position}px)`,
                        top: '4px'
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    {/* Down Chevron */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

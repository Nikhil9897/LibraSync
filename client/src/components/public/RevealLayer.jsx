import React, { useEffect, useRef, useState } from 'react';

const SPOTLIGHT_R = 260;

export const RevealLayer = ({ image, cursorX, cursorY }) => {
    const canvasRef = useRef(null);
    const [maskUrl, setMaskUrl] = useState('');

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && canvasRef.current.parentElement) {
                canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
                canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (cursorX === -999 || cursorY === -999) {
            setMaskUrl(canvas.toDataURL());
            return;
        }

        const gradient = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
        gradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.88, 'rgba(255, 255, 255, 0.12)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
        ctx.fill();

        setMaskUrl(canvas.toDataURL());
    }, [cursorX, cursorY]);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ display: 'none' }}
            />
            <div
                className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
                style={{
                    backgroundImage: `url(${image})`,
                    WebkitMaskImage: `url(${maskUrl})`,
                    maskImage: `url(${maskUrl})`,
                    WebkitMaskSize: '100% 100%',
                    maskSize: '100% 100%',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                }}
            />
        </>
    );
};

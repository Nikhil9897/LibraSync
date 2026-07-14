import React from 'react';

export const RevealLayer = ({ image }) => {
    return (
        <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
            style={{
                backgroundImage: `url(${image})`,
                WebkitMaskImage: `radial-gradient(260px circle at var(--cursor-x, -999px) var(--cursor-y, -999px), rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,0.75) 60%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.12) 88%, rgba(255,255,255,0) 100%)`,
                maskImage: `radial-gradient(260px circle at var(--cursor-x, -999px) var(--cursor-y, -999px), rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,0.75) 60%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.12) 88%, rgba(255,255,255,0) 100%)`,
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
            }}
        />
    );
};

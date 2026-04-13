import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] font-['Plus_Jakarta_Sans',_sans-serif] animate-in fade-in duration-500 relative">
      <style>
        {`
          .console-text {
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
            border-right: 2px solid transparent; 
            width: 0;
            animation: typing 3s steps(45, end) forwards, blink-caret 0.75s step-end infinite;
          }
          @keyframes typing { from { width: 0 } to { width: 100% } }
          @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: currentColor } }
          
          @keyframes custom_bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes fade_in_late {
            0%, 90% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-late-bounce {
            opacity: 0;
            animation: fade_in_late 3.2s forwards, custom_bounce 1.5s ease-in-out infinite 3.2s;
          }
        `}
      </style>
      
      <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
        <DotLottieReact
          src="https://lottie.host/f5c5830f-cded-4960-9be2-877b77588418/wyyj6CGHKL.lottie"
          loop
          autoplay
        />
      </div>
      <div className="text-center -mt-10 flex flex-col items-center w-full max-w-[95%] md:max-w-max px-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both delay-300">
        <div className="bg-white/40 backdrop-blur-lg border border-white/20 shadow-2xl shadow-[#6367FF]/10 rounded-2xl px-8 py-6 flex flex-col items-center">
          <h1 className="text-sm md:text-base font-black text-[#2D2B55] mb-2 console-text">
            Waduh, Durung wayae mlebu kene cokkk 😅😅
          </h1>
          <p className="text-xs font-bold text-gray-500 animate-late-bounce">
            Ngopi sek ~  ☕
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;

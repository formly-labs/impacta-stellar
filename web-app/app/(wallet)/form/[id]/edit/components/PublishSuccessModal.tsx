'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface PublishSuccessModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function PublishSuccessModal({ isOpen, onComplete }: PublishSuccessModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/90 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center">
        {/* Círculo animado */}
        <div className="relative flex h-32 w-32 items-center justify-center">
          {/* Partículas flotantes */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-white animate-ping"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-60px)`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0.6
              }}
            />
          ))}
          
          {/* Círculo principal */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl animate-scale-in">
            <Check className="h-12 w-12 text-primary animate-check-in" strokeWidth={3} />
          </div>
        </div>

        {/* Texto */}
        <p className="mt-8 text-center text-2xl font-semibold text-white animate-fade-in">
          ¡Formulario publicado!
        </p>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes check-in {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(0deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-check-in {
          animation: check-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out 0.5s both;
        }
      `}</style>
    </div>
  );
}

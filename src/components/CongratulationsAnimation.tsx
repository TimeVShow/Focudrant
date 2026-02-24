import { useEffect, useState } from 'react';
import { useLocale } from '../hooks/useLocale';

interface CongratulationsAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function CongratulationsAnimation({ isVisible, onComplete }: CongratulationsAnimationProps) {
  const { t } = useLocale();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (isVisible) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/10 animate-fade-in" />
      
      <div className="relative animate-congratulations">
        <div className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 animate-pulse-soft">
          🎉 Congratulations! 🎉
        </div>
        <div className="text-center mt-2 text-lg text-gray-600 animate-fade-in-delayed">
          {t('congrats')}
        </div>
      </div>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: '50%',
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

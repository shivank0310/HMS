import { useEffect, useState } from 'react';

export function useCounterAnimation(target: number, suffix: string, delay = 400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const step = target / 50;
      let current = 0;

      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        setValue(Math.round(current));
        if (current >= target) clearInterval(timer);
      }, 30);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [target, delay]);

  return `${value}${suffix}`;
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

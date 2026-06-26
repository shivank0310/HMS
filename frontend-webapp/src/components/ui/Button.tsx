import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  block?: boolean;
  size?: 'sm' | 'md';
}

export default function Button({
  variant = 'primary',
  block = false,
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-ghost';
  const sizeClass = size === 'sm' ? 'btn-sm' : '';

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${block ? 'btn-block' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

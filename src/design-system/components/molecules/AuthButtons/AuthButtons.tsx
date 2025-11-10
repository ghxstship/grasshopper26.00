'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '../../atoms/Button/Button';
import styles from './AuthButtons.module.css';

export interface AuthButtonsProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

/**
 * AuthButtons - Login and Sign Up button group
 * Atomic molecule composed of Button atoms
 * GHXSTSHIP monochromatic design
 */
export const AuthButtons: React.FC<AuthButtonsProps> = ({ 
  className = '',
  variant = 'horizontal'
}) => {
  return (
    <div className={`${styles.authButtons} ${styles[variant]} ${className}`}>
      <Link href="/login">
        <Button variant="ghost" size="md">
          LOGIN
        </Button>
      </Link>
      <Link href="/signup">
        <Button variant="filled" size="md">
          SIGN UP
        </Button>
      </Link>
    </div>
  );
};

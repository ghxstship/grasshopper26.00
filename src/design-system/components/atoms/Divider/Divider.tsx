/**
 * Divider - Visual separator atom
 * GHXSTSHIP Atomic Design System
 */

import styles from './Divider.module.css';

export interface DividerProps {
  /** Divider orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Divider thickness */
  thickness?: 1 | 2 | 3;
  /** Additional className */
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  thickness = 3,
  className,
}: DividerProps) {
  const classNames = [
    styles.divider,
    styles[`orientation-${orientation}`],
    styles[`thickness-${thickness}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <hr className={classNames} />;
}

/**
 * Container Component
 * GHXSTSHIP Entertainment Platform - Responsive content container
 * Max-width container with consistent padding
 */

import * as React from 'react'
import styles from './Container.module.css'

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ContainerProps {
  children: React.ReactNode
  size?: ContainerSize
  className?: string
  as?: React.ElementType
  noPadding?: boolean
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  className = '',
  as: Component = 'div',
  noPadding = false,
}) => {
  const classNames = [
    styles.container,
    styles[size],
    noPadding && styles.noPadding,
    className,
  ].filter(Boolean).join(' ')

  return <Component className={classNames}>{children}</Component>
}

Container.displayName = 'Container'

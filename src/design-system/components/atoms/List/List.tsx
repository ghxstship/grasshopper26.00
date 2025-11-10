/**
 * List Component
 * GHXSTSHIP Entertainment Platform - Ordered/unordered lists
 */

import * as React from 'react'
import styles from './List.module.css'

export type ListType = 'ul' | 'ol'
export type ListStyle = 'default' | 'geometric' | 'none'

export interface ListProps {
  children: React.ReactNode
  type?: ListType
  listStyle?: ListStyle
  className?: string
}

export const List: React.FC<ListProps> = ({
  children,
  type = 'ul',
  listStyle = 'default',
  className = '',
}) => {
  const Component = type
  const classNames = [
    styles.list,
    styles[listStyle],
    className,
  ].filter(Boolean).join(' ')

  return <Component className={classNames}>{children}</Component>
}

List.displayName = 'List'

export interface ListItemProps {
  children: React.ReactNode
  className?: string
}

export const ListItem: React.FC<ListItemProps> = ({ children, className = '' }) => {
  return <li className={`${styles.item} ${className}`}>{children}</li>
}

ListItem.displayName = 'ListItem'

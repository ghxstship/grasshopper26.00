import * as React from 'react';

export { Card, CardHeader, CardBody, CardFooter } from './Card';
export type { CardProps, CardVariant, CardPadding } from './Card';

// Aliases for compatibility
export { CardBody as CardContent } from './Card';

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => (
  React.createElement('h3', { className, ...props }, children)
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', children, ...props }) => (
  React.createElement('p', { className, ...props }, children)
);

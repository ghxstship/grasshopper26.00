import * as React from 'react';

export interface SiteHeaderProps {
  children?: React.ReactNode;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ children }) => {
  return <header>{children}</header>;
};

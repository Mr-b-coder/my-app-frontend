import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header, Badge } from '@acutrack-bookprint/acutrack-ds';

const AppHeader: React.FC = () => {
  const location = useLocation();
  const isCheckPdf = location.pathname === '/check-pdf';

  return (
    <Header
      variant="default"
      size="md"
      className="mb-6 md:mb-8"
      skipToContent={true}
      skipToContentId="main-content"
    >
      <Header.Logo text="Template Generator" href="/" />
      <Header.Navigation>
        <Header.NavItem href="/" isActive={!isCheckPdf}>
          Template
        </Header.NavItem>
        <Header.NavItem href="/check-pdf" isActive={isCheckPdf}>
          <span className="inline-flex items-center gap-2">
            Check PDF
            <Badge variant="info" size="sm">New</Badge>
          </span>
        </Header.NavItem>
      </Header.Navigation>
      <Header.Actions>
        <Header.ThemeSwitcher />
        <Header.MobileMenu />
      </Header.Actions>
    </Header>
  );
};

export default AppHeader;

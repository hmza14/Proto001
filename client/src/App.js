import React, { useState } from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import DemoPageContent from './components/DemoPageContent';
import Navigation from './components/Navigation';
import theme from './themes/theme';

function App() {
  const router = useDemoRouter('/dashboard');
  const [dividerPosition, setDividerPosition] = useState(50);

  return (
    <AppProvider
      navigation={Navigation}
      branding={{
        logo: <img src="https://mui.com/static/logo.png" alt="MUI logo" />,
        title: 'TMS_Proto',
      }}
      router={router}
      theme={theme}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <DemoPageContent
          pathname={router.pathname}
          dividerPosition={dividerPosition}
          setDividerPosition={setDividerPosition}
        />
      </DashboardLayout>
    </AppProvider>
  );
}

export default App;

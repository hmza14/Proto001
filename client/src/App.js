import React, { useState } from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import DemoPageContent from './components/DemoPageContent';
import Navigation from './components/Navigation';
import Suivi from './components_suivi/Suivi'
import theme from './themes/theme';

function App() {
  const router = useDemoRouter('/planification');
  const [dividerPosition, setDividerPosition] = useState(50);

    // Define route mapping
    const routeMapping = {
      '/planification': DemoPageContent,
      '/suivi': Suivi,
    };

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
          {React.createElement(
            routeMapping[router.pathname] || DemoPageContent, 
            {
              pathname: router.pathname,
              dividerPosition,
              setDividerPosition,
            }
          )}
        </DashboardLayout>
      </AppProvider>
    );
  }

export default App;

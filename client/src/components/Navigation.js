import React from 'react';
//import DashboardIcon from '@mui/icons-material/Dashboard';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import StorageIcon from '@mui/icons-material/Storage';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const NAVIGATION = [
  { kind: 'header', title: 'Main items' },
  { segment: 'planification', title: 'Planification', icon: <ScheduleIcon />, href: '/dashboard'  },
  { segment: 'suivi', title: 'Suivi', icon: <ContentPasteSearchIcon />,href: '/suivi'  },
  {
    segment: 'masterdata',
    title: 'Master data',
    icon: <StorageIcon />,
    children: [
      { segment: 'utilisateur', title: 'Utilisateur', icon: <PersonIcon />, href: '/masterdata/utilisateur' },
      { segment: 'location', title: 'Location', icon: <LocationOnIcon />, href: '/masterdata/location' },
    ],
  },
  { kind: 'divider' },
  { kind: 'header', title: 'Analytics' },
  {
    segment: 'reports',
    title: 'Reports',
    icon: <BarChartIcon />,
    children: [
      { segment: 'sales', title: 'Sales', icon: <DescriptionIcon /> },
      { segment: 'traffic', title: 'Traffic', icon: <DescriptionIcon /> },
    ],
  },
  { segment: 'integrations', title: 'Integrations', icon: <LayersIcon /> },
];

export default NAVIGATION;
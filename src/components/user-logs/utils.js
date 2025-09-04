import { FileText, ShieldAlert, LogIn, Settings, UserCog } from 'lucide-react';

export const getActionIcon = (type) => {
  switch (type) {
    case 'login':
      return <LogIn className="h-4 w-4" />;
    case 'security':
      return <ShieldAlert className="h-4 w-4" />;
    case 'system':
      return <Settings className="h-4 w-4" />;
    case 'action':
      return <UserCog className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const getActionColor = (type) => {
  switch (type) {
    case 'login':
      return 'bg-blue-100 text-blue-800';
    case 'security':
      return 'bg-red-100 text-red-800';
    case 'system':
      return 'bg-gray-100 text-gray-800';
    case 'action':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};


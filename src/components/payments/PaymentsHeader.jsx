import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const PaymentsHeader = ({ className, onExport }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn('flex items-center gap-1', className)}
      onClick={onExport}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      <span>Export</span>
    </Button>
  );
};

export default PaymentsHeader;

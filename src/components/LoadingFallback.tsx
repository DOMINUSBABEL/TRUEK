import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}

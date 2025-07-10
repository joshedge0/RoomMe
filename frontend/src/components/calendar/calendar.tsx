'use client';

import { Month } from "./month"

export function Calendar() {

  return (
    <div className="p-8">
        <div>
            <Month month="May 2025" />
        </div>
    </div>
    
  );
}

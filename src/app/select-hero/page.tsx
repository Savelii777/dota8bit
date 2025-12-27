'use client';

import React, { useState } from 'react';
import { HeroSelect } from '@/components/menu';

export default function SelectHeroPage() {
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  
  return (
    <HeroSelect 
      selectedHeroId={selectedHeroId} 
      onHeroSelect={setSelectedHeroId} 
    />
  );
}

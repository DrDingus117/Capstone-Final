// Web version: shows the same map in an <iframe>.
import React, { useMemo } from 'react';
import { View } from 'react-native';

import { buildMapHtml, Center } from './map-html';

export default function CentersMap({ centers }: { centers: Center[] }) {
  const html = useMemo(() => buildMapHtml(centers), [centers]);

  return (
    <View style={{ width: '100%', height: 480, borderRadius: 12, overflow: 'hidden' }}>
      {React.createElement('iframe', {
        srcDoc: html,
        title: 'Map of autism centers',
        style: { width: '100%', height: '100%', border: 0 },
      })}
    </View>
  );
}
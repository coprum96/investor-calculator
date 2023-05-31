import React from 'react';
import { MantineProvider, Text } from '@mantine/core';

const SectionTitle = ({ children }) => {
  return (
    <MantineProvider>
      <Text
        variant="h1"
        style={{
          marginBottom: '1rem',
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#333',
          textTransform: 'uppercase',
          textAlign: 'center'
        }}
      >
        {children}
      </Text>
    </MantineProvider>
  );
};

export default SectionTitle;

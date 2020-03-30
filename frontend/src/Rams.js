import React, { useState, useRef } from 'react';
import { useOnClickOutside } from './hooks';
import AnimalForm from './AnimalForm';
import Burger from './Burger';
import Menu from './Menu';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './global';
import { theme } from './theme';

export default function Rams() {
    const [open, setOpen] = useState(false);
    const node = useRef(); 
    useOnClickOutside(node, () => setOpen(false));
    

  return (      
    <ThemeProvider theme={theme}>
        <>
        <GlobalStyles />
        <div ref={node}>
            <Burger open={open} setOpen={setOpen} />
            <Menu open={open} setOpen={setOpen} />
        </div>
        <div>
            <AnimalForm />
        </div>
        </>
    </ThemeProvider>
  );
}


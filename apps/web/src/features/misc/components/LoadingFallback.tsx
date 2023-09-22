import React from 'react';


import { Spinner } from '@/components';




export const LoadingFallback = () => (
 
    window.setTimeout(showSpinner, 100)
    
);

export const showSpinner = () => (
    <Spinner/>
);
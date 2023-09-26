import React, { useEffect, useState } from 'react';


import { AnimatePresence, motion } from 'framer-motion';

import { Spinner } from '@/components';

type LoadingFallbackProps = {
    children: (data: any) => React.ReactNode
}

export const LoadingFallback = ({ children }: LoadingFallbackProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setIsVisible(true), 300
        })
        return () => { clearTimeout(timeOut); };
    }, []);



    return isVisible ?  <Spinner/> : null
}

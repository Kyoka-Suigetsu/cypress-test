"use client"

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import React, { type ComponentPropsWithRef } from 'react'
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import FrozenRouterProvider from '@/providers/FrozenRouterProvider';

type PageWrapperProps = ComponentPropsWithRef<typeof motion.div> & React.PropsWithChildren

const variants = {
  hidden: { opacity: 0, x: 0, y: 20 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: -20 }
}

const PageWrapper = ({ children, className, ...props }: PageWrapperProps) => {
  const segment = useSelectedLayoutSegment();

  return (
    <AnimatePresence initial mode='popLayout'>
      <motion.div
        key={segment}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ type: "linear" }}
        className={cn('w-full h-full', className)}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export const FrozenPageWrapper = ({ children, className, ...props }: PageWrapperProps) => {
  const pathname = usePathname();

  return (
    <AnimatePresence initial mode='popLayout'>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ type: "linear" }}
        className={cn('w-full', className)}
        {...props}
      >
        <FrozenRouterProvider>
          {children}
        </FrozenRouterProvider>
      </motion.div>
    </AnimatePresence>
  )
}

export default PageWrapper
'use client';

import React from 'react';
import { Drawer } from 'vaul';

interface CustomDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode; // Component to render inside the drawer
  direction?: 'left' | 'right' | 'bottom'; // Direction of the drawer
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({ open, onOpenChange, children, direction = 'left' }) => {
  const isSideDrawer = direction === 'left' || direction === 'right';

  return (
    <Drawer.Root open={open} direction={direction} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content
          className={`bg-gray-100 flex flex-col z-50 ${
            isSideDrawer ? 'h-full w-[400px]' : 'h-fit w-full'
          } fixed ${direction === 'left' ? 'left-0 top-0' : ''} ${
            direction === 'right' ? 'right-0 top-0' : ''
          } ${direction === 'bottom' ? 'bottom-0 left-0 right-0' : ''} outline-none`}
        >
          <div className={`p-4 ${isSideDrawer ? 'h-full' : ''} bg-white flex-1`}>
            <div
             
              
            />
            <div className="max-w-md mx-auto">{children}</div>
          </div>
          
            <div className="p-4 bg-gray-100 border-t border-gray-200 mt-auto">
              <div className="flex gap-6 justify-end max-w-md mx-auto">
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </button>
              </div>
            </div>
          
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default CustomDrawer;
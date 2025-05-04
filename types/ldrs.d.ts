// types/ldrs.d.ts
import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'l-helix': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: string | number;
        speed?: string | number;
        color?: string;
        // Add other props specific to l-helix if needed
      };
      // Add declarations for other ldrs components if you use them
    }
  }
}

// Export empty object to make it a module (avoids isolatedModules error)
export {};

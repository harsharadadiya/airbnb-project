// shadcn/ui Toaster (pop-up notifications) using "sonner"
import { Toaster as Sonner } from 'sonner';

function Toaster(props) {
  return (
    <Sonner
      position="top-center"
      richColors
      closeButton
      toastOptions={{ style: { fontFamily: 'Plus Jakarta Sans, sans-serif', borderRadius: '12px' } }}
      {...props}
    />
  );
}

export { Toaster };

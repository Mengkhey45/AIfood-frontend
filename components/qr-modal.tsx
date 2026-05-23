'use client';

import { QRCodeCanvas } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useRef } from 'react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuUrl: string;
}

export function QRModal({ isOpen, onClose, menuUrl }: QRModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = 'restroai-menu-qr.png';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restaurant Menu QR Code</DialogTitle>
          <DialogDescription>
            Print this QR code and place it on your tables so customers can easily access your digital menu.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div 
            ref={qrRef}
            className="p-4 bg-white rounded-xl shadow-sm border border-neutral-200"
          >
            <QRCodeCanvas 
              value={menuUrl} 
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <Button onClick={downloadQR} className="w-full bg-sky-500 hover:bg-sky-600 gap-2">
            <Download className="w-4 h-4" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

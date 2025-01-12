import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FormattedSermonProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const FormattedSermon = ({ isOpen, onClose, content }: FormattedSermonProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-bible-navy">
            Sermão Formatado
          </DialogTitle>
        </DialogHeader>
        <div 
          className="prose max-w-none font-serif"
          dangerouslySetInnerHTML={{ 
            __html: content
              .split('\n')
              .map(line => {
                if (line.startsWith('# ')) {
                  return `<h1 class="text-3xl font-bold text-bible-navy mb-6">${line.slice(2)}</h1>`;
                } else if (line.startsWith('## ')) {
                  return `<h2 class="text-2xl font-semibold text-bible-navy mt-8 mb-4">${line.slice(3)}</h2>`;
                } else if (line.startsWith('### ')) {
                  return `<h3 class="text-xl font-medium text-bible-navy mt-6 mb-3">${line.slice(4)}</h3>`;
                } else if (line.startsWith('- ')) {
                  return `<li class="ml-4 mb-2">${line.slice(2)}</li>`;
                } else if (line.trim() === '') {
                  return '<br>';
                } else {
                  return `<p class="text-bible-text leading-relaxed mb-4">${line}</p>`;
                }
              })
              .join('\n')
          }} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default FormattedSermon;
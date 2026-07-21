import React from 'react';
import { useViaggioStore } from '../../store/store';
import { Copy } from 'lucide-react';

interface CopyableTextProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  toastMessage?: string;
  showIcon?: boolean;
}

export const CopyableText: React.FC<CopyableTextProps> = ({
  text,
  children,
  className = '',
  toastMessage = 'Copiato! ✓',
  showIcon = true,
}) => {
  const showToast = useViaggioStore((state) => state.showToast);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      showToast(toastMessage);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 cursor-pointer select-all hover:opacity-80 active:scale-95 transition-all text-left ${className}`}
      title="Clicca per copiare"
    >
      <span>{children || text}</span>
      {showIcon && <Copy className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />}
    </button>
  );
};

export default CopyableText;

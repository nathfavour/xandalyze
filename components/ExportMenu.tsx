import React, { useState } from 'react';
import { Download, FileJson, FileText, FileSpreadsheet } from 'lucide-react';

interface ExportMenuProps {
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportMarkdown: () => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExportCSV,
  onExportJSON,
  onExportMarkdown,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    {
      label: 'Export as CSV',
      icon: <FileSpreadsheet size={16} />,
      onClick: () => {
        onExportCSV();
        setIsOpen(false);
      },
    },
    {
      label: 'Export as JSON',
      icon: <FileJson size={16} />,
      onClick: () => {
        onExportJSON();
        setIsOpen(false);
      },
    },
    {
      label: 'Export Report (MD)',
      icon: <FileText size={16} />,
      onClick: () => {
        onExportMarkdown();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 font-medium shadow-sm"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Export</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-surface-primary border border-border rounded-lg shadow-xl z-50 overflow-hidden">
            {exportOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.onClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-surface-secondary transition-colors"
              >
                <span className="text-muted">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

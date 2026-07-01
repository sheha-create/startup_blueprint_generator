'use client';

import React from 'react';
import { Download, FileText, File } from 'lucide-react';

interface Props {
  sessionId: string;
  onExport: (format: 'pdf' | 'docx') => void;
  exporting: boolean;
}

export default function ExportBar({ sessionId, onExport, exporting }: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-white">
      <span className="text-xs font-medium text-gray-500 mr-1">Export blueprint:</span>
      <button
        onClick={() => onExport('docx')}
        disabled={exporting}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileText className="w-3.5 h-3.5" />
        Word (.docx)
      </button>
      <button
        onClick={() => onExport('pdf')}
        disabled={exporting}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <File className="w-3.5 h-3.5" />
        PDF
      </button>
      {exporting && (
        <span className="text-xs text-gray-400 ml-1 animate-pulse">Generating file…</span>
      )}
    </div>
  );
}

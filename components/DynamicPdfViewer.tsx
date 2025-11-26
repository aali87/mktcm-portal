"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the PDF viewer with no SSR
const PdfWorkbookViewer = dynamic(
  () => import("./PdfWorkbookViewer").then((mod) => mod.PdfWorkbookViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-neutral-600">Loading PDF viewer...</p>
        </div>
      </div>
    ),
  }
);

interface DynamicPdfViewerProps {
  workbookId: string;
  initialPage?: number;
}

export function DynamicPdfViewer({ workbookId, initialPage = 1 }: DynamicPdfViewerProps) {
  return <PdfWorkbookViewer workbookId={workbookId} initialPage={initialPage} />;
}

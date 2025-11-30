"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import react-pdf styles for proper annotation rendering
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker from CDN for cross-browser compatibility
// Using unpkg CDN avoids build-time bundling issues and works in Safari
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfWorkbookViewerProps {
  workbookId: string;
  workbookSlug: string;
  productSlug: string;
  initialPage?: number;
}

export function PdfWorkbookViewer({
  workbookId,
  workbookSlug,
  productSlug,
  initialPage = 1,
}: PdfWorkbookViewerProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch signed PDF URL
  useEffect(() => {
    async function fetchPdfUrl() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/workbooks/${workbookId}/pdf`);

        if (!response.ok) {
          throw new Error("Failed to load workbook PDF");
        }

        const data = await response.json();
        setPdfUrl(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workbook");
        console.error("Error fetching workbook PDF:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPdfUrl();
  }, [workbookId]);

  // Set responsive width
  useEffect(() => {
    function updateWidth() {
      const container = document.getElementById("pdf-container");
      if (container) {
        setPageWidth(container.clientWidth - 32); // Subtract padding
      }
    }

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        goToPreviousPage();
      } else if (e.key === "ArrowRight") {
        goToNextPage();
      }
    }

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, totalPages]);

  // Save progress when page changes
  useEffect(() => {
    if (!loading && pdfUrl && totalPages > 0) {
      saveProgress();
    }
  }, [currentPage, totalPages, loading, pdfUrl]);

  // Handle external link clicks in PDF annotations
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleLinkClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href) {
        // Check if it's an external link (not a page reference)
        const href = link.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          e.preventDefault();
          e.stopPropagation();

          // Check if this is an S3 video link for a workbook video
          // S3 links contain the bucket URL and video file extensions
          const isS3VideoLink = (
            href.includes('.s3.') ||
            href.includes('s3.amazonaws.com') ||
            href.includes('s3.us-') ||
            href.includes('s3.eu-') ||
            href.includes('s3.ap-')
          ) && (
            href.toLowerCase().includes('.mov') ||
            href.toLowerCase().includes('.mp4') ||
            href.toLowerCase().includes('.m4v') ||
            href.toLowerCase().includes('.webm')
          );

          if (isS3VideoLink) {
            try {
              // Extract the S3 key from the URL
              // URL format: https://bucket.s3.region.amazonaws.com/path/to/video.mov
              // or: https://s3.region.amazonaws.com/bucket/path/to/video.mov
              const url = new URL(href);
              let s3Key = decodeURIComponent(url.pathname);

              // Remove leading slash
              if (s3Key.startsWith('/')) {
                s3Key = s3Key.substring(1);
              }

              // Convert + to spaces (URL encoding uses + for spaces in some contexts)
              s3Key = s3Key.replace(/\+/g, ' ');

              // Look up the workbook video by S3 key
              const response = await fetch(`/api/workbook-videos/lookup?s3Key=${encodeURIComponent(s3Key)}`);

              if (response.ok) {
                const data = await response.json();
                // Navigate to the workbook video player with return info
                const videoUrl = `/dashboard/workbook-video/${data.id}?returnPage=${currentPage}&workbookSlug=${workbookSlug}&productSlug=${productSlug}`;
                window.location.href = videoUrl;
                return;
              } else {
                // Video not found in database, open link normally
                console.warn('Workbook video not found in database for S3 key:', s3Key);
                window.open(href, '_blank', 'noopener,noreferrer');
              }
            } catch (err) {
              console.error('Error looking up workbook video:', err);
              // Fall back to opening the link normally
              window.open(href, '_blank', 'noopener,noreferrer');
            }
          } else {
            // Regular external link - open in new tab
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        }
      }
    };

    container.addEventListener('click', handleLinkClick);
    return () => container.removeEventListener('click', handleLinkClick);
  }, [currentPage, totalPages, workbookSlug, productSlug]);

  const saveProgress = async () => {
    try {
      await fetch(`/api/workbooks/${workbookId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastViewedPage: currentPage,
          completed: currentPage === totalPages,
        }),
      });
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("PDF URL was:", pdfUrl);
    setError(`Failed to load PDF: ${error.message || 'Unknown error'}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-neutral-600">Loading workbook...</p>
        </div>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || "Failed to load PDF"}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-neutral-600">
            Page {currentPage} of {totalPages || "..."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 border border-neutral-200 rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.6}
              className="rounded-r-none"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-neutral-600 px-2 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="rounded-l-none"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        ref={containerRef}
        id="pdf-container"
        className="bg-neutral-100 border border-neutral-200 rounded-lg overflow-auto p-4"
        style={{ minHeight: "600px" }}
      >
        <div className="flex justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              width={pageWidth}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }
            />
          </Document>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="flex items-center justify-center gap-4 md:hidden">
        <Button
          variant="outline"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="flex-1 max-w-[150px]"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-neutral-600">
          {currentPage}/{totalPages || "..."}
        </span>
        <Button
          variant="outline"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="flex-1 max-w-[150px]"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Info note */}
      <p className="text-xs text-neutral-500 text-center">
        Click on links and interactive elements directly in the PDF above
      </p>
    </div>
  );
}

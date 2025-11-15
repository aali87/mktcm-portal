"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkbookViewerProps {
  workbookId: string;
  totalPages: number;
  initialPage?: number;
}

interface PageUrl {
  pageNumber: number;
  url: string;
}

export function WorkbookViewer({
  workbookId,
  totalPages,
  initialPage = 1,
}: WorkbookViewerProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageUrls, setPageUrls] = useState<PageUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch signed URLs for all pages
  useEffect(() => {
    async function fetchPageUrls() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/workbooks/${workbookId}/pages`);

        if (!response.ok) {
          throw new Error("Failed to load workbook pages");
        }

        const data = await response.json();
        setPageUrls(data.pages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workbook");
        console.error("Error fetching workbook pages:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPageUrls();
  }, [workbookId]);

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
    if (!loading && pageUrls.length > 0) {
      saveProgress();
    }
  }, [currentPage]);

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
      setImageLoading(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setImageLoading(true);
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const getCurrentPageUrl = () => {
    const page = pageUrls.find((p) => p.pageNumber === currentPage);
    return page?.url || "";
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          Page {currentPage} of {totalPages}
        </p>
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

      {/* Image viewer */}
      <div className="relative bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div className="relative w-full" style={{ minHeight: "600px" }}>
          <Image
            src={getCurrentPageUrl()}
            alt={`Page ${currentPage}`}
            width={1200}
            height={1600}
            className="w-full h-auto"
            priority={currentPage === 1}
            onLoadingComplete={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setError("Failed to load page image");
            }}
          />
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
          {currentPage}/{totalPages}
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
    </div>
  );
}

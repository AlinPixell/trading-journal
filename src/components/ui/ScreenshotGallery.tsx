"use client";

import { ZoomIn } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import { ScreenshotLightbox } from "@/components/ui/ScreenshotLightbox";

type LightboxState = {
  images: string[];
  index: number;
  title?: string;
} | null;

export function useScreenshotLightbox() {
  const [state, setState] = useState<LightboxState>(null);

  const open = useCallback((images: string[], index = 0, title?: string) => {
    if (!images.length) return;
    setState({
      images,
      index: Math.min(Math.max(0, index), images.length - 1),
      title,
    });
  }, []);

  const close = useCallback(() => setState(null), []);

  const lightbox = state ? (
    <ScreenshotLightbox
      images={state.images}
      initialIndex={state.index}
      open
      onClose={close}
      title={state.title}
    />
  ) : null;

  return { open, close, lightbox, isOpen: state != null };
}

type ScreenshotThumbProps = {
  src: string;
  alt?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  imgClassName?: string;
  showZoomHint?: boolean;
};

export function ScreenshotThumb({
  src,
  alt,
  onClick,
  className,
  imgClassName,
  showZoomHint = true,
}: ScreenshotThumbProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(
        "group relative block w-full overflow-hidden rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] text-left transition hover:border-[var(--border)]",
        className,
      )}
    >
      <img src={src} alt={alt ?? ""} className={cn("w-full object-contain", imgClassName)} />
      {showZoomHint ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
          <span className="flex scale-90 items-center gap-1.5 rounded-md border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition group-hover:scale-100 group-hover:opacity-100">
            <ZoomIn className="h-3.5 w-3.5" />
            View full size
          </span>
        </span>
      ) : null}
    </button>
  );
}

type ScreenshotGalleryProps = {
  images: string[];
  title?: string;
  containerClassName?: string;
  thumbClassName?: string;
  imgClassName?: string;
  showZoomHint?: boolean;
};

export function ScreenshotGallery({
  images,
  title,
  containerClassName,
  thumbClassName,
  imgClassName,
  showZoomHint = true,
}: ScreenshotGalleryProps) {
  const { open, lightbox } = useScreenshotLightbox();

  if (!images.length) return null;

  return (
    <>
      <div className={containerClassName}>
        {images.map((src, i) => (
          <ScreenshotThumb
            key={i}
            src={src}
            alt={`Screenshot ${i + 1}`}
            onClick={() => open(images, i, title)}
            className={thumbClassName}
            imgClassName={imgClassName}
            showZoomHint={showZoomHint}
          />
        ))}
      </div>
      {lightbox}
    </>
  );
}

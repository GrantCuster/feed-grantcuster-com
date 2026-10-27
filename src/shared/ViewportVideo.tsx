"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import type { ExtraProps } from "react-markdown";

export function ViewportVideo({
  node: _node,
  autoPlay,
  playsInline,
  controls,
  ...props
}: ComponentPropsWithoutRef<"video"> & ExtraProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [tapped, setTapped] = useState(false);
  const revealControls = Boolean(autoPlay && controls);

  useEffect(() => {
    if (!tapped) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) {
        setTapped(false);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [tapped]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !autoPlay || !window.IntersectionObserver) return;

    let inView = false;
    let manuallyPaused = false;
    let automaticPauses = 0;

    const pause = () => {
      if (!video.paused) {
        // Media events arrive asynchronously, after pause() has returned.
        automaticPauses += 1;
        video.pause();
      }
    };
    const syncPlayback = () => {
      if (!inView || document.hidden) {
        pause();
      } else if (!manuallyPaused && !video.ended && video.paused) {
        // Browser autoplay policies can reject playback; controls still work.
        void video.play().catch(() => {});
      }
    };
    const onPause = () => {
      if (automaticPauses > 0) {
        automaticPauses -= 1;
      } else if (!video.ended) {
        manuallyPaused = true;
      }
    };
    const onPlay = () => {
      manuallyPaused = false;
      if (!inView || document.hidden) pause();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        syncPlayback();
      },
      { threshold: [0, 0.25] },
    );

    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);
    document.addEventListener("visibilitychange", syncPlayback);
    observer.observe(video);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);
      video.pause();
    };
  }, [autoPlay, props.src]);

  // Omit native autoplay even from server HTML so it cannot race the observer.
  return (
    <video
      {...props}
      ref={ref}
      playsInline={playsInline ?? autoPlay}
      controls={revealControls ? hovered || keyboardFocused || tapped : controls}
      tabIndex={props.tabIndex ?? (revealControls ? 0 : undefined)}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
        props.onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        props.onPointerLeave?.(event);
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") setTapped(true);
        props.onPointerDown?.(event);
      }}
      onFocus={(event) => {
        setKeyboardFocused(event.currentTarget.matches(":focus-visible"));
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setKeyboardFocused(false);
        setTapped(false);
        props.onBlur?.(event);
      }}
    />
  );
}

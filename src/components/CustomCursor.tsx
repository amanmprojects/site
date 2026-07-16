"use client";

import { useEffect } from "react";

/**
 * Blue cursor ring only while the pointer is over the sidebar.
 * Rest of the page keeps the normal system cursor.
 */
export function CustomCursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.getElementById("cursor-root");
    const sidebar = document.getElementById("site-sidebar");
    if (!root || !sidebar) return;

    const dot = document.createElement("div");
    dot.className = "cursor-dot";

    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    dot.appendChild(ring);
    root.appendChild(dot);

    let inside = false;

    const show = () => {
      inside = true;
      sidebar.classList.add("sidebar-cursor-active");
      dot.style.opacity = "1";
    };

    const hide = () => {
      inside = false;
      sidebar.classList.remove("sidebar-cursor-active");
      dot.style.opacity = "0";
      dot.classList.remove("is-link");
    };

    const onMove = (e: MouseEvent) => {
      if (!inside) return;
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    const linkSelector = "a, button, [role='button']";

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.(linkSelector)) dot.classList.add("is-link");
    };

    const onOut = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.(linkSelector)) dot.classList.remove("is-link");
    };

    sidebar.addEventListener("mouseenter", show);
    sidebar.addEventListener("mouseleave", hide);
    sidebar.addEventListener("mousemove", onMove);
    sidebar.addEventListener("mouseover", onOver);
    sidebar.addEventListener("mouseout", onOut);

    return () => {
      sidebar.removeEventListener("mouseenter", show);
      sidebar.removeEventListener("mouseleave", hide);
      sidebar.removeEventListener("mousemove", onMove);
      sidebar.removeEventListener("mouseover", onOver);
      sidebar.removeEventListener("mouseout", onOut);
      sidebar.classList.remove("sidebar-cursor-active");
      root.innerHTML = "";
    };
  }, []);

  return <div id="cursor-root" aria-hidden="true" />;
}

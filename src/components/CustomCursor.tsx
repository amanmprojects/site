"use client";

import { useEffect } from "react";

const SVG_NS = "http://www.w3.org/2000/svg";

function createArrow(fill: string) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "cursor-arrow");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.style.filter = "drop-shadow(0 1px 2px rgba(0,0,0,0.25))";

  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M5 3l14 7-6 2-2 6-6-15z");
  path.setAttribute("fill", fill);
  path.setAttribute("stroke", "white");
  path.setAttribute("stroke-width", "1.5");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);
  return svg;
}

/**
 * Site-wide blue arrow cursor (dhravya.dev style).
 * Switches to the large blue ring only while over sidebar nav items.
 */
export function CustomCursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.getElementById("cursor-root");
    if (!root) return;

    document.body.classList.add("live-cursor");

    const dot = document.createElement("div");
    dot.className = "cursor-dot";

    const ring = document.createElement("div");
    ring.className = "cursor-ring";

    const arrow = createArrow("#2f6bff");
    dot.append(ring, arrow);
    root.appendChild(dot);

    let activeItem: Element | null = null;
    const bound = new Set<Element>();

    const onMove = (e: MouseEvent) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    const setRing = (on: boolean) => {
      dot.classList.toggle("is-link", on);
    };

    const onItemEnter = (e: Event) => {
      const item = e.currentTarget as Element;
      if (activeItem && activeItem !== item) {
        activeItem.classList.remove("sidebar-item-cursor-active");
      }
      activeItem = item;
      item.classList.add("sidebar-item-cursor-active");
      setRing(true);
    };

    const onItemLeave = (e: Event) => {
      const item = e.currentTarget as Element;
      if (activeItem !== item) return;
      item.classList.remove("sidebar-item-cursor-active");
      activeItem = null;
      setRing(false);
    };

    const bindItem = (item: Element) => {
      if (bound.has(item)) return;
      bound.add(item);
      item.addEventListener("mouseenter", onItemEnter);
      item.addEventListener("mouseleave", onItemLeave);
    };

    const sync = () => {
      document.querySelectorAll("[data-sidebar-item]").forEach(bindItem);
    };

    sync();

    const sidebar = document.getElementById("site-sidebar");
    const observer = sidebar
      ? new MutationObserver(() => sync())
      : null;
    observer?.observe(sidebar!, { childList: true, subtree: true });

    const onDocLeave = () => {
      dot.style.opacity = "0";
    };
    const onDocEnter = () => {
      dot.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onDocLeave);
    document.documentElement.addEventListener("mouseenter", onDocEnter);

    return () => {
      observer?.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onDocLeave);
      document.documentElement.removeEventListener("mouseenter", onDocEnter);
      bound.forEach((item) => {
        item.removeEventListener("mouseenter", onItemEnter);
        item.removeEventListener("mouseleave", onItemLeave);
        item.classList.remove("sidebar-item-cursor-active");
      });
      bound.clear();
      document.body.classList.remove("live-cursor");
      root.innerHTML = "";
    };
  }, []);

  return <div id="cursor-root" aria-hidden="true" />;
}

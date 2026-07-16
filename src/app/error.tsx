"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[50vh] grow place-items-center px-6">
      <div className="max-w-sm text-center">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          An unexpected error occurred while loading this page.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 inline-flex items-center rounded-lg bg-blue px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2558e0] active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

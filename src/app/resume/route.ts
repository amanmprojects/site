const RESUME_URL =
  "https://raw.githubusercontent.com/amanmprojects/resume/main/aman_mehtar_resume.pdf";

// The PDF should always be the latest from the resume repo — never cache.
export const dynamic = "force-dynamic";

export async function GET() {
  let upstream: Response;
  try {
    upstream = await fetch(RESUME_URL, { cache: "no-store" });
  } catch {
    return new Response("Could not reach GitHub to fetch the resume.", {
      status: 502,
    });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Resume PDF not found upstream.", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="aman_mehtar_resume.pdf"',
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

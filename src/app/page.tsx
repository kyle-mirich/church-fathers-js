import Image from "next/image";
import React from "react";
// Directly import the JSON data. Ensure output.json is in the same directory or adjust the path.
import data from "./output.json";

// Helper component to render raw HTML content safely.
// It applies basic prose styling to make the content readable.
function HtmlContent({ htmlString }: { htmlString: string }) {
  return <div className="prose dark:prose-invert max-w-none break-words" dangerouslySetInnerHTML={{ __html: htmlString }} />;
}

// Component for rendering a single footnote in the footnotes list.
function Footnote({ footnote, index }: { footnote: any, index: number }) {
  return (
    <li id={`footnote-${footnote.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
      {/* Back-link to the footnote reference in the main text */}
      <a href={`#fnref-${footnote.id}`} className="font-bold text-blue-600 hover:text-blue-800 no-underline mr-2">
        {index + 1}.
      </a>
      {/* Render the HTML content of the footnote */}
      <HtmlContent htmlString={footnote.text_html} />
    </li>
  );
}

// Component for rendering a single scripture reference.
function ScriptureReference({ reference }: { reference: any }) {
  return (
    <li className="mb-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      <span className="font-semibold">OSIS Ref:</span> {reference.osis_ref} - <span className="font-semibold">Passage:</span> {reference.passage_text}
    </li>
  );
}

// Component for rendering a single chapter, including its content, footnotes, and scripture references.
function Chapter({ chapter }: { chapter: any }) {
  // Define a type for footnote information to improve readability and type safety.
  type FootnoteInfo = {
    anchor: string; // The ID for the anchor link in the footnote list.
    number: number; // The display number for the footnote.
  };

  // Build a map of footnote IDs to their corresponding anchor and number for easy lookup.
  const footnoteMap = (chapter.footnotes || []).reduce<Record<string, FootnoteInfo>>((acc, fn, idx) => {
    // Use the provided ID or generate a fallback based on index.
    const id = fn.id || `_auto_fn_${idx + 1}`;
    acc[id] = {
      anchor: `footnote-${id}`, // The ID for the target of the link (in the footnote list).
      number: idx + 1 // The display number for the footnote reference.
    };
    return acc;
  }, {});

  // Start with the raw HTML content of the chapter.
  let contentHtml = chapter.content_html || "";

  // If there are footnotes, replace their references in the content HTML with numbered, clickable links.
  if (chapter.footnotes && chapter.footnotes.length > 0) {
    (Object.entries(footnoteMap) as [string, FootnoteInfo][]).forEach(([id, info]) => {
      // Escape special characters in the ID to ensure the regex works correctly.
      const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Regex to find footnote anchor tags with the specific href.
      // It looks for any <a> tag with href="#id" and replaces the entire tag.
      const regex = new RegExp(`<a[^>]*href="#${escapedId}"[^>]*>.*?</a>`, 'g');

      contentHtml = contentHtml.replace(regex,
        // Replace with a new anchor tag that links to the footnote, styled as a superscript.
        `<a href="#${info.anchor}" id="fnref-${id}" class="inline-flex items-baseline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 no-underline text-sm align-top ml-0.5"><sup>[${info.number}]</sup></a>`
      );
    });
  }

  return (
    <section className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <h3 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-400 border-b pb-2 border-blue-200 dark:border-blue-600">
        {chapter.chapter_title}
      </h3>
      {/* Render the processed chapter content */}
      <HtmlContent htmlString={contentHtml} />

      {/* Display footnotes if they exist */}
      {chapter.footnotes && chapter.footnotes.length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Footnotes</h4>
          <ol className="list-decimal pl-5 text-base">
            {chapter.footnotes.map((fn: any, idx: number) => (
              <Footnote footnote={fn} index={idx} key={fn.id || idx} />
            ))}
          </ol>
        </div>
      )}

      {/* Display scripture references if they exist */}
      {chapter.scripture_references && chapter.scripture_references.length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Scripture References</h4>
          <ul className="list-disc pl-5 text-base">
            {chapter.scripture_references.map((ref: any, idx: number) => (
              <ScriptureReference reference={ref} key={idx} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// Component for rendering a "Part" of a work, which contains multiple chapters.
function Part({ part }: { part: any }) {
  return (
    <article className="mb-12">
      <h2 className="text-3xl font-bold mb-8 text-indigo-800 dark:text-indigo-300 border-b-2 pb-3 border-indigo-300 dark:border-indigo-600">
        {part.part_title}
      </h2>
      {part.chapters && part.chapters.length > 0 ? (
        part.chapters.map((chapter: any, idx: number) => (
          <Chapter chapter={chapter} key={idx} />
        ))
      ) : (
        <div className="italic text-gray-400 text-center py-4">No chapters available for this part.</div>
      )}
    </article>
  );
}

// Component for rendering an entire "Work," which contains multiple parts.
function Work({ work }: { work: any }) {
  return (
    <article className="mb-16 border-b-4 pb-12 border-blue-300 dark:border-blue-700 last:border-b-0">
      <h2 className="text-4xl font-extrabold mb-8 text-blue-800 dark:text-blue-300 border-b-4 pb-4 border-blue-400 dark:border-blue-600">
        {work.work_title}
      </h2>
      {work.parts && work.parts.length > 0 ? (
        work.parts.map((part: any, idx: number) => <Part part={part} key={idx} />)
      ) : (
        <div className="italic text-gray-400 text-center py-6 text-lg">No parts available for this work.</div>
      )}
    </article>
  );
}

// Main page component that loads and displays the library data.
export default function Home() {
  // Use the directly imported JSON data.
  const libraryData = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-10 font-sans leading-relaxed">
      <header className="flex flex-col items-center mb-16 text-center">
        <Image
          className="dark:invert mb-4"
          src="/next.svg"
          alt="Next.js logo"
          width={200}
          height={42}
          priority
        />
        <h1 className="text-5xl font-extrabold mt-4 mb-2 text-gray-800 dark:text-gray-100 leading-tight">Church Fathers Library</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
          A comprehensive collection of works from the early Church Fathers, presented for easy study and reference.
        </p>
      </header>

      <main className="container mx-auto max-w-4xl px-4">
        {/* Check if data is loaded and has works before mapping. */}
        {libraryData && libraryData.works && libraryData.works.length > 0 ? (
          libraryData.works.map((work: any, idx: number) => (
            <Work work={work} key={idx} />
          ))
        ) : (
          <div className="text-center text-2xl text-red-600 dark:text-red-400 p-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            Error: Could not load library data or no works available. Please ensure 'output.json' is correctly formatted.
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 text-center text-gray-500 dark:text-gray-600 text-sm border-t border-gray-200 dark:border-gray-800">
        &copy; {new Date().getFullYear()} Church Fathers Library. All rights reserved.
      </footer>
    </div>
  );
}

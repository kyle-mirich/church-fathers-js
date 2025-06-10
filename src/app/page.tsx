"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import dataJson from "./output.json";
const data: { works: any[] } = dataJson as any;

function HtmlContent({ htmlString }: { htmlString: string }) {
  return <div className="prose dark:prose-invert max-w-none break-words overflow-visible" dangerouslySetInnerHTML={{ __html: htmlString }} />;
}

function FootnoteTooltip({ footnote, isVisible, position }: { 
  footnote: any; 
  isVisible: boolean; 
  position: { x: number; y: number } 
}) {
  if (!isVisible) return null;
  
  return (
    <div 
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 max-w-sm text-sm"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px'
      }}
    >
      <div className="prose dark:prose-invert prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: footnote.text_html }} />
      </div>
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300 dark:border-t-gray-600"></div>
    </div>
  );
}

function Footnote({ footnote }: { footnote: any }) {
  return (
    <li id={`footnote-${footnote.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
      <a href={`#fnref-${footnote.id}`} className="font-bold text-blue-600 hover:text-blue-800 no-underline mr-2">
        {footnote.id}.
      </a>
      <HtmlContent htmlString={footnote.text_html} />
    </li>
  );
}

function ScriptureReference({ reference }: { reference: any }) {
  return (
    <li className="mb-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      <span className="font-semibold">OSIS Ref:</span> {reference.osis_ref} - <span className="font-semibold">Passage:</span> {reference.passage_text}
    </li>
  );
}

// Helper to inject footnote popovers into content_html
function injectFootnotes(contentHtml: string, footnotes: any[]) {
  if (!footnotes || footnotes.length === 0) return contentHtml;
  
  // Build a map for quick lookup
  const footnoteMap = footnotes.reduce((acc: Record<string, any>, fn: any) => {
    acc[fn.id] = fn;
    return acc;
  }, {});
  
  // Replace each <sup class="footnote-ref" data-note-id="X">X</sup> with a hoverable link
  // Use the actual footnote ID as the display number instead of resetting
  return contentHtml.replace(/<sup class=\"footnote-ref\" data-note-id=\"(\d+)\">(\d+)<\/sup>/g, (match, id, number) => {
    const fn = footnoteMap[id];
    if (!fn) return match;
    
    return `
      <a 
        href="#footnote-${id}" 
        id="fnref-${id}" 
        class="footnote-link text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer"
        data-footnote-id="${id}"
        data-footnote-content="${encodeURIComponent(fn.text_html)}"
      >[${id}]</a>
    `;
  });
}

function Chapter({ chapter }: { chapter: any }) {
  const [hoveredFootnote, setHoveredFootnote] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const chapterRef = useRef<HTMLElement>(null);
  
  let contentHtml = chapter.content_html || "";
  contentHtml = injectFootnotes(contentHtml, chapter.footnotes);
  
  // Build footnote map for quick lookup
  const footnoteMap = chapter.footnotes?.reduce((acc: Record<string, any>, fn: any) => {
    acc[fn.id] = fn;
    return acc;
  }, {}) || {};
  
  // Add event listeners for footnote hover
  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('footnote-link')) {
        const footnoteId = target.getAttribute('data-footnote-id');
        if (footnoteId && footnoteMap[footnoteId]) {
          const rect = target.getBoundingClientRect();
          setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top
          });
          setHoveredFootnote(footnoteMap[footnoteId]);
        }
      }
    };
    
    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('footnote-link')) {
        setHoveredFootnote(null);
      }
    };
    
    const chapterElement = chapterRef.current;
    if (chapterElement) {
      chapterElement.addEventListener('mouseenter', handleMouseEnter, true);
      chapterElement.addEventListener('mouseleave', handleMouseLeave, true);
      
      return () => {
        chapterElement.removeEventListener('mouseenter', handleMouseEnter, true);
        chapterElement.removeEventListener('mouseleave', handleMouseLeave, true);
      };
    }
  }, [footnoteMap]);
  
  // Add CSS for footnotes
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced styling for footnote links */
      .footnote-link {
        text-decoration: none;
        color: #3b82f6; /* blue-500 */
        margin: 0 2px;
        padding: 1px 3px;
        border-radius: 3px;
        transition: all 0.2s ease;
        position: relative;
      }
      
      .footnote-link:hover {
        background-color: #dbeafe; /* blue-100 */
        text-decoration: none;
      }
      
      .dark .footnote-link:hover {
        background-color: #1e3a8a; /* blue-900 */
      }
      
      /* Style for the footnotes section */
      .footnotes {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb; /* gray-200 */
        font-size: 0.875rem; /* text-sm */
      }
      
      .footnotes h4 {
        font-size: 1.125rem; /* text-lg */
        font-weight: 600; /* font-semibold */
        margin-bottom: 0.75rem; /* mb-3 */
      }
      
      .footnotes ol {
        list-style-type: decimal;
        padding-left: 1.25rem; /* pl-5 */
      }
      
      .footnotes li {
        margin-bottom: 0.5rem; /* mb-2 */
      }
      
      .footnotes a {
        color: #3b82f6; /* blue-500 */
        text-decoration: none;
      }
      
      .footnotes a:hover {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <>
      <section 
        ref={chapterRef}
        className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-visible"
      >
        <h3 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-400 border-b pb-2 border-blue-200 dark:border-blue-600">
          {chapter.chapter_title}
        </h3>
        
        <HtmlContent htmlString={contentHtml} />
        
        {chapter.footnotes && chapter.footnotes.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Footnotes</h4>
            <ul className="list-none pl-0 text-base">
              {chapter.footnotes.map((fn: any) => (
                <Footnote footnote={fn} key={fn.id} />
              ))}
            </ul>
          </div>
        )}
        
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
      
      <FootnoteTooltip 
        footnote={hoveredFootnote}
        isVisible={!!hoveredFootnote}
        position={tooltipPosition}
      />
    </>
  );
}

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

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-50 dark:bg-gray-900">
      <header className="w-full max-w-5xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-blue-900 dark:text-blue-200 mb-4 drop-shadow-lg">Ante-Nicene Fathers, Vol. 1</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Early Christian Writings with Footnotes &amp; Scripture References</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Hover over footnote markers to view notes instantly. Use dark mode for a comfortable reading experience.</p>
      </header>
      <section className="w-full max-w-5xl mx-auto">
        {data.works && data.works.length > 0 ? (
          data.works.map((work: any, idx: number) => <Work work={work} key={idx} />)
        ) : (
          <div className="italic text-gray-400 text-center py-12 text-xl">No works found in the data.</div>
        )}
      </section>
    </main>
  );
}
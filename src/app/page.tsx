"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import dataJson from "./output.json";
const data: { works: any[] } = dataJson as any;

function Sidebar({ data }: { data: { works: any[] } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [expandedAuthor, setExpandedAuthor] = useState<number | null>(null);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  // New state for TOC collapsible sections
  const [expandedTOCWork, setExpandedTOCWork] = useState<number | null>(null);
  const [expandedTOCPart, setExpandedTOCPart] = useState<string | null>(null);

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false); // Close sidebar on mobile after navigation
    }
  };

  const generateId = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-blue-600 text-white p-2 rounded-md shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 overflow-y-auto`}>
        
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Contents</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTOC(false)}
              className={`px-3 py-1 text-sm rounded ${!showTOC ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Table of Contents
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {showTOC ? (
            // Table of Contents View (formerly Navigation)
            <div>
              {data.works?.map((author: any, authorIdx: number) => {
                const authorId = generateId(author.work_title);
                return (
                  <div key={authorIdx} className="mb-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => scrollToElement(authorId)}
                        onMouseEnter={() => setExpandedAuthor(authorIdx)}
                        className="text-blue-700 dark:text-blue-400 font-semibold hover:text-blue-900 dark:hover:text-blue-200 text-left flex-1 text-sm"
                      >
                        {author.work_title}
                      </button>
                      <button
                        onClick={() => setExpandedAuthor(expandedAuthor === authorIdx ? null : authorIdx)}
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg 
                          className={`w-4 h-4 transform transition-transform ${expandedAuthor === authorIdx ? 'rotate-90' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {expandedAuthor === authorIdx && author.parts?.map((book: any, bookIdx: number) => {
                      const bookId = generateId(`${author.work_title}-${book.part_title}`);
                      const bookKey = `${authorIdx}-${bookIdx}`;
                      return (
                        <div key={bookIdx} className="ml-4 mt-2">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => scrollToElement(bookId)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 text-sm text-left flex-1"
                            >
                              {book.part_title}
                            </button>
                            <button
                              onClick={() => setExpandedBook(expandedBook === bookKey ? null : bookKey)}
                              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <svg 
                                className={`w-3 h-3 transform transition-transform ${expandedBook === bookKey ? 'rotate-90' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                          
                          {expandedBook === bookKey && book.chapters?.map((chapter: any, chapterIdx: number) => {
                            const chapterId = generateId(`${author.work_title}-${book.part_title}-${chapter.chapter_title}`);
                            return (
                              <button
                                key={chapterIdx}
                                onClick={() => scrollToElement(chapterId)}
                                className="block ml-4 mt-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xs text-left w-full truncate"
                              >
                                {chapter.chapter_title}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {data.works?.map((author: any, authorIdx: number) => {
                const authorId = generateId(author.work_title);
                return (
                  <div key={authorIdx} className="mb-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => scrollToElement(authorId)}
                        className="text-blue-700 dark:text-blue-400 font-semibold hover:text-blue-900 dark:hover:text-blue-200 text-left flex-1 text-sm"
                      >
                        {author.work_title}
                      </button>
                      <button
                        onClick={() => setExpandedAuthor(expandedAuthor === authorIdx ? null : authorIdx)}
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg 
                          className={`w-4 h-4 transform transition-transform ${expandedAuthor === authorIdx ? 'rotate-90' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {expandedAuthor === authorIdx && author.parts?.map((book: any, bookIdx: number) => {
                      const bookId = generateId(`${author.work_title}-${book.part_title}`);
                      const bookKey = `${authorIdx}-${bookIdx}`;
                      return (
                        <div key={bookIdx} className="ml-4 mt-2">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => scrollToElement(bookId)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 text-sm text-left flex-1"
                            >
                              {book.part_title}
                            </button>
                            <button
                              onClick={() => setExpandedBook(expandedBook === bookKey ? null : bookKey)}
                              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <svg 
                                className={`w-3 h-3 transform transition-transform ${expandedBook === bookKey ? 'rotate-90' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                          
                          {expandedBook === bookKey && book.chapters?.map((chapter: any, chapterIdx: number) => {
                            const chapterId = generateId(`${author.work_title}-${book.part_title}-${chapter.chapter_title}`);
                            return (
                              <button
                                key={chapterIdx}
                                onClick={() => scrollToElement(chapterId)}
                                className="block ml-4 mt-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xs text-left w-full truncate"
                              >
                                {chapter.chapter_title}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

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

function Chapter({ chapter, workTitle, partTitle }: { chapter: any; workTitle: string; partTitle: string }) {
  const [hoveredFootnote, setHoveredFootnote] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const chapterRef = useRef<HTMLElement>(null);
  
  const generateId = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };
  
  const chapterId = generateId(`${workTitle}-${partTitle}-${chapter.chapter_title}`);
  
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
        id={chapterId}
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

function Part({ part, workTitle }: { part: any; workTitle: string }) {
  const generateId = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };
  
  const partId = generateId(`${workTitle}-${part.part_title}`);
  
  return (
    <article className="mb-12">
      <h2 id={partId} className="text-3xl font-bold mb-8 text-indigo-800 dark:text-indigo-300 border-b-2 pb-3 border-indigo-300 dark:border-indigo-600">
        {part.part_title}
      </h2>
      {part.chapters && part.chapters.length > 0 ? (
        part.chapters.map((chapter: any, idx: number) => (
          <Chapter chapter={chapter} workTitle={workTitle} partTitle={part.part_title} key={idx} />
        ))
      ) : (
        <div className="italic text-gray-400 text-center py-4">No chapters available for this part.</div>
      )}
    </article>
  );
}

function Work({ work }: { work: any }) {
  const generateId = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };
  
  const workId = generateId(work.work_title);
  
  return (
    <article className="mb-16 border-b-4 pb-12 border-blue-300 dark:border-blue-700 last:border-b-0">
      <h2 id={workId} className="text-4xl font-extrabold mb-8 text-blue-800 dark:text-blue-300 border-b-4 pb-4 border-blue-400 dark:border-blue-600">
        {work.work_title}
      </h2>
      {work.parts && work.parts.length > 0 ? (
        work.parts.map((part: any, idx: number) => <Part part={part} workTitle={work.work_title} key={idx} />)
      ) : (
        <div className="italic text-gray-400 text-center py-6 text-lg">No parts available for this work.</div>
      )}
    </article>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar data={data} />
      
      <main className="flex-1 lg:ml-80 transition-all duration-300">
        <div className="p-8 pt-16 lg:pt-8">
          <header className="w-full max-w-5xl mx-auto mb-12 text-center">
            <h1 className="text-5xl font-extrabold text-blue-900 dark:text-blue-200 mb-4 drop-shadow-lg">Ante-Nicene Fathers, Vol. 1</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Early Christian Writings with Footnotes &amp; Scripture References</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Hover over footnote markers to view notes instantly. Use the sidebar to navigate. Use dark mode for a comfortable reading experience.</p>
          </header>
          <section className="w-full max-w-5xl mx-auto">
            {data.works && data.works.length > 0 ? (
              data.works.map((work: any, idx: number) => <Work work={work} key={idx} />)
            ) : (
              <div className="italic text-gray-400 text-center py-12 text-xl">No works found in the data.</div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
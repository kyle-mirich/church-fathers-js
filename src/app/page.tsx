"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import dataJson from "./output.json";
const data: { works: any[] } = dataJson as any;

// A unique ID generator for DOM elements
const generateId = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};


// --- Sidebar Component ---
// Improved with cleaner state and better mobile defaults.

function Sidebar({ data }: { data: { works: any[] } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedWork, setExpandedWork] = useState<number | null>(null);
  const [expandedPart, setExpandedPart] = useState<string | null>(null);

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Automatically close the sidebar on mobile after navigation
      setIsOpen(false); 
    }
  };

  const NavItem = ({ children, onClick, level }: { children: React.ReactNode; onClick: () => void; level: 1 | 2 | 3 }) => {
    const levelStyles = {
      1: "text-blue-700 dark:text-blue-400 font-semibold text-base",
      2: "text-indigo-600 dark:text-indigo-400 text-sm pl-4",
      3: "text-gray-600 dark:text-gray-400 text-xs pl-8 truncate",
    };
    return (
      <button
        onClick={onClick}
        className={`block text-left w-full py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${levelStyles[level]}`}
      >
        {children}
      </button>
    );
  };

  const CollapsibleIcon = ({ isExpanded }: { isExpanded: boolean }) => (
    <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
      <svg
        className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );

  return (
    <>
      {/* Mobile "Hamburger" Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-blue-600 text-white p-2 rounded-md shadow-lg"
        aria-label="Open navigation menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar Panel */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl z-[60] transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 overflow-y-auto`}>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Contents</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
              aria-label="Close navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="p-4">
          {data.works?.map((work, workIdx) => {
            const workId = generateId(work.work_title);
            const isWorkExpanded = expandedWork === workIdx;
            return (
              <div key={workIdx} className="mb-2">
                <div className="flex items-center justify-between">
                  <NavItem level={1} onClick={() => scrollToElement(workId)}>{work.work_title}</NavItem>
                  <div onClick={() => setExpandedWork(isWorkExpanded ? null : workIdx)}>
                    <CollapsibleIcon isExpanded={isWorkExpanded} />
                  </div>
                </div>
                
                {isWorkExpanded && work.parts?.map((part, partIdx) => {
                  const partId = generateId(`${work.work_title}-${part.part_title}`);
                  const partKey = `${workIdx}-${partIdx}`;
                  const isPartExpanded = expandedPart === partKey;
                  return (
                    <div key={partKey} className="mt-1">
                      <div className="flex items-center justify-between">
                        <NavItem level={2} onClick={() => scrollToElement(partId)}>{part.part_title}</NavItem>
                        <div onClick={() => setExpandedPart(isPartExpanded ? null : partKey)}>
                          <CollapsibleIcon isExpanded={isPartExpanded} />
                        </div>
                      </div>
                      
                      {isPartExpanded && part.chapters?.map((chapter, chapterIdx) => {
                        const chapterId = generateId(`${work.work_title}-${part.part_title}-${chapter.chapter_title}`);
                        return (
                          <NavItem key={chapterIdx} level={3} onClick={() => scrollToElement(chapterId)}>
                            {chapter.chapter_title}
                          </NavItem>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile view */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}


// --- Content Components ---

function HtmlContent({ htmlString }: { htmlString: string }) {
  return <div className="prose dark:prose-invert max-w-none break-words" dangerouslySetInnerHTML={{ __html: htmlString }} />;
}

// Replaces footnote references with interactive, clickable links.
function injectInteractiveFootnotes(contentHtml: string) {
  if (!contentHtml) return "";
  return contentHtml.replace(/<sup class=\"footnote-ref\" data-note-id=\"(\d+)\">(\d+)<\/sup>/g, (match, id) => {
    return `
      <a 
        href="#footnote-${id}" 
        id="fnref-${id}" 
        class="footnote-link text-blue-600 dark:text-blue-400 no-underline font-semibold cursor-pointer px-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
        data-footnote-id="${id}"
      >[${id}]</a>
    `;
  });
}

// --- Footnote System (Click-based) ---

const FootnoteTooltip = forwardRef<HTMLDivElement, {
  footnote: any;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}>(({ footnote, isVisible, position, onClose }, ref) => {
  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl p-4 max-w-xs sm:max-w-sm text-sm"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)', // Position above the link
        marginTop: '-10px'
      }}
    >
      <div className="prose dark:prose-invert prose-sm max-w-none mb-3" dangerouslySetInnerHTML={{ __html: footnote.text_html }} />
      <div className="flex justify-end items-center border-t border-gray-200 dark:border-gray-700 pt-2">
         <button onClick={onClose} className="text-xs font-bold py-1 px-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
           CLOSE
         </button>
      </div>
    </div>
  );
});
FootnoteTooltip.displayName = 'FootnoteTooltip';


function Footnote({ footnote }: { footnote: any }) {
  return (
    <li id={`footnote-${footnote.id}`} className="mb-3 text-gray-700 dark:text-gray-300 target:bg-yellow-100 dark:target:bg-yellow-900/50 p-2 rounded-md">
      <a href={`#fnref-${footnote.id}`} className="font-bold text-blue-600 hover:text-blue-800 no-underline mr-2">
        {footnote.id}.
      </a>
      <HtmlContent htmlString={footnote.text_html} />
    </li>
  );
}


function Chapter({ chapter, workTitle, partTitle }: { chapter: any; workTitle: string; partTitle: string }) {
  const [activeFootnote, setActiveFootnote] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const chapterRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const chapterId = generateId(`${workTitle}-${partTitle}-${chapter.chapter_title}`);
  const contentHtml = injectInteractiveFootnotes(chapter.content_html);
  
  const footnoteMap = chapter.footnotes?.reduce((acc: Record<string, any>, fn: any) => {
    acc[fn.id] = fn;
    return acc;
  }, {}) || {};

  // Handle opening and closing of footnote tooltips
  useEffect(() => {
    const chapterElement = chapterRef.current;
    if (!chapterElement) return;

    // --- Open Tooltip on Link Click (Event Delegation) ---
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.footnote-link');
      if (!target) return;
      
      e.preventDefault();
      const footnoteId = target.getAttribute('data-footnote-id');

      // If clicking the link of an already active tooltip, close it
      if (activeFootnote && activeFootnote.id === footnoteId) {
        setActiveFootnote(null);
        return;
      }

      if (footnoteId && footnoteMap[footnoteId]) {
        const rect = target.getBoundingClientRect();
        setTooltipPosition({
          x: rect.left + rect.width / 2, // Center horizontally
          y: rect.top, // Position above the element
        });
        setActiveFootnote(footnoteMap[footnoteId]);
      }
    };
    
    // --- Close Tooltip on Outside Click ---
    const handleOutsideClick = (e: MouseEvent) => {
        if (!activeFootnote) return;
        if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node) && !(e.target as HTMLElement).closest('.footnote-link')) {
            setActiveFootnote(null);
        }
    };
    
    chapterElement.addEventListener('click', handleLinkClick);
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      chapterElement.removeEventListener('click', handleLinkClick);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeFootnote, footnoteMap]);


  return (
    <>
      <section ref={chapterRef} id={chapterId} className="mb-10 p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl md:text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-400 border-b pb-2 border-blue-200 dark:border-blue-600">
          {chapter.chapter_title}
        </h3>
        
        <HtmlContent htmlString={contentHtml} />
        
        {chapter.footnotes?.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-lg md:text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Footnotes</h4>
            <ol className="list-none pl-0 text-base">
              {chapter.footnotes.map((fn: any) => <Footnote footnote={fn} key={fn.id} />)}
            </ol>
          </div>
        )}
      </section>
      
      <FootnoteTooltip
        ref={tooltipRef}
        footnote={activeFootnote}
        isVisible={!!activeFootnote}
        position={tooltipPosition}
        onClose={() => setActiveFootnote(null)}
      />
    </>
  );
}

function Part({ part, workTitle }: { part: any; workTitle: string }) {
  const partId = generateId(`${workTitle}-${part.part_title}`);
  return (
    <div className="mb-12">
      <h2 id={partId} className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-indigo-800 dark:text-indigo-300 border-b-2 pb-3 border-indigo-300 dark:border-indigo-600">
        {part.part_title}
      </h2>
      {part.chapters?.length > 0 ? (
        part.chapters.map((chapter: any, idx: number) => (
          <Chapter chapter={chapter} workTitle={workTitle} partTitle={part.part_title} key={idx} />
        ))
      ) : (
        <p className="italic text-gray-400 text-center py-4">No chapters available.</p>
      )}
    </div>
  );
}

function Work({ work }: { work: any }) {
  const workId = generateId(work.work_title);
  return (
    <article className="mb-16 border-b-4 pb-12 border-blue-300 dark:border-blue-700 last:border-b-0">
      <h2 id={workId} className="text-3xl md:text-4xl font-extrabold mb-8 text-blue-800 dark:text-blue-300 border-b-4 pb-4 border-blue-400 dark:border-blue-600">
        {work.work_title}
      </h2>
      {work.parts?.length > 0 ? (
        work.parts.map((part: any, idx: number) => <Part part={part} workTitle={work.work_title} key={idx} />)
      ) : (
        <p className="italic text-gray-400 text-center py-6 text-lg">No parts available for this work.</p>
      )}
    </article>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar data={data} />
      
      <main className="flex-1 lg:ml-72 transition-all duration-300">
        <div className="p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
          <header className="w-full max-w-4xl mx-auto mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 dark:text-blue-200 mb-4">Ante-Nicene Fathers, Vol. 1</h1>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-2">Early Christian Writings</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Click footnote numbers like [1] to view notes. Use the sidebar to navigate.</p>
          </header>
          
          <section className="w-full max-w-4xl mx-auto">
            {data.works?.length > 0 ? (
              data.works.map((work: any, idx: number) => <Work work={work} key={idx} />)
            ) : (
              <p className="italic text-gray-400 text-center py-12 text-xl">No works found in the data.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
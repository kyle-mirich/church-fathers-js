import SimpleReader from "./simple-reader"

// Type your data structure (adjust based on your actual JSON structure)
interface Chapter {
  chapter_title: string
  content_html: string
  footnotes?: Array<{
    id: string
    text_html: string
  }>
}

interface Part {
  part_title: string
  chapters: Chapter[]
}

interface Work {
  work_title: string
  parts: Part[]
}

interface ReaderData {
  works: Work[]
}

export default function Page() {
  return <SimpleReader data={{ works: [] }} />
}

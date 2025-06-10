import ModernReader from "../modern-reader"
import dataJson from "../output.json"

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
  // Cast your imported JSON to the expected type
  const data = dataJson as ReaderData

  return <ModernReader data={data} />
}

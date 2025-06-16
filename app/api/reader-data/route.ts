import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// API route to serve your JSON data
export async function GET() {
  try {
    // Read your JSON file from the file system
    const filePath = path.join(process.cwd(), "data", "output.json")
    const fileContents = fs.readFileSync(filePath, "utf8")
    const data = JSON.parse(fileContents)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error loading data:", error)
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 })
  }
}

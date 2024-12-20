import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  console.log('console log to check, if this route is being hit or not')
  const filename = params.filename; // Capture dynamic filename parameter
  console.log(`Fetching file: ${filename}`);

  const filePath = path.join(process.cwd(), 'output', filename); // Ensure correct path

  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    });
  } catch (error) {
    console.error(`Error fetching file: ${filename}`, error);
    return new NextResponse('File not found', { status: 404 });
  }
}
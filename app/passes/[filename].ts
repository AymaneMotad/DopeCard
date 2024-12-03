import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  const filename = params.filename; // Capture dynamic filename parameter
  console.log(`Fetching file: ${filename}`);

  const filePath = path.join(process.cwd(), 'output', filename); // Ensure correct path

  try {
    const file = fs.readFileSync(filePath);
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



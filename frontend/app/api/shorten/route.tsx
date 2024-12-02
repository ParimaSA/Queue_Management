import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { url }: { url: string } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }
    
    const response = await axios.post(
      'https://api.tinyurl.com/create',
      {
        url, 
        description: "string"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TINYURL_API_KEY}`,
        }
      }
    );
    return NextResponse.json({ shortUrl: response.data.data.tiny_url });
  } catch (error: any) {
    console.error('Error shortening URL:', error.message);
    return NextResponse.json(
      { error: 'Failed to shorten URL' },
      { status: 500 }
    );
  }
}

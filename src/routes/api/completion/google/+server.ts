import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY || '');

export const POST = (async ({ request }) => {
  // Extract the `prompt` from the body of the request
  const { prompt } = await req.json();

  // Ask Google Generative AI for a streaming completion given the prompt
  const response = await genAI
    .getGenerativeModel({ model: 'gemini-pro' })
    .generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

  // Convert the response into a friendly text-stream
  const stream = GoogleGenerativeAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}) satisfies RequestHandler;





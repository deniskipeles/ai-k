import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit =
	process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
		? new Ratelimit({
				redis: new Redis({
					url: process.env.KV_REST_API_URL,
					token: process.env.KV_REST_API_TOKEN,
				}),
				limiter: Ratelimit.slidingWindow(10, "5 m"),
				analytics: true,
		  })
		: false;

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY ?? '');

export const POST = (async ({ request }) => {
  if (ratelimit) {
		let ip  = request.headers.get('x-forwarded-for') ?? request.headers.get('host') ?? request?.socket?.remoteAddress ?? request.headers.get("x-real-ip") ?? "local";
		ip = (ip?.split(":"))[0]
    
		const rl = await ratelimit.limit(ip);

		if (!rl.success) {
			return new Response("Rate limit exceeded", { status: 429 });
		}
	}
  // Extract the `prompt` from the body of the request
  const { prompt,context } = await request.json();

  // Ask Google Generative AI for a streaming completion given the prompt
  const text= (context && context.length>0) ? `Prompt::: ${prompt}\nText::: ${context}` : prompt;
  const response = await genAI
    .getGenerativeModel({ model: 'gemini-pro' })
    .generateContentStream({
      contents: [{ role: 'user', parts: [{ text }] }],
    });

  // Convert the response into a friendly text-stream
  const stream = GoogleGenerativeAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}) satisfies RequestHandler;





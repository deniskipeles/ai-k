import { createOpenAI } from '@ai-sdk/openai';
import { StreamData, StreamingTextResponse, streamText } from 'ai';

import { env } from '$env/dynamic/private';
// You may want to replace the above with a static private env variable
// for dead-code elimination and build-time type-checking:
// import { OPENAI_API_KEY } from '$env/static/private'

import type { RequestHandler } from './$types';

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit =
	process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
		? new Ratelimit({
				redis: new Redis({
					url: process.env.KV_REST_API_URL,
					token: process.env.KV_REST_API_TOKEN,
				}),
				limiter: Ratelimit.slidingWindow(50, "5 m"),
				analytics: true,
		  })
		: false;

// Create an OpenAI Provider instance
const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY ?? '',
  baseURL: "https://api.groq.com/openai/v1",
});

export const POST = (async ({ request }) => {
  if (ratelimit) {
		let ip  = request.headers.get('referer') ?? request.headers.get('origin');
		ip = ip ? new URL(ip).hostname : (request.headers.get("x-real-ip") ?? "local");
		
		const rl = await ratelimit.limit(`${ip}-groq`);

		if (!rl.success) {
			return new Response("Rate limit exceeded", { status: 429 });
		}
	}
  // Extract the `prompt` from the body of the request
  const { prompt,context } = await request.json();

  // Ask OpenAI for a streaming chat completion given the prompt
  const text= (context && context.length>0) ? `Prompt::: ${prompt}\nText::: ${context}` : prompt;
  const result = await streamText({
    model: openai('llama3-8b-8192'),
    system: context ? "You are a professinal school guider. You will be given a prompt and a context to refererence, which may be empty or incomplete. Try your best to answer the prompt, and only respond with well styled markdown such that when previewed it looks good and wrap latex with double dollar signs $$latex code$$ do not use other delimiters in latex. If you modify the context make sure to flesh it up. Do not include the prompt or otherwise preface your response. Do not enclose the response in quotes." : "",
    prompt,
  });

  // optional: use stream data
  const data = new StreamData();

  data.append({ test: 'value' });

  // Convert the response into a friendly text-stream
  const stream = result.toAIStream({
    onFinal(completion) {
      data.close();
    },
  });

  // Respond with the stream
  return new StreamingTextResponse(stream, {}, data);
}) satisfies RequestHandler;
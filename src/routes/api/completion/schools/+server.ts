import { createOpenAI } from '@ai-sdk/openai';
import { GoogleGenerativeAI, GoogleGenerativeAIStream } from '@google/generative-ai';
import { StreamData, StreamingTextResponse, streamText } from 'ai';
import { env } from '$env/dynamic/private';
// You may want to replace the above with a static private env variable
// for dead-code elimination and build-time type-checking:
// import { OPENAI_API_KEY, GOOGLE_API_KEY, KV_REST_API_URL, KV_REST_API_TOKEN } from '$env/static/private'

import type { RequestHandler } from './$types';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit =
  env.KV_REST_API_URL && env.KV_REST_API_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: env.KV_REST_API_URL,
          token: env.KV_REST_API_TOKEN,
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
const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY ?? '');

export const POST = (async ({ request }) => {
  try {
    if (ratelimit) {
      let ip = request.headers.get('referer') ?? request.headers.get('origin');
      ip = ip ? new URL(ip).hostname : (request.headers.get("x-real-ip") ?? "local");

      const rl = await ratelimit.limit(`${ip}-school`);

      if (!rl.success) {
        return new Response("Rate limit exceeded", { status: 429 });
      }
    }

    // Extract the `prompt`, `context`, and `systemPrompt` from the body of the request
    const { prompt, context, systemPrompt } = await request.json();

    // Construct the text based on the context
    const text = (context && context.length > 0) ? `<prompt>${prompt}</prompt>\n<context>${context}</context>` : prompt;
    const context_len = context&&systemPrompt ? (context+systemPrompt).length : (context ? context.length :(systemPrompt ? systemPrompt.length : 0));

    if (context_len < 16000) {
      const result = await streamText({
        model: openai('mixtral-8x7b-32768'),
        system: `You are a professional school guider. Answer the prompt in well-styled markdown. Wrap all LaTeX code with double dollar signs $$...$$. For TikZ, use $$continuous TikZ code$$ or \`\`\`tikz\n$$TikZ code$$\`\`\` for multiline. Rewrite all rows if tabular data is given. For images, use <img src='link' height='100px' width='100px'/>. If asked to watermark with an imageLink, wrap response in <div style='background-image:url(imageLink);background-size:contain;background-position:center;background-repeat:no-repeat;height:100vh;width:100vw;position:absolute;top:0;left:0;z-index:-1;opacity:0.5;'>markdown content here</div>.Do not include the prompt or otherwise preface your response.` + (systemPrompt ? `<others>${systemPrompt}</others>` : ""),
        prompt: text,
      });

      // Optional: use stream data
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
    } else {
      const response = await genAI
        .getGenerativeModel({ model: 'gemini-pro' })
        .generateContentStream({
          contents: [
            { role: 'user', parts: [{ text }] }
          ],
        });

      // Convert the response into a friendly text-stream
      const stream = GoogleGenerativeAIStream(response);

      // Respond with the stream
      return new StreamingTextResponse(stream);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}) satisfies RequestHandler;

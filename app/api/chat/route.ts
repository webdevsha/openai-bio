import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client (that's edge-friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
  const { vibe, bio, input } = await req.json(); // Include 'input' in the destructuring

  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'user',
        content: `List 14 ${vibe} tweet ideas for 2 weeks (7 each week) with a topic title and tweets based on the product ${input} and clearly labeled "1." and "2.". ${
          vibe === 'Funny'
            ? "Make sure there is a joke in there and it's a little ridiculous."
            : null
        }
          Make sure each generated content is more than 150 characters, has simple sentences that are used by top creators and sellers on Twitter, and base them on this context: ${bio}${
          bio.slice(-1) === '.' ? '' : '.'
        }`,
      },
    ],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}

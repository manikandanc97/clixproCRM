import { streamText, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const googleAi = createGoogleGenerativeAI({
  apiKey: 'dummy'
});

async function test() {
  console.log("Keys of streamText result:");
  try {
    const result = streamText({
      model: googleAi('gemini-2.5-flash'),
      prompt: 'hi'
    });
    console.log(Object.keys(result));
    console.log("Does toDataStreamResponse exist?", typeof result.toDataStreamResponse);
    console.log("Does stream exist?", typeof result.stream);
    console.log("Does fullStream exist?", typeof result.fullStream);
  } catch (e) {
    console.error(e);
  }
}
test();

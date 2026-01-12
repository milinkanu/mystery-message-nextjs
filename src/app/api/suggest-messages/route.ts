import { mistral } from '@ai-sdk/mistral';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Check for API Key
    // Check for API Key
    if (!process.env.MISTRAL_API_KEY) {
      console.warn('MISTRAL_API_KEY is not defined. Using fallback messages.');
      return new Response(getFallbackMessages());
    }

    console.log("Using Mistral AI for suggestions");

    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. Ensure the output is strictly the questions separated by '||', with no intro or outro text.";

    try {
      const { text } = await generateText({
        model: mistral('mistral-small-latest'),
        prompt,
        temperature: 0.8,
      });
      return new Response(text);
    } catch (apiError: any) {
      console.error("Mistral API Error details:", apiError);
      // Check specifically for quota or billing errors to switch to fallback
      if (apiError?.name === 'AI_APICallError' || apiError?.message?.includes('insufficient_quota')) {
        console.error('Mistral API Error (Quota/Billing). Switching to fallback messages.');
        return new Response(getFallbackMessages());
      }
      throw apiError; // Re-throw other errors
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('An unexpected error occurred:', error.message);
    } else {
      console.error('An unexpected error occurred:', error);
    }

    return NextResponse.json(
      { message: 'Internal Server Error', error: String(error) },
      { status: 500 }
    );
  }
}

function getFallbackMessages(): string {
  const fallbackSets = [
    "What's a hobby you've always wanted to pick up?||If you could have dinner with any historical figure, who would it be?||What's the best piece of advice you've ever received?",
    "What's your favorite way to spend a weekend?||If you could travel anywhere right now, where would you go?||What's a movie you can watch over and over again?",
    "What's a talent you wish you had?||What's the most interesting thing you've read recently?||If you could live in any fictional world, which one would it be?"
  ];
  // Return a random set of messages
  return fallbackSets[Math.floor(Math.random() * fallbackSets.length)];
}

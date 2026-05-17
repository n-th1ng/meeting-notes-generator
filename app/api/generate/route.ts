import { NextRequest, NextResponse } from 'next/server';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'sk-cp-BWsocdbi6Ge7f4-bArnQtQX4TscgcMp48RsnRzywTV5J0j1H3d-jG96YZnSnzRNjB58tP9q76ImQhrLw7RpbP_AgA-tqQmGcEOed_zXQUhhca2Eq2hxC_OU';
const MINIMAX_API_URL = 'https://api.minimax.io/v1/chat/completions';

const PROMPTS = {
  markdown: `You are a meeting notes analyst. Analyze the following transcript and create structured markdown notes with:

## Summary
A brief 2-3 sentence overview of the meeting.

## Key Decisions
List all decisions made during the meeting.

## Action Items
List all action items with who is responsible if mentioned.

## Speaker Contributions
Analyze what each speaker contributed if speaker names are present.

Format your response in clean markdown. Be concise but comprehensive.

TRANSCRIPT:
`,
  bullets: `You are a meeting notes analyst. Analyze the following transcript and create bullet-point notes:

• SUMMARY: 2-3 sentence overview
• DECISIONS: All decisions made (use ✓ for confirmed decisions)
• ACTIONS: All action items with assignee if available
• SPEAKERS: What each person contributed

Keep bullets concise and scannable.

TRANSCRIPT:
`,
  executive: `You are a meeting notes analyst. Create an executive summary of the following transcript:

EXECUTIVE SUMMARY:
[2-3 paragraph overview of the meeting purpose, outcomes, and next steps]

KEY OUTCOMES:
• [Outcome 1]
• [Outcome 2]
• [Outcome 3]

IMMEDIATE ACTIONS:
1. [Action 1 - Owner]
2. [Action 2 - Owner]

STRATEGIC INSIGHTS:
[Any important strategic points discussed]

Keep it professional and concise.

TRANSCRIPT:
`,
};

export async function POST(req: NextRequest) {
  try {
    const { transcript, format } = await req.json();
    
    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const promptTemplate = PROMPTS[format as keyof typeof PROMPTS] || PROMPTS.markdown;
    const fullPrompt = `${promptTemplate}${transcript}`;

    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('MiniMax API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to generate notes', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || 'No output generated';

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in generate API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
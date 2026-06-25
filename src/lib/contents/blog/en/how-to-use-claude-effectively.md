---
title: "How to Actually Use Claude | 18 Techniques Most People Don't Know"
date: "2026-06-25"
description: "Most people using Claude every day are only getting 10% of what it can do. From Projects setup to using it as a thinking partner, here's how to use Claude in a way that actually changes how you work."
ctaTool: "audio-to-text"
---

If you use Claude regularly but still feel like it's underwhelming, the problem probably isn't Claude.

It's been out for over two years, and most daily users are still treating it like a slightly smarter search engine. Type a question, wait for an answer, move on. That's the lowest-value way to use it — and it only scratches about 10% of what Claude can actually do.

Here's what the other 90% looks like.

---

## Start Here: Use Projects, Not Just Chats

Every time you open a new Claude chat, it starts from zero. It doesn't know your name, your job, your communication preferences, or what you're working on. You either spend the first few messages re-explaining yourself, or you don't — and get a generic answer that doesn't quite fit.

**Projects** fix this. A Project is a persistent workspace where Claude keeps context across every conversation inside it. Set it up once, and every session that follows starts with Claude already knowing who you are.

Click Projects in the sidebar, create a new one, and name it something like "Work" or "Personal." Everything else in this article goes inside that Project.

---

## Tell Claude Who You Are

Once your Project is set up, the first thing to do is introduce yourself. Most people skip this entirely and then wonder why answers always feel slightly off.

Paste this template into your Project's knowledge base and fill it in honestly. The more specific you are, the better every single response becomes.

```
My name is [your name].
I work as [your role]. My main responsibilities are [2–3 things you actually do].
My biggest goals right now: [1–3 specific goals].
I use Claude mainly for: [writing, research, analysis, coding, etc].
My background and knowledge level: [what you know well, what you're still learning].
How I like to receive information: [concise / detailed with examples / step-by-step / no bullet points].
Things I don't want: [no disclaimers, don't restate my question, no "Great question!" openers].
Topics and areas I care about: [your industry, interests, niche].
```

Then use this prompt to turn it into proper Custom Instructions:

```
Based on everything I've told you about myself, write me a set of custom instructions for this Claude Project.

Include:
- Who I am and what I do
- My default communication style and format
- What Claude should never do when working with me
- The tone I want in every response
- Any default behaviors I'd want applied every session

Write in second person, as if Claude is reading its own rules. Be specific. No generic advice. Under 400 words.
```

Paste the output into your Project Instructions. That's now Claude's permanent operating mode for every conversation in this Project.

---

## How You Should Actually Be Using Claude

### Stop Using It Like a Search Engine

Most people type a question and wait for an answer. This is the lowest-value way to use Claude, and it cuts its usefulness by 80%.

Claude isn't a retrieval tool. It's a thinking partner. It reasons, synthesizes, argues, and builds on context. The moment you treat it like Google, you miss everything that makes it genuinely useful.

**❌ Don't do this:** "What is prompt caching?"

**✅ Do this instead:** "I'm building a workflow that calls Claude around 20 times per session. Walk me through how prompt caching works and whether it would actually reduce my costs in that context."

The second prompt gives Claude a problem to solve with you. The first just asks for a definition.

### Make Claude Ask You Questions First

Almost nobody does this, but it's one of the highest-impact techniques you can use. Before Claude starts any complex task, tell it to gather information from you first.

When Claude asks questions before starting, the output is dramatically better because it's built on the right foundation. Without this step, Claude makes assumptions — and you spend time fixing things that could have been right the first time.

```
Before you start, ask me the 5 most important questions that would help you do this well.
After I answer, then begin.
```

---

## What Regular Users Don't Know

### Clone Your Writing Style

When Claude writes without examples, it writes in its own voice. Grammatically fine, tonally wrong. It sounds like AI because it is.

Give it 3–5 samples of your actual writing and ask it to analyze your patterns — not just describe your style, but pull apart the specific things that make your writing yours. After that, it writes like you.

```
Here are 3 examples of my writing:

[sample 1]
[sample 2]
[sample 3]

Analyze my writing style in detail. Look at sentence length, rhythm, vocabulary, how I open and close paragraphs, what I avoid, formality level, and any patterns that make my writing distinct.

After this, whenever I ask you to write something, match this style exactly. Don't default back to your own patterns.
```

### Use Claude as a Sparring Partner

Ask Claude to help with an idea and it'll build on it, agree with it, expand it. That's useful sometimes. But it's not how you stress-test something.

Before committing to any plan, decision, or piece of writing, tell Claude to attack it — not critique it. The difference matters.

```
Here's my plan: [describe it]

Your job is to destroy it. Find every assumption I'm making that could be wrong. Find every way this could fail. Argue the opposite position as hard as you can. Don't be polite. Don't qualify. Just attack.

Then steelman my position — build the strongest possible case for why I'm right.

Then tell me what you actually think.
```

### Turn On Extended Thinking

Most Claude users have never touched this. Extended Thinking is a mode where Claude reasons through a problem step by step before giving you an answer, instead of pattern-matching its way to a response.

For simple tasks, skip it. For complex decisions, analysis, or any question where you want real reasoning rather than a fast guess, turn it on.

Click the brain icon before sending, or add this to your prompt:

```
Think through this carefully before responding.
Work through the problem step by step, show your reasoning, flag where you're uncertain, then give me your conclusion.
```

The quality difference on hard questions is significant.

### Let Claude Write Your Prompts

This is the most underused thing you can do. If you're not sure how to prompt Claude for a specific task, just ask Claude to write the prompt for you.

```
I need Claude to help me [describe the actual task].
Write the best possible prompt for this.
Include role, context, format instructions, and any constraints that would improve the output.
Then use that prompt immediately.
```

---

## How to Get More While Spending Fewer Tokens

### Specify Output Length Upfront

Claude's default is to write as much as it thinks is appropriate — usually more than you need. More tokens, more time reading, more noise.

Tell it exactly how long you want before it starts.

```
Answer in 3 sentences maximum.
```
```
Give me 5 bullet points. No explanations. Just the points.
```
```
Keep this under 150 words.
```

This one instruction cuts token usage by 40–60% on most tasks without losing anything you actually need.

### Kill the Preamble

Claude defaults to starting with things you didn't ask for. "Great question! Let me break this down." Or a full restatement of what you just said. Or a disclaimer. Or a closing summary that repeats everything it just told you.

None of that was requested. It wastes tokens and your reading time.

Add this to your Custom Instructions:

```
Never start responses with preamble, affirmations, or restatements of my question.
Go directly to the answer.
Don't add a summary at the end unless I ask for one.
No disclaimers unless the topic genuinely requires one.
```

### Start a New Chat When You Switch Topics

Claude carries the full context of everything said earlier in a conversation. Switch topics inside a long chat and all that previous context is still loaded — meaning more tokens per response, slower processing, and earlier conversation bleed affecting your new topic.

When you move to something unrelated, open a new chat inside your Project. You keep the Project memory. You drop the irrelevant baggage.

---

## The Point of All This

Claude isn't smarter than you. It doesn't have better ideas than you. What it has is infinite patience, broad knowledge, and the ability to think through problems from angles you haven't considered.

The people who get the most from Claude aren't the ones with the best questions. They're the ones who've set it up to actually understand them, who give it real context, and who use it as a partner rather than a vending machine.

Set it up once. Change how you work permanently.

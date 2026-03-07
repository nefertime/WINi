---
description: Synthesize a structured prompt from vague input, then execute it
allowed-tools: Read
---

# Synthesize Prompt

Takes your free-text description and transforms it into Prompt DNA format before acting.

## Process
1. Read the provided description
2. Ask ≤2 clarifying questions if critical info is missing (stack, scope, output format)
3. Output a structured prompt (GOAL / CONTEXT / CONSTRAINTS / DELIVERABLE / ACCEPTANCE / NON-GOALS)
4. Proceed immediately using the synthesized prompt — tell the user to "reply to adjust any field"

## When to Use
- Before starting a complex multi-day feature
- When you have a rough idea but want constraints made explicit
- When briefing Claude on a new problem domain
- When writing a business case or strategy document
- When requirements feel fuzzy or underspecified

## Output Format

```
SYNTHESIZED PROMPT:
GOAL: [specific outcome + success criteria]
CONTEXT: [current state, domain, what exists]
CONSTRAINTS: [stack, patterns, what NOT to do]
DELIVERABLE: [exact format and scope]
ACCEPTANCE: [measurable: how you'll know it's done]
NON-GOALS: [explicit out-of-scope]

Proceeding with this synthesized prompt. Reply to adjust any field.
```

## Example

Input: "help me think through my SaaS pricing"

Output:
```
SYNTHESIZED PROMPT:
GOAL: Recommend a 3-tier pricing architecture that enables self-serve adoption and has an upsell path.
CONTEXT: B2B SaaS, early-stage, targeting [segment], current price: [if any].
CONSTRAINTS: Must include expansion revenue mechanism. No enterprise custom pricing yet. EU market.
DELIVERABLE: Pricing table (Good/Better/Best) with per-tier features, price points, target customer, upsell trigger.
ACCEPTANCE: Each tier has price + 3-5 features + why a customer chooses this tier over adjacent.
NON-GOALS: Billing system implementation, enterprise negotiation playbook.

Proceeding with this synthesized prompt. Reply to adjust any field.
```

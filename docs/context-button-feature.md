# Context Button — Interview Page

## What It Is

The **Context** button appears in the top-right toolbar of the interview page (`/interview/:planId`). It displays a Building icon and the label "Context" (desktop) or just the icon (mobile).

## What It Does

When clicked, it reveals the **Profile Context Panel** — a green expandable banner at the top of the question area. This panel shows which questionnaire questions were **automatically answered from the organization profile** collected during onboarding.

### Panel Contents

- **Summary line**: "X questions answered from your profile"
- **Profile completeness score**: e.g., "Profile completeness: 80%"
- **Expandable detail list**: Each skipped question with:
  - Question number and text
  - The pre-filled value pulled from the org profile

## How It Works

### Data Flow

1. During **onboarding**, the user provides organization info (industry, sector, team size, funding status, target market, business stage, goals, location).
2. This data is saved to the `Organization` entity via `POST /api/v1/onboarding/v2/complete`.
3. When the user enters the **interview page**, the adaptive interview system compares org profile fields against questionnaire questions.
4. Questions that already have answers from the org profile are **skipped** from the questionnaire and listed as `skippedQuestions`.
5. The Context button toggles visibility of this list.

### Adaptive Interview API

The interview page calls:

```
GET /api/v1/business-plans/:planId/adaptive-interview/questions?language=fr
```

The response includes:

```json
{
  "questions": [...],
  "skippedQuestions": [
    {
      "id": "q5",
      "questionNumber": 5,
      "questionText": "What is your industry sector?",
      "profileFieldKey": "sector",
      "profileFieldValue": "Technology"
    }
  ],
  "profileCompletenessScore": 80
}
```

### Visibility Conditions

The panel only appears when **both** conditions are met:

1. The adaptive interview feature flag is enabled
2. There is at least one skipped question (`skippedQuestions.length > 0`)

If the user skipped onboarding business context or the org profile is empty, the panel has nothing to display and remains hidden — the button click has no visible effect.

## Why It Matters

- **Transparency**: Users see exactly what the system already knows about their business
- **Trust**: No hidden assumptions — the user can verify pre-filled data is correct
- **Efficiency**: Users understand why certain questions are absent from their questionnaire
- **Context for AI**: The same org profile data feeds into AI-assisted content generation, so users can see what context the AI is working with

## Technical References

| Component | File |
|-----------|------|
| Context button | `src/pages/InterviewQuestionnairePage.tsx` (header toolbar) |
| Profile Context Panel | `src/components/questionnaire/ProfileContextPanel.tsx` |
| Skipped questions type | `src/types/organization-profile.ts` (`SkippedQuestionDto`) |
| Adaptive interview API | `GET /api/v1/business-plans/:planId/adaptive-interview/questions` |
| Translation key | `interview.context` / `interview.viewCompanyContext` |

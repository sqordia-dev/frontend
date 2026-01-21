This consolidated **Sqordia Master Blueprint** is organized specifically for your Google Doc. You can copy and paste these sections directly. It covers the Vision, UI/UX Strategy, Technical Architecture, and the AI Intelligence Layer.

---

# Sqordia Product Specification: The Growth Architect 🚀

## 1. Executive Summary & Persona Vision

**Target Persona:** The Growth Architect (Senior Consultant / Strategic Entrepreneur).
**Core Value Proposition:** Transitioning from static business plan generation to dynamic "Growth Engineering." The platform acts as a high-fidelity simulator that produces bank-ready documentation and interactive strategy maps.

---

## 2. UI/UX Implementation Roadmap

The wizard is designed as a **Split-Pane Workspace** (40% Input / 60% Live Preview).

### Phase 1: The Core Foundation

* **Dual-Pane Container:** Persistent Markdown preview on the right that updates via a "Live-Sync" heartbeat.
* **Focus-State Input:** Question-by-question wizard reducing cognitive load.

### Phase 2: The AI Intelligence Layer

* **The Polishing Wand ✨:** Instant professional tone adjustment with a "diff" view (Original vs. Polished).
* **Sidebar Context Drawers:** Strategic "Why this matters" tooltips for every financial and operational field.

### Phase 3: The Growth Engine (Strategy Map)

* **Node-Based Canvas:** Built with React Flow.
* **Color Logic:** Blue (Attraction/Leads), Yellow (Conversion/Sales), Green (Revenue/LTV).
* **Math HUD:** Real-time ticker showing projected monthly revenue based on node conversion rates.

### Phase 4: The Socratic Coach 🤖

* **Audit Sidebar:** Categories for Financial, Strategic, and Legal/Compliance.
* **Nudge System:** One Socratic question + The Triad (Options A, B, and C).

### Phase 5: The Celebration Reveal & Export

* **Readiness Score Dashboard:** Visualized via a **Bank-Ready Meter** (Gauge) and a **Confidence Interval** (Ambition vs. Evidence).
* **The Reveal:** High-polish motion sequence assembling the final Pitch Deck and PDF.

---

## 3. Technical Architecture (Backend)

### Data Modeling (Sqordia.Domain)

* **PersonaType:** Enum (Entrepreneur, Consultant, OBNL).
* **ReadinessScore:** Decimal (0.00 to 100.00).
* **FinancialHealthMetrics:** Value Object containing `PivotPointMonth` and `RunwayMonths`.
* **StrategyMapJson:** Blob storage for node positions and conversion math.

### The Intelligence Engine (Sqordia.Application)

* **AuditService:** Logic for the Socratic Coach. Uses GPT-4o structured JSON outputs.
* **FinancialBenchmarkService:** A local JSON-based validator that flags "Ambition Gaps" (e.g., Lead costs lower than industry average).
* **Recalculation Loop:** Background sync between the Strategy Map nodes and the `FinancialProjections` table.

### Security & The Vault (Sqordia.Infrastructure)

* **Live-Link Sharing:** Email-gated access with dynamic watermarking.
* **Access Expiry:** Automatic link deactivation after a set period.

---

## 4. AI Prompt Library

### Master System Prompt (Global Logic)

> **Role:** Senior Business Consultant and Growth Architect.
> **Objective:** Transform raw data into quantitative, bank-ready narratives.
> **Constraints:** Zero-hallucination. Use industry-standard terminology. Persona-aware generation.

### Socratic Coach System Prompt (Technicolor)

> **Role:** Senior Auditor.
> **Instruction:** Analyze plan data for contradictions. Identify one risk at a time.
> **Output Format:**
> 1. `[CATEGORY AUDIT]`
> 2. `Nudge`: [Socratic Question]
> 3. `Suggestions`: {Option A: Conservative, Option B: Aggressive, Option C: Data Request}
> 
> 

---

## 5. Database Schema (EF Migration)

```csharp
public partial class AddGrowthArchitectFeatures : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(name: "Persona", table: "BusinessPlans", type: "integer", nullable: false, defaultValue: 0);
        migrationBuilder.AddColumn<string>(name: "StrategyMapJson", table: "BusinessPlans", type: "text", nullable: true);
        migrationBuilder.AddColumn<decimal>(name: "ReadinessScore", table: "BusinessPlans", type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m);
        migrationBuilder.AddColumn<int>(name: "HealthMetrics_PivotPointMonth", table: "BusinessPlans", type: "integer", nullable: false);
        migrationBuilder.AddColumn<int>(name: "HealthMetrics_RunwayMonths", table: "BusinessPlans", type: "integer", nullable: false);
    }
}

```

---

## 6. Onboarding Strategy (The 60-Second "Aha!")

1. **Persona Fork:** User selects "Consultant."
2. **The Seed:** User pastes a paragraph of raw notes.
3. **AI Deconstruction:** System pre-fills the first 3 steps of the wizard.
4. **Instant Win:** User lands in the split-pane view with a "Polished" version of their idea already visible.

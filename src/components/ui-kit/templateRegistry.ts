/* ------------------------------------------------------------------ */
/*  Sylvester UI-kit — template registry                               */
/*  Selection is PER USE CASE: a script scene is classified into a     */
/*  useCase, then we pull the best-matching template. Every template  */
/*  is parametric (brand-skinned by default; pass palette props to    */
/*  render faithful to an original).                                   */
/* ------------------------------------------------------------------ */

import { GlassPoster, GamifiedBanner, DataFlowDashboard, PromptInputBar, VoiceBanner, OtpSheet, SwipeCard, FrostedPoster, AppNavMenu } from "./UiKit";
import { AgentWorkflow, ToolGrid, BeforeAfter } from "./AutomationTemplates";
import { ProblemSolution, StepTimeline, AgentActivityStream, CtaEndCard, LogoReveal } from "./PremiumTemplates";

export type TemplateEntry = {
  id: string;
  component: any;
  useCases: string[];
  aspects: string[];
  brandable: boolean;
  note: string;
};

export const TEMPLATE_REGISTRY: TemplateEntry[] = [
  // ── Existing 9 (replicas, now also brand-skinnable) ──
  { id: "GlassPoster", component: GlassPoster, useCases: ["poster", "title-card"], aspects: ["1:1", "16:9"], brandable: true, note: "Frosted glassmorphism poster" },
  { id: "GamifiedBanner", component: GamifiedBanner, useCases: ["stat-number", "feature-callout", "cta"], aspects: ["16:9"], brandable: true, note: "Fanned cards, neon number" },
  { id: "DataFlowDashboard", component: DataFlowDashboard, useCases: ["data-flow", "source-aggregate"], aspects: ["portrait", "16:9"], brandable: true, note: "Curved flows into a focal node" },
  { id: "PromptInputBar", component: PromptInputBar, useCases: ["chat-prompt", "input-bar"], aspects: ["wide", "16:9"], brandable: true, note: "Neon prompt bar w/ typing" },
  { id: "VoiceBanner", component: VoiceBanner, useCases: ["chat-prompt", "voice-bar"], aspects: ["wide", "16:9"], brandable: true, note: "Ask bar + voice + send" },
  { id: "OtpSheet", component: OtpSheet, useCases: ["auth", "otp"], aspects: ["portrait", "16:9"], brandable: true, note: "Verification bottom sheet" },
  { id: "SwipeCard", component: SwipeCard, useCases: ["card-swipe", "destination"], aspects: ["portrait", "16:9"], brandable: true, note: "Swipeable content card" },
  { id: "FrostedPoster", component: FrostedPoster, useCases: ["poster", "glass-showcase"], aspects: ["portrait", "16:9"], brandable: true, note: "Warm frosted cards" },
  { id: "AppNavMenu", component: AppNavMenu, useCases: ["menu-nav", "app-ui"], aspects: ["portrait", "16:9"], brandable: true, note: "App sidebar / menu" },

  // ── New automation-explainer templates (brand-skinned) ──
  { id: "AgentWorkflow", component: AgentWorkflow, useCases: ["agent-workflow", "automation-diagram", "process"], aspects: ["16:9"], brandable: true, note: "Node graph: trigger→steps→outcome" },
  { id: "ToolGrid", component: ToolGrid, useCases: ["tool-grid", "integrations"], aspects: ["16:9"], brandable: true, note: "Grid of connected tools" },
  { id: "BeforeAfter", component: BeforeAfter, useCases: ["before-after", "metrics", "comparison"], aspects: ["16:9"], brandable: true, note: "Manual vs automated metrics" },

  // ── Premium automation-explainer templates ──
  { id: "ProblemSolution", component: ProblemSolution, useCases: ["problem-solution", "before-after", "transform"], aspects: ["16:9"], brandable: true, note: "Visual metaphor: chaos tangle -> single clean flow (text = tiny captions)" },
  { id: "StepTimeline", component: StepTimeline, useCases: ["step-timeline", "how-it-works", "process"], aspects: ["16:9"], brandable: true, note: "Self-drawing line + traveling light; step names are tiny captions" },
  { id: "AgentActivityStream", component: AgentActivityStream, useCases: ["agent-activity", "agent-workflow", "working"], aspects: ["16:9"], brandable: true, note: "Live pipeline + agent core; stations ignite, text = small caption" },
  { id: "CtaEndCard", component: CtaEndCard, useCases: ["cta", "end-card", "subscribe"], aspects: ["16:9"], brandable: true, note: "Subscribe / next-step card" },
  { id: "LogoReveal", component: LogoReveal, useCases: ["logo-reveal", "intro", "sting"], aspects: ["16:9"], brandable: true, note: "Channel sting / wordmark build" },
];

// Planned (gaps to fill next): problem-solution split, step-timeline,
// agent-activity-stream, browser/screen-mockup, testimonial, cta-end-card,
// logo-reveal, pricing/comparison-table.

export function pickTemplate(useCase: string): TemplateEntry | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.useCases.includes(useCase));
}

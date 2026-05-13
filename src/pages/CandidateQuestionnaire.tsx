import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  candidateQuestionnaireSteps,
  type CandidateQuestionField,
} from "@/data/candidate-questionnaire";
import { useViewerSession } from "@/hooks/useViewerSession";

function renderField(
  field: CandidateQuestionField,
  value: string,
  onChange: (nextValue: string) => void,
) {
  if (field.kind === "textarea") {
    return (
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 resize-y border-[#4A9B8E]/20 bg-white"
      />
    );
  }

  if (field.kind === "select" && field.options) {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#4A9B8E]/20 bg-white px-3 py-3 text-sm shadow-sm outline-none transition focus:border-[#4A9B8E]"
      >
        <option value="">Ø§Ø®ØªØ± Ø¥Ø¬Ø§Ø¨Ø©</option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Input
      type={field.kind}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="border-[#4A9B8E]/20 bg-white"
    />
  );
}

function isFieldFilled(value: string | undefined) {
  return (value ?? "").trim().length > 0;
}

function isStepComplete(stepIndex: number, answers: Record<string, string>) {
  const step = candidateQuestionnaireSteps[stepIndex];

  if (!step) {
    return false;
  }

  if (step.fields.length === 0) {
    return candidateQuestionnaireSteps
      .slice(0, stepIndex)
      .every((previousStep) =>
        previousStep.fields.every((field) => isFieldFilled(answers[field.key])),
      );
  }

  return step.fields.every((field) => isFieldFilled(answers[field.key]));
}

function isStepStarted(stepIndex: number, answers: Record<string, string>) {
  const step = candidateQuestionnaireSteps[stepIndex];

  if (!step) {
    return false;
  }

  if (step.fields.length === 0) {
    return candidateQuestionnaireSteps
      .slice(0, stepIndex)
      .some((previousStep) =>
        previousStep.fields.some((field) => isFieldFilled(answers[field.key])),
      );
  }

  return step.fields.some((field) => isFieldFilled(answers[field.key]));
}

export default function CandidateQuestionnaire() {
  const navigate = useNavigate();
  const { viewer, isCandidate, isLoading } = useViewerSession();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const canAccess = useMemo(() => isCandidate && !!viewer, [isCandidate, viewer]);
  const storageKey = `candidate-questionnaire-${viewer?.id ?? "guest"}`;

  useEffect(() => {
    if (!viewer) {
      return;
    }

    const savedAnswers = window.localStorage.getItem(storageKey);
    if (!savedAnswers) {
      return;
    }

    try {
      setAnswers(JSON.parse(savedAnswers) as Record<string, string>);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, viewer]);

  if (!isLoading && !canAccess) {
    return (
      <div className="min-h-screen bg-[#F8FAF9]">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 pt-28 pb-20 text-center sm:px-6">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø© Ù…Ø®ØµØµØ© Ù„Ù„Ù…ØªØ±Ø´Ø­ÙŠÙ†</h1>
          <p className="mb-8 text-gray-600">
            Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„Ø§Ø³ØªÙ…Ø§Ø±Ø© Ø¥Ù„Ø§ Ù…Ù† Ø·Ø±Ù Ø§Ù„Ù…ØªØ±Ø´Ø­ Ø§Ù„Ù…Ø³Ø¬Ù„ Ø¯Ø®ÙˆÙ„Ù‡.
          </p>
          <Button onClick={() => navigate("/")} className="bg-[#4A9B8E] hover:bg-[#3D7A6F]">
            <ArrowRight className="mr-2 h-4 w-4" />
            Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStep = candidateQuestionnaireSteps[currentStepIndex];
  const isFinalStep = currentStepIndex === candidateQuestionnaireSteps.length - 1;
  const totalQuestions = candidateQuestionnaireSteps.reduce(
    (total, step) => total + step.fields.length,
    0,
  );
  const answeredCount = Object.values(answers).filter((value) => isFieldFilled(value)).length;
  const completionRate = Math.round(
    (currentStepIndex / (candidateQuestionnaireSteps.length - 1)) * 100,
  );

  const questionOffset = candidateQuestionnaireSteps
    .slice(0, currentStepIndex)
    .reduce((total, step) => total + step.fields.length, 0);

  const reviewCards = candidateQuestionnaireSteps.slice(0, -1).map((step, index) => ({
    step,
    index,
    answered: step.fields.filter((field) => isFieldFilled(answers[field.key])).length,
  }));

  const goToStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < candidateQuestionnaireSteps.length - 1) {
      goToStep(currentStepIndex + 1);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    window.localStorage.setItem(storageKey, JSON.stringify(answers));
    toast.success("ØªÙ… ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª ÙˆØ­ÙØ¸Ù‡Ø§ Ù…Ø­Ù„ÙŠØ§");
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9]" dir="rtl">
      <Navbar />

      <section className="pt-20">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#1f5148_0%,#4A9B8E_55%,#9ad7cb_100%)]">
          <div className="relative mx-auto max-w-6xl px-4 py-16 text-white sm:px-6">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm transition-colors hover:bg-white/15"
            >
              <ArrowRight className="h-4 w-4" />
              Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
            </button>

            <div className="mt-8 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Ø§Ø³ØªÙ…Ø§Ø±Ø© Ø§Ù„Ù…ØªØ±Ø´Ø­
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
                Ø£Ø³Ø¦Ù„Ø© Ø§Ù„ØªØ±Ø´Ø­ Ù„Ù„Ø¯ÙˆØ±Ø© Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©
              </h1>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <section className="rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm md:p-8">
            <div className="overflow-x-auto pb-4">
              <div className="flex min-w-max items-center gap-3">
                {candidateQuestionnaireSteps.map((step, index) => {
                  const isActive = index === currentStepIndex;
                  const complete = isStepComplete(index, answers);
                  const started = isStepStarted(index, answers);

                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => goToStep(index)}
                        className={[
                          "flex min-h-[74px] min-w-[172px] items-center justify-center rounded-full border px-6 py-4 text-center text-sm font-bold transition-all",
                          complete
                            ? "border-[#1C8B63] bg-[#1C8B63] text-white"
                            : started
                              ? "border-[#C53B32] bg-[#C53B32] text-white"
                              : "border-gray-200 bg-transparent text-gray-600",
                          isActive ? "ring-4 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]" : "",
                        ].join(" ")}
                      >
                        {step.title}
                      </button>
                      {index < candidateQuestionnaireSteps.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => goToStep(index + 1)}
                          aria-label={`Go to ${candidateQuestionnaireSteps[index + 1].title}`}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-[#4A9B8E] hover:text-[#1f5148]"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold tracking-[0.24em] text-[#4A9B8E]">
                    Ø§Ù„Ù…Ø±Ø­Ù„Ø© {currentStepIndex + 1} / {candidateQuestionnaireSteps.length}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900">{currentStep.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600">
                    {currentStep.description}
                  </p>
                </div>

                <div className="rounded-3xl bg-[#F3FBF9] px-5 py-4 text-sm text-gray-700">
                  <p className="font-semibold text-[#1f5148]">
                    {answeredCount} / {totalQuestions} Ø¥Ø¬Ø§Ø¨Ø© Ù…Ù…Ù„ÙˆØ¡Ø©
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø±Ø¬ÙˆØ¹ Ø¥Ù„Ù‰ Ø£ÙŠ Ù…Ø±Ø­Ù„Ø© Ù‚Ø¨Ù„ Ø§Ù„ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ.
                  </p>
                </div>
              </div>

              <Progress value={completionRate} className="h-3 bg-[#D4ECE7]" />
            </div>
          </section>

          {!isFinalStep ? (
            <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <div className="grid gap-5">
                {currentStep.fields.map((field, index) => (
                  <div
                    key={field.key}
                    className="rounded-[24px] border border-[#4A9B8E]/10 bg-[#FCFDFC] p-5"
                  >
                    <Label className="mb-3 block whitespace-pre-line text-base font-semibold leading-8 text-gray-900">
                      {questionOffset + index + 1}. {field.label}
                    </Label>
                    {renderField(field, answers[field.key] ?? "", (nextValue) =>
                      setAnswers((previous) => ({ ...previous, [field.key]: nextValue })),
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[28px] border border-[#4A9B8E]/10 bg-[#FCFDFC] p-6">
                  <div className="flex items-center gap-3 text-[#1f5148]">
                    <CheckCircle2 className="h-6 w-6" />
                    <h3 className="text-xl font-bold">Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©</h3>
                  </div>
                  <p className="mt-4 leading-8 text-gray-600">
                    Ø±Ø§Ø¬Ø¹ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„ØªØ§Ù„ÙŠØ© Ù‚Ø¨Ù„ ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª. ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø±Ø¬ÙˆØ¹ Ø¥Ù„Ù‰ Ø£ÙŠ Ù…Ø±Ø­Ù„Ø© ÙˆØªØ¹Ø¯ÙŠÙ„
                    Ø§Ù„Ù…Ø¹Ø·ÙŠØ§Øª Ø«Ù… Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø©.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {reviewCards.map(({ step, index, answered }) => (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => goToStep(index)}
                        className="rounded-2xl border border-[#4A9B8E]/15 bg-white px-4 py-4 text-right transition hover:border-[#4A9B8E] hover:bg-[#F5FCFA]"
                      >
                        <p className="text-xs font-semibold tracking-[0.2em] text-[#4A9B8E]">
                          Ø§Ù„Ù…Ø±Ø­Ù„Ø© {index + 1}
                        </p>
                        <p className="mt-2 font-bold text-gray-900">{step.title}</p>
                        <p className="mt-2 text-sm text-gray-500">
                          {answered} / {step.fields.length} Ø¥Ø¬Ø§Ø¨Ø§Øª
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] bg-[linear-gradient(180deg,#1f5148_0%,#2b7468_100%)] p-6 text-white">
                  <p className="text-sm font-semibold tracking-[0.24em] text-white/70">Ø§Ù„Ù…Ù„Ø®Øµ</p>
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-white/70">Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø£Ø³Ø¦Ù„Ø©</p>
                      <p className="mt-1 text-3xl font-bold">{totalQuestions}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-white/70">Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª Ø§Ù„Ù…Ù…Ù„ÙˆØ¡Ø©</p>
                      <p className="mt-1 text-3xl font-bold">{answeredCount}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-white/70">Ù†Ø³Ø¨Ø© Ø§Ù„ØªÙ‚Ø¯Ù…</p>
                      <p className="mt-1 text-3xl font-bold">{completionRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3 rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="border-[#4A9B8E]/20 text-[#1f5148]"
            >
              <ChevronRight className="mr-2 h-4 w-4" />
              Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row">
              {!isFinalStep ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#4A9B8E] hover:bg-[#3D7A6F]"
                >
                  Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„ØªØ§Ù„ÙŠØ©
                  <ChevronLeft className="ml-2 h-4 w-4" />
                </Button>
              ) : null}

              <Button
                type="submit"
                className={isFinalStep ? "bg-[#1C8B63] hover:bg-[#176E4F]" : "bg-[#B12577] hover:bg-[#8E1E61]"}
              >
                {isFinalStep ? "ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª" : "Ø­ÙØ¸ Ø§Ù„Ø£Ø¬ÙˆØ¨Ø©"}
                <Send className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </section>
        </motion.form>
      </main>

      <Footer />
    </div>
  );
}


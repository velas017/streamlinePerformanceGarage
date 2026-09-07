import type { Faq } from "@/content/types";

/** General FAQs shown on the contact page (hidden on the home page for now). */
export const generalFaqs = [
  {
    question: "Do you only work on Japanese cars?",
    answer:
      "Yes. Focusing on Subaru, Honda, Nissan and Toyota lets us keep the right tools, parts relationships and platform knowledge in-house. That focus is why our diagnostics are faster and our work holds up.",
  },
  {
    question: "Do you serve Charlotte?",
    answer:
      "Every day. Our shop is in Concord, about 20 minutes from Uptown Charlotte via I-85, and a large share of our customers drive in from Charlotte, Huntersville, Kannapolis and Harrisburg.",
  },
  {
    question: "Do you sell performance parts?",
    answer:
      "Yes. We are dealers for the biggest names in the performance industry and can quote parts and installation together. Contact us with your car and your goals.",
  },
  {
    question: "Can I supply my own parts?",
    answer:
      "For most installs, yes. We inspect customer-supplied parts before installing them and will tell you if something is not right for the car.",
  },
  {
    question: "How do I book?",
    answer:
      "Use the booking form on the contact page or call the shop. For tuning and engine work we will schedule a short consultation first so we can plan parts and time correctly.",
  },
] as const satisfies readonly Faq[];

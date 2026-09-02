import type { Faq } from "@/content/types";

/** General FAQs shown on the home page and contact page. */
export const generalFaqs = [
  {
    question: "Do you only work on Japanese cars?",
    answer:
      "Yes. Focusing on Subaru, Nissan, Honda and Acura, Toyota, Mazda, Mitsubishi and Lexus lets us keep the right tools, parts relationships and platform knowledge in-house. That focus is why our diagnostics are faster and our work holds up.",
  },
  {
    question: "Do you serve Charlotte?",
    answer:
      "Every day. Our shop is in Concord, about 20 minutes from Uptown Charlotte via I-85, and a large share of our customers drive in from Charlotte, Huntersville, Kannapolis and Harrisburg.",
  },
  {
    question: "Do you work on right-hand-drive JDM imports?",
    answer:
      "Yes. Skylines, Silvias, Chasers, Kei cars and more. We do post-import inspections, US-road prep and ongoing service for imported cars.",
  },
  {
    question: "Do you offer a warranty on your work?",
    answer:
      "Yes. Parts and labor are warrantied on every repair, and engine builds include a break-in follow-up. Ask your service advisor for the terms that apply to your job.",
  },
  {
    question: "Can I supply my own parts?",
    answer:
      "For most installs, yes. We inspect customer-supplied parts before installing them and will tell you if something is not right for the car. Warranty on customer-supplied parts is limited to our labor.",
  },
  {
    question: "How do I book?",
    answer:
      "Use the booking form on the contact page or call the shop. For tuning and engine work we will schedule a short consultation first so we can plan parts and time correctly.",
  },
] as const satisfies readonly Faq[];

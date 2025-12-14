"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./FAQ.module.css";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={styles.faqList}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`${styles.faqItem} ${activeIndex === index ? styles.active : ""}`}
        >
          <button
            className={styles.faqQuestion}
            onClick={() => toggleItem(index)}
            aria-expanded={activeIndex === index}
          >
            <span>{item.question}</span>
            <ChevronDown
              size={20}
              className={styles.faqIcon}
            />
          </button>
          <div className={styles.faqAnswer}>
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

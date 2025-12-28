"use client";

import { useState, useEffect } from "react";
import styles from "./Countdown.module.css";

interface CountdownProps {
  targetDate: Date;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return null;
  }

  return (
    <p className={styles.countdown}>
      <span className={styles.countdownLabel}>Encore </span>
      <span className={styles.countdownNumber}>{timeLeft.days}</span>
      <span className={styles.countdownUnit}>j </span>
      <span className={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, "0")}</span>
      <span className={styles.countdownUnit}>h </span>
      <span className={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, "0")}</span>
      <span className={styles.countdownUnit}>m </span>
      <span className={styles.countdownNumber}>{String(timeLeft.seconds).padStart(2, "0")}</span>
      <span className={styles.countdownUnit}>s</span>
    </p>
  );
}

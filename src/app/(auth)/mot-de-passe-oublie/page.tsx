"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, AlertCircle, Check, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "../auth.module.css";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <Check size={48} />
            </div>
            <h2>Email envoyé !</h2>
            <p>
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>,
              vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <Link href="/connexion" className={styles.submitBtn}>
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/">
            <Image
              src="/logos/logo-core-de-femme-no-bg.png"
              alt="Core de Femme"
              width={160}
              height={60}
              className={styles.logo}
            />
          </Link>
          <h1>Mot de passe oublié</h1>
          <p>Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Adresse email</label>
            <div className={styles.inputWrapper}>
              <Mail size={20} className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.btnSpinner}></span>
                Envoi...
              </>
            ) : (
              "Envoyer le lien"
            )}
          </button>
        </form>

        <div className={styles.authFooter}>
          <Link href="/connexion" className={styles.backLink}>
            <ArrowLeft size={16} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

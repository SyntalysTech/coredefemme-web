"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === "Invalid login credentials") {
          setError("Email ou mot de passe incorrect");
        } else {
          setError(signInError.message);
        }
        return;
      }

      router.push("/admin");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <Image
            src="/logos/logo-core-de-femme-no-bg.png"
            alt="Core de Femme"
            width={180}
            height={70}
            className={styles.logo}
          />
          <h1>Administration</h1>
          <p>Connectez-vous pour accéder au panneau d&apos;administration</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
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

          <div className={styles.formGroup}>
            <label htmlFor="password">Mot de passe</label>
            <div className={styles.inputWrapper}>
              <Lock size={20} className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
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
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <a href="/" className={styles.backLink}>
            Retour au site
          </a>
        </div>
      </div>
    </div>
  );
}

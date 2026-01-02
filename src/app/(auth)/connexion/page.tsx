"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "../auth.module.css";

function ConnexionContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/mon-compte";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Already logged in, redirect
        window.location.href = redirectUrl;
      } else {
        setCheckingSession(false);
      }
    };
    checkExistingSession();
  }, [redirectUrl]);

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
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Veuillez confirmer votre email avant de vous connecter");
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
        return;
      }

      // Use full page navigation to ensure auth state is properly synced
      window.location.href = redirectUrl;
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(false);
    }
  }

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className={styles.btnSpinner} style={{ margin: "0 auto", width: "32px", height: "32px" }}></div>
            <p style={{ marginTop: "1rem", color: "#765c4a" }}>Vérification...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/logos/logo-core-de-femme-no-bg.png"
              alt="Core de Femme"
              width={160}
              height={60}
            />
          </Link>
          <h1>Connexion</h1>
          <p>Connectez-vous pour accéder à votre espace client</p>
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

          <div className={styles.forgotPassword}>
            <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
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

        <div className={styles.authFooter}>
          <p>
            Pas encore de compte ?{" "}
            <Link href={`/inscription${redirectUrl !== "/mon-compte" ? `?redirect=${redirectUrl}` : ""}`} className={styles.authLink}>
              S&apos;inscrire
            </Link>
          </p>
          <Link href="/" className={styles.backLink}>
            Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className={styles.btnSpinner} style={{ margin: "0 auto" }}></div>
          </div>
        </div>
      </div>
    }>
      <ConnexionContent />
    </Suspense>
  );
}

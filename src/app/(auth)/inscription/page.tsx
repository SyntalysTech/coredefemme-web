"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Phone, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "../auth.module.css";

function InscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/mon-compte";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}${redirectUrl}`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Cette adresse email est déjà utilisée");
        } else {
          setError(signUpError.message);
        }
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
            <h2>Inscription réussie !</h2>
            <p>
              Un email de confirmation a été envoyé à <strong>{formData.email}</strong>.
              <br />
              Veuillez cliquer sur le lien pour activer votre compte.
            </p>
            <Link href={`/connexion${redirectUrl !== "/mon-compte" ? `?redirect=${redirectUrl}` : ""}`} className={styles.submitBtn}>
              Aller à la connexion
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
          <Link href="/" className={styles.logo}>
            <Image
              src="/logos/logo-core-de-femme-no-bg.png"
              alt="Core de Femme"
              width={160}
              height={60}
            />
          </Link>
          <h1>Créer un compte</h1>
          <p>Inscrivez-vous pour réserver vos séances et gérer vos cours</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Nom complet *</label>
            <div className={styles.inputWrapper}>
              <User size={20} className={styles.inputIcon} />
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Marie Dupont"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Adresse email *</label>
            <div className={styles.inputWrapper}>
              <Mail size={20} className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="marie@exemple.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Téléphone</label>
            <div className={styles.inputWrapper}>
              <Phone size={20} className={styles.inputIcon} />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+41 79 000 00 00"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Mot de passe *</label>
            <div className={styles.inputWrapper}>
              <Lock size={20} className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 caractères"
                required
                autoComplete="new-password"
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

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
            <div className={styles.inputWrapper}>
              <Lock size={20} className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Répétez le mot de passe"
                required
                autoComplete="new-password"
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
                Inscription...
              </>
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Déjà un compte ?{" "}
            <Link href={`/connexion${redirectUrl !== "/mon-compte" ? `?redirect=${redirectUrl}` : ""}`} className={styles.authLink}>
              Se connecter
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

export default function InscriptionPage() {
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
      <InscriptionContent />
    </Suspense>
  );
}

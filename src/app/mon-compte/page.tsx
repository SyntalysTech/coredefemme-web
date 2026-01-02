"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  CreditCard,
  User,
  Bell,
  Package,
  Clock,
  MapPin,
  LogOut,
  ChevronRight,
  AlertCircle,
  Check,
  X,
  Users,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  total_sessions_attended: number;
  total_amount_spent: number;
}

interface Reservation {
  id: string;
  reservation_number: string;
  status: string;
  queue_position: number | null;
  payment_status: string;
  created_at: string;
  session: {
    id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    service: {
      name: string;
      slug: string;
    };
  };
}

interface CustomerPack {
  id: string;
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
  status: string;
  expires_at: string | null;
  service: {
    name: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function MonComptePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [packs, setPacks] = useState<CustomerPack[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"reservations" | "packs" | "profile" | "notifications">("reservations");
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let dataLoaded = false;

    const loadData = async (userId: string, email: string) => {
      if (dataLoaded || !isMounted) return;
      dataLoaded = true;
      await loadAllData(userId, email);
      if (isMounted) setIsLoading(false);
    };

    // Check session immediately on mount
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session) {
        await loadData(session.user.id, session.user.email!);
      } else {
        // No session found, redirect to login
        router.push("/connexion");
      }
    };

    initializeAuth();

    // Listen for auth changes (for sign out, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        router.push("/connexion");
        return;
      }

      // Handle token refresh or new sign in
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        if (session && !dataLoaded) {
          await loadData(session.user.id, session.user.email!);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function loadAllData(userId: string, email: string) {
    await Promise.all([
      loadUserProfile(userId),
      loadReservations(userId, email),
      loadPacks(userId, email),
      loadNotifications(userId),
    ]);
  }

  async function loadUserProfile(userId: string) {
    const { data } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setUser(data);
    }
  }

  async function loadReservations(userId: string, email: string) {
    const { data } = await supabase
      .from("reservations")
      .select(`
        *,
        session:sessions (
          id,
          session_date,
          start_time,
          end_time,
          service:services (
            name,
            slug
          )
        )
      `)
      .or(`user_id.eq.${userId},customer_email.eq.${email}`)
      .in("status", ["pending", "confirmed"])
      .gte("session.session_date", new Date().toISOString().split("T")[0])
      .order("session(session_date)", { ascending: true });

    setReservations(data || []);
  }

  async function loadPacks(userId: string, email: string) {
    const { data } = await supabase
      .from("customer_packs")
      .select(`
        *,
        service:services (
          name
        )
      `)
      .or(`user_id.eq.${userId},customer_email.eq.${email}`)
      .eq("status", "active");

    setPacks(data || []);
  }

  async function loadNotifications(userId: string) {
    const { data } = await supabase
      .from("user_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    setNotifications(data || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    setPasswordStatus("loading");

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        setPasswordError(error.message);
        setPasswordStatus("error");
        return;
      }

      setPasswordStatus("success");
      setPasswordData({ newPassword: "", confirmPassword: "" });

      // Reset after 3 seconds
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordStatus("idle");
      }, 3000);
    } catch {
      setPasswordError("Une erreur est survenue");
      setPasswordStatus("error");
    }
  }

  async function handleCancelReservation(reservationId: string) {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;

    setCancellingId(reservationId);

    try {
      const response = await fetch("/api/reservations/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: reservationId }),
      });

      const result = await response.json();

      if (result.success) {
        // Recargar reservaciones
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await loadReservations(session.user.id, session.user.email!);
        }
        alert(result.message || "Réservation annulée avec succès");
      } else {
        alert(result.error || "Erreur lors de l'annulation");
      }
    } catch {
      alert("Erreur lors de l'annulation");
    } finally {
      setCancellingId(null);
    }
  }

  async function markNotificationRead(notificationId: string) {
    // Usar la API para marcar como leído
    await fetch("/api/account/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notification_ids: [notificationId] }),
    });

    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, is_read: true } : n
    ));
  }

  if (isLoading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
        <p>Chargement...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className={styles.userName}>
            <h3>{user?.full_name}</h3>
            <p>{user?.email}</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === "reservations" ? styles.active : ""}`}
            onClick={() => setActiveTab("reservations")}
          >
            <Calendar size={20} />
            Mes réservations
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "packs" ? styles.active : ""}`}
            onClick={() => setActiveTab("packs")}
          >
            <Package size={20} />
            Mes packs
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "notifications" ? styles.active : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={20} />
            Notifications
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "profile" ? styles.active : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={20} />
            Mon profil
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/reserver" className={styles.reserveBtn}>
            <Calendar size={18} />
            Réserver une séance
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Calendar size={24} />
            <div>
              <span className={styles.statValue}>{reservations.length}</span>
              <span className={styles.statLabel}>Réservations à venir</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Package size={24} />
            <div>
              <span className={styles.statValue}>
                {packs.reduce((sum, p) => sum + (p.remaining_sessions || 0), 0)}
              </span>
              <span className={styles.statLabel}>Séances restantes</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Check size={24} />
            <div>
              <span className={styles.statValue}>{user?.total_sessions_attended || 0}</span>
              <span className={styles.statLabel}>Séances effectuées</span>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.content}>
          {activeTab === "reservations" && (
            <section className={styles.section}>
              <h2>Mes réservations à venir</h2>
              {reservations.length === 0 ? (
                <div className={styles.emptyState}>
                  <Calendar size={48} />
                  <h3>Aucune réservation</h3>
                  <p>Vous n&apos;avez pas encore de réservation à venir.</p>
                  <Link href="/reserver" className={styles.primaryBtn}>
                    Réserver une séance
                  </Link>
                </div>
              ) : (
                <div className={styles.reservationsList}>
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className={styles.reservationCard}>
                      <div className={styles.reservationHeader}>
                        <span className={styles.reservationNumber}>
                          {reservation.reservation_number}
                        </span>
                        <span className={`${styles.status} ${styles[reservation.status]}`}>
                          {reservation.queue_position
                            ? `En attente (${reservation.queue_position})`
                            : reservation.status === "confirmed"
                            ? "Confirmée"
                            : "En attente"}
                        </span>
                      </div>
                      <div className={styles.reservationDetails}>
                        <h3>{reservation.session?.service?.name}</h3>
                        <div className={styles.detailRow}>
                          <Calendar size={16} />
                          <span>
                            {new Date(reservation.session?.session_date).toLocaleDateString("fr-CH", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                        </div>
                        <div className={styles.detailRow}>
                          <Clock size={16} />
                          <span>
                            {reservation.session?.start_time?.slice(0, 5)} - {reservation.session?.end_time?.slice(0, 5)}
                          </span>
                        </div>
                        <div className={styles.detailRow}>
                          <MapPin size={16} />
                          <span>La Vouivre, Porrentruy</span>
                        </div>
                      </div>
                      <div className={styles.reservationActions}>
                        <button
                          className={styles.cancelBtn}
                          onClick={() => handleCancelReservation(reservation.id)}
                          disabled={cancellingId === reservation.id}
                        >
                          {cancellingId === reservation.id ? (
                            <span className={styles.smallSpinner}></span>
                          ) : (
                            <>
                              <X size={16} />
                              Annuler
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "packs" && (
            <section className={styles.section}>
              <h2>Mes packs</h2>
              {packs.length === 0 ? (
                <div className={styles.emptyState}>
                  <Package size={48} />
                  <h3>Aucun pack actif</h3>
                  <p>Vous n&apos;avez pas encore de pack de séances.</p>
                  <Link href="/reserver" className={styles.primaryBtn}>
                    Acheter un pack
                  </Link>
                </div>
              ) : (
                <div className={styles.packsList}>
                  {packs.map((pack) => (
                    <div key={pack.id} className={styles.packCard}>
                      <div className={styles.packHeader}>
                        <h3>{pack.service?.name}</h3>
                        <span className={styles.packBadge}>Actif</span>
                      </div>
                      <div className={styles.packProgress}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${((pack.total_sessions - pack.remaining_sessions) / pack.total_sessions) * 100}%`,
                            }}
                          />
                        </div>
                        <span>
                          {pack.remaining_sessions} / {pack.total_sessions} séances restantes
                        </span>
                      </div>
                      {pack.expires_at && (
                        <p className={styles.expiryDate}>
                          Expire le {new Date(pack.expires_at).toLocaleDateString("fr-CH")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "notifications" && (
            <section className={styles.section}>
              <h2>Notifications</h2>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <Bell size={48} />
                  <h3>Aucune notification</h3>
                  <p>Vous n&apos;avez pas encore de notifications.</p>
                </div>
              ) : (
                <div className={styles.notificationsList}>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`${styles.notificationCard} ${!notification.is_read ? styles.unread : ""}`}
                      onClick={() => !notification.is_read && markNotificationRead(notification.id)}
                    >
                      <div className={`${styles.notificationIcon} ${styles[notification.type]}`}>
                        {notification.type === "success" ? <Check size={20} /> :
                         notification.type === "error" ? <AlertCircle size={20} /> :
                         notification.type === "queue" ? <Users size={20} /> :
                         <Bell size={20} />}
                      </div>
                      <div className={styles.notificationContent}>
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className={styles.notificationDate}>
                          {new Date(notification.created_at).toLocaleDateString("fr-CH", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "profile" && (
            <section className={styles.section}>
              <h2>Mon profil</h2>
              <div className={styles.profileCard}>
                <div className={styles.profileRow}>
                  <label>Nom complet</label>
                  <span>{user?.full_name}</span>
                </div>
                <div className={styles.profileRow}>
                  <label>Email</label>
                  <span>{user?.email}</span>
                </div>
                <div className={styles.profileRow}>
                  <label>Téléphone</label>
                  <span>{user?.phone || "Non renseigné"}</span>
                </div>
                <div className={styles.profileRow}>
                  <label>Séances effectuées</label>
                  <span>{user?.total_sessions_attended || 0}</span>
                </div>
              </div>

              {/* Password Change Section */}
              <div className={styles.passwordSection}>
                <h3 className={styles.securityTitle}>
                  <Lock size={18} />
                  Sécurité
                </h3>

                {!showPasswordForm ? (
                  <button
                    className={styles.changePasswordBtn}
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Changer mon mot de passe
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
                    {passwordStatus === "success" ? (
                      <div className={styles.passwordSuccess}>
                        <Check size={20} />
                        Mot de passe modifié avec succès !
                      </div>
                    ) : (
                      <>
                        {passwordError && (
                          <div className={styles.passwordError}>
                            <AlertCircle size={16} />
                            {passwordError}
                          </div>
                        )}

                        <div className={styles.passwordField}>
                          <label>Nouveau mot de passe</label>
                          <div className={styles.passwordInputWrapper}>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              placeholder="Minimum 6 caractères"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              className={styles.togglePassword}
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <div className={styles.passwordField}>
                          <label>Confirmer le mot de passe</label>
                          <div className={styles.passwordInputWrapper}>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              placeholder="Répétez le mot de passe"
                              required
                            />
                            <button
                              type="button"
                              className={styles.togglePassword}
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <div className={styles.passwordActions}>
                          <button
                            type="button"
                            className={styles.cancelPasswordBtn}
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordData({ newPassword: "", confirmPassword: "" });
                              setPasswordError("");
                            }}
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className={styles.savePasswordBtn}
                            disabled={passwordStatus === "loading"}
                          >
                            {passwordStatus === "loading" ? (
                              <span className={styles.smallSpinner}></span>
                            ) : (
                              <>
                                <Check size={16} />
                                Enregistrer
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

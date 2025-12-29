"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Package,
  User,
  Calendar,
  RefreshCw,
  Filter,
  CreditCard,
  TrendingUp,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import styles from "./page.module.css";

interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
  type: string;
  nickname: string | null;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  active: boolean;
  metadata: Record<string, string>;
  prices: StripePrice[];
  created: number;
}

interface StripePurchase {
  id: string;
  customer_email: string | null;
  customer_name: string | null;
  amount_total: number;
  currency: string;
  created: number;
  metadata: Record<string, string>;
  payment_status: string;
  is_pack: boolean;
  service_slug: string | null;
}

interface StripeData {
  products: StripeProduct[];
  purchases: StripePurchase[];
  stats: {
    totalProducts: number;
    totalPurchases: number;
    totalRevenue: number;
  };
}

export default function AdminPacksPage() {
  const [data, setData] = useState<StripeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"products" | "purchases">("products");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/stripe-products");
      if (!response.ok) {
        throw new Error("Failed to fetch Stripe data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error:", err);
      setError("Erreur lors du chargement des données Stripe");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleProduct = (productId: string) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const filteredProducts = data?.products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const filteredPurchases = data?.purchases.filter((purchase) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      purchase.customer_email?.toLowerCase().includes(searchLower) ||
      purchase.customer_name?.toLowerCase().includes(searchLower) ||
      purchase.service_slug?.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href="/admin" className={styles.backLink}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1>Produits & Packs Stripe</h1>
              <p>Erreur de chargement</p>
            </div>
          </div>
        </header>
        <div className={styles.errorState}>
          <Package size={48} />
          <p>{error}</p>
          <button onClick={fetchData} className={styles.refreshBtn}>
            <RefreshCw size={18} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin" className={styles.backLink}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1>Produits & Packs Stripe</h1>
            <p>
              {viewMode === "products"
                ? `${data?.stats.totalProducts || 0} produit${(data?.stats.totalProducts || 0) > 1 ? "s" : ""}`
                : `${data?.stats.totalPurchases || 0} achat${(data?.stats.totalPurchases || 0) > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <a
            href="https://dashboard.stripe.com/products"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.stripeLink}
          >
            <ExternalLink size={16} />
            Dashboard Stripe
          </a>
          <button onClick={fetchData} className={styles.refreshBtn}>
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <Package size={24} />
          <div>
            <span className={styles.statValue}>{data?.stats.totalProducts || 0}</span>
            <span className={styles.statLabel}>Produits actifs</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <ShoppingBag size={24} />
          <div>
            <span className={styles.statValue}>{data?.stats.totalPurchases || 0}</span>
            <span className={styles.statLabel}>Achats</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <TrendingUp size={24} />
          <div>
            <span className={styles.statValue}>
              {data?.stats.totalRevenue ? `CHF ${data.stats.totalRevenue.toFixed(0)}` : "CHF 0"}
            </span>
            <span className={styles.statLabel}>Revenus totaux</span>
          </div>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className={styles.filters}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === "products" ? styles.active : ""}`}
            onClick={() => setViewMode("products")}
          >
            <Package size={16} />
            Produits
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === "purchases" ? styles.active : ""}`}
            onClick={() => setViewMode("purchases")}
          >
            <CreditCard size={16} />
            Achats
          </button>
        </div>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder={
              viewMode === "products"
                ? "Rechercher un produit..."
                : "Rechercher par email, nom..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {viewMode === "products" ? (
        <div className={styles.productsList}>
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <Package size={48} />
              <p>Aucun produit trouvé</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div
                  className={styles.productHeader}
                  onClick={() => toggleProduct(product.id)}
                >
                  <div className={styles.productInfo}>
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    )}
                    <div>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <p className={styles.productDescription}>
                        {product.description || "Sans description"}
                      </p>
                    </div>
                  </div>
                  <div className={styles.productRight}>
                    <div className={styles.productPrices}>
                      {product.prices.map((price) => (
                        <span key={price.id} className={styles.priceTag}>
                          {formatPrice(price.unit_amount, price.currency)}
                        </span>
                      ))}
                    </div>
                    {expandedProducts.has(product.id) ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>

                {expandedProducts.has(product.id) && (
                  <div className={styles.productDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ID Stripe:</span>
                      <code className={styles.detailValue}>{product.id}</code>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Créé le:</span>
                      <span className={styles.detailValue}>
                        {formatDate(product.created)}
                      </span>
                    </div>
                    {product.prices.map((price) => (
                      <div key={price.id} className={styles.detailRow}>
                        <span className={styles.detailLabel}>
                          Price ID {price.nickname ? `(${price.nickname})` : ""}:
                        </span>
                        <code className={styles.detailValue}>{price.id}</code>
                      </div>
                    ))}
                    {Object.keys(product.metadata).length > 0 && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Metadata:</span>
                        <code className={styles.detailValue}>
                          {JSON.stringify(product.metadata, null, 2)}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className={styles.purchasesList}>
          {filteredPurchases.length === 0 ? (
            <div className={styles.emptyState}>
              <CreditCard size={48} />
              <p>Aucun achat trouvé</p>
            </div>
          ) : (
            filteredPurchases.map((purchase) => (
              <div key={purchase.id} className={styles.purchaseCard}>
                <div className={styles.purchaseHeader}>
                  <div className={styles.purchaseType}>
                    {purchase.is_pack ? (
                      <span className={styles.packBadge}>Pack</span>
                    ) : (
                      <span className={styles.sessionBadge}>Séance</span>
                    )}
                  </div>
                  <span className={styles.purchaseAmount}>
                    {formatPrice(purchase.amount_total, purchase.currency)}
                  </span>
                </div>

                <div className={styles.purchaseCustomer}>
                  <User size={16} />
                  <div>
                    <span className={styles.customerName}>
                      {purchase.customer_name || "Client"}
                    </span>
                    <span className={styles.customerEmail}>
                      {purchase.customer_email || "Email non disponible"}
                    </span>
                  </div>
                </div>

                {purchase.service_slug && (
                  <div className={styles.purchaseService}>
                    <Package size={14} />
                    <span>{purchase.service_slug}</span>
                  </div>
                )}

                <div className={styles.purchaseFooter}>
                  <span className={styles.purchaseDate}>
                    <Calendar size={14} />
                    {formatDate(purchase.created)}
                  </span>
                  <span className={styles.paymentStatus}>
                    {purchase.payment_status === "paid" ? "Payé" : purchase.payment_status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

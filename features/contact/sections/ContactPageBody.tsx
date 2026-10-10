"use client";

import { useMemo, useState } from "react";
import type { StrapiContactPage } from "@/lib/strapi";

function formatAddress(a: StrapiContactPage["address"]): string {
  if (!a) return "";
  const parts = [a.street, a.city, a.country].map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
  return parts.join(", ");
}

function ensureMailto(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) return "#";
  return trimmed.includes(":") ? trimmed : `mailto:${trimmed}`;
}

function ensureTel(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return "#";
  return trimmed.includes(":") ? trimmed : `tel:${trimmed}`;
}

function mapSrc(value: string | null | undefined): string {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) return "";
  // Allow an actual embed URL if Strapi stores it.
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  // Otherwise treat it as a query string / place name.
  return `https://www.google.com/maps?q=${encodeURIComponent(v)}&output=embed`;
}

function ensureUrl(url: string | null | undefined): string {
  if (url == null || typeof url !== "string" || !url.trim()) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function IconSvg({ icon }: { icon: { iconData?: string; width?: number; height?: number } | null | undefined }) {
  if (!icon?.iconData) return null;
  const w = icon.width ?? 24;
  const h = icon.height ?? 24;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="currentColor"
      className="shrink-0"
      dangerouslySetInnerHTML={{ __html: icon.iconData }}
    />
  );
}

export function ContactPageBody({ page }: { page: StrapiContactPage }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const addressText = useMemo(() => formatAddress(page.address), [page.address]);
  const mapUrl = useMemo(() => mapSrc(page.mapEmbedLink), [page.mapEmbedLink]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, message }),
      });
      if (res.ok) setStatus("sent");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="relative overflow-hidden bg-muted py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Get in touch
            </h2>

            {(addressText || page.phoneNumber || page.emailAddress) && (
              <div className="mt-6 space-y-4 text-muted-foreground">
                {addressText && (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-foreground">
                      Address
                    </p>
                    <p className="mt-1">{addressText}</p>
                  </div>
                )}
                {page.phoneNumber && (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-foreground">
                      Phone
                    </p>
                    <a className="mt-1 block hover:text-primary" href={ensureTel(page.phoneNumber)}>
                      {page.phoneNumber}
                    </a>
                  </div>
                )}
                {page.emailAddress && (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-foreground">
                      Email
                    </p>
                    <a className="mt-1 block hover:text-primary" href={ensureMailto(page.emailAddress)}>
                      {page.emailAddress}
                    </a>
                  </div>
                )}
              </div>
            )}

            {(page.socialLinks?.length ?? 0) > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                  Follow us
                </p>
                <div className="flex gap-3">
                  {page.socialLinks?.map((item) => (
                    <a
                      key={item.id}
                      href={ensureUrl(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary transition hover:bg-primary hover:text-primary-foreground"
                      aria-label={item.icon?.iconName ?? "Social link"}
                    >
                      <IconSvg icon={item.icon} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h3 className="text-xl font-semibold text-foreground">Send us a message</h3>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="contact-fullName" className="block text-sm font-medium text-foreground">
                  Full name
                </label>
                <input
                  id="contact-fullName"
                  name="fullName"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-foreground">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {status === "sent" && (
                <p className="text-sm font-medium text-secondary">Thank you! Your message has been sent.</p>
              )}
              {status === "error" && (
                <p className="text-sm font-medium text-destructive">Something went wrong. Please try again.</p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>
        </div>

        {mapUrl && (
          <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="relative aspect-video w-full">
              <iframe
                src={mapUrl}
                title="Map"
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


"use client";

import { useState } from "react";
import type { StrapiContactBlock, StrapiContactLink, StrapiSocialIcon } from "@/lib/strapi";

function ensureUrl(url: string | null | undefined): string {
  if (url == null || typeof url !== "string" || !url.trim()) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function contactLinkHref(url: string): string {
  const trimmed = url.trim();
  if (/@/.test(trimmed) && !trimmed.includes(":")) return `mailto:${trimmed}`;
  if (/^[\d\s\-+()]+$/.test(trimmed.replace(/\s/g, ""))) return `tel:${trimmed}`;
  return ensureUrl(trimmed);
}

function IconSvg({ icon }: { icon: { url?: string; iconData?: string; width?: number; height?: number } }) {
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

interface ContactSectionProps {
  data: StrapiContactBlock | null | undefined;
}

export function ContactSection({ data }: ContactSectionProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (!data) return null;

  const { title, address, description, link = [], socialLinks = [] } = data;
  const hasContent = title || address || description || link.length > 0 || socialLinks.length > 0;

  if (!hasContent) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      // TODO: Replace with your API endpoint
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: { "Content-Type": "application/json" },
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
              {title}
            </h2>
            {address && (
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {address}
              </p>
            )}
            {description && (
              <div className="mt-4 whitespace-pre-line text-muted-foreground leading-relaxed">
                {description}
              </div>
            )}
            {link.length > 0 && (
              <ul className="mt-6 space-y-4">
                {link.map((item: StrapiContactLink) => (
                  <li key={item.id}>
                    <a
                      href={contactLinkHref(item.url)}
                      className="group flex items-center gap-3 text-foreground transition hover:text-primary"
                    >
                      {item.icon && (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                          <IconSvg icon={item.icon} />
                        </span>
                      )}
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {socialLinks.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Follow us
                </p>
                <div className="flex gap-3">
                  {socialLinks.map((item: StrapiSocialIcon) => (
                    <a
                      key={item.id}
                      href={ensureUrl(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary transition hover:bg-primary hover:text-primary-foreground"
                      aria-label={item.icon?.iconName ?? "Social link"}
                    >
                      {item.icon && <IconSvg icon={item.icon} />}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h3 className="text-xl font-semibold text-foreground">
              Send us a message
            </h3>
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-firstName" className="block text-sm font-medium text-foreground">
                    First name
                  </label>
                  <input
                    id="contact-firstName"
                    name="firstName"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label htmlFor="contact-lastName" className="block text-sm font-medium text-foreground">
                    Last name
                  </label>
                  <input
                    id="contact-lastName"
                    name="lastName"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
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
                <label htmlFor="contact-phone" className="block text-sm font-medium text-foreground">
                  Phone
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
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
                  rows={4}
                  required
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {status === "sent" && (
                <p className="text-sm font-medium text-secondary">
                  Thank you! Your message has been sent.
                </p>
              )}
              {status === "error" && (
                <p className="text-sm font-medium text-destructive">
                  Something went wrong. Please try again.
                </p>
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
      </div>
    </section>
  );
}

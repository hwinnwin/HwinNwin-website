import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, BarChart3, Bot, Gamepad2, Globe, Gauge, Heart, ArrowUpRight, Megaphone, Sparkles } from "lucide-react";
import { SEO } from "@/lib/seo/meta";
import { SITE_CONFIG } from "@/lib/constants";
import { SkipNav } from "@/components/layout/SkipNav";
import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Icon mapping for portals
const portalIcons: Record<string, React.ReactNode> = {
  chart: <BarChart3 className="w-5 h-5" />,
  bot: <Bot className="w-5 h-5" />,
  gamepad: <Gamepad2 className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
  gauge: <Gauge className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  megaphone: <Megaphone className="w-5 h-5" />,
  sparkles: <Sparkles className="w-5 h-5" />,
};

export default function CodexI18n() {
  const { t, locale } = useI18n();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0D1A] via-[#0E1330] to-[#0A0D1A]">
      {/* SEO */}
      <SEO
        title={t.meta.title}
        description={t.meta.description}
        ogTitle={t.meta.ogTitle}
        ogDescription={t.meta.ogDescription}
        ogType="website"
        canonical={`${SITE_CONFIG.baseUrl}/${locale === "en" ? "" : `?lang=${locale}`}`}
      />

      {/* Skip to Content Link */}
      <SkipNav />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0D1A]/80 border-b border-slate-700/30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-serif font-bold text-slate-100 hover:text-[#B4FFE7] transition-colors">
            hwinnwin
          </a>
          <nav className="hidden md:flex gap-8 text-sm" aria-label="Main navigation">
            <a href="#portals" className="text-[#B4FFE7] hover:text-[#A7B6FF] transition-colors font-medium">Ecosystem</a>
            <a href="#ethos" className="text-slate-300 hover:text-slate-100 transition-colors">{t.nav.ethos}</a>
            <a href="#codex" className="text-slate-300 hover:text-slate-100 transition-colors">{t.nav.codex}</a>
            <a href="/hwin" className="text-slate-300 hover:text-slate-100 transition-colors">{t.nav.work}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a href="mailto:hello@hwinnwin.com">
              <Button
                variant="outline"
                className="bg-transparent border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-slate-100"
                aria-label="Contact us via email"
              >
                <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                {t.nav.contact}
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content">

      {/* Hero */}
      <motion.section
        className="container mx-auto px-6 py-24 md:py-32"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 text-slate-100">
            {t.hero.headline}
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-slate-300 mb-8 max-w-3xl mx-auto">
            {t.hero.subheadline}
          </p>
          <a href="mailto:hello@hwinnwin.com">
            <Button
              size="lg"
              className="bg-[#A7B6FF] text-[#0A0D1A] hover:bg-[#B4FFE7] font-semibold px-8 py-6 text-lg"
            >
              {t.hero.cta}
            </Button>
          </a>
        </motion.div>
      </motion.section>

      {/* Portals / Ecosystem Section */}
      <motion.section
        id="portals"
        className="container mx-auto px-6 py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-slate-100">
              {t.portals.title}
            </h2>
            <p className="text-xl text-slate-400">
              {t.portals.subtitle}
            </p>
          </div>

          {/* Portal Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.portals.items.map((portal, index) => (
              <motion.a
                key={portal.name}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-6 rounded-xl border border-slate-700/50 bg-slate-900/30 hover:bg-slate-800/50 hover:border-[#A7B6FF]/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    portal.status === "live"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : portal.status === "beta"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                  }`}>
                    {t.portals.statusLabels[portal.status as keyof typeof t.portals.statusLabels]}
                  </span>
                </div>

                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-slate-800/50 text-[#A7B6FF] group-hover:text-[#B4FFE7] transition-colors">
                    {portalIcons[portal.icon]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100 group-hover:text-[#B4FFE7] transition-colors flex items-center gap-2">
                      {portal.name}
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      {portal.tagline}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed">
                  {portal.desc}
                </p>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Divider */}
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto border-t border-slate-700/30"></div>
      </div>

      {/* Ethos Section */}
      <motion.section
        id="ethos"
        className="container mx-auto px-6 py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          <div className="prose prose-invert prose-lg md:prose-xl max-w-none">
            {/* Mission Title */}
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-slate-100">
              {t.mission.title}
            </h1>

            {/* Purpose */}
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mt-16 mb-4 text-slate-200">
              {t.mission.purpose.title}
            </h2>
            <p className="text-lg md:text-xl leading-relaxed mb-4 text-slate-300">
              {t.mission.purpose.content}
            </p>
            <p className="text-lg md:text-xl leading-relaxed mb-4 text-slate-300">
              {t.mission.purpose.note}
            </p>

            {/* Core Definition */}
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mt-16 mb-4 text-slate-200">
              {t.mission.coreDefinition.title}
            </h2>
            <p className="text-lg md:text-xl leading-relaxed mb-4 text-slate-300">
              <strong className="font-semibold text-slate-100">{t.mission.coreDefinition.content}</strong>
            </p>
            <p className="text-lg md:text-xl leading-relaxed mb-4 text-slate-300">
              {t.mission.coreDefinition.note}
            </p>

            {/* Mission in Action */}
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mt-16 mb-4 text-slate-200">
              {t.mission.inAction.title}
            </h2>
            <ul className="list-disc list-outside ml-6">
              {t.mission.inAction.items.map((item, i) => (
                <li key={i} className="text-lg md:text-xl leading-relaxed mb-3 text-slate-300">
                  {item}
                </li>
              ))}
            </ul>

            {/* Guiding Principles */}
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mt-16 mb-4 text-slate-200">
              {t.mission.principles.title}
            </h2>
            <ol className="list-decimal list-outside ml-6">
              {t.mission.principles.items.map((item, i) => (
                <li key={i} className="text-lg md:text-xl leading-relaxed mb-3 text-slate-300">
                  <strong className="font-semibold text-slate-100">{item.name}</strong> - {item.desc}
                </li>
              ))}
            </ol>

            {/* Vision */}
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mt-16 mb-4 text-slate-200">
              {t.mission.vision.title}
            </h2>
            <p className="text-lg md:text-xl leading-relaxed mb-4 text-slate-300">
              {t.mission.vision.content}
            </p>
            <p className="text-lg md:text-xl leading-relaxed mb-4 text-slate-300">
              {t.mission.vision.note}
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* Divider */}
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto border-t border-slate-700/30"></div>
      </div>

      {/* Codex Section */}
      <motion.section
        id="codex"
        className="container mx-auto px-6 py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          <div className="prose prose-invert prose-lg md:prose-xl max-w-none">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-10 text-slate-100">
              {t.codex.title}
            </h1>

            {t.codex.items.map((item) => (
              <p key={item.num} className="text-lg md:text-xl leading-relaxed mb-4 text-slate-300">
                <strong className="font-semibold text-slate-100">{item.num}. {item.name}.</strong> {item.desc}
              </p>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="container mx-auto px-6 py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-slate-100">
            {t.cta.headline}
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed text-slate-300 mb-8">
            {t.cta.content} <em className="text-[#B4FFE7] not-italic font-semibold">{t.cta.emphasis}</em>{t.cta.contentEnd}
          </p>
          <a href="mailto:hello@hwinnwin.com">
            <Button
              size="lg"
              className="bg-[#A7B6FF] text-[#0A0D1A] hover:bg-[#B4FFE7] font-semibold px-8 py-6 text-lg"
            >
              {t.cta.email}
            </Button>
          </a>
        </motion.div>
      </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/30 bg-[#0A0D1A]">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <div>{t.footer.copyright}</div>
            <div className="flex gap-6">
              <a href="/legal/privacy" className="hover:text-slate-200 transition-colors">{t.footer.privacy}</a>
              <a href="/legal/terms" className="hover:text-slate-200 transition-colors">{t.footer.terms}</a>
              <button
                onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
                className="hover:text-slate-200 transition-colors"
                data-testid="link-manage-cookies"
              >
                {t.footer.cookies}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

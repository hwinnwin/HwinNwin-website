import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function Codex() {
  const [missionContent, setMissionContent] = useState("");
  const [codexContent, setCodexContent] = useState("");

  useEffect(() => {
    // Load mission and codex markdown files
    Promise.all([
      fetch('/src/content/mission.md').then(r => r.text()),
      fetch('/src/content/codex.md').then(r => r.text())
    ]).then(([mission, codex]) => {
      setMissionContent(mission);
      setCodexContent(codex);
    });
  }, []);

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

  // Simple markdown parser for our content
  const parseMarkdown = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').map((line, i) => {
      // H1
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-5xl md:text-6xl font-serif font-bold mb-6 text-slate-100">{line.slice(2)}</h1>;
      }
      // H2
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-3xl md:text-4xl font-serif font-semibold mt-16 mb-4 text-slate-200">{line.slice(3)}</h2>;
      }
      // Bold text with **
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={i} className="text-lg md:text-xl leading-relaxed mb-4 text-slate-300">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-slate-100">{part}</strong> : part)}
          </p>
        );
      }
      // List items
      if (line.match(/^[\d]+\./)) {
        return <li key={i} className="text-lg md:text-xl leading-relaxed mb-3 text-slate-300 ml-6">{line}</li>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="text-lg md:text-xl leading-relaxed mb-3 text-slate-300 ml-6">{line.slice(2)}</li>;
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={i} className="h-2"></div>;
      }
      // Regular paragraph
      return <p key={i} className="text-lg md:text-xl leading-relaxed mb-4 text-slate-300">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0D1A] via-[#0E1330] to-[#0A0D1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0D1A]/80 border-b border-slate-700/30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-serif font-bold text-slate-100 hover:text-[#B4FFE7] transition-colors">
            hwinnwin
          </a>
          <nav className="hidden md:flex gap-8 text-sm">
            <a href="#ethos" className="text-slate-300 hover:text-slate-100 transition-colors">Ethos</a>
            <a href="#codex" className="text-slate-300 hover:text-slate-100 transition-colors">Codex</a>
            <a href="/hwin" className="text-slate-300 hover:text-slate-100 transition-colors">Work</a>
            <a href="/panel-quote" className="text-slate-300 hover:text-slate-100 transition-colors">Tools</a>
          </nav>
          <a href="mailto:hello@hwinnwin.com">
            <Button 
              variant="outline" 
              className="bg-transparent border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-slate-100"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        className="container mx-auto px-6 py-24 md:py-32"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 text-slate-100">
            Remembering, by design.
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-slate-300 mb-8 max-w-3xl mx-auto">
            We build from coherence: language, code, and consciousness woven as one.
          </p>
          <a href="mailto:hello@hwinnwin.com">
            <Button 
              size="lg"
              className="bg-[#A7B6FF] text-[#0A0D1A] hover:bg-[#B4FFE7] font-semibold px-8 py-6 text-lg"
            >
              Start the conversation →
            </Button>
          </a>
        </motion.div>
      </motion.section>

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
            {parseMarkdown(missionContent)}
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
            {parseMarkdown(codexContent)}
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
            Build from coherence.
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed text-slate-300 mb-8">
            If the work is a <em className="text-[#B4FFE7] not-italic font-semibold">hell yes</em>, let's begin. 
            Share your context; we'll tune the signal and architect from there.
          </p>
          <a href="mailto:hello@hwinnwin.com">
            <Button 
              size="lg"
              className="bg-[#A7B6FF] text-[#0A0D1A] hover:bg-[#B4FFE7] font-semibold px-8 py-6 text-lg"
            >
              hello@hwinnwin.com
            </Button>
          </a>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-slate-700/30 bg-[#0A0D1A]">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <div>© 2025 hwinnwin. All frequencies reserved.</div>
            <div className="flex gap-6">
              <a href="/legal/privacy" className="hover:text-slate-200 transition-colors">Privacy</a>
              <a href="/legal/terms" className="hover:text-slate-200 transition-colors">Terms</a>
              <button className="hover:text-slate-200 transition-colors" id="manage-cookies-link">
                Manage Cookies
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

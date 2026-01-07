import React from "react";
import { useI18n } from "@/i18n/context";
import { Locale, localeNames } from "@/i18n";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  const locales: Locale[] = ["en", "vi", "zh"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeNames[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[#0E1330] border-slate-700/50 text-slate-200"
      >
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={`cursor-pointer hover:bg-slate-800/50 ${
              locale === loc ? "bg-slate-800/30 text-[#B4FFE7]" : ""
            }`}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

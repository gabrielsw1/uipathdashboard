import { Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Desenvolvido por <span className="font-semibold text-slate-700 dark:text-slate-300">Gabriel Moreno da Luz</span>
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/gabrieldaluz23/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="LinkedIn - Gabriel Moreno da Luz"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">LinkedIn</span>
            </a>
            <a
              href="https://www.youtube.com/@rpa_simplificado"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="YouTube - RPA Simplificado"
              aria-label="YouTube"
            >
              <Youtube className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">YouTube</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}


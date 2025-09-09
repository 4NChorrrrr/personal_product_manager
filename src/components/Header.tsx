import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="border-b" style={{ backgroundColor: '#3544A3' }}>
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl text-white">🧠</span>
          <h1 className="text-xl font-semibold text-white">{t('header.title')}</h1>
        </div>
        <LanguageSelector />
      </div>
    </header>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Receipt,
  Download,
  ExternalLink,
  FileText,
} from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  pdfUrl?: string;
}

const translations = {
  en: {
    back: 'Back to Dashboard',
    title: 'Invoices',
    subtitle: 'View and download your billing history.',
    invoiceNumber: 'Invoice',
    date: 'Date',
    amount: 'Amount',
    status: 'Status',
    actions: 'Actions',
    download: 'Download',
    view: 'View',
    statuses: {
      paid: 'Paid',
      open: 'Open',
      uncollectible: 'Uncollectible',
      void: 'Void',
      draft: 'Draft',
    },
    noInvoices: 'No invoices yet',
    noInvoicesDesc: 'Your invoices will appear here once you subscribe to a paid plan.',
    viewPlans: 'View Plans',
  },
  fr: {
    back: 'Retour au tableau de bord',
    title: 'Factures',
    subtitle: 'Consultez et téléchargez votre historique de facturation.',
    invoiceNumber: 'Facture',
    date: 'Date',
    amount: 'Montant',
    status: 'Statut',
    actions: 'Actions',
    download: 'Télécharger',
    view: 'Voir',
    statuses: {
      paid: 'Payée',
      open: 'Ouverte',
      uncollectible: 'Non recouvrable',
      void: 'Annulée',
      draft: 'Brouillon',
    },
    noInvoices: 'Aucune facture',
    noInvoicesDesc: 'Vos factures apparaîtront ici une fois abonné à un plan payant.',
    viewPlans: 'Voir les plans',
  },
};

export default function InvoicesContent({ locale }: { locale: string }) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const basePath = locale === 'fr' ? '/fr' : '';
  const dateLocale = locale === 'fr' ? 'fr-CA' : 'en-US';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || data || []);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(dateLocale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'open':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'void':
      case 'uncollectible':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href={`${basePath}/dashboard`}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {t.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {t.subtitle}
      </p>

      {invoices.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 mb-4">
            <Receipt className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t.noInvoices}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {t.noInvoicesDesc}
          </p>
          <Link
            href={`${basePath}/subscription`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-lg transition-colors"
          >
            {t.viewPlans}
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t.invoiceNumber}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t.date}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t.amount}
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t.status}
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {invoice.number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(invoice.createdAt).toLocaleDateString(dateLocale, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {t.statuses[invoice.status.toLowerCase() as keyof typeof t.statuses] || invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.pdfUrl && (
                          <a
                            href={invoice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={t.download}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title={t.view}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoice.number}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {t.statuses[invoice.status.toLowerCase() as keyof typeof t.statuses] || invoice.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(invoice.createdAt).toLocaleDateString(dateLocale)}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </span>
                </div>
                {invoice.pdfUrl && (
                  <a
                    href={invoice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-[#FF6B00] hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    {t.download}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

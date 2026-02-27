import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, FileText, Receipt, CreditCard } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/SEO';
import { getCanonicalUrl } from '../utils/seo';
import { getUserFriendlyError } from '../utils/error-messages';

interface Invoice {
  id: string;
  subscriptionId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string | null;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  description: string;
  pdfUrl?: string | null;
}

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { theme, language } = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Brand colors
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const lightAIGrey = '#F4F7FA';

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Invoice[] | { isSuccess: boolean; value: Invoice[] }>('/api/v1/subscriptions/invoices');
      const data = response.data;

      // Handle wrapped response format (isSuccess/value)
      if (data && typeof data === 'object' && 'isSuccess' in data && data.isSuccess && data.value) {
        setInvoices(data.value);
      } else if (Array.isArray(data)) {
        // Handle direct array response
        setInvoices(data);
      } else {
        setInvoices([]);
      }
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      setDownloadingId(invoice.id);

      // Call the backend endpoint to generate and download PDF
      const response = await apiClient.get(`/api/v1/subscriptions/invoices/${invoice.id}/download`, {
        responseType: 'blob',
        timeout: 30000 // 30 second timeout for PDF generation
      });

      // Verify we received actual PDF data
      const blob = response.data as Blob;
      if (!blob || blob.size === 0) {
        throw new Error('Received empty PDF response');
      }

      // Check if the response is actually a PDF (not an error message)
      if (blob.type && !blob.type.includes('pdf')) {
        // Try to read as text to get error message
        const text = await blob.text();
        console.error('Unexpected response type:', blob.type, text);
        throw new Error('Failed to generate PDF. Please try again.');
      }

      // Create a blob URL and trigger download
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download invoice:', err);
      alert(getUserFriendlyError(err, 'download'));
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'N/A';
    }

    const date = new Date(dateString);

    // Check for invalid date or epoch 0 (Dec 31, 1969 / Jan 1, 1970)
    if (isNaN(date.getTime()) || date.getTime() < 86400000) {
      return 'N/A';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return {
          icon: CheckCircle,
          bg: theme === 'dark' ? 'rgba(255, 107, 0, 0.15)' : '#FFF4ED',
          text: theme === 'dark' ? '#FF8C42' : '#CC4A00',
          border: theme === 'dark' ? 'rgba(255, 107, 0, 0.3)' : '#FFD4B8'
        };
      case 'pending':
        return {
          icon: Clock,
          bg: theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : '#FFFBEB',
          text: theme === 'dark' ? '#FCD34D' : '#92400E',
          border: theme === 'dark' ? 'rgba(251, 191, 36, 0.3)' : '#FDE68A'
        };
      case 'failed':
        return {
          icon: XCircle,
          bg: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
          text: theme === 'dark' ? '#FCA5A5' : '#DC2626',
          border: theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#FECACA'
        };
      case 'refunded':
        return {
          icon: AlertCircle,
          bg: theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
          text: theme === 'dark' ? '#93C5FD' : '#1D4ED8',
          border: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE'
        };
      default:
        return {
          icon: AlertCircle,
          bg: theme === 'dark' ? 'rgba(107, 114, 128, 0.15)' : '#F9FAFB',
          text: theme === 'dark' ? '#9CA3AF' : '#6B7280',
          border: theme === 'dark' ? 'rgba(107, 114, 128, 0.3)' : '#E5E7EB'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme === 'dark' ? '#111827' : lightAIGrey }}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div
              className="absolute inset-0 rounded-full border-4"
              style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}
            />
            <div
              className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: `${momentumOrange} transparent transparent transparent` }}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme === 'dark' ? '#111827' : lightAIGrey }}>
      <SEO
        title={language === 'fr' ? "Factures | Sqordia" : "Invoices | Sqordia"}
        description={language === 'fr' ? "Consultez vos factures Sqordia." : "View your Sqordia invoices."}
        url={getCanonicalUrl('/invoices')}
        noindex={true}
        nofollow={true}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/subscription')}
            className="inline-flex items-center gap-2 mb-6 transition-all group"
            style={{ color: theme === 'dark' ? '#D1D5DB' : strategyBlue }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Subscription</span>
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: theme === 'dark' ? strategyBlue : strategyBlue }}
            >
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}
              >
                Invoice History
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and download your billing invoices
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="mb-6 rounded-xl border-2 p-4 flex items-center gap-3"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
              borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#FECACA'
            }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: theme === 'dark' ? '#FCA5A5' : '#DC2626' }} />
            <p style={{ color: theme === 'dark' ? '#FCA5A5' : '#DC2626' }}>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {invoices.length === 0 ? (
          <div
            className="rounded-2xl border-2 p-12 text-center shadow-lg"
            style={{
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              borderColor: theme === 'dark' ? '#374151' : strategyBlue
            }}
          >
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: theme === 'dark' ? '#374151' : lightAIGrey }}
            >
              <FileText className="w-10 h-10" style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }} />
            </div>
            <h3
              className="text-2xl font-bold mb-3"
              style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}
            >
              No Invoices Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Your invoices will appear here once you have an active paid subscription.
            </p>
            <button
              onClick={() => navigate('/subscription-plans')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl"
              style={{ backgroundColor: momentumOrange }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
            >
              <CreditCard className="w-5 h-5" />
              View Plans
            </button>
          </div>
        ) : (
          /* Invoice Cards - Mobile-friendly card layout */
          <div className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div
                className="rounded-xl border-2 p-4"
                style={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                }}
              >
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Invoices</div>
                <div className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                  {invoices.length}
                </div>
              </div>
              <div
                className="rounded-xl border-2 p-4"
                style={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                }}
              >
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Paid</div>
                <div className="text-2xl font-bold" style={{ color: momentumOrange }}>
                  {invoices.filter(i => i.status.toLowerCase() === 'paid').length}
                </div>
              </div>
              <div
                className="rounded-xl border-2 p-4"
                style={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                }}
              >
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Spent</div>
                <div className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                  {formatPrice(
                    invoices
                      .filter(i => i.status.toLowerCase() === 'paid')
                      .reduce((sum, i) => sum + i.total, 0),
                    invoices[0]?.currency || 'CAD'
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Table/Cards */}
            <div
              className="rounded-2xl border-2 overflow-hidden shadow-lg"
              style={{
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                borderColor: theme === 'dark' ? '#374151' : strategyBlue
              }}
            >
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full table-fixed">
                  <thead>
                    <tr style={{ backgroundColor: theme === 'dark' ? '#111827' : lightAIGrey }}>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-[28%]" style={{ color: theme === 'dark' ? '#9CA3AF' : strategyBlue }}>
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-[15%]" style={{ color: theme === 'dark' ? '#9CA3AF' : strategyBlue }}>
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-[20%]" style={{ color: theme === 'dark' ? '#9CA3AF' : strategyBlue }}>
                        Period
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-[12%]" style={{ color: theme === 'dark' ? '#9CA3AF' : strategyBlue }}>
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-[10%]" style={{ color: theme === 'dark' ? '#9CA3AF' : strategyBlue }}>
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider w-[15%]" style={{ color: theme === 'dark' ? '#9CA3AF' : strategyBlue }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {invoices.map((invoice) => {
                      const statusConfig = getStatusConfig(invoice.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <tr
                          key={invoice.id}
                          className="transition-colors"
                          style={{ backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(244, 247, 250, 0.5)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: theme === 'dark' ? '#374151' : lightAIGrey }}
                              >
                                <FileText className="w-4 h-4" style={{ color: momentumOrange }} />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm truncate" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                                  {invoice.invoiceNumber}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {invoice.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                              {formatDate(invoice.issueDate)}
                            </div>
                            {invoice.paidDate && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Paid: {formatDate(invoice.paidDate)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-xs" style={{ color: theme === 'dark' ? '#D1D5DB' : '#4B5563' }}>
                              {formatDate(invoice.periodStart)} –<br/>{formatDate(invoice.periodEnd)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-bold" style={{ color: momentumOrange }}>
                              {formatPrice(invoice.total, invoice.currency)}
                            </div>
                            {invoice.tax > 0 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Tax: {formatPrice(invoice.tax, invoice.currency)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border"
                              style={{
                                backgroundColor: statusConfig.bg,
                                color: statusConfig.text,
                                borderColor: statusConfig.border
                              }}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {invoice.status}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDownloadInvoice(invoice)}
                              disabled={downloadingId === invoice.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                borderColor: momentumOrange,
                                color: downloadingId === invoice.id ? '#FFFFFF' : momentumOrange,
                                backgroundColor: downloadingId === invoice.id ? momentumOrange : 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                if (downloadingId !== invoice.id) {
                                  e.currentTarget.style.backgroundColor = momentumOrange;
                                  e.currentTarget.style.color = '#FFFFFF';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (downloadingId !== invoice.id) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = momentumOrange;
                                }
                              }}
                            >
                              {downloadingId === invoice.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  Download
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className={`md:hidden divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {invoices.map((invoice) => {
                  const statusConfig = getStatusConfig(invoice.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div key={invoice.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme === 'dark' ? '#374151' : lightAIGrey }}
                          >
                            <FileText className="w-5 h-5" style={{ color: momentumOrange }} />
                          </div>
                          <div>
                            <div className="font-semibold" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                              {invoice.invoiceNumber}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(invoice.issueDate)}
                            </div>
                          </div>
                        </div>
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
                          style={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.text,
                            borderColor: statusConfig.border
                          }}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {invoice.status}
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                        {invoice.description}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                            {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                          </div>
                          <div className="font-bold text-lg" style={{ color: momentumOrange }}>
                            {formatPrice(invoice.total, invoice.currency)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          disabled={downloadingId === invoice.id}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: momentumOrange }}
                        >
                          {downloadingId === invoice.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Download
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

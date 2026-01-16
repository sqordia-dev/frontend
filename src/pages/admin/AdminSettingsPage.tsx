import { useEffect, useState } from 'react';
import { settingsService, themeColors, ThemeColor } from '../../lib/settings-service';
import { useTheme } from '../../contexts/ThemeContext';
import { Check, Palette, Save, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const { themeColor, setThemeColor, t } = useTheme();
  const [selectedColor, setSelectedColor] = useState<string>(themeColor.id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCurrentTheme();
  }, []);

  const loadCurrentTheme = async () => {
    try {
      setLoading(true);
      const colorId = await settingsService.getThemeColor();
      setSelectedColor(colorId);
    } catch (error: any) {
      console.error('Failed to load theme color:', error);
      setMessage({ type: 'error', text: 'Failed to load current theme color' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await setThemeColor(selectedColor);
      setMessage({ type: 'success', text: 'Theme color updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to save theme color:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update theme color' });
    } finally {
      setSaving(false);
    }
  };

  const selectedTheme = themeColors.find(c => c.id === selectedColor) || themeColors[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Theme Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Customize the primary color theme for the entire application
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <AlertCircle
            className={`w-5 h-5 ${
              message.type === 'success' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
            }`}
          />
          <p
            className={
              message.type === 'success'
                ? 'text-orange-800 dark:text-orange-300'
                : 'text-red-800 dark:text-red-300'
            }
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Current Theme Preview */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Theme</h2>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl shadow-lg"
            style={{ backgroundColor: themeColor.primary }}
          ></div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{themeColor.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{themeColor.primary}</p>
          </div>
        </div>
      </div>

      {/* Color Selection */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Select Theme Color</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themeColors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                className={`relative group p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedColor === color.id
                    ? 'border-gray-900 dark:border-white shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                {/* Checkmark */}
                {selectedColor === color.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white dark:text-gray-900" />
                  </div>
                )}

                {/* Color Preview */}
                <div
                  className="w-full h-20 rounded-lg mb-3 shadow-md"
                  style={{ backgroundColor: color.primary }}
                ></div>

                {/* Color Info */}
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">{color.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{color.primary}</p>
                </div>

                {/* Hover Preview */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: color.primary }}></div>
              </button>
            ))}
          </div>
        )}

        {/* Selected Color Details */}
        {selectedTheme && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Color Values
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Primary</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: selectedTheme.primary }}
                  ></div>
                  <code className="text-xs text-gray-700 dark:text-gray-300">{selectedTheme.primary}</code>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hover</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: selectedTheme.primaryHover }}
                  ></div>
                  <code className="text-xs text-gray-700 dark:text-gray-300">{selectedTheme.primaryHover}</code>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Light</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: selectedTheme.primaryLight }}
                  ></div>
                  <code className="text-xs text-gray-700 dark:text-gray-300">{selectedTheme.primaryLight}</code>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dark</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: selectedTheme.primaryDark }}
                  ></div>
                  <code className="text-xs text-gray-700 dark:text-gray-300">{selectedTheme.primaryDark}</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || selectedColor === themeColor.id}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5"
            style={{
              backgroundColor: selectedTheme.primary,
            }}
            onMouseEnter={(e) => {
              if (!saving && selectedColor !== themeColor.id) {
                e.currentTarget.style.backgroundColor = selectedTheme.primaryHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!saving && selectedColor !== themeColor.id) {
                e.currentTarget.style.backgroundColor = selectedTheme.primary;
              }
            }}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Theme Color</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Preview</h2>
        <div className="space-y-4">
          {/* Button Preview */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Button</p>
            <button
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all"
              style={{ backgroundColor: selectedTheme.primary }}
            >
              Primary Button
            </button>
          </div>

          {/* Badge Preview */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Badge</p>
            <span
              className="px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: selectedTheme.primary }}
            >
              Featured
            </span>
          </div>

          {/* Link Preview */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Link</p>
            <a
              href="#"
              className="font-semibold transition-colors"
              style={{ color: selectedTheme.primary }}
            >
              Click here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';

import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'business' | 'commerce' | 'seo' | 'social' | 'enquiry'>('business');

  useEffect(() => {
    async function load() {
      try { const { settings: s } = await api.settings.get(); setSettings(s); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const updateField = (section: string, field: string, value: unknown) => {
    setSettings((prev: typeof settings) => {
      if (!prev) return prev;
      return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
    setMessage(null);
  };

  const handleSave = async (section: string) => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.settings.update({ [section]: settings[section] });
      setMessage({ type: 'success', text: `${section} saved successfully` });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to save' });
    } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'business', label: 'Business', icon: 'Building' },
    { id: 'commerce', label: 'Commerce', icon: 'ShoppingCart' },
    { id: 'seo', label: 'SEO', icon: 'Search' },
    { id: 'social', label: 'Social', icon: 'Share2' },
    { id: 'enquiry', label: 'Enquiries', icon: 'Mail' },
  ] as const;

  if (loading) return <div className={styles.loading}>Loading settings…</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Configure your business, commerce, and site settings</p>
      </header>

      {message && (
        <div className={styles.toast + ' ' + styles[message.type]}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className={styles.tabs} role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            className={styles.tab + (activeTab === t.id ? ' ' + styles.active : '')}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
          >{t.label}</button>
        ))}
      </div>

      <div className={styles.formWrap} role="tabpanel" id={`${activeTab}-panel`}>
        {activeTab === 'business' && <SettingsSection title="Business Information" onSave={() => handleSave('business')} saving={saving}>
          <div className={styles.grid}>
            <Input label="Business Name" value={settings.business.name} onChange={e => updateField('business', 'name', e.target.value)} />
            <Input label="Legal Name" value={settings.business.legalName} onChange={e => updateField('business', 'legalName', e.target.value)} />
            <Input label="Email" type="email" value={settings.business.email} onChange={e => updateField('business', 'email', e.target.value)} />
            <Input label="Phone" value={settings.business.phone} onChange={e => updateField('business', 'phone', e.target.value)} />
            <Input label="WhatsApp" value={settings.business.whatsapp} onChange={e => updateField('business', 'whatsapp', e.target.value)} placeholder="+91 98765 43210" />
            <Input label="GST Number" value={settings.business.gstNumber} onChange={e => updateField('business', 'gstNumber', e.target.value)} />
            <Input label="Address" value={settings.business.address} onChange={e => updateField('business', 'address', e.target.value)} />
            <Input label="City" value={settings.business.city} onChange={e => updateField('business', 'city', e.target.value)} />
            <Input label="State" value={settings.business.state} onChange={e => updateField('business', 'state', e.target.value)} />
            <Input label="Postal Code" value={settings.business.postalCode} onChange={e => updateField('business', 'postalCode', e.target.value)} />
            <Input label="Country" value={settings.business.country} onChange={e => updateField('business', 'country', e.target.value)} />
          </div>
        </SettingsSection>}

        {activeTab === 'commerce' && <SettingsSection title="Commerce & Pricing" onSave={() => handleSave('commerce')} saving={saving}>
          <div className={styles.grid}>
            <Select label="Currency" value={settings.commerce.currency} onChange={e => updateField('commerce', 'currency', e.target.value)} options={[
              { value: 'INR', label: 'Indian Rupee (INR)' },
              { value: 'USD', label: 'US Dollar (USD)' },
            ]} />
            <Input label="Tax Rate (%)" type="number" min="0" max="100" step="0.01" value={settings.commerce.taxPercent} onChange={e => updateField('commerce', 'taxPercent', Number(e.target.value) || 0)} />
            <Input label="Flat Shipping (₹)" type="number" min="0" step="0.01" value={settings.commerce.shippingFlatRate} onChange={e => updateField('commerce', 'shippingFlatRate', Number(e.target.value) || 0)} />
            <Input label="Free Shipping Threshold (₹)" type="number" min="0" step="0.01" value={settings.commerce.freeShippingThreshold} onChange={e => updateField('commerce', 'freeShippingThreshold', Number(e.target.value) || 0)} />
            <Input label="Default Low Stock Alert" type="number" min="0" value={settings.commerce.defaultLowStockThreshold} onChange={e => updateField('commerce', 'defaultLowStockThreshold', Number(e.target.value) || 5)} />
          </div>
        </SettingsSection>}

        {activeTab === 'seo' && <SettingsSection title="SEO Defaults" onSave={() => handleSave('seo')} saving={saving}>
          <div className={styles.grid}>
            <Input label="Default Page Title" value={settings.seo.defaultTitle} onChange={e => updateField('seo', 'defaultTitle', e.target.value)} />
            <Input label="Title Suffix" value={settings.seo.titleSuffix} onChange={e => updateField('seo', 'titleSuffix', e.target.value)} placeholder="| Shreeji Corporate Gift" />
            <Textarea label="Default Meta Description" value={settings.seo.defaultDescription} onChange={e => updateField('seo', 'defaultDescription', e.target.value)} rows={3} maxLength={300} />
            <Input label="Open Graph Image URL" value={settings.seo.ogImage} onChange={e => updateField('seo', 'ogImage', e.target.value)} placeholder="https://..." />
          </div>
        </SettingsSection>}

        {activeTab === 'social' && <SettingsSection title="Social Media Links" onSave={() => handleSave('social')} saving={saving}>
          <div className={styles.grid}>
            <Input label="Facebook" value={settings.social.facebook} onChange={e => updateField('social', 'facebook', e.target.value)} placeholder="https://facebook.com/..." />
            <Input label="Instagram" value={settings.social.instagram} onChange={e => updateField('social', 'instagram', e.target.value)} placeholder="https://instagram.com/..." />
            <Input label="LinkedIn" value={settings.social.linkedin} onChange={e => updateField('social', 'linkedin', e.target.value)} placeholder="https://linkedin.com/..." />
            <Input label="Twitter (X)" value={settings.social.twitter} onChange={e => updateField('social', 'twitter', e.target.value)} placeholder="https://twitter.com/..." />
            <Input label="YouTube" value={settings.social.youtube} onChange={e => updateField('social', 'youtube', e.target.value)} placeholder="https://youtube.com/..." />
          </div>
        </SettingsSection>}

        {activeTab === 'enquiry' && <SettingsSection title="Enquiry Notifications" onSave={() => handleSave('enquiry')} saving={saving}>
          <div className={styles.grid}>
            <div className={styles.fullWidth}>
              <label className={styles.label}><input type="checkbox" checked={settings.enquiry.autoAckEnabled} onChange={e => updateField('enquiry', 'autoAckEnabled', e.target.checked)} /> Auto-acknowledge new enquiries via email</label>
            </div>
            <div className={styles.fullWidth}>
              <label className={styles.label}>Auto-acknowledge Message</label>
              <Textarea value={settings.enquiry.autoAckMessage} onChange={e => updateField('enquiry', 'autoAckMessage', e.target.value)} rows={3} placeholder="Message sent to customer upon enquiry submission" />
            </div>
            <div className={styles.fullWidth}>
              <label className={styles.label}>Notification Emails (comma-separated)</label>
              <Input value={settings.enquiry.notifyEmails.join(', ')} onChange={e => updateField('enquiry', 'notifyEmails', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} placeholder="admin@shreeji.com, sales@shreeji.com" />
            </div>
          </div>
        </SettingsSection>}
      </div>
    </div>
  );
}

function SettingsSection({ title, children, onSave, saving }: any) {
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(); }} className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <Button type="submit" variant="gold" loading={saving}>
          {saving ? <Loader2 size={18} className={styles.spinner} /> : 'Save Changes'}
        </Button>
      </div>
      {children}
    </form>
  );
}
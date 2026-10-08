import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';
import styles from './SettingsPage.module.css';
export function SettingsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('business');
    useEffect(() => {
        async function load() {
            try {
                const { settings: s } = await api.settings.get();
                setSettings(s);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        }
        load();
    }, []);
    const updateField = (section, field, value) => {
        setSettings((prev) => {
            if (!prev)
                return prev;
            return { ...prev, [section]: { ...prev[section], [field]: value } };
        });
        setMessage(null);
    };
    const handleSave = async (section) => {
        if (!settings)
            return;
        setSaving(true);
        setMessage(null);
        try {
            await api.settings.update({ [section]: settings[section] });
            setMessage({ type: 'success', text: `${section} saved successfully` });
        }
        catch (e) {
            setMessage({ type: 'error', text: e.message || 'Failed to save' });
        }
        finally {
            setSaving(false);
        }
    };
    const tabs = [
        { id: 'business', label: 'Business', icon: 'Building' },
        { id: 'commerce', label: 'Commerce', icon: 'ShoppingCart' },
        { id: 'seo', label: 'SEO', icon: 'Search' },
        { id: 'social', label: 'Social', icon: 'Share2' },
        { id: 'enquiry', label: 'Enquiries', icon: 'Mail' },
    ];
    if (loading)
        return _jsx("div", { className: styles.loading, children: "Loading settings\u2026" });
    return (_jsxs("div", { className: styles.page, children: [_jsxs("header", { className: styles.header, children: [_jsx("h1", { className: styles.title, children: "Settings" }), _jsx("p", { className: styles.subtitle, children: "Configure your business, commerce, and site settings" })] }), message && (_jsxs("div", { className: styles.toast + ' ' + styles[message.type], children: [message.type === 'success' ? _jsx(CheckCircle, { size: 18 }) : _jsx(AlertCircle, { size: 18 }), message.text] })), _jsx("div", { className: styles.tabs, role: "tablist", children: tabs.map(t => (_jsx("button", { type: "button", role: "tab", "aria-selected": activeTab === t.id, className: styles.tab + (activeTab === t.id ? ' ' + styles.active : ''), onClick: () => setActiveTab(t.id), children: t.label }, t.id))) }), _jsxs("div", { className: styles.formWrap, role: "tabpanel", id: `${activeTab}-panel`, children: [activeTab === 'business' && _jsx(SettingsSection, { title: "Business Information", onSave: () => handleSave('business'), saving: saving, children: _jsxs("div", { className: styles.grid, children: [_jsx(Input, { label: "Business Name", value: settings.business.name, onChange: e => updateField('business', 'name', e.target.value) }), _jsx(Input, { label: "Legal Name", value: settings.business.legalName, onChange: e => updateField('business', 'legalName', e.target.value) }), _jsx(Input, { label: "Email", type: "email", value: settings.business.email, onChange: e => updateField('business', 'email', e.target.value) }), _jsx(Input, { label: "Phone", value: settings.business.phone, onChange: e => updateField('business', 'phone', e.target.value) }), _jsx(Input, { label: "WhatsApp", value: settings.business.whatsapp, onChange: e => updateField('business', 'whatsapp', e.target.value), placeholder: "+91 98765 43210" }), _jsx(Input, { label: "GST Number", value: settings.business.gstNumber, onChange: e => updateField('business', 'gstNumber', e.target.value) }), _jsx(Input, { label: "Address", value: settings.business.address, onChange: e => updateField('business', 'address', e.target.value) }), _jsx(Input, { label: "City", value: settings.business.city, onChange: e => updateField('business', 'city', e.target.value) }), _jsx(Input, { label: "State", value: settings.business.state, onChange: e => updateField('business', 'state', e.target.value) }), _jsx(Input, { label: "Postal Code", value: settings.business.postalCode, onChange: e => updateField('business', 'postalCode', e.target.value) }), _jsx(Input, { label: "Country", value: settings.business.country, onChange: e => updateField('business', 'country', e.target.value) })] }) }), activeTab === 'commerce' && _jsx(SettingsSection, { title: "Commerce & Pricing", onSave: () => handleSave('commerce'), saving: saving, children: _jsxs("div", { className: styles.grid, children: [_jsx(Select, { label: "Currency", value: settings.commerce.currency, onChange: e => updateField('commerce', 'currency', e.target.value), options: [
                                        { value: 'INR', label: 'Indian Rupee (INR)' },
                                        { value: 'USD', label: 'US Dollar (USD)' },
                                    ] }), _jsx(Input, { label: "Tax Rate (%)", type: "number", min: "0", max: "100", step: "0.01", value: settings.commerce.taxPercent, onChange: e => updateField('commerce', 'taxPercent', Number(e.target.value) || 0) }), _jsx(Input, { label: "Flat Shipping (\u20B9)", type: "number", min: "0", step: "0.01", value: settings.commerce.shippingFlatRate, onChange: e => updateField('commerce', 'shippingFlatRate', Number(e.target.value) || 0) }), _jsx(Input, { label: "Free Shipping Threshold (\u20B9)", type: "number", min: "0", step: "0.01", value: settings.commerce.freeShippingThreshold, onChange: e => updateField('commerce', 'freeShippingThreshold', Number(e.target.value) || 0) }), _jsx(Input, { label: "Default Low Stock Alert", type: "number", min: "0", value: settings.commerce.defaultLowStockThreshold, onChange: e => updateField('commerce', 'defaultLowStockThreshold', Number(e.target.value) || 5) })] }) }), activeTab === 'seo' && _jsx(SettingsSection, { title: "SEO Defaults", onSave: () => handleSave('seo'), saving: saving, children: _jsxs("div", { className: styles.grid, children: [_jsx(Input, { label: "Default Page Title", value: settings.seo.defaultTitle, onChange: e => updateField('seo', 'defaultTitle', e.target.value) }), _jsx(Input, { label: "Title Suffix", value: settings.seo.titleSuffix, onChange: e => updateField('seo', 'titleSuffix', e.target.value), placeholder: "| Shreeji Corporate Gift" }), _jsx(Textarea, { label: "Default Meta Description", value: settings.seo.defaultDescription, onChange: e => updateField('seo', 'defaultDescription', e.target.value), rows: 3, maxLength: 300 }), _jsx(Input, { label: "Open Graph Image URL", value: settings.seo.ogImage, onChange: e => updateField('seo', 'ogImage', e.target.value), placeholder: "https://..." })] }) }), activeTab === 'social' && _jsx(SettingsSection, { title: "Social Media Links", onSave: () => handleSave('social'), saving: saving, children: _jsxs("div", { className: styles.grid, children: [_jsx(Input, { label: "Facebook", value: settings.social.facebook, onChange: e => updateField('social', 'facebook', e.target.value), placeholder: "https://facebook.com/..." }), _jsx(Input, { label: "Instagram", value: settings.social.instagram, onChange: e => updateField('social', 'instagram', e.target.value), placeholder: "https://instagram.com/..." }), _jsx(Input, { label: "LinkedIn", value: settings.social.linkedin, onChange: e => updateField('social', 'linkedin', e.target.value), placeholder: "https://linkedin.com/..." }), _jsx(Input, { label: "Twitter (X)", value: settings.social.twitter, onChange: e => updateField('social', 'twitter', e.target.value), placeholder: "https://twitter.com/..." }), _jsx(Input, { label: "YouTube", value: settings.social.youtube, onChange: e => updateField('social', 'youtube', e.target.value), placeholder: "https://youtube.com/..." })] }) }), activeTab === 'enquiry' && _jsx(SettingsSection, { title: "Enquiry Notifications", onSave: () => handleSave('enquiry'), saving: saving, children: _jsxs("div", { className: styles.grid, children: [_jsx("div", { className: styles.fullWidth, children: _jsxs("label", { className: styles.label, children: [_jsx("input", { type: "checkbox", checked: settings.enquiry.autoAckEnabled, onChange: e => updateField('enquiry', 'autoAckEnabled', e.target.checked) }), " Auto-acknowledge new enquiries via email"] }) }), _jsxs("div", { className: styles.fullWidth, children: [_jsx("label", { className: styles.label, children: "Auto-acknowledge Message" }), _jsx(Textarea, { value: settings.enquiry.autoAckMessage, onChange: e => updateField('enquiry', 'autoAckMessage', e.target.value), rows: 3, placeholder: "Message sent to customer upon enquiry submission" })] }), _jsxs("div", { className: styles.fullWidth, children: [_jsx("label", { className: styles.label, children: "Notification Emails (comma-separated)" }), _jsx(Input, { value: settings.enquiry.notifyEmails.join(', '), onChange: e => updateField('enquiry', 'notifyEmails', e.target.value.split(',').map((s) => s.trim()).filter(Boolean)), placeholder: "admin@shreeji.com, sales@shreeji.com" })] })] }) })] })] }));
}
function SettingsSection({ title, children, onSave, saving }) {
    return (_jsxs("form", { onSubmit: e => { e.preventDefault(); onSave(); }, className: styles.section, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx("h2", { className: styles.sectionTitle, children: title }), _jsx(Button, { type: "submit", variant: "gold", loading: saving, children: saving ? _jsx(Loader2, { size: 18, className: styles.spinner }) : 'Save Changes' })] }), children] }));
}

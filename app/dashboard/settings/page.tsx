'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { ApiKeysService, AIProvider } from '@/lib/services/api-keys.service';
import { Key, Check, X, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const [apiKeys, setApiKeys] = useState<{ [K in AIProvider]?: string }>({});
    const [savedKeys, setSavedKeys] = useState<AIProvider[]>([]);
    const [loading, setLoading] = useState<AIProvider | null>(null);
    const [testingKey, setTestingKey] = useState<AIProvider | null>(null);
    const [messages, setMessages] = useState<{ [K in AIProvider]?: { type: 'success' | 'error'; text: string } }>({});

    useEffect(() => {
        if (user) {
            loadSavedKeys();
        }
    }, [user]);

    const loadSavedKeys = async () => {
        if (!user) return;

        const { data } = await ApiKeysService.listUserKeys(user.id);
        if (data) {
            setSavedKeys(data.filter(k => k.is_active).map(k => k.provider as AIProvider));
        }
    };

    const handleSaveKey = async (provider: AIProvider) => {
        if (!user || !apiKeys[provider]) return;

        setLoading(provider);
        setMessages(prev => ({ ...prev, [provider]: undefined }));

        const { error } = await ApiKeysService.saveApiKey(user.id, provider, apiKeys[provider]!);

        if (error) {
            setMessages(prev => ({
                ...prev,
                [provider]: { type: 'error', text: `Erreur: ${error.message}` }
            }));
        } else {
            setMessages(prev => ({
                ...prev,
                [provider]: { type: 'success', text: 'Clé sauvegardée avec succès' }
            }));
            setSavedKeys(prev => [...new Set([...prev, provider])]);
            setApiKeys(prev => ({ ...prev, [provider]: '' })); // Clear input
        }

        setLoading(null);
    };

    const handleTestKey = async (provider: AIProvider) => {
        if (!apiKeys[provider]) return;

        setTestingKey(provider);
        setMessages(prev => ({ ...prev, [provider]: undefined }));

        const result = await ApiKeysService.testApiKey(provider, apiKeys[provider]!);

        if (result.success) {
            setMessages(prev => ({
                ...prev,
                [provider]: { type: 'success', text: '✓ Format de clé valide' }
            }));
        } else {
            setMessages(prev => ({
                ...prev,
                [provider]: { type: 'error', text: result.error || 'Clé invalide' }
            }));
        }

        setTestingKey(null);
    };

    const handleDeleteKey = async (provider: AIProvider) => {
        if (!user) return;

        setLoading(provider);
        const { error } = await ApiKeysService.deleteApiKey(user.id, provider);

        if (!error) {
            setSavedKeys(prev => prev.filter(p => p !== provider));
            setMessages(prev => ({
                ...prev,
                [provider]: { type: 'success', text: 'Clé supprimée' }
            }));
        }

        setLoading(null);
    };

    const providers: { id: AIProvider; name: string; description: string; link: string; prefix: string }[] = [
        {
            id: 'gemini',
            name: 'Google Gemini',
            description: 'Modèles Gemini 2.0 Flash pour génération rapide',
            link: 'https://aistudio.google.com/app/apikey',
            prefix: 'AIza...'
        },
        {
            id: 'deepseek',
            name: 'DeepSeek',
            description: 'DeepSeek Chat - Performant et économique',
            link: 'https://platform.deepseek.com/api_keys',
            prefix: 'sk-...'
        },
        {
            id: 'anthropic',
            name: 'Anthropic Claude',
            description: 'Claude Sonnet 4 - Le plus avancé',
            link: 'https://console.anthropic.com',
            prefix: 'sk-ant-...'
        },
    ];

    if (!user) {
        return (
            <div className="p-8">
                <div className="glass-card p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <p>Veuillez vous connecter pour gérer vos clés API</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Paramètres des clés API
                </h1>
                <p className="text-gray-600 mt-2">
                    Configurez vos clés API pour utiliser les services d'IA
                </p>
            </div>

            <div className="space-y-6">
                {providers.map((provider) => {
                    const isSaved = savedKeys.includes(provider.id);
                    const message = messages[provider.id];

                    return (
                        <div key={provider.id} className="glass-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Key className="w-5 h-5 text-primary" />
                                        {provider.name}
                                        {isSaved && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                                <Check className="w-3 h-3" />
                                                Configurée
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                                    <a
                                        href={provider.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline mt-1 inline-block"
                                    >
                                        Obtenir une clé API →
                                    </a>
                                </div>
                            </div>

                            {message && (
                                <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <input
                                    type="password"
                                    placeholder={`${provider.prefix} Votre clé API`}
                                    value={apiKeys[provider.id] || ''}
                                    onChange={(e) => setApiKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                                    className="flex-1 px-4 py-2.5 bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-sm"
                                />

                                <button
                                    onClick={() => handleTestKey(provider.id)}
                                    disabled={!apiKeys[provider.id] || testingKey === provider.id}
                                    className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Tester le format"
                                >
                                    {testingKey === provider.id ? '...' : 'Tester'}
                                </button>

                                <button
                                    onClick={() => handleSaveKey(provider.id)}
                                    disabled={!apiKeys[provider.id] || loading === provider.id}
                                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading === provider.id ? 'Sauvegarde...' : 'Sauvegarder'}
                                </button>

                                {isSaved && (
                                    <button
                                        onClick={() => handleDeleteKey(provider.id)}
                                        disabled={loading === provider.id}
                                        className="px-4 py-2.5 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                                        title="Supprimer la clé"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="glass-card p-6 mt-8 bg-blue-50/50">
                <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Comment ça marche ?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Vos clés sont chiffrées avant d'être stockées dans Supabase</li>
                    <li>• Seules VOS clés sont utilisées pour VOS requêtes IA</li>
                    <li>• Vous ne payez que ce que vous consommez directement auprès des fournisseurs</li>
                    <li>• Au moins une clé est requise pour utiliser les fonctionnalités IA</li>
                </ul>
            </div>
        </div>
    );
}

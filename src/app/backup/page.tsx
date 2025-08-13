
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, AlertTriangle, DatabaseBackup } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const LOCALSTORAGE_KEYS = [
    'kanbanTasks',
    'customRoulettes',
    'pairingRouletteHistory',
    'decodeEvaluations',
    'coreValuesTeams',
    'drawingCanvasState',
    'ticTacToeState',
    'memoryGameState',
    'flappyBirdHighScore',
    'roundsHistory',
    'innovationProjectScores_v2',
    'robotDesignScores_v2',
    'chatMessages',
    'customNotifications',
    'chatMuted',
    'strategyMapImage',
    'strategyHistory',
    'strategySteps',
    'strategyResources',
    'attachments',
    'activityLog',
];

// Keys that represent arrays of objects with an 'id' property and should be merged.
const ARRAY_KEYS_TO_MERGE = [
    'kanbanTasks',
    'customRoulettes',
    'pairingRouletteHistory',
    'decodeEvaluations',
    'coreValuesTeams',
    'roundsHistory',
    'chatMessages',
    'customNotifications',
    'attachments',
    'activityLog',
];


export default function BackupPage() {
    const { toast } = useToast();
    const [isImportAlertOpen, setImportAlertOpen] = useState(false);
    const [fileToImport, setFileToImport] = useState<File | null>(null);

    const handleExport = () => {
        try {
            const data: Record<string, any> = {};
            LOCALSTORAGE_KEYS.forEach(key => {
                const value = localStorage.getItem(key);
                if (value !== null) {
                    try {
                        data[key] = JSON.parse(value);
                    } catch {
                        data[key] = value; // Store as string if not valid JSON
                    }
                }
            });

            if (Object.keys(data).length === 0) {
                toast({
                    variant: 'destructive',
                    title: 'Nenhum dado para exportar',
                    description: 'Não foram encontrados dados salvos para criar um backup.',
                });
                return;
            }

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_dados_avalon_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
                title: 'Exportação Concluída!',
                description: 'O arquivo de backup foi baixado.',
            });
        } catch (error) {
            console.error('Falha na exportação:', error);
            toast({
                variant: 'destructive',
                title: 'Erro na Exportação',
                description: 'Não foi possível gerar o arquivo de backup.',
            });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileToImport(file);
            setImportAlertOpen(true);
        }
    };

    const handleImportConfirm = () => {
        if (!fileToImport) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("O arquivo está vazio ou corrompido.");
                }

                const importedData = JSON.parse(text);

                // Basic validation
                const importedKeys = Object.keys(importedData);
                if (importedKeys.length === 0 || !LOCALSTORAGE_KEYS.some(key => importedKeys.includes(key))) {
                     throw new Error("Este não parece ser um arquivo de backup válido.");
                }

                importedKeys.forEach(key => {
                    if (LOCALSTORAGE_KEYS.includes(key)) {
                        const importedValue = importedData[key];
                        
                        if (ARRAY_KEYS_TO_MERGE.includes(key) && Array.isArray(importedValue)) {
                            // Merge arrays by ID
                            const existingValueRaw = localStorage.getItem(key);
                            const existingValue = existingValueRaw ? JSON.parse(existingValueRaw) : [];
                            
                            if (Array.isArray(existingValue)) {
                                const combined = [...existingValue, ...importedValue];
                                const uniqueMap = new Map();
                                combined.forEach(item => {
                                    if (item && typeof item === 'object' && 'id' in item) {
                                        uniqueMap.set(item.id, item);
                                    }
                                });
                                const mergedValue = Array.from(uniqueMap.values());
                                localStorage.setItem(key, JSON.stringify(mergedValue));
                            } else {
                                // If existing is not an array, overwrite
                                localStorage.setItem(key, JSON.stringify(importedValue));
                            }
                        } else {
                            // For non-array keys or keys not in the merge list, simply overwrite.
                            localStorage.setItem(key, JSON.stringify(importedValue));
                        }
                    }
                });
                
                toast({
                    title: 'Importação Concluída!',
                    description: 'Os dados foram restaurados. A página será recarregada.',
                });
                
                // Reload the page to apply changes everywhere
                setTimeout(() => window.location.reload(), 2000);

            } catch (error: any) {
                console.error('Falha na importação:', error);
                toast({
                    variant: 'destructive',
                    title: 'Erro na Importação',
                    description: error.message || 'Ocorreu um erro ao importar os dados.',
                });
            } finally {
                setFileToImport(null);
                setImportAlertOpen(false);
            }
        };
        reader.readAsText(fileToImport);
    };

    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex items-center gap-4">
                <DatabaseBackup className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Backup e Restauração de Dados</h1>
                    <p className="text-muted-foreground">
                        Exporte seus dados para um arquivo de backup ou importe para restaurar seu ambiente.
                    </p>
                </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Exportar Dados</CardTitle>
                        <CardDescription>
                            Clique no botão abaixo para baixar um arquivo JSON com todos os dados salvos neste navegador (tarefas, chats, configurações, etc.). Guarde este arquivo em um local seguro.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={handleExport}>
                            <Download className="mr-2" />
                            Exportar Tudo
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Importar Dados</CardTitle>
                        <CardDescription>
                            Selecione um arquivo de backup para restaurar os dados. Os dados existentes serão mesclados com os dados do backup.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="hidden"
                            id="import-file"
                        />
                        <Button className="w-full" variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                            <Upload className="mr-2" />
                            Importar de um Arquivo
                        </Button>
                    </CardContent>
                </Card>
            </div>
             <AlertDialog open={isImportAlertOpen} onOpenChange={setImportAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <AlertDialogTitle className="text-center">Aviso de Importação</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                           Você está prestes a mesclar os dados do arquivo selecionado com os dados existentes neste navegador. Itens com o mesmo ID serão atualizados.
                           <br/><br/>
                           Arquivo: <span className="font-semibold">{fileToImport?.name}</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                        <AlertDialogCancel onClick={() => setImportAlertOpen(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleImportConfirm}>
                            Sim, mesclar dados
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

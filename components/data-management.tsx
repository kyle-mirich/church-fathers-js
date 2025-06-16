"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  Upload, 
  Database, 
  HardDrive, 
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import {
  downloadDataAsJson,
  uploadJsonFile,
  getStorageStats,
  exportLocalStorageData,
  importToLocalStorage,
  migrateToSupabase
} from '@/lib/migration-utils'

export function DataManagementDialog() {
  const [stats, setStats] = useState(getStorageStats())
  const [importing, setImporting] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const refreshStats = () => {
    setStats(getStorageStats())
  }

  const handleExport = () => {
    try {
      downloadDataAsJson()
      setMessage({ type: 'success', text: 'Data exported successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' })
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const data = await uploadJsonFile(file)
      if (data) {
        const success = importToLocalStorage(data)
        if (success) {
          setMessage({ type: 'success', text: 'Data imported successfully!' })
          refreshStats()
        } else {
          setMessage({ type: 'error', text: 'Failed to import data' })
        }
      } else {
        setMessage({ type: 'error', text: 'Invalid file format' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error reading file' })
    } finally {
      setImporting(false)
      event.target.value = '' // Reset file input
    }
  }

  const handleMigrateToSupabase = async () => {
    setMigrating(true)
    try {
      const data = exportLocalStorageData()
      const success = await migrateToSupabase(data)
      if (success) {
        setMessage({ type: 'success', text: 'Migration to Supabase completed!' })
      } else {
        setMessage({ type: 'error', text: 'Migration failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Migration error occurred' })
    } finally {
      setMigrating(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          Data Management
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Storage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Storage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-2xl font-bold text-blue-600">{stats.notesCount}</div>
                  <div className="text-sm text-muted-foreground">Notes</div>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-2xl font-bold text-green-600">{stats.highlightsCount}</div>
                  <div className="text-sm text-muted-foreground">Highlights</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Storage Size: <span className="font-medium">{stats.storageSize}</span></div>
                {stats.oldestNote && (
                  <div>First Note: <span className="font-medium">
                    {new Date(stats.oldestNote).toLocaleDateString()}
                  </span></div>
                )}
                {stats.newestNote && (
                  <div>Latest Note: <span className="font-medium">
                    {new Date(stats.newestNote).toLocaleDateString()}
                  </span></div>
                )}
              </div>
              <Button onClick={refreshStats} variant="outline" size="sm" className="w-full">
                Refresh Stats
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Export/Import */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Local Data Management
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <Download className="w-8 h-8 mx-auto text-blue-600" />
                    <div>
                      <h4 className="font-medium">Export Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Download your notes and highlights as JSON
                      </p>
                    </div>
                    <Button onClick={handleExport} className="w-full">
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <Upload className="w-8 h-8 mx-auto text-green-600" />
                    <div>
                      <h4 className="font-medium">Import Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Upload a JSON backup file
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="import-file" className="sr-only">
                        Import file
                      </Label>
                      <Input
                        id="import-file"
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        disabled={importing}
                        className="w-full"
                      />
                      {importing && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Importing...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Migration to Cloud */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" />
              Cloud Migration
            </h3>
            
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Migrate to Supabase/PostgreSQL</p>
                      <p className="text-muted-foreground">
                        This feature is ready for implementation when you set up cloud storage.
                        All data will be preserved and synced across devices.
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleMigrateToSupabase}
                    disabled={migrating || stats.notesCount === 0}
                    className="w-full"
                    variant="outline"
                  >
                    {migrating ? 'Migrating...' : 'Migrate to Cloud (Demo)'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Messages */}
          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">Migration Instructions</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>To migrate to cloud storage:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Set up Supabase or PostgreSQL database</li>
                  <li>Update the configuration in <code>lib/notes-provider.tsx</code></li>
                  <li>Change <code>USE_LOCAL_STORAGE</code> to <code>false</code></li>
                  <li>Run the migration to transfer your existing data</li>
                </ol>
                <p className="mt-2">All data structures are compatible between storage methods.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
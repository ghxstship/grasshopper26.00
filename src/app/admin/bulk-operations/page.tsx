'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { Textarea } from '@/design-system/components/atoms/textarea';
import { Badge } from '@/design-system/components/atoms/badge';
import { 
  Users, 
  Calendar, 
  ShoppingBag, 
  Trash2, 
  Mail, 
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type OperationType = 'orders' | 'users' | 'events' | 'emails';
type ActionType = 'delete' | 'update' | 'export' | 'email';

export default function BulkOperationsPage() {
  const { toast } = useToast();
  const [operationType, setOperationType] = useState<OperationType>('orders');
  const [actionType, setActionType] = useState<ActionType>('export');
  const [ids, setIds] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const operations = [
    { type: 'orders' as OperationType, label: 'Orders', icon: ShoppingBag, color: 'text-blue-400' },
    { type: 'users' as OperationType, label: 'Users', icon: Users, color: 'text-green-400' },
    { type: 'events' as OperationType, label: 'Events', icon: Calendar, color: 'text-purple-400' },
    { type: 'emails' as OperationType, label: 'Email Blast', icon: Mail, color: 'text-orange-400' },
  ];

  const actions = [
    { type: 'export' as ActionType, label: 'Export Data', icon: CheckCircle2 },
    { type: 'update' as ActionType, label: 'Bulk Update', icon: CheckCircle2 },
    { type: 'delete' as ActionType, label: 'Bulk Delete', icon: Trash2 },
    { type: 'email' as ActionType, label: 'Send Email', icon: Mail },
  ];

  const handleBulkOperation = async () => {
    if (!ids.trim() && actionType !== 'email') {
      toast({
        title: 'Error',
        description: 'Please enter at least one ID',
        variant: 'destructive',
      });
      return;
    }

    if (actionType === 'delete') {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${ids.split('\n').filter(Boolean).length} ${operationType}? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    setProcessing(true);
    setResults(null);

    try {
      const idList = ids.split('\n').map(id => id.trim()).filter(Boolean);
      
      const response = await fetch('/api/admin/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: operationType,
          action: actionType,
          ids: idList,
          emailSubject,
          emailBody,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bulk operation failed');
      }

      setResults(data.results);
      
      toast({
        title: 'Success',
        description: `Bulk operation completed: ${data.results.success} successful, ${data.results.failed} failed`,
      });

      // Clear form on success
      if (data.results.failed === 0) {
        setIds('');
        setEmailSubject('');
        setEmailBody('');
      }
    } catch (error) {
      console.error('Bulk operation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to perform bulk operation',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bulk Operations</h1>
        <p className="text-muted-foreground">
          Perform bulk actions on orders, users, events, and send mass emails
        </p>
      </div>

      {/* Operation Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Operation Type</CardTitle>
          <CardDescription>Choose what you want to perform bulk actions on</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {operations.map((op) => (
              <button
                key={op.type}
                onClick={() => {
                  setOperationType(op.type);
                  setResults(null);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  operationType === op.type
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <op.icon className={`w-8 h-8 mx-auto mb-2 ${op.color}`} />
                <p className="text-sm font-medium">{op.label}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Action</CardTitle>
          <CardDescription>Choose the action to perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => (
              <button
                key={action.type}
                onClick={() => {
                  setActionType(action.type);
                  setResults(null);
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  actionType === action.type
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                disabled={operationType === 'emails' && action.type !== 'email'}
              >
                <action.icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{action.label}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Data</CardTitle>
          <CardDescription>
            {actionType === 'email' 
              ? 'Compose your email message'
              : `Enter ${operationType} IDs (one per line)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionType === 'email' ? (
            <>
              <div>
                <label htmlFor="email-subject" className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject line"
                />
              </div>
              <div>
                <label htmlFor="email-body" className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  id="email-body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email message body"
                  rows={8}
                />
              </div>
              <div>
                <label htmlFor="recipient-ids" className="text-sm font-medium mb-2 block">
                  Recipient IDs (one per line)
                </label>
                <Textarea
                  id="recipient-ids"
                  value={ids}
                  onChange={(e) => setIds(e.target.value)}
                  placeholder={`Enter user IDs...\ne.g.:\nuser-id-1\nuser-id-2\nuser-id-3`}
                  rows={6}
                />
              </div>
            </>
          ) : (
            <Textarea
              value={ids}
              onChange={(e) => setIds(e.target.value)}
              placeholder={`Enter ${operationType} IDs (one per line)...\ne.g.:\nid-1\nid-2\nid-3`}
              rows={10}
            />
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {actionType === 'delete' && 'Warning: Deletion is permanent and cannot be undone'}
              {actionType === 'update' && 'Updates will be applied to all specified records'}
              {actionType === 'export' && 'Data will be exported to CSV format'}
              {actionType === 'email' && 'Emails will be sent to all specified users'}
            </span>
          </div>

          <Button
            onClick={handleBulkOperation}
            disabled={processing || (!ids.trim() && actionType !== 'email')}
            className="w-full"
            variant={actionType === 'delete' ? 'destructive' : 'default'}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Execute Bulk {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Operation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Successful</p>
                <p className="text-2xl font-bold text-green-400">{results.success}</p>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-400">{results.failed}</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Errors:</h3>
                <div className="space-y-1">
                  {results.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-400">
                      • {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

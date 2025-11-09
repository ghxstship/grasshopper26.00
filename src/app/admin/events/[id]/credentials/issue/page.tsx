/**
 * Credential Issuance Wizard
 * Step-by-step credential creation and assignment interface
 */

'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Label } from '@/design-system/components/atoms/label';
import { Textarea } from '@/design-system/components/atoms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/atoms/select';
import { ArrowLeft, ArrowRight, Check, Shield } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const CREDENTIAL_TYPES = [
  { value: 'aaa', label: 'AAA (All-Access)', color: 'red', badge: '🔴', description: 'Highest level all-access credential' },
  { value: 'aa', label: 'AA (Artist Access)', color: 'yellow', badge: '🟡', description: 'Elevated access for supporting artists' },
  { value: 'production', label: 'Production Crew', color: 'blue', badge: '🔵', description: 'Technical crew access' },
  { value: 'staff', label: 'Event Staff', color: 'green', badge: '🟢', description: 'Operations staff access' },
  { value: 'vendor', label: 'Vendor', color: 'orange', badge: '🟠', description: 'Service provider access' },
  { value: 'media', label: 'Media/Press', color: 'purple', badge: '🟣', description: 'Press and media access' },
  { value: 'guest', label: 'Guest', color: 'white', badge: '⚪', description: 'General guest access' },
];

export default function IssueCredentialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    credential_type: '',
    holder_name: '',
    holder_company: '',
    holder_role: '',
    holder_email: '',
    holder_phone: '',
    badge_color: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    notes: '',
    access_permissions: {},
  });

  const handleTypeSelect = (type: string) => {
    const credType = CREDENTIAL_TYPES.find(t => t.value === type);
    setFormData({
      ...formData,
      credential_type: type,
      badge_color: credType?.color || '',
    });
    setStep(2);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.holder_name || !formData.credential_type) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate credential number
      const credentialNumber = `${formData.credential_type.toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Get default permissions for credential type
      const { data: template } = await supabase
        .from('event_team_role_templates')
        .select('default_permissions')
        .eq('team_role', formData.credential_type)
        .single();

      // Create credential
      const { error } = await supabase
        .from('event_credentials')
        .insert({
          event_id: id,
          credential_type: formData.credential_type,
          credential_number: credentialNumber,
          badge_color: formData.badge_color,
          holder_name: formData.holder_name,
          holder_company: formData.holder_company || null,
          holder_role: formData.holder_role || null,
          valid_from: formData.valid_from,
          valid_until: formData.valid_until || null,
          access_permissions: template?.default_permissions || {},
          notes: formData.notes || null,
          is_active: true,
        });

      if (error) throw error;

      toast.success('Credential issued successfully');
      router.push(`/admin/events/${id}/credentials`);
    } catch (error: any) {
      toast.error('Failed to issue credential: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/events/${id}/credentials`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Issue Credential</h1>
          <p className="text-muted-foreground">Create and assign a new event credential</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">Select Type</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className="text-sm font-medium">Holder Info</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              3
            </div>
            <span className="text-sm font-medium">Review</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Credential Type */}
      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Credential Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CREDENTIAL_TYPES.map((type) => (
                  <Card
                    key={type.value}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleTypeSelect(type.value)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{type.badge}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{type.label}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Holder Information */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Credential Holder Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="holder_name">Full Name *</Label>
                <Input
                  id="holder_name"
                  placeholder="John Doe"
                  value={formData.holder_name}
                  onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holder_company">Company/Organization</Label>
                <Input
                  id="holder_company"
                  placeholder="ABC Productions"
                  value={formData.holder_company}
                  onChange={(e) => setFormData({ ...formData, holder_company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="holder_role">Role/Position</Label>
                <Input
                  id="holder_role"
                  placeholder="Audio Engineer"
                  value={formData.holder_role}
                  onChange={(e) => setFormData({ ...formData, holder_role: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holder_email">Email</Label>
                <Input
                  id="holder_email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.holder_email}
                  onChange={(e) => setFormData({ ...formData, holder_email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="holder_phone">Phone</Label>
                <Input
                  id="holder_phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.holder_phone}
                  onChange={(e) => setFormData({ ...formData, holder_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_from">Valid From *</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!formData.holder_name}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review and Confirm */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Credential</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
                <span className="text-4xl">
                  {CREDENTIAL_TYPES.find(t => t.value === formData.credential_type)?.badge}
                </span>
                <div>
                  <h3 className="font-semibold text-lg">{formData.holder_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {CREDENTIAL_TYPES.find(t => t.value === formData.credential_type)?.label}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Company</p>
                  <p className="font-medium">{formData.holder_company || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium">{formData.holder_role || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{formData.holder_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{formData.holder_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valid From</p>
                  <p className="font-medium">{new Date(formData.valid_from).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valid Until</p>
                  <p className="font-medium">
                    {formData.valid_until ? new Date(formData.valid_until).toLocaleDateString() : 'Ongoing'}
                  </p>
                </div>
              </div>

              {formData.notes && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Notes</p>
                  <p className="text-sm">{formData.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                <Shield className="h-4 w-4 mr-2" />
                {loading ? 'Issuing...' : 'Issue Credential'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

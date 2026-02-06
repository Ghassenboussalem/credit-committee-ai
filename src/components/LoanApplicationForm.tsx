import { useState } from 'react';
import { LoanApplication } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send } from 'lucide-react';

interface LoanApplicationFormProps {
  onSubmit: (application: LoanApplication) => void;
  isProcessing: boolean;
}

const loanPurposes = [
  'Home Purchase',
  'Business Expansion',
  'Debt Consolidation',
  'Vehicle Purchase',
  'Education',
  'Home Improvement',
  'Medical Expenses',
  'Other',
];

const industries = [
  'Technology',
  'Healthcare',
  'Government',
  'Education',
  'Finance',
  'Retail',
  'Manufacturing',
  'Construction',
  'Hospitality',
  'Transportation',
  'Energy',
  'Real Estate',
  'Legal',
  'Consulting',
  'Non-Profit',
  'Other',
];

export function LoanApplicationForm({ onSubmit, isProcessing }: LoanApplicationFormProps) {
  const [formData, setFormData] = useState({
    applicantName: '',
    requestedAmount: '',
    purpose: '',
    annualIncome: '',
    employmentYears: '',
    existingDebt: '',
    industry: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const application: LoanApplication = {
      id: `LOAN-${Date.now()}`,
      applicantName: formData.applicantName,
      requestedAmount: parseFloat(formData.requestedAmount) || 0,
      purpose: formData.purpose,
      annualIncome: parseFloat(formData.annualIncome) || 0,
      employmentYears: parseFloat(formData.employmentYears) || 0,
      existingDebt: parseFloat(formData.existingDebt) || 0,
      industry: formData.industry,
      createdAt: new Date(),
    };
    
    onSubmit(application);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValid = 
    formData.applicantName &&
    formData.requestedAmount &&
    formData.purpose &&
    formData.annualIncome &&
    formData.employmentYears &&
    formData.industry;

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">New Loan Application</h2>
        <span className="text-xs text-muted-foreground font-mono">v1.0</span>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="applicantName">Applicant Name</Label>
          <Input
            id="applicantName"
            placeholder="John Smith"
            value={formData.applicantName}
            onChange={(e) => updateField('applicantName', e.target.value)}
            className="bg-secondary/50 border-border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="requestedAmount">Loan Amount ($)</Label>
            <Input
              id="requestedAmount"
              type="number"
              placeholder="50,000"
              value={formData.requestedAmount}
              onChange={(e) => updateField('requestedAmount', e.target.value)}
              className="bg-secondary/50 border-border font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Select
              value={formData.purpose}
              onValueChange={(value) => updateField('purpose', value)}
            >
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                {loanPurposes.map(purpose => (
                  <SelectItem key={purpose} value={purpose}>
                    {purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => updateField('industry', value)}
          >
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="annualIncome">Annual Income ($)</Label>
            <Input
              id="annualIncome"
              type="number"
              placeholder="85,000"
              value={formData.annualIncome}
              onChange={(e) => updateField('annualIncome', e.target.value)}
              className="bg-secondary/50 border-border font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentYears">Years Employed</Label>
            <Input
              id="employmentYears"
              type="number"
              placeholder="5"
              value={formData.employmentYears}
              onChange={(e) => updateField('employmentYears', e.target.value)}
              className="bg-secondary/50 border-border font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="existingDebt">Existing Debt ($)</Label>
            <Input
              id="existingDebt"
              type="number"
              placeholder="15,000"
              value={formData.existingDebt}
              onChange={(e) => updateField('existingDebt', e.target.value)}
              className="bg-secondary/50 border-border font-mono"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isValid || isProcessing}
        className="w-full bg-gradient-to-r from-primary to-agent-chair hover:opacity-90 transition-opacity"
      >
        {isProcessing ? (
          <>Processing...</>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit to Committee
          </>
        )}
      </Button>
    </form>
  );
}

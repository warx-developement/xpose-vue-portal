import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAsset } from '@/hooks/useAssets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ArrowLeft, Target } from 'lucide-react';

const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required').max(100, 'Asset name must be less than 100 characters'),
  domains: z.array(z.string().min(1, 'Domain cannot be empty')).min(1, 'At least one domain is required'),
});

type AssetFormData = z.infer<typeof assetSchema>;

const AddAsset: React.FC = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<string[]>(['']);
  const [newDomain, setNewDomain] = useState('');
  
  const createAssetMutation = useCreateAsset();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      domains: [''],
    },
  });

  const watchedDomains = watch('domains');

  const addDomain = () => {
    if (newDomain.trim()) {
      const updatedDomains = [...domains, newDomain.trim()];
      setDomains(updatedDomains);
      setValue('domains', updatedDomains);
      setNewDomain('');
    }
  };

  const removeDomain = (index: number) => {
    if (domains.length > 1) {
      const updatedDomains = domains.filter((_, i) => i !== index);
      setDomains(updatedDomains);
      setValue('domains', updatedDomains);
    }
  };

  const updateDomain = (index: number, value: string) => {
    const updatedDomains = [...domains];
    updatedDomains[index] = value;
    setDomains(updatedDomains);
    setValue('domains', updatedDomains);
  };

  const onSubmit = async (data: AssetFormData) => {
    try {
      const filteredDomains = data.domains.filter(domain => domain.trim() !== '');
      await createAssetMutation.mutateAsync({
        name: data.name,
        domains: filteredDomains,
      });
      navigate('/assets');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDomain();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div 
          onClick={() => navigate('/assets')}
          className="inline-flex items-center justify-center w-10 h-10 bg-purple-50 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors"
        >
          <Target className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Asset</h1>
          <p className="text-gray-600">Create a new security asset with associated domains</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Asset Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter asset name (e.g., Google Services)"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Domains */}
            <div className="space-y-4">
              <Label>Domains *</Label>
              <div className="space-y-3">
                {domains.map((domain, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={domain}
                      onChange={(e) => updateDomain(index, e.target.value)}
                      placeholder="Enter domain (e.g., google.com)"
                      className={errors.domains?.[index] ? 'border-red-500' : ''}
                    />
                    {domains.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDomain(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {/* Add Domain Input */}
                <div className="flex items-center gap-2">
                  <Input
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add another domain..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDomain}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
              </div>
              
              {errors.domains && (
                <p className="text-sm text-red-600">
                  {Array.isArray(errors.domains) 
                    ? errors.domains[0]?.message || 'At least one domain is required'
                    : errors.domains.message
                  }
                </p>
              )}
            </div>

            {/* Domain Preview */}
            {domains.some(domain => domain.trim() !== '') && (
              <div className="space-y-2">
                <Label>Domain Preview</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
                  {domains
                    .filter(domain => domain.trim() !== '')
                    .map((domain, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {domain}
                      </Badge>
                    ))
                  }
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/assets')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createAssetMutation.isPending}
            className="flex items-center gap-2"
          >
            {createAssetMutation.isPending ? 'Creating...' : 'Create Asset'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddAsset;

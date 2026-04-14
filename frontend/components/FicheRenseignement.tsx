'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeCheck } from 'lucide-react';

interface FicheRenseignementProps {
  data?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    nationality?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    emergencyRelation?: string;
    socialSecurityNumber?: string;
    healthMutual?: string;
    healthMutualNumber?: string;
    drivingLicense?: string;
    licenseExpiryDate?: string;
  };
  onChange?: (field: string, value: string) => void;
}

export default function FicheRenseignement({ data = {}, onChange = () => {} }: FicheRenseignementProps) {
  const handleChange = (field: string, value: string) => {
    onChange(field, value);
  };

  return (
    <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold md:text-2xl">Fiche de renseignement</h2>
          <p className="text-sm text-muted-foreground">Informations administratives et personnelles.</p>
        </div>
        <BadgeCheck className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Informations personnelles</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date de naissance *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={data.dateOfBirth || ''}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeOfBirth" className="text-sm font-medium">Lieu de naissance *</Label>
              <Input
                id="placeOfBirth"
                placeholder="Ville ou village"
                value={data.placeOfBirth || ''}
                onChange={(e) => handleChange('placeOfBirth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-sm font-medium">Nationalité *</Label>
              <Input
                id="nationality"
                placeholder="Ex: Française"
                value={data.nationality || ''}
                onChange={(e) => handleChange('nationality', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialSecurityNumber" className="text-sm font-medium">Numéro de Sécurité Sociale</Label>
              <Input
                id="socialSecurityNumber"
                placeholder="13 chiffres"
                value={data.socialSecurityNumber || ''}
                onChange={(e) => handleChange('socialSecurityNumber', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Adresse</h3>
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">Adresse *</Label>
              <Input
                id="address"
                placeholder="Rue, numéro"
                value={data.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-sm font-medium">Code postal *</Label>
                <Input
                  id="postalCode"
                  placeholder="5 chiffres"
                  value={data.postalCode || ''}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city" className="text-sm font-medium">Ville *</Label>
                <Input
                  id="city"
                  placeholder="Votre ville"
                  value={data.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Driving License */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Permis de conduire</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="drivingLicense" className="text-sm font-medium">Numéro du permis *</Label>
              <Input
                id="drivingLicense"
                placeholder="Ex: 12AB345678"
                value={data.drivingLicense || ''}
                onChange={(e) => handleChange('drivingLicense', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseExpiryDate" className="text-sm font-medium">Date d'expiration *</Label>
              <Input
                id="licenseExpiryDate"
                type="date"
                value={data.licenseExpiryDate || ''}
                onChange={(e) => handleChange('licenseExpiryDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Health Info */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Couverture santé</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="healthMutual" className="text-sm font-medium">Mutuelle / Sécurité Sociale</Label>
              <Input
                id="healthMutual"
                placeholder="Nom de l'organisme"
                value={data.healthMutual || ''}
                onChange={(e) => handleChange('healthMutual', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="healthMutualNumber" className="text-sm font-medium">Numéro affilié</Label>
              <Input
                id="healthMutualNumber"
                placeholder="Votre numéro d'affiliation"
                value={data.healthMutualNumber || ''}
                onChange={(e) => handleChange('healthMutualNumber', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Contact d'urgence</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="emergencyName" className="text-sm font-medium">Nom</Label>
              <Input
                id="emergencyName"
                placeholder="Prénom et nom"
                value={data.emergencyName || ''}
                onChange={(e) => handleChange('emergencyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelation" className="text-sm font-medium">Lien</Label>
              <Input
                id="emergencyRelation"
                placeholder="Parent, ami..."
                value={data.emergencyRelation || ''}
                onChange={(e) => handleChange('emergencyRelation', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="emergencyPhone" className="text-sm font-medium">Téléphone</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={data.emergencyPhone || ''}
                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
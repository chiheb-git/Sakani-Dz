import { useState } from 'react';
import { motion } from 'framer-motion';
import { useListProperties, useUpdateProperty, getListPropertiesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, formatNumber } from '@/lib/format';
import { Search, Star } from 'lucide-react';

const WILAYAS = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif', 
  'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued', 'Skikda', 'Tiaret', 'Béjaïa'
];

export default function PropertiesPage() {
  const [wilayaFilter, setWilayaFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: propertiesData, isLoading } = useListProperties(
    { 
      wilaya: wilayaFilter === 'all' ? undefined : wilayaFilter,
      type: typeFilter === 'all' ? undefined : (typeFilter as 'apartment' | 'villa'),
      limit: 100
    },
    { 
      query: { 
        queryKey: getListPropertiesQueryKey({ 
          wilaya: wilayaFilter === 'all' ? undefined : wilayaFilter,
          type: typeFilter === 'all' ? undefined : (typeFilter as 'apartment' | 'villa'),
          limit: 100
        })
      }
    }
  );

  const updatePropertyMutation = useUpdateProperty();

  const properties = propertiesData?.data || [];

  const handleToggleFeatured = (id: number, currentValue: boolean) => {
    updatePropertyMutation.mutate(
      { id, data: { isFeatured: !currentValue } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
          toast({
            title: 'Propriété mise à jour',
            description: `Propriété ${!currentValue ? 'mise en vedette' : 'retirée de la vedette'}`,
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Erreur',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div>
      <PageHeader
        title="Propriétés"
        description="Toutes les propriétés de la plateforme"
      />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={wilayaFilter} onValueChange={setWilayaFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-wilaya">
                  <SelectValue placeholder="Toutes les wilayas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les wilayas</SelectItem>
                  {WILAYAS.map(w => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-type">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="apartment">Appartement</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <TableSkeleton rows={10} cols={7} />
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucune propriété trouvée</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Wilaya</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">En vedette</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property, index) => (
                    <motion.tr
                      key={property.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.01 }}
                      data-testid={`property-row-${property.id}`}
                    >
                      <TableCell className="font-medium capitalize">
                        {property.type} {property.apartmentType}
                      </TableCell>
                      <TableCell>{property.wilaya}</TableCell>
                      <TableCell className="font-semibold">{formatPrice(property.price)}</TableCell>
                      <TableCell className="text-sm">
                        {property.vendor ? `${property.vendor.firstName} ${property.vendor.lastName}` : '—'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{formatNumber(property.views || 0)}</TableCell>
                      <TableCell>
                        <StatusBadge status={property.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={property.isFeatured || false}
                            onCheckedChange={() => handleToggleFeatured(property.id, property.isFeatured || false)}
                            disabled={updatePropertyMutation.isPending}
                            data-testid={`switch-featured-${property.id}`}
                          />
                          {property.isFeatured && (
                            <Star className="w-4 h-4 text-accent fill-accent" />
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  useListAdminVendors, 
  useUpdateVendorPermissions,
  getListAdminVendorsQueryKey 
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, Save } from 'lucide-react';

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'site', label: 'Site' },
];

export default function PermissionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [permissions, setPermissions] = useState<Record<number, string[]>>({});
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vendorsData, isLoading } = useListAdminVendors(
    { status: 'active', search: searchQuery || undefined, limit: 100 },
    { 
      query: { 
        queryKey: getListAdminVendorsQueryKey({ 
          status: 'active', 
          search: searchQuery || undefined, 
          limit: 100 
        })
      }
    }
  );

  const updateMutation = useUpdateVendorPermissions();

  const vendors = vendorsData?.data || [];

  const getVendorPermissions = (vendorId: number, currentPermissions: string[]) => {
    return permissions[vendorId] || currentPermissions;
  };

  const togglePermission = (vendorId: number, type: string, currentPermissions: string[]) => {
    const current = getVendorPermissions(vendorId, currentPermissions);
    const updated = current.includes(type)
      ? current.filter(p => p !== type)
      : [...current, type];
    
    setPermissions({ ...permissions, [vendorId]: updated });
  };

  const handleSave = (vendorId: number) => {
    const allowedPropertyTypes = permissions[vendorId];
    if (!allowedPropertyTypes) return;

    updateMutation.mutate(
      { id: vendorId, data: { allowedPropertyTypes } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminVendorsQueryKey() });
          toast({ title: 'Permissions mises à jour' });
          // Clear local state for this vendor
          const updated = { ...permissions };
          delete updated[vendorId];
          setPermissions(updated);
        },
        onError: (error: any) => {
          toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  return (
    <div>
      <PageHeader
        title="La Clé"
        description="Gestion des permissions des vendeurs actifs"
      />

      <div className="p-8 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un vendeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-vendors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <TableSkeleton rows={10} cols={5} />
            ) : vendors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun vendeur actif trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Appartement</TableHead>
                    <TableHead>Villa</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor, index) => {
                    const currentPerms = getVendorPermissions(vendor.id, vendor.allowedPropertyTypes);
                    const hasChanges = permissions[vendor.id] !== undefined;
                    
                    return (
                      <motion.tr
                        key={vendor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.01 }}
                        data-testid={`vendor-row-${vendor.id}`}
                      >
                        <TableCell className="font-medium">
                          {vendor.firstName} {vendor.lastName}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{vendor.phone}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={currentPerms.includes('apartment')}
                            onCheckedChange={() => togglePermission(vendor.id, 'apartment', vendor.allowedPropertyTypes)}
                            data-testid={`checkbox-apartment-${vendor.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={currentPerms.includes('villa')}
                            onCheckedChange={() => togglePermission(vendor.id, 'villa', vendor.allowedPropertyTypes)}
                            data-testid={`checkbox-villa-${vendor.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={currentPerms.includes('site')}
                            onCheckedChange={() => togglePermission(vendor.id, 'site', vendor.allowedPropertyTypes)}
                            data-testid={`checkbox-site-${vendor.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleSave(vendor.id)}
                            disabled={!hasChanges || updateMutation.isPending}
                            data-testid={`button-save-${vendor.id}`}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Enregistrer
                          </Button>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

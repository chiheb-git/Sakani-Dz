import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  useListAdminVendors, 
  useApproveVendor, 
  useRejectVendor, 
  useBlockVendor, 
  useReactivateVendor,
  getListAdminVendorsQueryKey,
  VendorStatus 
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/format';
import { Search, Eye, CheckCircle, XCircle, Ban, RotateCcw } from 'lucide-react';

const STATUS_TABS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'active', label: 'Actifs' },
  { value: 'renewal_required', label: 'Renouvellement' },
  { value: 'blocked', label: 'Bloqués' },
  { value: 'rejected', label: 'Rejetés' },
];

export default function VendorsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionDialog, setActionDialog] = useState<{ type: string; vendorId: number; vendorName: string } | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vendorsData, isLoading } = useListAdminVendors(
    { 
      status: statusFilter === 'all' ? undefined : statusFilter as VendorStatus,
      search: searchQuery || undefined,
      limit: 50
    },
    { 
      query: { 
        queryKey: getListAdminVendorsQueryKey({ 
          status: statusFilter === 'all' ? undefined : statusFilter as VendorStatus,
          search: searchQuery || undefined,
          limit: 50
        })
      }
    }
  );

  const approveMutation = useApproveVendor();
  const rejectMutation = useRejectVendor();
  const blockMutation = useBlockVendor();
  const reactivateMutation = useReactivateVendor();

  const vendors = vendorsData?.data || [];

  const handleAction = (type: string, id: number, name: string) => {
    setActionDialog({ type, vendorId: id, vendorName: name });
  };

  const executeAction = () => {
    if (!actionDialog) return;

    const mutations = {
      approve: approveMutation,
      reject: rejectMutation,
      block: blockMutation,
      reactivate: reactivateMutation,
    };

    const mutation = mutations[actionDialog.type as keyof typeof mutations];
    
    mutation.mutate(
      { id: actionDialog.vendorId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminVendorsQueryKey() });
          toast({
            title: 'Action effectuée',
            description: `Vendeur ${actionDialog.type === 'approve' ? 'approuvé' : actionDialog.type === 'reject' ? 'rejeté' : actionDialog.type === 'block' ? 'bloqué' : 'réactivé'} avec succès`,
          });
          setActionDialog(null);
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
        title="Vendeurs"
        description="Gestion des vendeurs de la plateforme"
      />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-vendors"
                />
              </div>
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  {STATUS_TABS.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value} data-testid={`tab-${tab.value}`}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <TableSkeleton rows={8} cols={7} />
            ) : vendors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun vendeur trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernier accès</TableHead>
                    <TableHead>Expiration abon.</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor, index) => (
                    <motion.tr
                      key={vendor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="group"
                      data-testid={`vendor-row-${vendor.id}`}
                    >
                      <TableCell className="font-medium">
                        {vendor.firstName} {vendor.lastName}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{vendor.phone}</TableCell>
                      <TableCell className="text-sm">{vendor.email}</TableCell>
                      <TableCell>
                        <StatusBadge status={vendor.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(vendor.lastAccessAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(vendor.subscriptionExpiresAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/vendors/${vendor.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`button-view-${vendor.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {vendor.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAction('approve', vendor.id, `${vendor.firstName} ${vendor.lastName}`)}
                                data-testid={`button-approve-${vendor.id}`}
                              >
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAction('reject', vendor.id, `${vendor.firstName} ${vendor.lastName}`)}
                                data-testid={`button-reject-${vendor.id}`}
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {vendor.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction('block', vendor.id, `${vendor.firstName} ${vendor.lastName}`)}
                              data-testid={`button-block-${vendor.id}`}
                            >
                              <Ban className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                          {vendor.status === 'blocked' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction('reactivate', vendor.id, `${vendor.firstName} ${vendor.lastName}`)}
                              data-testid={`button-reactivate-${vendor.id}`}
                            >
                              <RotateCcw className="w-4 h-4 text-emerald-600" />
                            </Button>
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

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionDialog} onOpenChange={(open) => !open && setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'action</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir {actionDialog?.type === 'approve' ? 'approuver' : actionDialog?.type === 'reject' ? 'rejeter' : actionDialog?.type === 'block' ? 'bloquer' : 'réactiver'} le vendeur <strong>{actionDialog?.vendorName}</strong> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction} data-testid="button-confirm-action">
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

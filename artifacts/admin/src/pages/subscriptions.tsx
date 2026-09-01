import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  useListSubscriptions, 
  useListAdminVendors,
  useCreateSubscription, 
  getListSubscriptionsQueryKey,
  getListAdminVendorsQueryKey 
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatPrice } from '@/lib/format';
import { Plus } from 'lucide-react';
import { SubscriptionInputPropertyType } from '@workspace/api-client-react';

const SUBSCRIPTION_PRICING = {
  apartment: 2000,
  villa: 3500,
  site: 5000,
};

export default function SubscriptionsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
    propertyType: '',
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: subscriptionsData, isLoading } = useListSubscriptions(
    { limit: 100 },
    { query: { queryKey: getListSubscriptionsQueryKey({ limit: 100 }) } }
  );

  const { data: vendorsData } = useListAdminVendors(
    { status: 'active', limit: 200 },
    { query: { queryKey: getListAdminVendorsQueryKey({ status: 'active', limit: 200 }) } }
  );

  const createMutation = useCreateSubscription();

  const subscriptions = subscriptionsData?.data || [];
  const vendors = vendorsData?.data || [];

  const handleCreate = () => {
    const amount = SUBSCRIPTION_PRICING[formData.propertyType as keyof typeof SUBSCRIPTION_PRICING];
    
    createMutation.mutate(
      { 
        data: { 
          vendorId: Number(formData.vendorId), 
          propertyType: formData.propertyType as SubscriptionInputPropertyType,
          amount
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSubscriptionsQueryKey() });
          toast({ title: 'Abonnement créé avec succès' });
          setCreateOpen(false);
          setFormData({ vendorId: '', propertyType: '' });
        },
        onError: (error: any) => {
          toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const selectedAmount = formData.propertyType ? SUBSCRIPTION_PRICING[formData.propertyType as keyof typeof SUBSCRIPTION_PRICING] : 0;

  return (
    <div>
      <PageHeader
        title="Abonnements"
        description="Gestion des paiements et abonnements"
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-payment">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un paiement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau paiement</DialogTitle>
                <DialogDescription>Enregistrer un nouveau paiement d'abonnement</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendeur</Label>
                  <Select value={formData.vendorId} onValueChange={(val) => setFormData({ ...formData, vendorId: val })}>
                    <SelectTrigger data-testid="select-vendor">
                      <SelectValue placeholder="Sélectionner un vendeur" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map(v => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.firstName} {v.lastName} ({v.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type de propriété</Label>
                  <Select value={formData.propertyType} onValueChange={(val) => setFormData({ ...formData, propertyType: val })}>
                    <SelectTrigger data-testid="select-property-type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Appartement (2 000 DA/mois)</SelectItem>
                      <SelectItem value="villa">Villa (3 500 DA/mois)</SelectItem>
                      <SelectItem value="site">Site (5 000 DA/mois)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedAmount > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Montant</p>
                    <p className="text-2xl font-bold mt-1">{formatPrice(selectedAmount)}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={createMutation.isPending || !formData.vendorId || !formData.propertyType}
                  data-testid="button-save-payment"
                >
                  {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <TableSkeleton rows={10} cols={6} />
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun abonnement</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Date de paiement</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub, index) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.01 }}
                      data-testid={`subscription-row-${sub.id}`}
                    >
                      <TableCell className="font-medium">
                        {sub.vendor ? `${sub.vendor.firstName} ${sub.vendor.lastName}` : '—'}
                      </TableCell>
                      <TableCell className="capitalize">{sub.propertyType}</TableCell>
                      <TableCell className="font-semibold">{formatPrice(sub.amount)}</TableCell>
                      <TableCell>{formatDate(sub.paidAt)}</TableCell>
                      <TableCell>{formatDate(sub.expiresAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={sub.status} />
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

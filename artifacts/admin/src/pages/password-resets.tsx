import { motion } from 'framer-motion';
import { 
  useListPasswordResetRequests, 
  useApprovePasswordResetRequest,
  getListPasswordResetRequestsQueryKey 
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/format';
import { CheckCircle } from 'lucide-react';

export default function PasswordResetsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: requestsData, isLoading } = useListPasswordResetRequests({
    query: { queryKey: getListPasswordResetRequestsQueryKey() }
  });

  const approveMutation = useApprovePasswordResetRequest();

  const requests = requestsData?.data || [];

  const handleApprove = (id: number) => {
    approveMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPasswordResetRequestsQueryKey() });
          toast({ title: 'Demande approuvée', description: 'Le nouveau mot de passe a été activé' });
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
        title="Réinitialisation de mot de passe"
        description="Demandes de réinitialisation des vendeurs"
      />

      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <TableSkeleton rows={8} cols={5} />
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucune demande en attente</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Nouveau mot de passe</TableHead>
                    <TableHead>Date de demande</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request, index) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      data-testid={`request-row-${request.id}`}
                    >
                      <TableCell className="font-medium">
                        {request.vendor ? `${request.vendor.firstName} ${request.vendor.lastName}` : '—'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {request.vendor?.phone || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-sm bg-muted/50 px-3 py-1 rounded">
                        {request.newPassword || '—'}
                      </TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={approveMutation.isPending}
                            data-testid={`button-approve-${request.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approuver
                          </Button>
                        )}
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

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  useListAdminReports, 
  useResolveReport,
  useDismissReport,
  getListAdminReportsQueryKey,
  ReportStatus 
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/format';
import { CheckCircle, XCircle } from 'lucide-react';

const STATUS_TABS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'resolved', label: 'Résolus' },
  { value: 'dismissed', label: 'Rejetés' },
];

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reportsData, isLoading } = useListAdminReports(
    { 
      status: statusFilter === 'all' ? undefined : statusFilter as ReportStatus,
      limit: 100
    },
    { 
      query: { 
        queryKey: getListAdminReportsQueryKey({ 
          status: statusFilter === 'all' ? undefined : statusFilter as ReportStatus,
          limit: 100
        })
      }
    }
  );

  const resolveMutation = useResolveReport();
  const dismissMutation = useDismissReport();

  const reports = reportsData?.data || [];

  const handleResolve = (id: number) => {
    resolveMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminReportsQueryKey() });
          toast({ title: 'Signalement résolu' });
        },
        onError: (error: any) => {
          toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleDismiss = (id: number) => {
    dismissMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminReportsQueryKey() });
          toast({ title: 'Signalement rejeté' });
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
        title="Signalements"
        description="Gestion des signalements de propriétés"
      />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                {STATUS_TABS.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} data-testid={`tab-${tab.value}`}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <TableSkeleton rows={8} cols={6} />
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun signalement trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Propriété</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report, index) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      data-testid={`report-row-${report.id}`}
                    >
                      <TableCell className="font-medium">
                        {report.property ? (
                          <span className="capitalize">
                            {report.property.type} {report.property.apartmentType} - {report.property.wilaya}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{report.reason}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {report.details || '—'}
                      </TableCell>
                      <TableCell>{formatDate(report.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={report.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {report.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResolve(report.id)}
                              disabled={resolveMutation.isPending}
                              data-testid={`button-resolve-${report.id}`}
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDismiss(report.id)}
                              disabled={dismissMutation.isPending}
                              data-testid={`button-dismiss-${report.id}`}
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
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

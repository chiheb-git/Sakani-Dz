import { motion } from 'framer-motion';
import { useListSites, getListSitesQueryKey } from '@workspace/api-client-react';
import { PageHeader } from '@/components/PageHeader';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/lib/format';

export default function SitesPage() {
  const { data: sitesData, isLoading } = useListSites(
    { limit: 100 },
    { query: { queryKey: getListSitesQueryKey({ limit: 100 }) } }
  );

  const sites = sitesData?.data || [];

  return (
    <div>
      <PageHeader
        title="Sites"
        description="Tous les sites immobiliers"
      />

      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <TableSkeleton rows={10} cols={5} />
            ) : sites.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun site trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Wilaya</TableHead>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Propriétés</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site, index) => (
                    <motion.tr
                      key={site.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      data-testid={`site-row-${site.id}`}
                    >
                      <TableCell className="font-medium">{site.name}</TableCell>
                      <TableCell>{site.wilaya}</TableCell>
                      <TableCell className="text-sm">
                        {site.vendor ? `${site.vendor.firstName} ${site.vendor.lastName}` : '—'}
                      </TableCell>
                      <TableCell className="font-semibold">{formatNumber(site.propertyCount || 0)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                        {site.description || '—'}
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

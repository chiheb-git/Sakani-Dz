import { useParams } from 'wouter';
import { motion } from 'framer-motion';
import { 
  useGetAdminVendor, 
  useListSubscriptions, 
  useListProperties,
  getGetAdminVendorQueryKey,
  getListSubscriptionsQueryKey,
  getListPropertiesQueryKey
} from '@workspace/api-client-react';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatPrice } from '@/lib/format';
import { User, Phone, Mail, MapPin, Calendar, Eye } from 'lucide-react';

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = Number(params.id);

  const { data: vendor, isLoading: vendorLoading } = useGetAdminVendor(
    vendorId,
    { query: { queryKey: getGetAdminVendorQueryKey(vendorId) } }
  );

  const { data: subscriptionsData, isLoading: subsLoading } = useListSubscriptions(
    { vendorId, limit: 20 },
    { query: { queryKey: getListSubscriptionsQueryKey({ vendorId, limit: 20 }) } }
  );

  const { data: propertiesData, isLoading: propsLoading } = useListProperties(
    { vendorId, limit: 20 },
    { query: { queryKey: getListPropertiesQueryKey({ vendorId, limit: 20 }) } }
  );

  const subscriptions = subscriptionsData?.data || [];
  const properties = propertiesData?.data || [];

  if (vendorLoading) {
    return (
      <div>
        <PageHeader title="Chargement..." />
        <div className="p-8">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div>
        <PageHeader title="Vendeur introuvable" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${vendor.firstName} ${vendor.lastName}`}
        description="Détails du vendeur"
      />

      <div className="p-8 space-y-6">
        {/* Vendor Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nom complet</p>
                      <p className="font-medium">{vendor.firstName} {vendor.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium font-mono">{vendor.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{vendor.email}</p>
                    </div>
                  </div>
                  {vendor.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Adresse</p>
                        <p className="font-medium">{vendor.address}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <StatusBadge status={vendor.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date d'inscription</p>
                      <p className="font-medium">{formatDate(vendor.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Vues totales</p>
                      <p className="font-medium">{vendor.totalViews || 0}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiration abonnement</p>
                    <p className="font-medium">{formatDate(vendor.subscriptionExpiresAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Historique des abonnements</CardTitle>
            </CardHeader>
            <CardContent>
              {subsLoading ? (
                <div className="h-32 bg-muted animate-pulse rounded" />
              ) : subscriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun abonnement</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Date de paiement</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map(sub => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium capitalize">{sub.propertyType}</TableCell>
                        <TableCell>{formatPrice(sub.amount)}</TableCell>
                        <TableCell>{formatDate(sub.paidAt)}</TableCell>
                        <TableCell>{formatDate(sub.expiresAt)}</TableCell>
                        <TableCell>
                          <StatusBadge status={sub.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Properties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Propriétés ({properties.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {propsLoading ? (
                <div className="h-32 bg-muted animate-pulse rounded" />
              ) : properties.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune propriété</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Wilaya</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Vues</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map(prop => (
                      <TableRow key={prop.id}>
                        <TableCell className="font-medium capitalize">
                          {prop.type} {prop.apartmentType}
                        </TableCell>
                        <TableCell>{prop.wilaya}</TableCell>
                        <TableCell>{formatPrice(prop.price)}</TableCell>
                        <TableCell>{prop.views || 0}</TableCell>
                        <TableCell>
                          <StatusBadge status={prop.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

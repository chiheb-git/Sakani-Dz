import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetAdminStats, useGetTopVendors, useGetStatsByWilaya, getGetAdminStatsQueryKey, getGetTopVendorsQueryKey, getGetStatsByWilayaQueryKey } from '@workspace/api-client-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatCardSkeleton } from '@/components/LoadingSkeleton';
import { formatPrice, formatNumber } from '@/lib/format';
import { Users, Home, Building2, MapPin, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Period = 'week' | 'month' | 'year';

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('month');

  const { data: stats, isLoading: statsLoading } = useGetAdminStats(
    { period },
    { query: { queryKey: getGetAdminStatsQueryKey({ period }) } }
  );

  const { data: topVendorsData, isLoading: topVendorsLoading } = useGetTopVendors({
    query: { queryKey: getGetTopVendorsQueryKey() }
  });

  const { data: wilayaStatsData, isLoading: wilayaStatsLoading } = useGetStatsByWilaya({
    query: { queryKey: getGetStatsByWilayaQueryKey() }
  });

  const topVendors = topVendorsData?.data || [];
  const wilayaStats = wilayaStatsData?.data.slice(0, 10) || [];

  const statCards = [
    { title: 'Vendeurs totaux', value: stats?.totalVendors || 0, icon: Users, color: 'text-primary' },
    { title: 'Vendeurs actifs', value: stats?.activeVendors || 0, icon: TrendingUp, color: 'text-emerald-600' },
    { title: 'En attente', value: stats?.pendingVendors || 0, icon: Clock, color: 'text-amber-600' },
    { title: 'Propriétés', value: stats?.totalProperties || 0, icon: Home, color: 'text-blue-600' },
    { title: 'Sites', value: stats?.totalSites || 0, icon: Building2, color: 'text-purple-600' },
    { title: 'Lieux touristiques', value: stats?.totalTouristSpots || 0, icon: MapPin, color: 'text-teal-600' },
  ];

  const chartData = wilayaStats.map(item => ({
    wilaya: item.wilaya,
    propriétés: item.propertyCount,
    sites: item.siteCount,
  }));

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de la plateforme Sakani Dz"
        action={
          <Select value={period} onValueChange={(val) => setPeriod(val as Period)}>
            <SelectTrigger className="w-40" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    {statsLoading ? (
                      <StatCardSkeleton />
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            {card.title}
                          </p>
                          <p className="text-3xl font-bold tracking-tight" data-testid={`stat-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                            {formatNumber(card.value)}
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl bg-primary/10 ${card.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Revenue Card */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Revenus totaux ({period === 'week' ? 'semaine' : period === 'month' ? 'mois' : 'année'})
                    </p>
                    <p className="text-4xl font-bold mt-2 tracking-tight" data-testid="stat-revenue">
                      {formatPrice(stats.totalRevenue)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {stats.newVendorsCount} nouveaux vendeurs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Vendors Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 vendeurs</CardTitle>
            </CardHeader>
            <CardContent>
              {topVendorsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {topVendors.map((vendor, index) => (
                    <div
                      key={vendor.vendor.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`vendor-rank-${index + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {vendor.vendor.firstName} {vendor.vendor.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vendor.vendor.phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatNumber(vendor.totalViews)}</p>
                        <p className="text-xs text-muted-foreground">{vendor.totalProperties} biens</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wilaya Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par wilaya (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              {wilayaStatsLoading ? (
                <div className="h-80 bg-muted animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="wilaya" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="propriétés" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sites" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

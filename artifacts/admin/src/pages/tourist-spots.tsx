import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  useListTouristSpots, 
  useCreateTouristSpot, 
  useUpdateTouristSpot,
  useDeleteTouristSpot,
  getListTouristSpotsQueryKey 
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const WILAYAS = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif', 
  'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued', 'Skikda', 'Tiaret', 'Béjaïa',
  'Tlemcen', 'Béchar', 'Tamanrasset', 'Ouargla', 'Bordj Bou Arreridj', 'Tizi Ouzou'
];

export default function TouristSpotsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editSpot, setEditSpot] = useState<any | null>(null);
  const [deleteSpot, setDeleteSpot] = useState<{ id: number; name: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    wilaya: '',
    description: '',
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: spotsData, isLoading } = useListTouristSpots(
    { limit: 100 },
    { query: { queryKey: getListTouristSpotsQueryKey({ limit: 100 }) } }
  );

  const createMutation = useCreateTouristSpot();
  const updateMutation = useUpdateTouristSpot();
  const deleteMutation = useDeleteTouristSpot();

  const spots = spotsData?.data || [];

  const handleCreate = () => {
    createMutation.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTouristSpotsQueryKey() });
          toast({ title: 'Lieu touristique créé' });
          setCreateOpen(false);
          setFormData({ name: '', wilaya: '', description: '' });
        },
        onError: (error: any) => {
          toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleUpdate = () => {
    if (!editSpot) return;
    updateMutation.mutate(
      { id: editSpot.id, data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTouristSpotsQueryKey() });
          toast({ title: 'Lieu touristique mis à jour' });
          setEditSpot(null);
          setFormData({ name: '', wilaya: '', description: '' });
        },
        onError: (error: any) => {
          toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteSpot) return;
    deleteMutation.mutate(
      { id: deleteSpot.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTouristSpotsQueryKey() });
          toast({ title: 'Lieu touristique supprimé' });
          setDeleteSpot(null);
        },
        onError: (error: any) => {
          toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const openEdit = (spot: any) => {
    setEditSpot(spot);
    setFormData({
      name: spot.name,
      wilaya: spot.wilaya,
      description: spot.description || '',
    });
  };

  return (
    <div>
      <PageHeader
        title="Lieux touristiques"
        description="Gestion des lieux touristiques"
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-spot">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un lieu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau lieu touristique</DialogTitle>
                <DialogDescription>Ajoutez un nouveau lieu touristique à la plateforme</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Jardin d'Essai"
                    data-testid="input-spot-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wilaya">Wilaya</Label>
                  <Select value={formData.wilaya} onValueChange={(val) => setFormData({ ...formData, wilaya: val })}>
                    <SelectTrigger data-testid="select-spot-wilaya">
                      <SelectValue placeholder="Sélectionner une wilaya" />
                    </SelectTrigger>
                    <SelectContent>
                      {WILAYAS.map(w => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du lieu..."
                    rows={4}
                    data-testid="input-spot-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-save-spot">
                  {createMutation.isPending ? 'Création...' : 'Créer'}
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
              <TableSkeleton rows={10} cols={4} />
            ) : spots.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun lieu touristique</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Wilaya</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spots.map((spot, index) => (
                    <motion.tr
                      key={spot.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      data-testid={`spot-row-${spot.id}`}
                    >
                      <TableCell className="font-medium">{spot.name}</TableCell>
                      <TableCell>{spot.wilaya}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                        {spot.description || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(spot)}
                            data-testid={`button-edit-${spot.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteSpot({ id: spot.id, name: spot.name })}
                            data-testid={`button-delete-${spot.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
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

      {/* Edit Dialog */}
      <Dialog open={!!editSpot} onOpenChange={(open) => !open && setEditSpot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le lieu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-wilaya">Wilaya</Label>
              <Select value={formData.wilaya} onValueChange={(val) => setFormData({ ...formData, wilaya: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAS.map(w => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSpot(null)}>Annuler</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSpot} onOpenChange={(open) => !open && setDeleteSpot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deleteSpot?.name}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

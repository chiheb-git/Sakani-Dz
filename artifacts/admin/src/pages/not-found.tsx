import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            404
          </h1>
          <p className="text-muted-foreground mb-6">
            Page introuvable
          </p>
          <Link href="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

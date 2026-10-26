import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Centered card used by the login and sign-up pages
export default function AuthCard({ title, description, children, footer }) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-b from-accent/60 to-background px-4 py-12">
      <Card className="w-full max-w-md shadow-xl shadow-black/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-extrabold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && <div className="px-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </Card>
    </div>
  );
}

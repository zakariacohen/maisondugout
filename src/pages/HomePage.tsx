import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Sparkles, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      {/* Header */}
      <header className="py-8 px-4 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Maison du Goût" className="w-16 h-16 rounded-full shadow-lg object-cover" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Maison du Goût</h1>
              <p className="text-sm text-muted-foreground">L'art de la pâtisserie marocaine</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block px-6 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full text-primary font-medium mb-4 border border-primary/20">
              Bienvenue
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Savourez la Tradition
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Découvrez nos délices artisanaux préparés avec passion. 
            De la tradition marocaine aux créations modernes, chaque bouchée raconte une histoire.
          </p>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Commande Classique */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/30 cursor-pointer">
              <Link to="/commande" className="block">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                    Commander Maintenant
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Passez votre commande en ligne et recevez nos délices chez vous
                  </p>
                  <Button 
                    variant="outline" 
                    className="group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    Accéder au formulaire
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* Commande Ramadan */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-400/30 cursor-pointer bg-gradient-to-br from-purple-50/50 to-violet-50/50">
              <Link to="/ramadan" className="block">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-200 to-violet-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-3 bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent">
                    Collection Ramadan 2026
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Célébrez le mois sacré avec nos créations spéciales
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 group-hover:shadow-md transition-all"
                  >
                    Découvrir Ramadan
                    <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Admin Access */}
          <div className="pt-8 border-t border-border/50">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Shield className="w-4 h-4 mr-2" />
                Accès Administration
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🎂</span>
              </div>
              <h3 className="font-serif font-bold text-lg mb-2">Fait Maison</h3>
              <p className="text-sm text-muted-foreground">
                Tous nos produits sont préparés artisanalement avec des ingrédients de qualité
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-serif font-bold text-lg mb-2">Livraison Rapide</h3>
              <p className="text-sm text-muted-foreground">
                Nous livrons vos commandes rapidement à l'adresse de votre choix
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="font-serif font-bold text-lg mb-2">Service Personnalisé</h3>
              <p className="text-sm text-muted-foreground">
                Chaque commande est traitée avec soin pour garantir votre satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Maison du Goût. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
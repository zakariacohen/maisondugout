import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgb(139, 69, 19) 35px, rgb(139, 69, 19) 70px)`,
        }}></div>
      </div>
      
      {/* Header */}
      <header className="py-4 sm:py-6 md:py-8 px-3 sm:px-4 border-b-2 border-amber-700/30 bg-gradient-to-r from-red-900/95 via-amber-900/95 to-red-900/95 backdrop-blur relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMEwzNSAxNUgxNUwyMCAwSDMwWk0zMCA2MEwyNSA0NUg0NUw0MCA2MEgzMFpNMCAzMEwxNSAzNVYxNUwwIDIwVjMwWk02MCAzMEw0NSAyNVY0NUw2MCA0MFYzMFoiIGZpbGw9IiNmZmQ3MDAiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="max-w-6xl mx-auto flex items-center justify-center sm:justify-between relative z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl"></div>
              <img src={logo} alt="Maison du Goût" className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shadow-2xl object-cover border-2 sm:border-4 border-amber-400/50 relative" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-amber-50 mb-0.5 sm:mb-1">Maison du Goût</h2>
              <p className="text-xs sm:text-sm text-amber-200/90 font-medium tracking-wide">✨ فن الحلويات المغربية الأصيلة ✨</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10 sm:py-16 md:py-20 px-3 sm:px-4 relative">
        {/* Decorative Elements - Hidden on mobile */}
        <div className="absolute top-10 left-10 text-4xl sm:text-6xl opacity-20 hidden sm:block">🌙</div>
        <div className="absolute top-20 right-20 text-3xl sm:text-5xl opacity-20 hidden sm:block">⭐</div>
        <div className="absolute bottom-10 left-20 text-3xl sm:text-5xl opacity-20 hidden sm:block">🏮</div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="mb-6 sm:mb-8">
            <span className="inline-block px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-gradient-to-r from-red-800 via-amber-600 to-red-800 rounded-full text-amber-50 font-bold mb-4 border-2 border-amber-400 shadow-xl text-sm sm:text-base md:text-lg">
              ✨ أهلا وسهلا - Bienvenue ✨
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 bg-gradient-to-r from-red-900 via-amber-700 to-red-900 bg-clip-text text-transparent drop-shadow-lg leading-tight">
            تذوق التقاليد العريقة
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 sm:mb-8 text-red-900">
            Savourez la Tradition
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-amber-900 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-2">
            اكتشفوا حلوياتنا التقليدية المحضرة بشغف وإتقان<br/>
            Découvrez nos délices artisanaux préparés avec passion et authenticité
          </p>

          {/* CTA Cards */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
            {/* Commande Classique */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 sm:border-4 border-amber-600/50 hover:border-amber-500 cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSIjZDk3NzA2IiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-50"></div>
              <Link to="/commande" className="block relative z-10">
                <CardContent className="p-6 sm:p-8 md:p-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl border-2 sm:border-4 border-amber-200">
                    <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-1 sm:mb-2 text-amber-900 group-hover:text-red-800 transition-colors">
                    الطلبات الكلاسيكية
                  </h3>
                  <h4 className="text-lg sm:text-xl md:text-2xl font-serif font-bold mb-3 sm:mb-4 text-amber-800">
                    Commander Maintenant
                  </h4>
                  <p className="text-sm sm:text-base text-amber-900/80 mb-4 sm:mb-6 leading-relaxed font-medium">
                    احجز طلبك واستمتع بحلوياتنا التقليدية
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-amber-600 to-orange-700 text-white hover:from-amber-700 hover:to-orange-800 border-2 border-amber-400 shadow-lg text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 font-bold w-full sm:w-auto"
                  >
                    طلب الآن - Commander
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* Commande Ramadan */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 sm:border-4 border-emerald-600/50 hover:border-emerald-500 cursor-pointer bg-gradient-to-br from-red-900/90 via-emerald-900/80 to-amber-900/90 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0NSAyMEgyMEwyNSAwSDQwWk00MCA4MEwzNSA2MEg2MEw1NSA4MEg0MFpNMCA0MEwyMCA0NVYyMEwwIDI1VjQwWk04MCA0MEw2MCAzNVY2MEw4MCA1NVY0MFoiIGZpbGw9IiNmZmQ3MDAiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-2xl sm:text-4xl animate-pulse">🌙</div>
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-xl sm:text-3xl opacity-70">✨</div>
              <Link to="/ramadan" className="block relative z-10">
                <CardContent className="p-6 sm:p-8 md:p-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-emerald-400 via-amber-400 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl border-2 sm:border-4 border-amber-300">
                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-1 sm:mb-2 text-amber-100 group-hover:text-amber-50 transition-colors drop-shadow-lg">
                    مجموعة رمضان ٢٠٢٦
                  </h3>
                  <h4 className="text-lg sm:text-xl md:text-2xl font-serif font-bold mb-3 sm:mb-4 text-emerald-200">
                    Collection Ramadan 2026
                  </h4>
                  <p className="text-sm sm:text-base text-amber-100/90 mb-4 sm:mb-6 leading-relaxed font-medium">
                    احتفلوا بالشهر الكريم مع حلوياتنا المميزة
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-emerald-600 via-amber-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-amber-700 border-2 border-amber-300 shadow-xl text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 font-bold w-full sm:w-auto"
                  >
                    رمضان كريم - Découvrir
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:rotate-12 transition-transform" />
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 sm:py-16 md:py-20 px-3 sm:px-4 bg-gradient-to-br from-red-900/10 via-amber-100/50 to-emerald-900/10 border-y-2 sm:border-y-4 border-amber-600/30 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMzBtLTE1IDBhMTUsMTUgMCAxLDAgMzAsMGExNSwxNSAwIDEsMC0zMCwwIiBmaWxsPSJub25lIiBzdHJva2U9IiNkOTc3MDYiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-40"></div>
        
        <div className="max-w-6xl mx-auto relative">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-center mb-8 sm:mb-10 md:mb-12 text-red-900">
            ✨ مميزاتنا - Nos Atouts ✨
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            <div className="text-center bg-white/70 backdrop-blur p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-amber-600/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mx-auto mb-4 sm:mb-5 md:mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg border-2 sm:border-4 border-amber-200">
                <span className="text-3xl sm:text-3xl md:text-4xl">🎂</span>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 text-red-900">صنع يدوي</h3>
              <h4 className="font-serif font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 text-amber-800">Fait Maison</h4>
              <p className="text-sm sm:text-base text-amber-900/80 leading-relaxed font-medium">
                جميع منتجاتنا محضرة بإتقان<br/>
                avec des ingrédients de qualité
              </p>
            </div>
            <div className="text-center bg-white/70 backdrop-blur p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-emerald-600/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mx-auto mb-4 sm:mb-5 md:mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg border-2 sm:border-4 border-emerald-200">
                <span className="text-3xl sm:text-3xl md:text-4xl">🚚</span>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 text-red-900">توصيل سريع</h3>
              <h4 className="font-serif font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 text-emerald-800">Livraison Rapide</h4>
              <p className="text-sm sm:text-base text-amber-900/80 leading-relaxed font-medium">
                نوصل طلباتكم بسرعة<br/>
                à l'adresse de votre choix
              </p>
            </div>
            <div className="text-center bg-white/70 backdrop-blur p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-red-600/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mx-auto mb-4 sm:mb-5 md:mb-6 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg border-2 sm:border-4 border-red-200">
                <span className="text-3xl sm:text-3xl md:text-4xl">💝</span>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 text-red-900">خدمة شخصية</h3>
              <h4 className="font-serif font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 text-red-800">Service Personnalisé</h4>
              <p className="text-sm sm:text-base text-amber-900/80 leading-relaxed font-medium">
                نهتم بكل طلب لضمان رضاكم<br/>
                avec soin et passion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t-4 border-amber-600/50 bg-gradient-to-r from-red-900 via-amber-900 to-red-900 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMEwyNSAxNUgxNUwyMCAwWk0yMCA0MEwxNSAyNUgyNUwyMCA0MFpNMCAyMEwxNSAyNVYxNUwwIDIwWk00MCAyMEwyNSAxNVYyNUw0MCAyMFoiIGZpbGw9IiNmZmQ3MDAiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-4">
            <p className="text-lg font-serif text-amber-200">Maison du Goût</p>
          </div>
          <p className="text-sm text-amber-300/90 font-medium">
            © ٢٠٢٥ - 2025 Maison du Goût. جميع الحقوق محفوظة - Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
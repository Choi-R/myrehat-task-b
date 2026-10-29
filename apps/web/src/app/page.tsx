"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Building2, 
  MapPin, 
  Phone, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Home,
  Compass,
  ArrowRight
} from "lucide-react";

import { Button } from "@myrehat-task-b/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@myrehat-task-b/ui/components/card";
import { Input } from "@myrehat-task-b/ui/components/input";
import { Label } from "@myrehat-task-b/ui/components/label";
import { Textarea } from "@myrehat-task-b/ui/components/textarea";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const CATEGORY_OPTIONS = [
  "Buy Property",
  "Buy land to build homestay",
  "Buy Airbnb Profile",
  "Buy Airbnb Business",
] as const;

type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

const SAMPLE_LISTINGS = [
  {
    id: "sample-1",
    title: "Luxury Beachfront Homestay Villa",
    price: "3.500.000.000",
    location: "Canggu, Bali",
    category: "Buy Property" as const,
    whatsappContact: "6281234567890",
    description: "Villa 4 kamar tidur siap huni dengan occupancy rate 90% di Airbnb. Dilengkapi kolam renang pribadi dan lisensi homestay lengkap.",
    createdAt: new Date().toISOString(),
    isFeatured: true,
  },
  {
    id: "sample-2",
    title: "Tanah Komersial Siap Bangun Homestay",
    price: "850.000.000",
    location: "Kaliurang, Sleman, D.I. Yogyakarta",
    category: "Buy land to build homestay" as const,
    whatsappContact: "6281987654321",
    description: "Lahan 600m2 dengan pemandangan Gunung Merapi. Izin homestay & IMB siap diproses, akses jalan aspal 6 meter.",
    createdAt: new Date().toISOString(),
    isFeatured: true,
  },
  {
    id: "sample-3",
    title: "Akun Superhost Airbnb 5-Star (300+ Review)",
    price: "150.000.000",
    location: "Bandung, Jawa Barat",
    category: "Buy Airbnb Profile" as const,
    whatsappContact: "6285551234567",
    description: "Take over profil Airbnb Superhost rating 4.98 dengan riwayat 3 tahun dan pendapatan pasif stabil.",
    createdAt: new Date().toISOString(),
    isFeatured: true,
  },
  {
    id: "sample-4",
    title: "Bisnis Homestay Aktif 8 Kamar + Manajemen",
    price: "1.800.000.000",
    location: "Batu, Malang",
    category: "Buy Airbnb Business" as const,
    whatsappContact: "6287778889999",
    description: "Bisnis homestay berjalan lengkap dengan SOP, staf terlatih, sistem reservasi otomatis, dan perabotan lengkap.",
    createdAt: new Date().toISOString(),
    isFeatured: true,
  },
];

export default function HomePage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const listingsQuery = useQuery(orpc.homestay.list.queryOptions());

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<CategoryOption>("Buy Property");
  const [whatsappContact, setWhatsappContact] = useState("");
  const [description, setDescription] = useState("");
  const [isPolishing, setIsPolishing] = useState(false);

  const handlePolishAI = async () => {
    if (!description || !description.trim()) {
      toast.error("Tuliskan deskripsi awal terlebih dahulu sebelum dipoles AI!");
      return;
    }
    setIsPolishing(true);
    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, title, category }),
      });
      const data = await res.json();
      if (data.polished) {
        setDescription(data.polished);
        toast.success("Deskripsi berhasil dipoles dengan AI (F3)!");
      } else {
        toast.error("Gagal memoles deskripsi.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memoles deskripsi.");
    } finally {
      setIsPolishing(false);
    }
  };

  const createMutation = useMutation(
    orpc.homestay.create.mutationOptions({
      onSuccess: () => {
        toast.success("Listing BuyHomestay berhasil diterbitkan!");
        setTitle("");
        setPrice("");
        setLocation("");
        setCategory("Buy Property");
        setWhatsappContact("");
        setDescription("");
        listingsQuery.refetch();
      },
      onError: (err) => {
        toast.error(`Gagal membuat listing: ${err.message}`);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !location || !category || !whatsappContact) {
      toast.error("Mohon isi semua field wajib!");
      return;
    }
    createMutation.mutate({
      title,
      price,
      location,
      category,
      whatsappContact,
      description: description || undefined,
    });
  };

  const dbListings = listingsQuery.data || [];
  const displayListings = dbListings.length > 0 ? dbListings : SAMPLE_LISTINGS;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/50 to-background py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs sm:text-sm font-medium shadow-sm mb-6 backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>Platform Komprehensif Homestay & Peluang Investasi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance">
            Book homestays directly with hosts
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Temukan tempat tinggal unik langsung dari tuan rumah, atau miliki properti & bisnis homestay idaman Anda melalui marketplace BuyHomestay.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#form-listing">
              <Button size="lg" className="gap-2 shadow-md">
                <PlusCircle className="h-4 w-4" />
                Pasang Listing BuyHomestay
              </Button>
            </a>
            <Link href={"/listings" as any}>
              <Button size="lg" variant="outline" className="gap-2">
                <Compass className="h-4 w-4" />
                Lihat Halaman /listings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Form Listing BuyHomestay Section */}
        <section id="form-listing" className="scroll-mt-10">
          <Card className="border-border/60 shadow-lg">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl sm:text-2xl">Form Listing BuyHomestay (F1)</CardTitle>
              </div>
              <CardDescription>
                Pasang listing properti, lahan, profil, atau bisnis homestay Anda untuk calon investor. (Hanya user login yang dapat submit).
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {isSessionLoading ? (
                <div className="py-8 text-center text-muted-foreground animate-pulse">
                  Memeriksa status login...
                </div>
              ) : !session?.user ? (
                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 sm:p-8 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Perlu Login untuk Memasang Listing</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Hanya user yang telah masuk melalui Better-Auth yang diizinkan untuk membuat listing BuyHomestay.
                    </p>
                  </div>
                  <Link href="/login" className="inline-block">
                    <Button>Masuk / Daftar Akun</Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Judul Listing *</Label>
                      <Input
                        id="title"
                        placeholder="Contoh: Homestay Minimalis Tropis Dekat Malioboro"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Harga (Rp) *</Label>
                      <Input
                        id="price"
                        placeholder="Contoh: 1.250.000.000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Lokasi *</Label>
                      <Input
                        id="location"
                        placeholder="Contoh: Sleman, D.I. Yogyakarta"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori BuyHomestay (Tepat 4 Opsi) *</Label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryOption)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        required
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-popover text-popover-foreground">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="whatsappContact">Kontak WhatsApp *</Label>
                      <Input
                        id="whatsappContact"
                        placeholder="Contoh: 628123456789 (format nomor internasional)"
                        value={whatsappContact}
                        onChange={(e) => setWhatsappContact(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="description">Deskripsi Tambahan</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handlePolishAI}
                          disabled={isPolishing || !description}
                          className="h-7 text-xs gap-1.5 text-primary hover:text-primary/80"
                        >
                          <Sparkles className={`h-3.5 w-3.5 ${isPolishing ? "animate-spin" : ""}`} />
                          {isPolishing ? "Memoles..." : "Poles dengan AI (F3)"}
                        </Button>
                      </div>
                      <Textarea
                        id="description"
                        rows={3}
                        placeholder="Ceritakan detail unit, ROI, kapasitas tamu, dan fasilitas... Lalu klik 'Poles dengan AI (F3)' untuk memperbagus deskripsi."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                      {createMutation.isPending ? (
                        "Menyimpan..."
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Terbitkan Listing
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Listings Display Section */}
        <section id="listings" className="scroll-mt-10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Daftar Listing BuyHomestay</h2>
              <p className="text-sm text-muted-foreground">
                Peluang investasi homestay terverifikasi dari pemilik & mitra
              </p>
            </div>
            <Link href={"/listings" as any}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span>Buka Halaman Lengkap</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayListings.map((item) => {
              const cleanPhone = item.whatsappContact.replace(/\D/g, "");
              const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Halo, saya tertarik dengan listing BuyHomestay: ${item.title}`,
              )}`;

              return (
                <Card key={item.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-block rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1">
                    <div className="text-xl font-bold text-primary">
                      Rp {item.price}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2 border-t">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full gap-2 text-xs">
                        <Phone className="h-3.5 w-3.5 text-green-600" />
                        Hubungi via WhatsApp
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

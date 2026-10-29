"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Phone, 
  PlusCircle, 
  Sparkles, 
  Search,
  Filter,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

import { Button } from "@myrehat-task-b/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@myrehat-task-b/ui/components/card";
import { Input } from "@myrehat-task-b/ui/components/input";
import { orpc } from "@/utils/orpc";

const CATEGORIES = [
  "All",
  "Buy Property",
  "Buy land to build homestay",
  "Buy Airbnb Profile",
  "Buy Airbnb Business",
] as const;

type CategoryFilter = (typeof CATEGORIES)[number];

// Featured / sample listings to ensure the page is rich and informative even on fresh DB
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

export default function ListingsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const listingsQuery = useQuery(orpc.homestay.list.queryOptions());

  // Merge database listings with featured sample listings
  const dbListings = (listingsQuery.data || []).map((item) => ({
    ...item,
    isFeatured: false,
  }));

  // Combine DB listings first, then sample listings
  const allListings = [...dbListings, ...SAMPLE_LISTINGS];

  // Filter listings
  const filteredListings = allListings.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
              <Building2 className="h-3.5 w-3.5" />
              <span>BuyHomestay Marketplace</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Daftar Listing Homestay & Peluang Bisnis
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Jelajahi properti homestay, tanah potensial, profil Airbnb, dan bisnis homestay yang siap diakuisisi.
            </p>
          </div>

          <Link href={"/#form-listing" as any}>
            <Button className="gap-2 shadow-sm shrink-0">
              <PlusCircle className="h-4 w-4" />
              Pasang Listing Baru
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari lokasi, nama properti, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="text-xs whitespace-nowrap rounded-full h-8"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Menampilkan {filteredListings.length} listing</span>
            {dbListings.length > 0 && (
              <span className="text-primary font-medium">
                ({dbListings.length} dari database Drizzle)
              </span>
            )}
          </div>

          {filteredListings.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center space-y-3">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <h3 className="font-medium text-lg">Tidak ada listing yang cocok</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((item) => {
                const cleanPhone = item.whatsappContact.replace(/\D/g, "");
                const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Halo, saya tertarik dengan listing BuyHomestay: ${item.title} (${item.category})`,
                )}`;

                return (
                  <Card
                    key={item.id}
                    className="flex flex-col justify-between hover:shadow-lg transition-all duration-200 border-border/80"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-block rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                          {item.category}
                        </span>
                        {item.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Sparkles className="h-3 w-3" />
                            Featured
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold line-clamp-1">{item.title}</CardTitle>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 flex-1">
                      <div className="text-2xl font-black text-primary">
                        Rp {item.price}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </CardContent>

                    <CardFooter className="pt-3 border-t">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button className="w-full gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Phone className="h-3.5 w-3.5" />
                          Hubungi Penjual via WhatsApp
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


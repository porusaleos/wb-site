"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Plus, Minus, RefreshCw, Search, X } from "lucide-react"
import Link from "next/link"
import { getMenuItems, subscribeToMenuItems, type MenuItem } from "@/lib/supabase"

export default function HomePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<{ [key: number]: number }>({})
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const categories = ["Semua", "Makanan Utama", "Minuman", "Dessert"]

  useEffect(() => {
    loadMenuItems()

    // Load cart from localStorage
    const savedCart = localStorage.getItem("restaurant_cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    // Subscribe to real-time changes
    const subscription = subscribeToMenuItems((payload) => {
      console.log("Menu updated:", payload)
      loadMenuItems()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadMenuItems = async () => {
    setLoading(true)
    try {
      const items = await getMenuItems()
      setMenuItems(items)
    } catch (error) {
      console.error("Error loading menu items:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (itemId: number) => {
    setCart((prev) => {
      const newCart = {
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
      }
      localStorage.setItem("restaurant_cart", JSON.stringify(newCart))
      return newCart
    })
  }

  const removeFromCart = (itemId: number) => {
    setCart((prev) => {
      const newCart = { ...prev }
      if (newCart[itemId] > 1) {
        newCart[itemId]--
      } else {
        delete newCart[itemId]
      }
      localStorage.setItem("restaurant_cart", JSON.stringify(newCart))
      return newCart
    })
  }

  // Filter items berdasarkan kategori dan search query
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const cartItemsCount = Object.values(cart).reduce((sum, count) => sum + count, 0)

  const clearSearch = () => {
    setSearchQuery("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Memuat menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 w-full">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16 w-full">
            <div className="flex items-center min-w-0 flex-1">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Waroeng Bakar</h1>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Link href="/checkout">
                <Button variant="outline" size="sm" className="relative bg-transparent text-xs sm:text-sm px-2 sm:px-4">
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Keranjang</span>
                  <span className="sm:hidden">Cart</span>
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-6 lg:mb-8 w-full">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Cari menu atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 w-full text-sm sm:text-base py-2 sm:py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="text-center mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
              {filteredItems.length > 0 ? (
                <p>
                  Ditemukan <span className="font-semibold text-blue-600">{filteredItems.length}</span> menu untuk "
                  {searchQuery}"
                </p>
              ) : (
                <p className="text-red-500">Tidak ada menu yang ditemukan untuk "{searchQuery}"</p>
              )}
            </div>
          )}
        </div>

        {/* Category Filter - Hide when searching */}
        {!searchQuery && (
          <div className="mb-4 sm:mb-6 lg:mb-8 w-full">
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">Kategori Menu</h2>
            <div className="flex flex-wrap gap-2 w-full">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  className="text-xs sm:text-sm flex-shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Show active filters */}
        {(searchQuery || selectedCategory !== "Semua") && (
          <div className="mb-3 sm:mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs sm:text-sm text-gray-600">Filter aktif:</span>
            {searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Pencarian: "{searchQuery}"
                <button onClick={clearSearch} className="ml-1 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategory !== "Semua" && !searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Kategori: {selectedCategory}
                <button onClick={() => setSelectedCategory("Semua")} className="ml-1 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Menu Grid - Mobile: 2 columns, Tablet: 3 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 w-full">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden w-full hover:shadow-md transition-shadow duration-200">
              {/* Image - Smaller aspect ratio for mobile */}
              <div className="aspect-square bg-gray-200 w-full">
                <img
                  src={item.image_url || "/placeholder.svg?height=150&width=150"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content - Compact for mobile */}
              <div className="p-2 sm:p-3 lg:p-4">
                {/* Title */}
                <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                  {item.name}
                </h3>

                {/* Category Badge */}
                <Badge variant="secondary" className="text-xs mb-2 px-1 py-0.5">
                  {item.category}
                </Badge>

                {/* Price */}
                <div className="text-sm sm:text-base lg:text-lg font-bold text-green-600 mb-2">
                  Rp {item.price.toLocaleString("id-ID")}
                </div>

                {/* Cart Controls */}
                <div className="flex items-center justify-between gap-1">
                  {cart[item.id] > 0 ? (
                    <div className="flex items-center space-x-1 flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(item.id)}
                        className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-semibold text-xs sm:text-sm text-center min-w-[20px]">{cart[item.id]}</span>
                      <Button size="sm" onClick={() => addToCart(item.id)} className="h-7 w-7 p-0 sm:h-8 sm:w-8">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => addToCart(item.id)}
                      className="w-full h-7 sm:h-8 text-xs sm:text-sm"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Tambah
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
            {searchQuery ? (
              <div>
                <p className="text-base sm:text-lg mb-2">Tidak ada menu yang ditemukan</p>
                <p className="text-xs sm:text-sm mb-3 sm:mb-4">Coba kata kunci lain atau lihat semua menu</p>
                <Button onClick={clearSearch} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Hapus Pencarian
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-base sm:text-lg mb-2">Tidak ada menu dalam kategori ini</p>
                <Button onClick={() => setSelectedCategory("Semua")} variant="outline" size="sm">
                  Lihat Semua Menu
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick Search Suggestions */}
        {!searchQuery && menuItems.length > 0 && (
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Pencarian populer:</p>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {["Nasi", "Ayam", "Es", "Jus", "Bakar"].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery(suggestion)}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

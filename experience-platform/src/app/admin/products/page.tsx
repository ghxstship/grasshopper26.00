import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Package, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  
  const search = params.search || '';
  const category = params.category || '';
  const page = parseInt(params.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('products')
    .select('*, brands(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data: products, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
  }

  const totalPages = Math.ceil((count || 0) / limit);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'apparel':
        return 'bg-blue-100 text-blue-700';
      case 'accessories':
        return 'bg-purple-100 text-purple-700';
      case 'collectibles':
        return 'bg-yellow-100 text-yellow-700';
      case 'digital':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage merchandise and digital products</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-10"
            defaultValue={search}
          />
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products">
            <Button variant={!category ? 'default' : 'outline'} size="sm">
              All
            </Button>
          </Link>
          <Link href="/admin/products?category=apparel">
            <Button variant={category === 'apparel' ? 'default' : 'outline'} size="sm">
              Apparel
            </Button>
          </Link>
          <Link href="/admin/products?category=accessories">
            <Button variant={category === 'accessories' ? 'default' : 'outline'} size="sm">
              Accessories
            </Button>
          </Link>
          <Link href="/admin/products?category=collectibles">
            <Button variant={category === 'collectibles' ? 'default' : 'outline'} size="sm">
              Collectibles
            </Button>
          </Link>
          <Link href="/admin/products?category=digital">
            <Button variant={category === 'digital' ? 'default' : 'outline'} size="sm">
              Digital
            </Button>
          </Link>
        </div>
      </div>

      {/* Products grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge className={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {product.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      ${(product.base_price / 100).toFixed(2)}
                    </p>
                    <Badge className={getCategoryColor(product.category)} variant="outline">
                      {product.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first product</p>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {offset + 1} to {Math.min(offset + limit, count || 0)} of {count} products
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/admin/products?page=${page - 1}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}`}>
                  Previous
                </Link>
              ) : (
                <span>Previous</span>
              )}
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages}
              asChild={page < totalPages}
            >
              {page < totalPages ? (
                <Link href={`/admin/products?page=${page + 1}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}`}>
                  Next
                </Link>
              ) : (
                <span>Next</span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

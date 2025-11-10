'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { Label } from '@/design-system/components/atoms/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import styles from './page.module.css';

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(['']);
  const [variants, setVariants] = useState<Array<{
    name: string;
    sku: string;
    price: string;
    stockQuantity: string;
  }>>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'apparel',
    basePrice: '',
    status: 'draft',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const addImage = () => {
    setImages([...images, '']);
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', sku: '', price: '', stockQuantity: '' }]);
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          basePrice: parseFloat(formData.basePrice) * 100, // Convert to cents
          images: images.filter(img => img.trim() !== ''),
          variants: variants.map(v => ({
            ...v,
            price: v.price ? parseFloat(v.price) * 100 : undefined,
            stockQuantity: v.stockQuantity ? parseInt(v.stockQuantity) : undefined,
          })),
          brandId: 'default-brand-id', // TODO: Get from context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      toast({
        title: 'Success',
        description: 'Product created successfully',
      });

      router.push('/admin/products');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.row}>
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className={styles.icon} />
          </Button>
        </Link>
        <div>
          <h1 className={styles.title}>Create Product</h1>
          <p className={styles.text}>Add a new product to your store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.section}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className={styles.section}>
            <div className={styles.grid}>
              <div className={styles.section}>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Festival T-Shirt"
                  required
                />
              </div>
              <div className={styles.section}>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="festival-t-shirt"
                  required
                />
              </div>
            </div>

            <div className={styles.section}>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your product..."
                rows={4}
                className={styles.card}
              />
            </div>

            <div className={styles.grid}>
              <div className={styles.section}>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={styles.card}
                >
                  <option value="apparel">Apparel</option>
                  <option value="accessories">Accessories</option>
                  <option value="collectibles">Collectibles</option>
                  <option value="digital">Digital</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className={styles.section}>
                <Label htmlFor="basePrice">Base Price ($) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => handleChange('basePrice', e.target.value)}
                  placeholder="29.99"
                  required
                />
              </div>
              <div className={styles.section}>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={styles.card}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className={styles.header}>
              <CardTitle>Product Images</CardTitle>
              <Button type="button" onClick={addImage} size="sm" variant="outline">
                <Plus className={styles.icon} />
                Add Image
              </Button>
            </div>
          </CardHeader>
          <CardContent className={styles.section}>
            {images.map((image, index) => (
              <div key={index} className={styles.row}>
                <Input
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  
                />
                {images.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeImage(index)}
                    size="icon"
                    variant="outline"
                  >
                    <X className={styles.icon} />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className={styles.header}>
              <CardTitle>Product Variants (Optional)</CardTitle>
              <Button type="button" onClick={addVariant} size="sm" variant="outline">
                <Plus className={styles.icon} />
                Add Variant
              </Button>
            </div>
          </CardHeader>
          <CardContent className={styles.section}>
            {variants.map((variant, index) => (
              <div key={index} className={styles.section}>
                <div className={styles.row}>
                  <h4 >Variant {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeVariant(index)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className={styles.icon} />
                  </Button>
                </div>
                <div className={styles.grid}>
                  <div className={styles.section}>
                    <Label>Name</Label>
                    <Input
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      placeholder="Small"
                    />
                  </div>
                  <div className={styles.section}>
                    <Label>SKU</Label>
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      placeholder="TSH-SM-001"
                    />
                  </div>
                  <div className={styles.section}>
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      placeholder="29.99"
                    />
                  </div>
                  <div className={styles.section}>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={variant.stockQuantity}
                      onChange={(e) => updateVariant(index, 'stockQuantity', e.target.value)}
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            ))}
            {variants.length === 0 && (
              <p className={styles.emptyState}>
                No variants added. Click &quot;Add Variant&quot; to create size, color, or other variations.
              </p>
            )}
          </CardContent>
        </Card>

        <div className={styles.card}>
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className={styles.icon} />
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}

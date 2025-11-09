'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { Badge } from '@/design-system/components/atoms/badge';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown,
  RefreshCw,
  Search,
  Plus,
  Minus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  ticket_type_id: string;
  event_id: string;
  available_quantity: number;
  reserved_quantity: number;
  sold_quantity: number;
  total_quantity: number;
  low_stock_threshold: number;
  ticket_types: {
    name: string;
    price: number;
  };
  events: {
    name: string;
  };
}

export default function InventoryManagementPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [adjusting, setAdjusting] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/inventory');
      const data = await response.json();
      
      if (response.ok) {
        setInventory(data.inventory || []);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const adjustInventory = async (itemId: string, adjustment: number) => {
    setAdjusting(itemId);
    try {
      const response = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory_id: itemId,
          adjustment,
          reason: adjustment > 0 ? 'manual_increase' : 'manual_decrease',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Inventory adjusted successfully',
        });
        fetchInventory();
      } else {
        throw new Error('Failed to adjust inventory');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to adjust inventory',
        variant: 'destructive',
      });
    } finally {
      setAdjusting(null);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.events.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ticket_types.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(
    item => item.available_quantity <= item.low_stock_threshold
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage ticket inventory across all events
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items below threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Available</CardTitle>
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.reduce((sum, item) => sum + item.available_quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Tickets available for sale</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Refresh */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by event or ticket type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchInventory} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.events.name}</p>
                    <p className="text-sm text-muted-foreground">{item.ticket_types.name}</p>
                  </div>
                  <Badge variant="destructive">
                    {item.available_quantity} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading inventory...
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No inventory items found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{item.events.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.ticket_types.name} - ${item.ticket_types.price}
                      </p>
                    </div>
                    {item.available_quantity <= item.low_stock_threshold && (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="text-lg font-bold">{item.available_quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reserved</p>
                      <p className="text-lg font-bold text-yellow-500">{item.reserved_quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sold</p>
                      <p className="text-lg font-bold text-green-500">{item.sold_quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold">{item.total_quantity}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustInventory(item.id, 10)}
                      disabled={adjusting === item.id}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add 10
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustInventory(item.id, -10)}
                      disabled={adjusting === item.id || item.available_quantity < 10}
                    >
                      <Minus className="w-4 h-4 mr-1" />
                      Remove 10
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

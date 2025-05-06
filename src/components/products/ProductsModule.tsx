
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, Clock, Package, Tag, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Product type definition
interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  interval?: number;
  tags: string[];
  needsPrescription: boolean;
  controlled?: boolean;
}

const ProductsModule = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Dipirona 500mg',
      category: 'Analgésico',
      stock: 150,
      tags: ['Uso Comum'],
      needsPrescription: false,
    },
    {
      id: '2',
      name: 'Atorvastatina 20mg',
      category: 'Cardiovascular',
      stock: 80,
      interval: 30,
      tags: ['Uso Contínuo'],
      needsPrescription: true,
    },
    {
      id: '3',
      name: 'Losartana 50mg',
      category: 'Cardiovascular',
      stock: 120,
      interval: 30,
      tags: ['Uso Contínuo'],
      needsPrescription: true,
    },
    {
      id: '4',
      name: 'Omeprazol 20mg',
      category: 'Gastrointestinal',
      stock: 100,
      interval: 30,
      tags: ['Uso Contínuo'],
      needsPrescription: true,
    },
    {
      id: '5',
      name: 'Amoxicilina 500mg',
      category: 'Antibiótico',
      stock: 60,
      interval: 8,
      tags: ['Antibiótico', 'Controlado'],
      needsPrescription: true,
      controlled: true,
    },
  ];

  const getProductBadges = (product: Product) => {
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {product.tags.map((tag) => {
          let className = "";
          if (tag === "Uso Contínuo") {
            className = "bg-blue-600 text-white";
          } else if (tag === "Uso Comum") {
            className = "bg-green-600 text-white";
          } else if (tag === "Antibiótico") {
            className = "bg-purple-600 text-white";
          } else if (tag === "Controlado") {
            className = "bg-red-600 text-white";
          } else {
            className = "bg-gray-600 text-white";
          }
          
          return (
            <Badge key={tag} className={className + " mr-1"}>
              {tag}
            </Badge>
          );
        })}
        
        {product.needsPrescription && (
          <Badge className="bg-yellow-600 text-white">
            Com Receita
          </Badge>
        )}
        
        {!product.needsPrescription && (
          <Badge className="bg-green-600 text-white">
            Sem Receita
          </Badge>
        )}
      </div>
    );
  };

  const handleFilterClick = (filter: string) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
  };

  const filteredProducts = activeFilter
    ? mockProducts.filter(product => 
        product.tags.some(tag => tag === activeFilter) || 
        product.category === activeFilter)
    : mockProducts;

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-pharmacy-dark1">Produtos</h1>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            className={`border-gray-300 ${activeFilter === null ? 'bg-gray-100' : ''}`}
            onClick={() => setActiveFilter(null)}
          >
            Todos
          </Button>
          <Button 
            variant="outline" 
            className={`border-gray-300 ${activeFilter === 'Uso Contínuo' ? 'bg-gray-100' : ''}`}
            onClick={() => handleFilterClick('Uso Contínuo')}
          >
            Uso Contínuo
          </Button>
          <Button 
            variant="outline" 
            className={`border-gray-300 ${activeFilter === 'Controlado' ? 'bg-gray-100' : ''}`}
            onClick={() => handleFilterClick('Controlado')}
          >
            Controlados
          </Button>
          <Button 
            variant="outline" 
            className={`border-gray-300 ${activeFilter === 'Antibiótico' ? 'bg-gray-100' : ''}`}
            onClick={() => handleFilterClick('Antibiótico')}
          >
            Antibióticos
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produto..."
              className="pl-10 pr-4 py-2 border-gray-300 rounded-md w-64"
            />
          </div>
          <Button variant="outline" className="border-gray-300">
            <Filter className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="p-6 shadow-md border border-gray-200">
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-bold text-pharmacy-dark1">{product.name}</h3>
                <Badge className="bg-gray-200 text-gray-700 mt-1">{product.category}</Badge>
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-gray-500 mr-2" />
                <span>Estoque: {product.stock} unidades</span>
              </div>
              
              {product.interval && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span>Intervalo: {product.interval} dias</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Tag className="h-4 w-4 text-gray-500 mr-2" />
                {getProductBadges(product)}
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" className="border-gray-300">
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Detalhes
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductsModule;

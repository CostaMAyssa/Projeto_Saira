
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { CustomerDetails } from './types';

interface CustomerEditDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  customer: CustomerDetails;
  onSave: (data: CustomerDetails) => void;
}

const CustomerEditDialog: React.FC<CustomerEditDialogProps> = ({ open, setOpen, customer, onSave }) => {
  const form = useForm({
    defaultValues: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      birthdate: customer.birthdate,
    },
  });

  const handleSubmit = (data: any) => {
    onSave({ ...customer, ...data });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-pharmacy-dark2 text-white border-pharmacy-dark1">
        <DialogHeader>
          <DialogTitle className="text-pharmacy-green2">Editar Cliente</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nome</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-pharmacy-dark1 border-pharmacy-green1 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-pharmacy-dark1 border-pharmacy-green1 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-pharmacy-dark1 border-pharmacy-green1 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Endereço</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-pharmacy-dark1 border-pharmacy-green1 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-pharmacy-dark1 border-pharmacy-green1 text-white"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-pharmacy-accent hover:bg-pharmacy-green1"
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerEditDialog;

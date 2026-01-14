"use client"

import { useState } from "react"
import { Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"
import { AddressCard } from "@/components/cards/address-card"
import { ServiceAddressForm } from "@/components/forms/service-address-form"
import { createServiceAddressAction } from "@/lib/actions/service-addresses"
import type { Database } from "@/types/database.types"
import type { ServiceAddressFormData } from "@/lib/validations/service-address"
import { toast } from "sonner"

type ServiceAddress = Database['public']['Tables']['service_addresses']['Row']

interface CustomerAddressManagementProps {
  customerId: string
  addresses: ServiceAddress[]
}

export function CustomerAddressManagement({ customerId, addresses }: CustomerAddressManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [key, setKey] = useState(0) // For forcing re-render


  const handleAdd = async (data: ServiceAddressFormData) => {
    setIsLoading(true)
    try {
      const result = await createServiceAddressAction(customerId, data)
      
      if (result.success && result.serviceAddress) {
        toast.success("Address added successfully!")
        setIsAddDialogOpen(false)
        setKey(prev => prev + 1) // Force re-render
      } else {
        toast.error(result.error || "Failed to add address")
      }
    } catch (error) {
      console.error('Error adding address:', error)
      toast.error("Failed to add address")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = () => {
    setKey(prev => prev + 1) // Force re-render when address is updated
  }

  return (
    <div key={key} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Service Addresses</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Service Address</DialogTitle>
              <DialogDescription>
                Add a new service address for this customer
              </DialogDescription>
            </DialogHeader>
            <ServiceAddressForm
              customerId={customerId}
              onSubmit={handleAdd}
              onCancel={() => setIsAddDialogOpen(false)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No service addresses yet</p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add Service Address</DialogTitle>
                    <DialogDescription>
                      Add a new service address for this customer
                    </DialogDescription>
                  </DialogHeader>
                  <ServiceAddressForm
                    customerId={customerId}
                    onSubmit={handleAdd}
                    onCancel={() => setIsAddDialogOpen(false)}
                    isLoading={isLoading}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              customerId={customerId}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
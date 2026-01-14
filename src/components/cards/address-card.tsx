"use client"

import { useState } from "react"
import { Edit, Trash2, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ServiceAddressForm } from "@/components/forms/service-address-form"
import { createServiceAddressAction, updateServiceAddressAction, deleteServiceAddressAction } from "@/lib/actions/service-addresses"
import type { Database } from "@/types/database.types"
import type { ServiceAddressFormData } from "@/lib/validations/service-address"
import { toast } from "sonner"

type ServiceAddress = Database['public']['Tables']['service_addresses']['Row']

interface AddressCardProps {
  address: ServiceAddress
  customerId: string
  onUpdate?: () => void
}

export function AddressCard({ address, customerId, onUpdate }: AddressCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const formatAddress = (addr: ServiceAddress) => {
    const parts = [
      addr.street_address,
      addr.unit && `Unit ${addr.unit}`,
      addr.city,
      addr.state,
      addr.postal_code
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  const handleEdit = async (data: ServiceAddressFormData) => {
    setIsLoading(true)
    try {
      const result = await updateServiceAddressAction(address.id, customerId, data)
      
      if (result.success && result.serviceAddress) {
        toast.success("Address updated successfully!")
        setIsEditDialogOpen(false)
        onUpdate?.()
      } else {
        toast.error(result.error || "Failed to update address")
      }
    } catch (error) {
      console.error('Error updating address:', error)
      toast.error("Failed to update address")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const result = await deleteServiceAddressAction(address.id, customerId)
      
      if (result.success) {
        toast.success("Address deleted successfully!")
        onUpdate?.()
      } else {
        toast.error(result.error || "Failed to delete address")
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error("Failed to delete address")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="relative">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {address.label || 'Service Address'}
              </span>
              {address.is_primary && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Primary
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {formatAddress(address)}
            </p>
            
            <div className="flex flex-wrap gap-2 text-sm">
              {address.property_type && (
                <Badge variant="secondary" className="text-xs">
                  {address.property_type.charAt(0).toUpperCase() + address.property_type.slice(1)}
                </Badge>
              )}
              {address.window_count && (
                <Badge variant="outline" className="text-xs">
                  {address.window_count} window{address.window_count !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            {address.access_notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Access Notes:</p>
                <p className="text-xs text-muted-foreground">{address.access_notes}</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-1 ml-4">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Address</DialogTitle>
                  <DialogDescription>
                    Update the service address information
                  </DialogDescription>
                </DialogHeader>
                <ServiceAddressForm
                  customerId={customerId}
                  initialData={{
                    street_address: address.street_address,
                    unit: address.unit || "",
                    city: address.city,
                    state: address.state,
                    postal_code: address.postal_code,
                    country: address.country || "US",
                    label: address.label || "",
                    access_notes: address.access_notes || "",
                    property_type: address.property_type as "residential" | "commercial" | undefined,
                    window_count: address.window_count || undefined,
                    is_primary: address.is_primary || false,
                  }}
                  onSubmit={handleEdit}
                  onCancel={() => setIsEditDialogOpen(false)}
                  isLoading={isLoading}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Address</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this address? This action cannot be undone.
                    {address.is_primary && (
                      <span className="block mt-2 text-orange-600 font-medium">
                        ⚠️ This is the primary address for this customer.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
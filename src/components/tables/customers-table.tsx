"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/types/database.types"

type Customer = Database['public']['Tables']['customers']['Row']

interface CustomersTableProps {
  customers: Customer[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'created_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedCustomers = [...customers].sort((a, b) => {
    let comparison = 0
    
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy === 'status') {
      comparison = (a.status || '').localeCompare(b.status || '')
    } else if (sortBy === 'created_at') {
      comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (column: 'name' | 'status' | 'created_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'prospect':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No customers found.</p>
        <Button asChild className="mt-4">
          <Link href="/customers/new">Add your first customer</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer select-none"
              onClick={() => handleSort('name')}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Contact</TableHead>
            <TableHead 
              className="cursor-pointer select-none"
              onClick={() => handleSort('status')}
            >
              Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Addresses</TableHead>
            <TableHead>Source</TableHead>
            <TableHead 
              className="cursor-pointer select-none"
              onClick={() => handleSort('created_at')}
            >
              Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="w-[50px]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCustomers.map((customer) => (
            <TableRow 
              key={customer.id}
              className="cursor-pointer"
              onClick={() => window.location.href = `/customers/${customer.id}`}
            >
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">{customer.name}</div>
                  {customer.notes && (
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {customer.notes}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {customer.email && (
                    <div className="text-sm">{customer.email}</div>
                  )}
                  {customer.phone && (
                    <div className="text-sm text-muted-foreground">{customer.phone}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(customer.status || null)}>
                  {customer.status || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  0 addresses
                </span>
              </TableCell>
              <TableCell>
                {customer.source && (
                  <span className="text-sm capitalize">
                    {customer.source.replace('-', ' ')}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {customer.created_at && (
                  <span className="text-sm text-muted-foreground">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/customers/${customer.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/customers/${customer.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this customer?')) {
                          // TODO: Implement delete functionality
                          alert('Delete functionality will be implemented')
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
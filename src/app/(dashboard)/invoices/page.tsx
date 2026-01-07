export default function InvoicesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Invoices</h1>
      <p>Manage and track your customer invoices</p>
      
      <div className="mt-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Invoice System</h2>
        <p className="text-gray-600 mb-4">
          The invoicing system is ready to use.
        </p>
        <a 
          href="/invoices/new"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Invoice
        </a>
      </div>
    </div>
  )
}